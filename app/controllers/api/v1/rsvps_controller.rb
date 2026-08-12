class Api::V1::RsvpsController < Api::V1::EventResourcesController
  before_action :reject_if_finished!, only: [ :create, :add_companions ]

  # Janela para colapsar envios idênticos (double-click / retry)
  DEDUP_WINDOW = 10.seconds

  def index
    unless @event.rsvp_list_public? || admin_viewing?
      render json: { error: "Lista privada" }, status: :forbidden and return
    end
    render json: @event.rsvps.order(created_at: :desc).map { |r| rsvp_json(r) }
  end

  def create
    rsvp = @event.rsvps.build(rsvp_params)

    if rsvp.valid?
      # Anti double-submit: se um RSVP idêntico chegou há segundos, devolve
      # aquele em vez de duplicar (double-click / retry de rede).
      if (recent = recent_duplicate(rsvp))
        return render json: rsvp_json(recent), status: :created
      end

      # Bloqueia nova confirmação para quem já consta na lista. O convidado é
      # orientado a usar o fluxo de "adicionar acompanhantes" em vez de se
      # cadastrar de novo.
      if (existing = confirmed_by_name(rsvp.name))
        return render json: {
          error: "Este nome já confirmou presença. Se quiser incluir mais " \
                 "acompanhantes, use a opção de adicionar acompanhantes.",
          code:  "already_confirmed",
          rsvp:  rsvp_json(existing)
        }, status: :conflict
      end
    end

    if rsvp.save
      render json: rsvp_json(rsvp), status: :created
    else
      render json: { errors: rsvp.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  # Busca a confirmação de um convidado pelo nome (para o fluxo de adicionar
  # acompanhantes). Só devolve o próprio registro, não a lista inteira.
  def lookup
    rsvp = party_by_name(params[:name])
    unless rsvp
      return render json: {
        error: "Não encontramos uma confirmação com esse nome."
      }, status: :not_found
    end

    render json: rsvp_json(rsvp).merge(remaining_slots: remaining_slots(rsvp))
  end

  # Acrescenta acompanhantes a uma confirmação existente, respeitando o teto
  # de Rsvp::COMPANION_LIMIT no total.
  def add_companions
    rsvp = party_by_name(params.dig(:rsvp, :name))
    unless rsvp
      return render json: {
        error: "Não encontramos uma confirmação com esse nome."
      }, status: :not_found
    end

    additions = build_companions(
      params.dig(:rsvp, :companion_names),
      params.dig(:rsvp, :companion_children)
    )
    if additions.empty?
      return render json: { error: "Informe ao menos um acompanhante." },
                    status: :unprocessable_entity
    end

    merged = current_companions(rsvp) + additions
    if merged.size > Rsvp::COMPANION_LIMIT
      return render json: {
        error: "Cada confirmação aceita no máximo #{Rsvp::COMPANION_LIMIT} " \
               "acompanhantes."
      }, status: :unprocessable_entity
    end

    rsvp.companion_names    = merged.map { |c| c[:name] }
    rsvp.companion_children = merged.map { |c| c[:child] }
    rsvp.guests             = merged.size

    if rsvp.save
      render json: rsvp_json(rsvp)
    else
      render json: { errors: rsvp.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

  def recent_duplicate(rsvp)
    @event.rsvps
          .where(name: rsvp.name, attending: rsvp.attending,
                 guests: rsvp.guests, restriction: rsvp.restriction)
          .where("created_at > ?", DEDUP_WINDOW.ago)
          .order(created_at: :desc)
          .first
  end

  # Confirmação existente (attending: yes) cujo nome PRINCIPAL bate com o
  # informado. Usada no bloqueio de cadastro duplicado — deliberadamente NÃO
  # olha os acompanhantes, para não barrar homônimos de primeiro nome (o
  # acompanhante costuma ser cadastrado só com o primeiro nome).
  def confirmed_by_name(name)
    target = Rsvp.normalize_name(name)
    return nil if target.blank?

    @event.rsvps
          .where(attending: "yes")
          .detect { |r| Rsvp.normalize_name(r.name) == target }
  end

  # Confirmação (a "festa") cujo nome principal OU de algum acompanhante bate
  # com o informado. Usada na busca de convidado e ao adicionar acompanhantes,
  # onde um falso-positivo é inofensivo (só localiza o grupo).
  def party_by_name(name)
    target = Rsvp.normalize_name(name)
    return nil if target.blank?

    @event.rsvps.where(attending: "yes").detect do |r|
      Rsvp.normalize_name(r.name) == target ||
        Array(r.companion_names).any? { |c| Rsvp.normalize_name(c) == target }
    end
  end

  def current_companions(rsvp)
    names    = rsvp.companion_names || []
    children = rsvp.companion_children || []
    names.each_index.map { |i| { name: names[i], child: !!children[i] } }
  end

  # Monta [{name, child}] a partir dos arrays recebidos, descartando nomes
  # em branco e mantendo o alinhamento nome ↔ criança por índice.
  def build_companions(names, children)
    names    = Array(names)
    children = Array(children)
    names.each_index.map { |i|
      { name: names[i].to_s.strip, child: truthy?(children[i]) }
    }.reject { |c| c[:name].blank? }
  end

  def truthy?(value)
    ActiveModel::Type::Boolean.new.cast(value) || false
  end

  def remaining_slots(rsvp)
    [ Rsvp::COMPANION_LIMIT - (rsvp.companion_names || []).size, 0 ].max
  end

  def rsvp_params
    params.require(:rsvp).permit(
      :name, :guests, :attending, :restriction,
      companion_names: [],     # ← array de nomes dos acompanhantes
      companion_children: []   # ← booleans alinhados: criança abaixo de 8 anos
    )
  end

  def rsvp_json(rsvp)
    {
      id:               rsvp.id,
      name:             rsvp.name,
      guests:           rsvp.guests,
      attending:        rsvp.attending,
      restriction:      rsvp.restriction,
      companion_names:     rsvp.companion_names || [],
      companion_children:  rsvp.companion_children || [],
      created_at:       rsvp.created_at
    }
  end
end

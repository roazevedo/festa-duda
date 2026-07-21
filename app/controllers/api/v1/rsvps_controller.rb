class Api::V1::RsvpsController < Api::V1::EventResourcesController
  before_action :reject_if_finished!, only: [ :create ]

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

    # Anti double-submit: se um RSVP idêntico chegou há segundos, devolve
    # aquele em vez de duplicar. valid? roda o before_validation (sanitize),
    # então comparamos já com os campos limpos.
    if rsvp.valid? && (recent = recent_duplicate(rsvp))
      return render json: rsvp_json(recent), status: :created
    end

    if rsvp.save
      render json: rsvp_json(rsvp), status: :created
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

# Pagamento de upgrade de plano de um evento (Checkout Pro).
# Quando aprovado, o webhook aplica o plano comprado no evento.
class PlanPayment < ApplicationRecord
  # Status possíveis de um pagamento no Mercado Pago
  STATUSES = %w[
    pending approved authorized in_process in_mediation
    rejected cancelled refunded charged_back
  ].freeze

  # Evento é opcional: no fluxo de NOVO evento pago, o pagamento nasce
  # sem evento (guardando os dados dele) e o evento só é criado quando
  # o MP aprova. No upgrade de um evento já existente, o evento vem junto.
  belongs_to :event, optional: true
  belongs_to :user,  optional: true

  validates :plan,   inclusion: { in: Event::PLANS }
  validates :amount, presence: true,
                     numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }

  scope :approved, -> { where(status: "approved") }

  # external_reference enviado ao MP — o prefixo distingue upgrades
  # de plano dos pagamentos de presente no mesmo webhook
  def external_reference
    "plan:#{id}"
  end

  # Aplica o efeito de um pagamento aprovado, de forma idempotente:
  # - com evento: faz o upgrade do plano do evento existente;
  # - sem evento (novo evento pago): cria o evento no plano comprado.
  # Chamado tanto pelo webhook quanto pela confirmação na volta do MP.
  def apply_approved_effect!
    return unless status == "approved"

    if event
      event.update!(plan: plan) unless event.plan == plan
    else
      create_paid_event!
    end
  end

  private

  def create_paid_event!
    with_lock do
      return if event_id.present?
      return unless user && Event::TYPES.include?(event_type.to_s) &&
                    event_name.present? && event_date.present?

      new_event = user.events.create!(
        event_type: event_type,
        name:       event_name,
        event_date: event_date,
        plan:       plan
      )
      update!(event: new_event)
    end
  end
end

# Pagamento de upgrade de plano de um evento (Checkout Pro).
# Quando aprovado, o webhook aplica o plano comprado no evento.
class PlanPayment < ApplicationRecord
  # Status possíveis de um pagamento no Mercado Pago
  STATUSES = %w[
    pending approved authorized in_process in_mediation
    rejected cancelled refunded charged_back
  ].freeze

  belongs_to :event

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
end

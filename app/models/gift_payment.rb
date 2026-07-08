class GiftPayment < ApplicationRecord
  # Status possíveis de um pagamento no Mercado Pago
  STATUSES = %w[
    pending approved authorized in_process in_mediation
    rejected cancelled refunded charged_back
  ].freeze

  belongs_to :gift

  validates :amount, presence: true,
                     numericality: { greater_than: 0 }
  validates :status, inclusion: { in: STATUSES }

  scope :approved, -> { where(status: "approved") }
end

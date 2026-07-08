# Visão do admin sobre os pagamentos dos presentes do evento.
# Contém dados de pagadores — nunca expor publicamente.
class Api::V1::GiftPaymentsController < Api::V1::EventResourcesController
  before_action :authenticate_user!
  before_action :authorize_owner!

  def index
    scope = GiftPayment.joins(:gift).where(gifts: { event_id: @event.id })

    # Sem mp_payment_id é só um clique em "Presentear" que não virou
    # pagamento (checkout abandonado) — não interessa na listagem
    payments = scope.where.not(mp_payment_id: nil)
                    .includes(:gift).order(created_at: :desc)

    render json: {
      total_approved: scope.approved.sum(:amount).to_f,
      payments:       payments.map { |p| payment_json(p) }
    }
  end

  private

  def payment_json(payment)
    {
      id:          payment.id,
      gift_id:     payment.gift_id,
      gift_name:   payment.gift.name,
      amount:      payment.amount.to_f,
      status:      payment.status,
      payer_email: payment.payer_email,
      created_at:  payment.created_at
    }
  end
end

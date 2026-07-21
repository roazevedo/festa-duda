# Inicia o pagamento de um presente via Mercado Pago (Checkout Pro).
# Endpoint público — convidados não têm login; o slug+token do evento
# já limita quem chega até aqui.
class Api::V1::GiftCheckoutsController < Api::V1::EventResourcesController
  before_action :reject_if_finished!, only: [ :create ]

  def create
    gift = @event.gifts.find(params[:id])

    unless MercadoPagoService.configured?
      render json: { error: "Pagamento indisponível no momento." },
             status: :service_unavailable and return
    end

    payment = gift.gift_payments.create!(amount: gift.price)

    begin
      preference = MercadoPagoService.create_preference(
        payment:  payment,
        base_url: request.base_url
      )
    rescue MercadoPagoService::Error => e
      Rails.logger.error("Checkout MP falhou (gift_payment #{payment.id}): #{e.message}")
      payment.update(status: "cancelled")
      render json: { error: "Erro ao iniciar o pagamento. Tente novamente." },
             status: :bad_gateway and return
    end

    payment.update!(mp_preference_id: preference["id"])
    render json: { init_point: preference["init_point"] }, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Presente não encontrado." }, status: :not_found
  end
end

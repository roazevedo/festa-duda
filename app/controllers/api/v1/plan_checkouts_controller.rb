# Inicia o pagamento do upgrade de plano via Mercado Pago
# (Checkout Pro). Só o dono do evento pode comprar o upgrade;
# o plano em si é aplicado pelo webhook quando o MP aprovar.
class Api::V1::PlanCheckoutsController < Api::V1::EventResourcesController
  before_action :authenticate_user!
  before_action :authorize_owner!

  def create
    plan  = params[:plan].to_s
    price = Event::PLAN_PRICES[plan]

    unless price
      render json: { error: "Plano indisponível para compra." },
             status: :unprocessable_entity and return
    end

    if @event.plan == plan
      render json: { error: "O evento já está no plano #{plan.capitalize}." },
             status: :unprocessable_entity and return
    end

    unless MercadoPagoService.configured?
      render json: { error: "Pagamento indisponível no momento." },
             status: :service_unavailable and return
    end

    payment = @event.plan_payments.create!(plan: plan, amount: price)

    begin
      preference = MercadoPagoService.create_plan_preference(
        payment:  payment,
        base_url: request.base_url
      )
    rescue MercadoPagoService::Error => e
      Rails.logger.error("Checkout MP falhou (plan_payment #{payment.id}): #{e.message}")
      payment.update(status: "cancelled")
      render json: { error: "Erro ao iniciar o pagamento. Tente novamente." },
             status: :bad_gateway and return
    end

    payment.update!(mp_preference_id: preference["id"])
    render json: { init_point: preference["init_point"] }, status: :created
  end
end

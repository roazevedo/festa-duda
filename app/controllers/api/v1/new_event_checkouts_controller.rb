# Checkout de um NOVO evento em plano pago. O evento NÃO é criado
# aqui: nasce só quando o Mercado Pago aprova o pagamento (pelo webhook
# ou pela confirmação na volta). Se o usuário não paga, nenhum evento
# fica no painel.
class Api::V1::NewEventCheckoutsController < ApplicationController
  before_action :authenticate_user!

  # POST /api/v1/plan_checkouts
  def create
    plan  = params[:plan].to_s
    price = Event::PLAN_PRICES[plan]

    unless price
      return render json: { error: "Plano indisponível para compra." },
                    status: :unprocessable_entity
    end

    unless MercadoPagoService.configured?
      return render json: { error: "Pagamento indisponível no momento." },
                    status: :service_unavailable
    end

    payment = current_user.plan_payments.build(
      plan:       plan,
      amount:     price,
      event_type: params[:event_type],
      event_name: params[:name].to_s.strip,
      event_date: params[:event_date]
    )

    # Mesmos requisitos do Event, validados antes de ir ao pagamento
    unless Event::TYPES.include?(payment.event_type.to_s) &&
           payment.event_name.present? && payment.event_date.present?
      return render json: { error: "Dados do evento incompletos." },
                    status: :unprocessable_entity
    end

    payment.save!

    begin
      preference = MercadoPagoService.create_new_event_preference(
        payment:  payment,
        base_url: request.base_url
      )
    rescue MercadoPagoService::Error => e
      Rails.logger.error("Checkout MP (novo evento) falhou (payment #{payment.id}): #{e.message}")
      payment.update(status: "cancelled")
      return render json: { error: "Erro ao iniciar o pagamento. Tente novamente." },
                    status: :bad_gateway
    end

    payment.update!(mp_preference_id: preference["id"])
    render json: { init_point: preference["init_point"] }, status: :created
  end

  # POST /api/v1/plan_checkouts/confirm
  # Chamado pela página de retorno do MP. Atualiza o status pela API do
  # MP e cria o evento se aprovado (idempotente — o webhook faz o mesmo).
  def confirm
    payment = current_user.plan_payments.find_by(id: reference_id)
    unless payment
      return render json: { error: "Pagamento não encontrado." }, status: :not_found
    end

    refresh_status_from_mp(payment)
    payment.apply_approved_effect!
    payment.reload

    render json: {
      status: payment.status,
      event:  payment.event && { slug: payment.event.slug, token: payment.event.token }
    }
  end

  private

  # external_reference "plan:123" → id 123
  def reference_id
    params[:reference].to_s.delete_prefix("plan:")
  end

  def refresh_status_from_mp(payment)
    mp_id = params[:payment_id].presence || payment.mp_payment_id
    return unless mp_id && MercadoPagoService.configured?

    mp = MercadoPagoService.fetch_payment(mp_id)
    return unless PlanPayment::STATUSES.include?(mp["status"])

    payment.update!(
      status:        mp["status"],
      mp_payment_id: mp["id"].to_s,
      payer_email:   mp.dig("payer", "email")
    )
  rescue MercadoPagoService::Error => e
    Rails.logger.warn("Confirm MP falhou (payment #{payment.id}): #{e.message}")
  end
end

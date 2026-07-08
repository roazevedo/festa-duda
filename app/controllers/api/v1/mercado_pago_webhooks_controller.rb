# Recebe as notificações de pagamento do Mercado Pago.
#
# A notificação traz apenas o id do pagamento; o status é buscado
# direto na API do MP com nosso access token — assim um payload
# forjado não consegue marcar pagamento como aprovado.
class Api::V1::MercadoPagoWebhooksController < ApplicationController
  def create
    payment_id = extract_payment_id
    return head :ok unless payment_id

    mp_payment = MercadoPagoService.fetch_payment(payment_id)
    payment    = GiftPayment.find_by(id: mp_payment["external_reference"])
    return head :ok unless payment

    payment.update!(
      status:        mp_payment["status"],
      mp_payment_id: mp_payment["id"].to_s,
      payer_email:   mp_payment.dig("payer", "email")
    )
    head :ok
  rescue MercadoPagoService::Error => e
    # 500 faz o MP reenviar a notificação mais tarde
    Rails.logger.error("Webhook MP falhou: #{e.message}")
    head :internal_server_error
  end

  private

  # O MP envia formatos diferentes conforme a versão da notificação:
  #   body JSON:    { "type": "payment", "data": { "id": "123" } }
  #   query string: ?topic=payment&id=123  ou  ?type=payment&data.id=123
  def extract_payment_id
    type = params[:type] || params[:topic]
    return nil unless type == "payment"

    params.dig(:data, :id) || params["data.id"] || params[:id]
  end
end

require "net/http"
require "json"

# Cliente da API do Mercado Pago (Checkout Pro).
#
# O access token vem da variável MP_ACCESS_TOKEN:
#   fly secrets set MP_ACCESS_TOKEN='APP_USR-...'
# Para testes locais, use as credenciais de teste da conta MP.
class MercadoPagoService
  BASE_URL = "https://api.mercadopago.com".freeze

  class Error < StandardError; end

  def self.configured?
    ENV["MP_ACCESS_TOKEN"].present?
  end

  # Cria a preferência de pagamento de um presente e devolve o JSON
  # do MP (init_point, id etc). O external_reference é o id do
  # GiftPayment — é por ele que o webhook localiza o registro.
  def self.create_preference(payment:, base_url:)
    gift      = payment.gift
    event_url = "#{base_url}/#{gift.event.slug}/#{gift.event.token}"

    body = {
      items: [ {
        id:          gift.id.to_s,
        title:       "Presente: #{gift.name}",
        description: gift.description.to_s,
        quantity:    1,
        currency_id: "BRL",
        unit_price:  gift.price.to_f
      } ],
      external_reference: payment.id.to_s,
      back_urls: {
        success: "#{event_url}?presente=sucesso",
        pending: "#{event_url}?presente=pendente",
        failure: "#{event_url}?presente=erro"
      }
    }

    # O MP exige URL pública para auto_return/notification_url —
    # em localhost o retorno é manual e o webhook não se aplica.
    unless local_url?(base_url)
      body[:auto_return]      = "approved"
      body[:notification_url] = "#{base_url}/api/v1/webhooks/mercado_pago"
    end

    request(Net::HTTP::Post, "/checkout/preferences", body)
  end

  # Preferência do upgrade de plano de um evento. O retorno leva o
  # dono de volta ao site do evento com ?plano=sucesso|pendente|erro.
  def self.create_plan_preference(payment:, base_url:)
    event     = payment.event
    event_url = "#{base_url}/#{event.slug}/#{event.token}"

    body = {
      items: [ {
        id:          payment.plan,
        title:       "Convida.me — Plano #{payment.plan.capitalize}: #{event.name}",
        description: "Upgrade do site do evento para o plano #{payment.plan.capitalize}",
        quantity:    1,
        currency_id: "BRL",
        unit_price:  payment.amount.to_f
      } ],
      external_reference: payment.external_reference,
      back_urls: {
        success: "#{event_url}?plano=sucesso",
        pending: "#{event_url}?plano=pendente",
        failure: "#{event_url}?plano=erro"
      }
    }

    unless local_url?(base_url)
      body[:auto_return]      = "approved"
      body[:notification_url] = "#{base_url}/api/v1/webhooks/mercado_pago"
    end

    request(Net::HTTP::Post, "/checkout/preferences", body)
  end

  # Busca um pagamento direto na API do MP — fonte de verdade do
  # webhook (o payload da notificação não é confiável por si só).
  def self.fetch_payment(payment_id)
    request(Net::HTTP::Get, "/v1/payments/#{payment_id}")
  end

  def self.local_url?(url)
    %w[localhost 127.0.0.1].include?(URI(url).host)
  end
  private_class_method :local_url?

  def self.request(method_class, path, body = nil)
    uri  = URI("#{BASE_URL}#{path}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = true
    http.open_timeout = 10
    http.read_timeout = 10

    req = method_class.new(uri)
    req["Authorization"] = "Bearer #{ENV['MP_ACCESS_TOKEN']}"
    req["Content-Type"]  = "application/json"
    req.body = body.to_json if body

    response = http.request(req)
    payload  = JSON.parse(response.body) rescue {}

    unless response.is_a?(Net::HTTPSuccess)
      raise Error, "Mercado Pago #{response.code}: #{payload['message'] || response.body&.truncate(200)}"
    end

    payload
  end
  private_class_method :request
end

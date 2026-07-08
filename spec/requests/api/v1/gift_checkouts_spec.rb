require 'rails_helper'

RSpec.describe 'Api::V1::GiftCheckouts', type: :request do
  let!(:event) { create(:event) }
  let!(:gift)  { create(:gift, event: event, price: 250.0) }
  let(:url)    { "/api/v1/events/#{event.slug}/#{event.token}/gifts/#{gift.id}/checkout" }

  let(:preference_response) do
    {
      id:         'pref-123',
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-123'
    }.to_json
  end

  around do |example|
    original = ENV['MP_ACCESS_TOKEN']
    ENV['MP_ACCESS_TOKEN'] = 'TEST-token'
    example.run
    ENV['MP_ACCESS_TOKEN'] = original
  end

  describe 'POST /gifts/:id/checkout' do
    it 'cria o GiftPayment pendente e retorna o init_point' do
      stub = stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
        .with(headers: { 'Authorization' => 'Bearer TEST-token' })
        .to_return(status: 201, body: preference_response,
                   headers: { 'Content-Type' => 'application/json' })

      expect { post url }.to change(GiftPayment, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['init_point']).to include('mercadopago.com.br')
      expect(stub).to have_been_requested

      payment = GiftPayment.last
      expect(payment.gift).to eq(gift)
      expect(payment.amount).to eq(250.0)
      expect(payment.status).to eq('pending')
      expect(payment.mp_preference_id).to eq('pref-123')
    end

    it 'envia o external_reference com o id do GiftPayment' do
      stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
        .to_return(status: 201, body: preference_response,
                   headers: { 'Content-Type' => 'application/json' })

      post url

      payment = GiftPayment.last
      expect(
        a_request(:post, 'https://api.mercadopago.com/checkout/preferences')
          .with { |req| JSON.parse(req.body)['external_reference'] == payment.id.to_s }
      ).to have_been_made
    end

    it 'inclui auto_return e notification_url em host público' do
      stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
        .to_return(status: 201, body: preference_response,
                   headers: { 'Content-Type' => 'application/json' })

      post url

      expect(
        a_request(:post, 'https://api.mercadopago.com/checkout/preferences')
          .with { |req|
            body = JSON.parse(req.body)
            body['auto_return'] == 'approved' &&
              body['notification_url']&.end_with?('/api/v1/webhooks/mercado_pago')
          }
      ).to have_been_made
    end

    it 'omite auto_return e notification_url em localhost (MP exige URL pública)' do
      stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
        .to_return(status: 201, body: preference_response,
                   headers: { 'Content-Type' => 'application/json' })

      post url, headers: { 'Host' => 'localhost:3000' }

      expect(response).to have_http_status(:created)
      expect(
        a_request(:post, 'https://api.mercadopago.com/checkout/preferences')
          .with { |req|
            body = JSON.parse(req.body)
            !body.key?('auto_return') && !body.key?('notification_url')
          }
      ).to have_been_made
    end

    it 'retorna 502 e cancela o pagamento se o MP falhar' do
      stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
        .to_return(status: 400, body: { message: 'invalid' }.to_json)

      post url

      expect(response).to have_http_status(:bad_gateway)
      expect(GiftPayment.last.status).to eq('cancelled')
    end

    it 'retorna 503 quando o MP_ACCESS_TOKEN não está configurado' do
      ENV['MP_ACCESS_TOKEN'] = nil
      expect { post url }.not_to change(GiftPayment, :count)
      expect(response).to have_http_status(:service_unavailable)
    end

    it 'retorna 404 para presente inexistente' do
      post "/api/v1/events/#{event.slug}/#{event.token}/gifts/999999/checkout"
      expect(response).to have_http_status(:not_found)
    end

    it 'retorna 404 para token de evento errado' do
      post "/api/v1/events/#{event.slug}/token-errado/gifts/#{gift.id}/checkout"
      expect(response).to have_http_status(:not_found)
    end
  end
end

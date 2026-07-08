require 'rails_helper'

RSpec.describe 'Api::V1::MercadoPagoWebhooks', type: :request do
  let(:url)      { '/api/v1/webhooks/mercado_pago' }
  let!(:payment) { create(:gift_payment) }

  def stub_mp_payment(id:, status:, external_reference:)
    stub_request(:get, "https://api.mercadopago.com/v1/payments/#{id}")
      .to_return(
        status: 200,
        body: {
          id:                 id,
          status:             status,
          external_reference: external_reference,
          payer:              { email: 'convidado@email.com' }
        }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )
  end

  around do |example|
    original = ENV['MP_ACCESS_TOKEN']
    ENV['MP_ACCESS_TOKEN'] = 'TEST-token'
    example.run
    ENV['MP_ACCESS_TOKEN'] = original
  end

  describe 'POST /webhooks/mercado_pago' do
    it 'aprova o pagamento consultando a API do MP (formato body JSON)' do
      stub_mp_payment(id: 777, status: 'approved', external_reference: payment.id.to_s)

      post url, params: { type: 'payment', data: { id: '777' } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(payment.reload.status).to eq('approved')
      expect(payment.mp_payment_id).to eq('777')
      expect(payment.payer_email).to eq('convidado@email.com')
    end

    it 'atualiza o pagamento no formato query string (topic/id)' do
      stub_mp_payment(id: 888, status: 'rejected', external_reference: payment.id.to_s)

      post "#{url}?topic=payment&id=888"

      expect(response).to have_http_status(:ok)
      expect(payment.reload.status).to eq('rejected')
    end

    it 'ignora notificações que não são de pagamento' do
      post url, params: { type: 'merchant_order', data: { id: '1' } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(payment.reload.status).to eq('pending')
    end

    it 'responde 200 se o external_reference não bater com nenhum registro' do
      stub_mp_payment(id: 999, status: 'approved', external_reference: '0')
      post url, params: { type: 'payment', data: { id: '999' } }, as: :json
      expect(response).to have_http_status(:ok)
    end

    it 'responde 500 se a consulta ao MP falhar (MP reenvia depois)' do
      stub_request(:get, 'https://api.mercadopago.com/v1/payments/777')
        .to_return(status: 500, body: '{}')

      post url, params: { type: 'payment', data: { id: '777' } }, as: :json

      expect(response).to have_http_status(:internal_server_error)
      expect(payment.reload.status).to eq('pending')
    end

    it 'ignora status desconhecido sem estourar 500 (MP não deve reenviar)' do
      stub_mp_payment(id: 777, status: 'novo_status_do_mp', external_reference: payment.id.to_s)

      post url, params: { type: 'payment', data: { id: '777' } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(payment.reload.status).to eq('pending')
    end

    it 'não confia no status enviado no payload da notificação' do
      # payload diz "approved", mas a API do MP diz "rejected"
      stub_mp_payment(id: 777, status: 'rejected', external_reference: payment.id.to_s)

      post url,
        params: { type: 'payment', data: { id: '777', status: 'approved' } },
        as: :json

      expect(payment.reload.status).to eq('rejected')
    end
  end
end

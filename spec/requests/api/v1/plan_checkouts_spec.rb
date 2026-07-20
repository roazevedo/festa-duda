require 'rails_helper'

RSpec.describe 'Api::V1::PlanCheckouts', type: :request do
  let(:owner)    { create(:user, password: 'Senha@123456') }
  let(:intruder) { create(:user, password: 'Senha@123456') }
  let!(:event)   { create(:event, user: owner, plan: 'gratis') }
  let(:url)      { "/api/v1/events/#{event.slug}/#{event.token}/plan_checkout" }

  let(:preference_response) do
    {
      id:         'pref-plan-1',
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-plan-1'
    }.to_json
  end

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  def stub_preference
    stub_request(:post, 'https://api.mercadopago.com/checkout/preferences')
      .to_return(status: 201, body: preference_response,
                 headers: { 'Content-Type' => 'application/json' })
  end

  around do |example|
    original = ENV['MP_ACCESS_TOKEN']
    ENV['MP_ACCESS_TOKEN'] = 'TEST-token'
    example.run
    ENV['MP_ACCESS_TOKEN'] = original
  end

  describe 'POST /plan_checkout' do
    it 'retorna 401 sem autenticação' do
      expect {
        post url, params: { plan: 'completo' }
      }.not_to change(PlanPayment, :count)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para quem não é dono do evento' do
      expect {
        post url, params: { plan: 'completo' }, headers: auth_headers(intruder)
      }.not_to change(PlanPayment, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it 'cria o PlanPayment pendente e retorna o init_point' do
      stub_preference

      expect {
        post url, params: { plan: 'completo' }, headers: auth_headers(owner)
      }.to change(PlanPayment, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['init_point']).to include('mercadopago.com.br')

      payment = PlanPayment.last
      expect(payment.event).to eq(event)
      expect(payment.plan).to eq('completo')
      expect(payment.amount).to eq(149.90)
      expect(payment.status).to eq('pending')
      expect(payment.mp_preference_id).to eq('pref-plan-1')
    end

    it 'envia o external_reference com prefixo plan:' do
      stub_preference

      post url, params: { plan: 'completo' }, headers: auth_headers(owner)

      payment = PlanPayment.last
      expect(
        a_request(:post, 'https://api.mercadopago.com/checkout/preferences')
          .with { |req|
            JSON.parse(req.body)['external_reference'] == "plan:#{payment.id}"
          }
      ).to have_been_made
    end

    it 'rejeita plano sem preço de venda direta (atelie, gratis)' do
      %w[atelie gratis premium].each do |plan|
        post url, params: { plan: plan }, headers: auth_headers(owner)
        expect(response).to have_http_status(:unprocessable_entity)
      end
      expect(PlanPayment.count).to eq(0)
    end

    it 'rejeita quando o evento já está no plano' do
      event.update!(plan: 'completo')
      post url, params: { plan: 'completo' }, headers: auth_headers(owner)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'webhook aplica o upgrade' do
    let(:webhook_url) { '/api/v1/webhooks/mercado_pago' }
    let!(:payment)    { create(:plan_payment, event: event) }

    def stub_mp_payment(id:, status:)
      stub_request(:get, "https://api.mercadopago.com/v1/payments/#{id}")
        .to_return(
          status: 200,
          body: {
            id:                 id,
            status:             status,
            external_reference: payment.external_reference,
            payer:              { email: 'dono@email.com' }
          }.to_json,
          headers: { 'Content-Type' => 'application/json' }
        )
    end

    it 'pagamento aprovado muda o plano do evento' do
      stub_mp_payment(id: 999, status: 'approved')

      post webhook_url, params: { type: 'payment', data: { id: '999' } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(payment.reload.status).to eq('approved')
      expect(event.reload.plan).to eq('completo')
    end

    it 'pagamento recusado não muda o plano' do
      stub_mp_payment(id: 998, status: 'rejected')

      post webhook_url, params: { type: 'payment', data: { id: '998' } }, as: :json

      expect(payment.reload.status).to eq('rejected')
      expect(event.reload.plan).to eq('gratis')
    end
  end
end

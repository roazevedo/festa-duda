require 'rails_helper'

RSpec.describe 'Api::V1::NewEventCheckouts', type: :request do
  let(:user) { create(:user, password: 'Senha@123456') }

  let(:event_params) do
    { plan: 'completo', event_type: 'aniversario',
      name: 'Edinho', event_date: '2026-12-12T20:00:00Z' }
  end

  let(:preference_response) do
    { id: 'pref-new-1',
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=pref-new-1' }.to_json
  end

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } }, as: :json
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

  describe 'POST /plan_checkouts' do
    it 'retorna 401 sem autenticação' do
      post '/api/v1/plan_checkouts', params: event_params
      expect(response).to have_http_status(:unauthorized)
    end

    it 'cria o pagamento pendente SEM criar o evento' do
      stub_preference

      expect {
        post '/api/v1/plan_checkouts', params: event_params, headers: auth_headers(user)
      }.to change(PlanPayment, :count).by(1).and change(Event, :count).by(0)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['init_point']).to include('mercadopago.com.br')

      payment = PlanPayment.last
      expect(payment.event).to be_nil
      expect(payment.user).to eq(user)
      expect(payment.event_type).to eq('aniversario')
      expect(payment.event_name).to eq('Edinho')
    end

    it 'rejeita dados de evento incompletos' do
      expect {
        post '/api/v1/plan_checkouts',
          params: event_params.merge(name: ''), headers: auth_headers(user)
      }.not_to change(PlanPayment, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'rejeita plano sem preço de venda direta' do
      %w[gratis atelie].each do |plan|
        post '/api/v1/plan_checkouts',
          params: event_params.merge(plan: plan), headers: auth_headers(user)
        expect(response).to have_http_status(:unprocessable_entity)
      end
      expect(PlanPayment.count).to eq(0)
    end
  end

  describe 'criação adiada do evento' do
    let!(:payment) do
      create(:plan_payment, event: nil, user: user, plan: 'completo',
             event_type: 'aniversario', event_name: 'Edinho',
             event_date: '2026-12-12T20:00:00Z')
    end

    def stub_mp_payment(id:, status:)
      stub_request(:get, "https://api.mercadopago.com/v1/payments/#{id}")
        .to_return(status: 200,
          body: { id: id, status: status,
                  external_reference: payment.external_reference,
                  transaction_amount: payment.amount.to_f,
                  payer: { email: 'edinho@email.com' } }.to_json,
          headers: { 'Content-Type' => 'application/json' })
    end

    it 'webhook aprovado cria o evento no plano comprado' do
      stub_mp_payment(id: 555, status: 'approved')

      expect {
        post '/api/v1/webhooks/mercado_pago',
          params: { type: 'payment', data: { id: '555' } }, as: :json
      }.to change(user.events, :count).by(1)

      event = payment.reload.event
      expect(event).to be_present
      expect(event.plan).to eq('completo')
      expect(event.name).to eq('Edinho')
    end

    it 'webhook recusado não cria evento' do
      stub_mp_payment(id: 556, status: 'rejected')

      expect {
        post '/api/v1/webhooks/mercado_pago',
          params: { type: 'payment', data: { id: '556' } }, as: :json
      }.not_to change(Event, :count)

      expect(payment.reload.event).to be_nil
    end

    it 'confirm na volta cria o evento e é idempotente' do
      stub_mp_payment(id: 557, status: 'approved')

      expect {
        post '/api/v1/plan_checkouts/confirm',
          params: { reference: payment.external_reference, payment_id: '557' },
          headers: auth_headers(user)
      }.to change(Event, :count).by(1)

      body = JSON.parse(response.body)
      expect(body['status']).to eq('approved')
      expect(body['event']['slug']).to be_present

      # Chamar de novo (ou o webhook depois) não cria outro evento
      expect {
        post '/api/v1/plan_checkouts/confirm',
          params: { reference: payment.external_reference, payment_id: '557' },
          headers: auth_headers(user)
      }.not_to change(Event, :count)
    end

    it 'não aprova o plano com um pagamento de OUTRO recurso (bypass)' do
      # Pagamento aprovado real da conta MP, mas de outro recurso
      # (ex.: um presente barato): external_reference não bate.
      stub_request(:get, 'https://api.mercadopago.com/v1/payments/999')
        .to_return(status: 200,
          body: { id: 999, status: 'approved',
                  external_reference: '42', # id de gift_payment, não "plan:X"
                  transaction_amount: 0.5,
                  payer: { email: 'atacante@email.com' } }.to_json,
          headers: { 'Content-Type' => 'application/json' })

      expect {
        post '/api/v1/plan_checkouts/confirm',
          params: { reference: payment.external_reference, payment_id: '999' },
          headers: auth_headers(user)
      }.not_to change(Event, :count)

      expect(payment.reload.status).not_to eq('approved')
      expect(payment.event).to be_nil
    end
  end
end

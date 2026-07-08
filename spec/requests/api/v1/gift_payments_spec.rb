require 'rails_helper'

RSpec.describe 'Api::V1::GiftPayments', type: :request do
  let(:owner)    { create(:user, password: 'Senha@123456') }
  let(:intruder) { create(:user, password: 'Senha@123456') }
  let(:admin)    { create(:user, :admin, password: 'Senha@123456') }
  let!(:event)   { create(:event, user: owner) }
  let!(:gift)    { create(:gift, event: event, price: 100.0) }
  let(:url)      { "/api/v1/events/#{event.slug}/#{event.token}/gift_payments" }

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  describe 'GET /gift_payments' do
    it 'retorna 401 sem autenticação' do
      get url
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário que não é dono do evento' do
      get url, headers: auth_headers(intruder)
      expect(response).to have_http_status(:forbidden)
    end

    it 'lista pagamentos e total aprovado para o dono' do
      create(:gift_payment, :approved, gift: gift, amount: 100.0)
      create(:gift_payment, :approved, gift: gift, amount: 100.0)
      create(:gift_payment, gift: gift, status: 'rejected',
                            mp_payment_id: '123', payer_email: 'x@y.com')

      get url, headers: auth_headers(owner)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['total_approved']).to eq(200.0)
      expect(body['payments'].length).to eq(3)
      expect(body['payments'].first).to include('gift_name', 'amount', 'status', 'payer_email')
    end

    it 'lista pagamentos para um admin' do
      create(:gift_payment, :approved, gift: gift)
      get url, headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['payments'].length).to eq(1)
    end

    it 'omite checkouts abandonados (sem mp_payment_id)' do
      create(:gift_payment, gift: gift) # pending sem mp_payment_id
      create(:gift_payment, :approved, gift: gift)

      get url, headers: auth_headers(owner)

      expect(JSON.parse(response.body)['payments'].length).to eq(1)
    end

    it 'não mistura pagamentos de outros eventos' do
      other_gift = create(:gift)
      create(:gift_payment, :approved, gift: other_gift)

      get url, headers: auth_headers(owner)

      body = JSON.parse(response.body)
      expect(body['payments']).to be_empty
      expect(body['total_approved']).to eq(0.0)
    end
  end
end

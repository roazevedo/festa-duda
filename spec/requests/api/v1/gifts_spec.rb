require 'rails_helper'

RSpec.describe 'Api::V1::Gifts', type: :request do
  let(:owner)    { create(:user, password: 'Senha@123456') }
  let(:intruder) { create(:user, password: 'Senha@123456') }
  let(:admin)    { create(:user, :admin, password: 'Senha@123456') }
  let!(:event)   { create(:event, user: owner) }
  let(:url)      { "/api/v1/events/#{event.slug}/#{event.token}/gifts" }

  let(:valid_params) do
    {
      gift: {
        name:        'Maquiagem profissional',
        description: 'Make completa para a noite de gala',
        price:       250.0
      }
    }
  end

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  # ── GET index (público) ───────────────────────────────────

  describe 'GET /gifts' do
    it 'retorna os presentes do evento sem autenticação' do
      create_list(:gift, 2, event: event)
      get url
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end

    it 'retorna o preço como número' do
      create(:gift, event: event, price: 250.0)
      get url
      expect(JSON.parse(response.body).first['price']).to eq(250.0)
    end
  end

  # ── POST create ───────────────────────────────────────────

  describe 'POST /gifts' do
    it 'retorna 401 sem autenticação' do
      expect { post url, params: valid_params }.not_to change(Gift, :count)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário autenticado que não é dono do evento' do
      expect {
        post url, params: valid_params, headers: auth_headers(intruder)
      }.not_to change(Gift, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it 'cria o presente quando o dono do evento envia' do
      expect {
        post url, params: valid_params, headers: auth_headers(owner)
      }.to change(Gift, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'cria o presente quando um admin envia' do
      expect {
        post url, params: valid_params, headers: auth_headers(admin)
      }.to change(Gift, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'rejeita presente sem nome' do
      params = { gift: valid_params[:gift].merge(name: '') }
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.not_to change(Gift, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'rejeita preço inválido' do
      params = { gift: valid_params[:gift].merge(price: -10) }
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.not_to change(Gift, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  # ── PATCH update ──────────────────────────────────────────

  describe 'PATCH /gifts/:id' do
    let!(:gift) { create(:gift, event: event) }

    it 'retorna 401 sem autenticação' do
      patch "#{url}/#{gift.id}", params: { gift: { price: 300 } }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário que não é dono do evento' do
      patch "#{url}/#{gift.id}",
            params:  { gift: { price: 300 } },
            headers: auth_headers(intruder)
      expect(response).to have_http_status(:forbidden)
    end

    it 'atualiza o presente quando o dono envia' do
      patch "#{url}/#{gift.id}",
            params:  { gift: { price: 300 } },
            headers: auth_headers(owner)
      expect(response).to have_http_status(:ok)
      expect(gift.reload.price).to eq(300)
    end
  end

  # ── DELETE destroy ────────────────────────────────────────

  describe 'DELETE /gifts/:id' do
    let!(:gift) { create(:gift, event: event) }

    it 'retorna 401 sem autenticação' do
      expect { delete "#{url}/#{gift.id}" }.not_to change(Gift, :count)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário que não é dono do evento' do
      expect {
        delete "#{url}/#{gift.id}", headers: auth_headers(intruder)
      }.not_to change(Gift, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it 'remove o presente quando o dono envia' do
      expect {
        delete "#{url}/#{gift.id}", headers: auth_headers(owner)
      }.to change(Gift, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end

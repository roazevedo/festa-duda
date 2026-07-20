require 'rails_helper'

# ── Travas de plano na API ───────────────────────────────────
RSpec.describe 'Limites por plano', type: :request do
  let(:owner)  { create(:user, password: 'Senha@123456') }
  let(:admin)  { create(:user, :admin, password: 'Senha@123456') }
  let!(:event) { create(:event, user: owner, plan: 'gratis') }

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  describe 'presentes' do
    let(:url) { "/api/v1/events/#{event.slug}/#{event.token}/gifts" }
    let(:params) { { gift: { name: 'Presente', price: 100.0 } } }

    it 'grátis: barra o 11º presente com 422' do
      create_list(:gift, 10, event: event)
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.not_to change(Gift, :count)
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors'].join).to include('plano Grátis')
    end

    it 'completo: não limita a lista' do
      event.update!(plan: 'completo')
      create_list(:gift, 10, event: event)
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.to change(Gift, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe 'fotos da galeria' do
    let(:url) { "/api/v1/events/#{event.slug}/#{event.token}/photos" }
    let(:params) do
      { photo: {
        url:           "https://res.cloudinary.com/#{Photo::CLOUD_NAME}/image/upload/foto.jpg",
        thumb_url:     "https://res.cloudinary.com/#{Photo::CLOUD_NAME}/image/upload/thumb_foto.jpg",
        cloudinary_id: 'festa-duda/foto',
        category:      'galeria'
      } }
    end

    it 'grátis: barra a 21ª foto da galeria com 422' do
      create_list(:photo, 20, event: event, category: 'galeria')
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.not_to change(Photo, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'grátis: não conta fotos de outras categorias no limite da galeria' do
      create_list(:photo, 20, event: event, category: 'traje')
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.to change(Photo, :count).by(1)
    end

    it 'completo: não limita a galeria' do
      event.update!(plan: 'completo')
      create_list(:photo, 20, event: event, category: 'galeria')
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.to change(Photo, :count).by(1)
    end
  end

  describe 'troca de plano' do
    let(:url) { "/api/v1/events/#{event.slug}/#{event.token}" }

    it 'aparece no JSON do evento' do
      get url
      expect(JSON.parse(response.body)['plan']).to eq('gratis')
    end

    it 'dono não consegue mudar o próprio plano' do
      patch url,
        params:  { event: { plan: 'completo' } },
        headers: auth_headers(owner)
      expect(event.reload.plan).to eq('gratis')
    end

    it 'admin consegue mudar o plano' do
      patch url,
        params:  { event: { plan: 'completo' } },
        headers: auth_headers(admin)
      expect(response).to have_http_status(:ok)
      expect(event.reload.plan).to eq('completo')
    end
  end

  describe 'settings restritos por plano no update' do
    let(:url) { "/api/v1/events/#{event.slug}/#{event.token}" }

    it 'grátis: rejeita tema pago com 422' do
      patch url,
        params:  { event: { settings: { theme: 'lilas-encanto' } } },
        headers: auth_headers(owner)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'grátis: aceita tema liberado' do
      patch url,
        params:  { event: { settings: { theme: 'rosa-cha' } } },
        headers: auth_headers(owner)
      expect(response).to have_http_status(:ok)
    end
  end
end

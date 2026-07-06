require 'rails_helper'

RSpec.describe 'Api::V1::Photos', type: :request do
  let(:owner)    { create(:user, password: 'Senha@123456') }
  let(:intruder) { create(:user, password: 'Senha@123456') }
  let(:admin)    { create(:user, :admin, password: 'Senha@123456') }
  let!(:event)   { create(:event, user: owner) }
  let(:url)      { "/api/v1/events/#{event.slug}/#{event.token}/photos" }

  let(:valid_params) do
    {
      photo: {
        url:           "https://res.cloudinary.com/#{Photo::CLOUD_NAME}/image/upload/foto.jpg",
        thumb_url:     "https://res.cloudinary.com/#{Photo::CLOUD_NAME}/image/upload/thumb_foto.jpg",
        cloudinary_id: 'festa-duda/foto123',
        category:      'galeria'
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

  describe 'GET /photos' do
    it 'retorna as fotos do evento sem autenticação' do
      create_list(:photo, 2, event: event)
      get url
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end
  end

  # ── POST create ───────────────────────────────────────────

  describe 'POST /photos' do
    it 'retorna 401 sem autenticação' do
      expect { post url, params: valid_params }.not_to change(Photo, :count)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário autenticado que não é dono do evento' do
      expect {
        post url, params: valid_params, headers: auth_headers(intruder)
      }.not_to change(Photo, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it 'cria a foto quando o dono do evento envia' do
      expect {
        post url, params: valid_params, headers: auth_headers(owner)
      }.to change(Photo, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'cria a foto quando um admin envia' do
      expect {
        post url, params: valid_params, headers: auth_headers(admin)
      }.to change(Photo, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it 'rejeita URL de fora do Cloudinary do projeto' do
      params = valid_params.deep_merge(
        photo: { url: 'https://res.cloudinary.com/outra-conta/image/upload/foto.jpg' }
      )
      expect {
        post url, params: params, headers: auth_headers(owner)
      }.not_to change(Photo, :count)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  # ── DELETE destroy ────────────────────────────────────────

  describe 'DELETE /photos/:id' do
    let!(:photo) { create(:photo, event: event) }

    it 'retorna 401 sem autenticação' do
      expect { delete "#{url}/#{photo.id}" }.not_to change(Photo, :count)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna 403 para usuário que não é dono do evento' do
      expect {
        delete "#{url}/#{photo.id}", headers: auth_headers(intruder)
      }.not_to change(Photo, :count)
      expect(response).to have_http_status(:forbidden)
    end

    it 'remove a foto quando o dono envia' do
      expect {
        delete "#{url}/#{photo.id}", headers: auth_headers(owner)
      }.to change(Photo, :count).by(-1)
      expect(response).to have_http_status(:ok)
    end
  end
end

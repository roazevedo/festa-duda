require 'rails_helper'

RSpec.describe 'Api::V1::Authentication', type: :request do

  let(:user)  { create(:user, password: 'Senha@123456') }
  let(:admin) { create(:user, :admin, password: 'Senha@123456') }

  # ── Helper ────────────────────────────────────────────────

  def login(email, password)
    post '/api/v1/login',
      params:  { user: { email: email, password: password } },
      as:     :json
  end

  def auth_token(u = user)
    login(u.email, 'Senha@123456')
    response.headers['Authorization']
  end

  # ── Login ─────────────────────────────────────────────────

  describe 'POST /api/v1/login' do

    context 'com credenciais corretas' do
      before { login(user.email, 'Senha@123456') }

      it 'retorna status 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'retorna token JWT no header Authorization' do
        expect(response.headers['Authorization']).to be_present
        expect(response.headers['Authorization']).to include('Bearer')
      end

      it 'retorna mensagem de sucesso' do
        body = JSON.parse(response.body)
        expect(body['message']).to eq('Login realizado com sucesso.')
      end

      it 'retorna dados do usuário' do
        body = JSON.parse(response.body)
        expect(body['user']['email']).to eq(user.email)
      end
    end

    context 'com email incorreto' do
      it 'retorna 401' do
        login('naoexiste@email.com', 'Senha@123456')
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com senha incorreta' do
      it 'retorna 401' do
        login(user.email, 'senha_errada')
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com usuário admin' do
      it 'retorna admin: true' do
        login(admin.email, 'Senha@123456')
        body = JSON.parse(response.body)
        expect(body['user']['admin']).to be true
      end
    end

    context 'com usuário comum' do
      it 'retorna admin: false' do
        login(user.email, 'Senha@123456')
        body = JSON.parse(response.body)
        expect(body['user']['admin']).to be false
      end
    end
  end

  # ── Profile ───────────────────────────────────────────────

  describe 'GET /api/v1/profile' do

    context 'com token válido' do
      it 'retorna os dados do usuário logado' do
        get '/api/v1/profile',
          headers: { 'Authorization' => auth_token }

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['email']).to eq(user.email)
      end
    end

    context 'sem token' do
      it 'retorna 401' do
        get '/api/v1/profile'
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com token inválido' do
      it 'retorna 401' do
        get '/api/v1/profile',
          headers: { 'Authorization' => 'Bearer token_invalido_xpto' }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── Logout ────────────────────────────────────────────────

  describe 'DELETE /api/v1/logout' do

    it 'retorna 200 ao deslogar' do
      token = auth_token
      delete '/api/v1/logout',
        headers: { 'Authorization' => token }

      expect(response).to have_http_status(:ok)
    end

    it 'invalida o token após logout' do
      token = auth_token

      delete '/api/v1/logout',
        headers: { 'Authorization' => token }

      # Tenta usar o mesmo token após logout
      get '/api/v1/profile',
        headers: { 'Authorization' => token }

      expect(response).to have_http_status(:unauthorized)
    end
  end
end

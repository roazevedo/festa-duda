require 'rails_helper'

RSpec.describe 'Api::V1::Messages', type: :request do
  let(:event) { create(:event) }
  let(:url)   { "/api/v1/events/#{event.slug}/#{event.token}/messages" }

  # ── GET index ─────────────────────────────────────────────

  describe 'GET /messages' do
    it 'retorna todas as mensagens do evento' do
      create_list(:message, 3, event: event)
      get url
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(3)
    end

    it 'retorna mensagens em ordem decrescente' do
      msg1 = create(:message, event: event, name: 'Primeiro')
      msg2 = create(:message, event: event, name: 'Segundo')

      get url

      body = JSON.parse(response.body)
      expect(body.first['name']).to eq(msg2.name)
      expect(body.last['name']).to  eq(msg1.name)
    end

    it 'retorna 404 com token errado' do
      get "/api/v1/events/#{event.slug}/token-errado/messages"
      expect(response).to have_http_status(:not_found)
    end

    context 'quando o mural é privado' do
      let(:event) { create(:event, messages_public: false) }

      def auth_headers(u)
        post '/api/v1/login',
          params: { user: { email: u.email, password: 'Senha@123456' } },
          as:     :json
        { 'Authorization' => response.headers['Authorization'] }
      end

      it 'retorna 403 para visitantes' do
        create(:message, event: event)
        get url
        expect(response).to have_http_status(:forbidden)
      end

      it 'retorna as mensagens para o dono do evento' do
        create(:message, event: event)
        get url, headers: auth_headers(event.user)
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body).length).to eq(1)
      end
    end
  end

  # ── POST create ───────────────────────────────────────────

  describe 'POST /messages' do
    context 'com dados válidos' do
      let(:params) do
        { message: { name: 'Tia Célia', body: 'Parabéns minha querida!' } }
      end

      it 'cria a mensagem' do
        expect { post url, params: params }.to change(Message, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it 'retorna os dados da mensagem criada' do
        post url, params: params
        body = JSON.parse(response.body)
        expect(body['name']).to eq('Tia Célia')
        expect(body['body']).to eq('Parabéns minha querida!')
      end
    end

    context 'com dados inválidos' do
      it 'retorna 422 sem nome' do
        expect {
          post url, params: { message: { name: '', body: 'Mensagem sem nome' } }
        }.not_to change(Message, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'retorna 422 sem corpo' do
        expect {
          post url, params: { message: { name: 'Alguém', body: '' } }
        }.not_to change(Message, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end

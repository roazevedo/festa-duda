# spec/requests/api/v1/rate_limiting_spec.rb
require 'rails_helper'

RSpec.describe 'Rate Limiting (Rack::Attack)', type: :request, rate_limit: true do

  # ── Login: throttle por IP ──────────────────────────────

  describe 'login throttle por IP' do
    it 'permite até 5 tentativas em 20 segundos' do
      5.times do
        post '/api/v1/login',
          params: { user: { email: 'qualquer@teste.com', password: 'errada' } },
          as:     :json
      end

      # A 5ª tentativa ainda deve ser processada normalmente (401, não 429)
      expect(response).to have_http_status(:unauthorized)
    end

    it 'bloqueia a 6ª tentativa com 429' do
      6.times do
        post '/api/v1/login',
          params: { user: { email: 'qualquer@teste.com', password: 'errada' } },
          as:     :json
      end

      expect(response).to have_http_status(:too_many_requests)
    end

    it 'retorna corpo JSON com mensagem de erro' do
      6.times do
        post '/api/v1/login',
          params: { user: { email: 'qualquer@teste.com', password: 'errada' } },
          as:     :json
      end

      body = JSON.parse(response.body)
      expect(body['error']).to be_present
    end

    it 'retorna header Retry-After' do
      6.times do
        post '/api/v1/login',
          params: { user: { email: 'qualquer@teste.com', password: 'errada' } },
          as:     :json
      end

      expect(response.headers['Retry-After']).to be_present
    end
  end

  # ── Login: throttle por email ───────────────────────────

  describe 'login throttle por email' do
    it 'bloqueia após 5 tentativas com o mesmo email, mesmo de IPs diferentes' do
      6.times do |i|
        post '/api/v1/login',
          params:  { user: { email: 'alvo@teste.com', password: 'errada' } },
          headers: { 'REMOTE_ADDR' => "10.0.0.#{i}" },
          as:      :json
      end

      expect(response).to have_http_status(:too_many_requests)
    end

    it 'não bloqueia emails diferentes vindos de IPs diferentes' do
      5.times do |i|
        post '/api/v1/login',
          params:  { user: { email: "user#{i}@teste.com", password: 'errada' } },
          headers: { 'REMOTE_ADDR' => "10.0.1.#{i}" },
          as:      :json
      end

      expect(response).to have_http_status(:unauthorized)
    end
  end

  # ── Criação de RSVP/Mensagens: throttle por IP ──────────

  describe 'throttle de criação de RSVPs' do
    let(:event) { create(:event) }

    it 'permite até 10 RSVPs por minuto' do
      10.times do |i|
        post "/api/v1/events/#{event.slug}/#{event.token}/rsvps",
          params: { rsvp: { name: "Convidado #{i}", guests: 0, attending: 'yes' } },
          as:     :json
      end

      expect(response).to have_http_status(:created)
    end

    it 'bloqueia o 11º RSVP em 1 minuto' do
      11.times do |i|
        post "/api/v1/events/#{event.slug}/#{event.token}/rsvps",
          params: { rsvp: { name: "Convidado #{i}", guests: 0, attending: 'yes' } },
          as:     :json
      end

      expect(response).to have_http_status(:too_many_requests)
    end
  end

  describe 'throttle de criação de mensagens' do
    let(:event) { create(:event) }

    it 'bloqueia a 11ª mensagem em 1 minuto' do
      11.times do |i|
        post "/api/v1/events/#{event.slug}/#{event.token}/messages",
          params: { message: { name: "Convidado #{i}", body: 'Parabéns!' } },
          as:     :json
      end

      expect(response).to have_http_status(:too_many_requests)
    end
  end
end

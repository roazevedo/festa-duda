require 'rails_helper'

RSpec.describe 'Api::V1::Events', type: :request do
  let(:admin) { create(:user, :admin, password: 'Senha@123456') }
  let(:user)  { create(:user, password: 'Senha@123456') }
  let!(:event) { create(:event, user: admin) }

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  # ── GET show (público) ────────────────────────────────────

  describe 'GET /api/v1/events/:slug/:token' do
    context 'com slug e token corretos' do
      before { get "/api/v1/events/#{event.slug}/#{event.token}" }

      it 'retorna 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'retorna os dados do evento' do
        body = JSON.parse(response.body)
        expect(body['name']).to eq(event.name)
        expect(body['slug']).to eq(event.slug)
      end

      it 'retorna o token do evento' do
        body = JSON.parse(response.body)
        expect(body['token']).to eq(event.token)
      end

      it 'retorna stats do evento' do
        body = JSON.parse(response.body)
        expect(body['stats']).to include('rsvps', 'messages', 'photos')
      end
    end

    context 'com stats preenchidos' do
      it 'contabiliza apenas rsvps confirmados' do
        create_list(:rsvp, 3, event: event, attending: 'yes')
        create(:rsvp, event: event, attending: 'no')

        get "/api/v1/events/#{event.slug}/#{event.token}"

        body = JSON.parse(response.body)
        expect(body['stats']['rsvps']).to eq(3)
      end
    end

    context 'com token errado' do
      it 'retorna 404' do
        get "/api/v1/events/#{event.slug}/token-errado"
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'com slug errado' do
      it 'retorna 404' do
        get "/api/v1/events/slug-errado/#{event.token}"
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  # ── GET index (autenticado) ───────────────────────────────

  describe 'GET /api/v1/events' do
    context 'usuário autenticado' do
      it 'retorna apenas os próprios eventos' do
        outro_evento = create(:event, user: user)

        get '/api/v1/events', headers: auth_headers(admin)

        body  = JSON.parse(response.body)
        slugs = body.map { |e| e['slug'] }

        expect(slugs).to include(event.slug)
        expect(slugs).not_to include(outro_evento.slug)
      end
    end

    context 'sem autenticação' do
      it 'retorna 401' do
        get '/api/v1/events'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  # ── POST create ───────────────────────────────────────────

  describe 'POST /api/v1/events' do
    let(:valid_params) do
      {
        event: {
          name:          'Festa da Ana',
          slug:          'festa-da-ana',
          event_type:    'aniversario',
          event_date:    2.months.from_now,
          venue_name:    'Salão Festivo',
          venue_address: 'Rua B, 200'
        }
      }
    end

    context 'usuário autenticado com dados válidos' do
      it 'cria o evento' do
        expect {
          post '/api/v1/events',
            params:  valid_params,
            headers: auth_headers(admin)
        }.to change(Event, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it 'gera token automaticamente' do
        post '/api/v1/events',
          params:  valid_params,
          headers: auth_headers(admin)

        body = JSON.parse(response.body)
        expect(body['token']).to be_present
      end
    end

    context 'sem autenticação' do
      it 'não cria e retorna 401' do
        expect {
          post '/api/v1/events', params: valid_params
        }.not_to change(Event, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com dados inválidos' do
      it 'retorna 422 com erros' do
        post '/api/v1/events',
          params:  { event: { name: '', slug: '', event_type: 'invalido' } },
          headers: auth_headers(admin)

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body['errors']).to be_present
      end
    end
  end
end

require 'rails_helper'

RSpec.describe 'Api::V1::Rsvps', type: :request do

  let(:event) { create(:event) }
  let(:url)   { "/api/v1/events/#{event.slug}/#{event.token}/rsvps" }

  # ── GET index ─────────────────────────────────────────────

  describe 'GET /rsvps' do

    it 'retorna todos os rsvps do evento' do
      create_list(:rsvp, 4, event: event)
      get url
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(4)
    end

    it 'retorna lista vazia se não houver rsvps' do
      get url
      expect(JSON.parse(response.body)).to be_empty
    end

    it 'retorna 404 com token errado' do
      get "/api/v1/events/#{event.slug}/token-invalido/rsvps"
      expect(response).to have_http_status(:not_found)
    end
  end

  # ── POST create ───────────────────────────────────────────

  describe 'POST /rsvps' do

    context 'com dados válidos' do
      let(:params) { { rsvp: { name: 'João Silva', guests: 1, attending: 'yes', restriction: '' } } }

      it 'cria o rsvp' do
        expect { post url, params: params }.to change(Rsvp, :count).by(1)
        expect(response).to have_http_status(:created)
      end

      it 'retorna os dados do rsvp criado' do
        post url, params: params
        body = JSON.parse(response.body)
        expect(body['name']).to     eq('João Silva')
        expect(body['attending']).to eq('yes')
      end
    end

    context 'confirmando presença' do
      it 'salva attending como yes' do
        post url, params: { rsvp: { name: 'Ana', guests: 2, attending: 'yes' } }
        expect(JSON.parse(response.body)['attending']).to eq('yes')
      end
    end

    context 'recusando presença' do
      it 'salva attending como no' do
        post url, params: { rsvp: { name: 'Pedro', guests: 0, attending: 'no' } }
        expect(JSON.parse(response.body)['attending']).to eq('no')
      end
    end

    context 'com restrição alimentar' do
      it 'salva a restrição corretamente' do
        post url, params: { rsvp: { name: 'Clara', guests: 0, attending: 'yes', restriction: 'Vegana' } }
        expect(JSON.parse(response.body)['restriction']).to eq('Vegana')
      end
    end

    context 'com dados inválidos' do
      it 'retorna 422 sem nome' do
        expect {
          post url, params: { rsvp: { name: '', guests: 1, attending: 'yes' } }
        }.not_to change(Rsvp, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'retorna 422 com attending inválido' do
        expect {
          post url, params: { rsvp: { name: 'Alguém', guests: 1, attending: 'talvez_nao' } }
        }.not_to change(Rsvp, :count)
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end

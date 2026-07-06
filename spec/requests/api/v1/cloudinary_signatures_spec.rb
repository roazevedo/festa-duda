require 'rails_helper'

RSpec.describe 'Api::V1::CloudinarySignatures', type: :request do
  let(:user) { create(:user, password: 'Senha@123456') }
  let(:url)  { '/api/v1/cloudinary/signature' }

  def auth_headers(u)
    post '/api/v1/login',
      params: { user: { email: u.email, password: 'Senha@123456' } },
      as:     :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  around do |example|
    old_key, old_secret = ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET']
    ENV['CLOUDINARY_API_KEY']    = 'test-key'
    ENV['CLOUDINARY_API_SECRET'] = 'test-secret'
    example.run
    ENV['CLOUDINARY_API_KEY'], ENV['CLOUDINARY_API_SECRET'] = old_key, old_secret
  end

  describe 'POST /cloudinary/signature' do
    it 'retorna 401 sem autenticação' do
      post url, params: { folder: 'festa-duda/galeria' }
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna a assinatura correta para usuário autenticado' do
      post url, params: { folder: 'festa-duda/galeria' }, headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)

      expected = Digest::SHA1.hexdigest(
        "folder=festa-duda/galeria&timestamp=#{body['timestamp']}" \
        "&upload_preset=#{body['upload_preset']}test-secret"
      )
      expect(body['signature']).to  eq(expected)
      expect(body['api_key']).to    eq('test-key')
      expect(body['cloud_name']).to eq(Photo::CLOUD_NAME)
    end

    it 'usa a pasta padrão quando nenhuma é informada' do
      post url, headers: auth_headers(user)
      expect(JSON.parse(response.body)['folder']).to eq('festa-duda')
    end

    it 'rejeita pasta fora do padrão do projeto' do
      post url, params: { folder: '../outra-conta' }, headers: auth_headers(user)
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'retorna 503 quando as chaves não estão configuradas' do
      ENV['CLOUDINARY_API_KEY'] = nil
      ENV['CLOUDINARY_API_SECRET'] = nil
      allow(Rails.application.credentials).to receive(:dig).with(:cloudinary, anything).and_return(nil)
      post url, params: { folder: 'festa-duda/galeria' }, headers: auth_headers(user)
      expect(response).to have_http_status(:service_unavailable)
    end
  end
end

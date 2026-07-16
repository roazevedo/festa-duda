require 'rails_helper'

RSpec.describe 'Api::V1::GiftCatalog', type: :request do
  let(:url) { '/api/v1/gift_catalog' }

  before do
    create(:catalog_gift, key: 'adega',  event_type: 'casamento',   name: 'Adega',  position: 1)
    create(:catalog_gift, key: 'panela', event_type: 'casamento',   name: 'Panela', position: 0)
    create(:catalog_gift, key: 'valsa',  event_type: 'quinze_anos', name: 'Valsa',  position: 0)
  end

  it 'é público e retorna o catálogo completo' do
    get url
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).length).to eq(3)
  end

  it 'filtra por event_type e ordena por posição' do
    get url, params: { event_type: 'casamento' }
    body = JSON.parse(response.body)
    expect(body.map { |i| i['id'] }).to eq(%w[panela adega])
  end

  it 'retorna lista vazia para event_type sem itens' do
    get url, params: { event_type: 'bodas_de_ouro' }
    expect(JSON.parse(response.body)).to eq([])
  end

  it 'serializa os campos esperados com preço numérico' do
    get url, params: { event_type: 'quinze_anos' }
    item = JSON.parse(response.body).first
    expect(item.keys).to match_array(
      %w[id event_type name description price category image_url]
    )
    expect(item['price']).to be_a(Float)
  end

  it 'devolve cache público com ETag e responde 304 na revalidação' do
    get url
    expect(response.headers['Cache-Control']).to include('public')
    etag = response.headers['ETag']
    expect(etag).to be_present

    get url, headers: { 'If-None-Match' => etag }
    expect(response).to have_http_status(:not_modified)
  end
end

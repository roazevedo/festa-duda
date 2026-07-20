require 'rails_helper'

RSpec.describe CatalogGift, type: :model do
  describe 'validações' do
    it 'é válido com os atributos da factory' do
      expect(build(:catalog_gift)).to be_valid
    end

    it 'exige key, name e price' do
      expect(build(:catalog_gift, key: nil)).not_to be_valid
      expect(build(:catalog_gift, name: nil)).not_to be_valid
      expect(build(:catalog_gift, price: nil)).not_to be_valid
    end

    it 'rejeita preço zero ou negativo' do
      expect(build(:catalog_gift, price: 0)).not_to be_valid
      expect(build(:catalog_gift, price: -10)).not_to be_valid
    end

    it 'rejeita event_type fora da lista' do
      expect(build(:catalog_gift, event_type: 'churrasco')).not_to be_valid
    end

    it 'aceita o escopo geral (sugestões para qualquer evento)' do
      expect(build(:catalog_gift, event_type: 'geral')).to be_valid
    end

    it 'rejeita key duplicada dentro do mesmo event_type' do
      create(:catalog_gift, key: 'adega', event_type: 'casamento')
      expect(build(:catalog_gift, key: 'adega', event_type: 'casamento')).not_to be_valid
      expect(build(:catalog_gift, key: 'adega', event_type: 'quinze_anos')).to be_valid
    end

    it 'rejeita key com formato inválido' do
      expect(build(:catalog_gift, key: 'Com Espaço')).not_to be_valid
    end
  end

  describe '.sync_from_file!' do
    let(:yaml_path) { Rails.root.join('tmp', 'catalog_test.yml') }

    def write_catalog(content)
      File.write(yaml_path, content)
    end

    after { FileUtils.rm_f(yaml_path) }

    it 'cria os itens do arquivo com posição pela ordem da lista' do
      write_catalog(<<~YAML)
        casamento:
          - key: adega
            name: Adega do casal
            price: 120.0
          - key: panelas
            name: Jogo de panelas
            description: Nunca vai pro fogo
            price: 180.0
            category: casa_nova
      YAML

      described_class.sync_from_file!(yaml_path)

      expect(described_class.count).to eq(2)
      panelas = described_class.find_by(key: 'panelas')
      expect(panelas.position).to eq(1)
      expect(panelas.category).to eq('casa_nova')
    end

    it 'atualiza itens existentes e remove os que saíram do arquivo' do
      create(:catalog_gift, key: 'adega', event_type: 'casamento', price: 120.0)
      create(:catalog_gift, key: 'removido', event_type: 'casamento')
      create(:catalog_gift, key: 'outro-tipo', event_type: 'quinze_anos')

      write_catalog(<<~YAML)
        casamento:
          - key: adega
            name: Adega do casal
            price: 150.0
      YAML

      described_class.sync_from_file!(yaml_path)

      expect(described_class.find_by(key: 'adega').price).to eq(150.0)
      expect(described_class.find_by(key: 'removido')).to be_nil
      # tipos ausentes do arquivo também são limpos
      expect(described_class.find_by(key: 'outro-tipo')).to be_nil
    end

    it 'sincroniza o catálogo real do repositório sem erros' do
      described_class.sync_from_file!
      expect(described_class.count).to be > 0
      # o catálogo é único para a plataforma: tudo vive no escopo geral
      expect(described_class.for_event_type('geral').count).to eq(described_class.count)
    end
  end
end

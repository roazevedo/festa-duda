# Catálogo curado de sugestões de presente por tipo de evento.
# A fonte da verdade é db/gift_catalog.yml (versionado no git);
# esta tabela é só a projeção dele para a API — sincronize com
# `rails catalog:sync` após editar o arquivo.
#
# Quando o organizador escolhe um item, o frontend cria um Gift do
# evento copiando os campos (snapshot) — mudanças posteriores no
# catálogo não afetam listas já montadas.
class CatalogGift < ApplicationRecord
  CATALOG_FILE = Rails.root.join("db/gift_catalog.yml")

  # "geral" agrupa sugestões válidas para qualquer tipo de evento
  # (produtos, viagens, experiências); os demais escopos são os
  # tipos de evento e guardam os itens exclusivos de cada um.
  SCOPES = (%w[geral] + Event::TYPES).freeze

  validates :key,        presence: true, uniqueness: { scope: :event_type },
                         format: { with: /\A[a-z0-9\-]+\z/ }
  validates :event_type, presence: true, inclusion: { in: SCOPES }
  validates :name,       presence: true
  validates :price,      presence: true,
                         numericality: { greater_than: 0 }

  scope :for_event_type, ->(type) { where(event_type: type) }

  # Upsert por (event_type, key) seguindo o YAML; itens que saíram
  # do arquivo são removidos e a posição segue a ordem da lista.
  def self.sync_from_file!(path = CATALOG_FILE)
    data = YAML.safe_load_file(path) || {}

    transaction do
      data.each do |event_type, items|
        items.each_with_index do |item, index|
          gift = find_or_initialize_by(event_type: event_type, key: item.fetch("key"))
          gift.update!(
            name:        item.fetch("name"),
            description: item["description"],
            price:       item.fetch("price"),
            category:    item["category"],
            image_url:   item["image_url"],
            position:    index
          )
        end
        where(event_type: event_type)
          .where.not(key: items.map { |i| i.fetch("key") })
          .destroy_all
      end
      where.not(event_type: data.keys).destroy_all
    end
  end
end

# Catálogo de sugestões de presente — endpoint público, só leitura.
# Os dados vêm de db/gift_catalog.yml via `rails catalog:sync`.
class Api::V1::GiftCatalogController < ApplicationController
  def index
    items = CatalogGift.all
    if params[:event_type].present?
      items = items.for_event_type(params[:event_type])
    end
    items = items.order(:event_type, :position, :id)

    # O catálogo muda raramente — cache público no navegador/CDN
    # mais revalidação por ETag/Last-Modified.
    expires_in 1.hour, public: true
    return unless stale?(items)

    render json: items.map { |item| catalog_gift_json(item) }
  end

  private

  def catalog_gift_json(item)
    {
      id:          item.key,
      event_type:  item.event_type,
      name:        item.name,
      description: item.description,
      price:       item.price.to_f,
      category:    item.category,
      image_url:   item.image_url
    }
  end
end

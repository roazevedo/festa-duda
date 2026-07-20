class Api::V1::PhotosController < Api::V1::EventResourcesController
  before_action :authenticate_user!, only: [ :create, :update, :destroy, :reorder ]
  before_action :authorize_owner!,   only: [ :create, :update, :destroy, :reorder ]
  before_action :set_photo,          only: [ :update, :destroy ]
  ALLOWED_CATEGORIES = %w[galeria traje save_the_date convite].freeze

  def index
    photos = @event.photos
    photos = photos.where(category: params[:category]) if params[:category].present?
    render json: photos.order(Arel.sql("position ASC NULLS LAST"), created_at: :asc)
                       .map { |p| photo_json(p) }
  end

  def create
    photo = @event.photos.build(photo_params)

    # Limite do plano vale para a galeria; as demais categorias
    # (traje, convite, save the date) têm poucas fotos por natureza
    limit = @event.plan_limits[:photos]
    if photo.category == "galeria" && limit &&
       @event.photos.where(category: "galeria").count >= limit
      return render json: {
        errors: [ "O plano Grátis permite até #{limit} fotos na galeria. " \
                  "Faça upgrade para o plano Completo e envie quantas quiser." ]
      }, status: :unprocessable_entity
    end

    # Nova foto entra no fim do álbum da sua categoria
    photo.position =
      (@event.photos.where(category: photo.category).maximum(:position) || -1) + 1
    if photo.save
      render json: photo_json(photo), status: :created
    else
      render json: { errors: photo.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  # PATCH /events/:slug/:token/photos/reorder  { ids: [3, 1, 2] }
  # Regrava as posições conforme a ordem enviada pelo painel.
  def reorder
    ids    = Array(params[:ids]).map(&:to_i)
    photos = @event.photos.where(id: ids).index_by(&:id)

    if ids.empty? || photos.size != ids.size
      return render json: { error: "Lista de fotos inválida." },
                    status: :unprocessable_entity
    end

    Photo.transaction do
      ids.each_with_index do |id, index|
        photos[id].update_column(:position, index)
      end
    end
    render json: { message: "Ordem atualizada." }
  end

  def update
    if @photo.update(photo_params)
      render json: photo_json(@photo)
    else
      render json: { errors: @photo.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def destroy
    @photo.destroy
    render json: { message: "Foto removida." }
  end

  private

  def set_photo
    @photo = @event.photos.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Foto não encontrada." }, status: :not_found
  end

  def photo_params
    params.require(:photo).permit(:url, :cloudinary_id, :thumb_url, :caption, :category)
          .tap do |p|
      unless ALLOWED_CATEGORIES.include?(p[:category])
        raise ActionController::BadRequest, "Categoria inválida"
      end
    end
  end

  def photo_json(photo)
    {
      id:            photo.id,
      url:           photo.url,
      thumb_url:     photo.thumb_url,
      caption:       photo.caption,
      cloudinary_id: photo.cloudinary_id,
      category:      photo.category,
      position:      photo.position,
      created_at:    photo.created_at
    }
  end
end

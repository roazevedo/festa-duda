class Api::V1::PhotosController < Api::V1::EventResourcesController
  before_action :authenticate_user!, only: [ :create, :update, :destroy ]
  before_action :authorize_owner!,   only: [ :create, :update, :destroy ]
  before_action :set_photo,          only: [ :update, :destroy ]
  ALLOWED_CATEGORIES = %w[galeria traje save_the_date convite].freeze

  def index
    photos = @event.photos
    photos = photos.where(category: params[:category]) if params[:category].present?
    render json: photos.order(created_at: :asc).map { |p| photo_json(p) }
  end

  def create
    photo = @event.photos.build(photo_params)
    if photo.save
      render json: photo_json(photo), status: :created
    else
      render json: { errors: photo.errors.full_messages },
             status: :unprocessable_entity
    end
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
      created_at:    photo.created_at
    }
  end
end

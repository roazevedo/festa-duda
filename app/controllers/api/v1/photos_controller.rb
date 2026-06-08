class Api::V1::PhotosController < Api::V1::EventResourcesController
  before_action :authenticate_user!, only: [ :create, :update, :destroy ]
  before_action :set_photo,          only: [ :update, :destroy ]

  def index
    photos = @event.photos.order(created_at: :asc)
    render json: photos.map { |p| photo_json(p) }
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
    render json: { message: 'Foto removida.' }
  end

  private

  def set_photo
    @photo = @event.photos.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Foto não encontrada.' }, status: :not_found
  end

  def photo_params
    params.require(:photo).permit(:url, :thumb_url, :caption, :cloudinary_id)
  end

  def photo_json(photo)
    {
      id:            photo.id,
      url:           photo.url,
      thumb_url:     photo.thumb_url,
      caption:       photo.caption,
      cloudinary_id: photo.cloudinary_id,
      created_at:    photo.created_at
    }
  end
end

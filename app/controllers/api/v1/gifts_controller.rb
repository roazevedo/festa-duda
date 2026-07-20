class Api::V1::GiftsController < Api::V1::EventResourcesController
  before_action :authenticate_user!, only: [ :create, :update, :destroy ]
  before_action :authorize_owner!,   only: [ :create, :update, :destroy ]
  before_action :set_gift,           only: [ :update, :destroy ]

  def index
    render json: @event.gifts.order(created_at: :asc).map { |g| gift_json(g) }
  end

  def create
    limit = @event.plan_limits[:gifts]
    if limit && @event.gifts.count >= limit
      return render json: {
        errors: [ "O plano Grátis permite até #{limit} presentes na lista. " \
                  "Faça upgrade para o plano Completo e cadastre quantos quiser." ]
      }, status: :unprocessable_entity
    end

    gift = @event.gifts.build(gift_params)
    if gift.save
      render json: gift_json(gift), status: :created
    else
      render json: { errors: gift.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def update
    if @gift.update(gift_params)
      render json: gift_json(@gift)
    else
      render json: { errors: @gift.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  def destroy
    @gift.destroy
    render json: { message: "Presente removido." }
  end

  private

  def set_gift
    @gift = @event.gifts.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Presente não encontrado." }, status: :not_found
  end

  def gift_params
    params.require(:gift).permit(:name, :description, :price, :image_url)
  end

  def gift_json(gift)
    {
      id:          gift.id,
      name:        gift.name,
      description: gift.description,
      price:       gift.price.to_f,
      image_url:   gift.image_url,
      created_at:  gift.created_at
    }
  end
end

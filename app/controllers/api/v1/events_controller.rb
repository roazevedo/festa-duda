class Api::V1::EventsController < ApplicationController
  before_action :authenticate_user!, only: [ :index, :create, :update, :destroy ]
  before_action :set_event,          only: [ :show, :update, :destroy ]
  before_action :authorize_owner!,   only: [ :update, :destroy ]

  # GET /api/v1/events/:slug/:token — público
  def show
    render json: event_json(@event)
  end

  # GET /api/v1/events — lista eventos do usuário logado
  def index
    events = current_user.events.order(created_at: :desc)
    render json: events.map { |e| event_json(e) }
  end

  # POST /api/v1/events
  def create
    event = current_user.events.build(event_params)
    if event.save
      render json: event_json(event), status: :created
    else
      render json: { errors: event.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/events/:slug/:token
  def update
    if @event.update(event_params)
      render json: event_json(@event)
    else
      render json: { errors: @event.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/events/:slug/:token
  def destroy
    @event.destroy
    render json: { message: "Evento removido." }
  end

  private

  def set_event
    @event = Event.find_by!(slug: params[:slug], token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Evento não encontrado." }, status: :not_found
  end

  def authorize_owner!
    unless @event.user == current_user || current_user.admin?
      render json: { error: "Não autorizado." }, status: :forbidden
    end
  end

  def event_params
    params.require(:event).permit(
      :slug,
      :name,
      :event_type,
      :event_date,
      :venue_name,
      :venue_address,
      :rsvp_list_public,
      :messages_public,
      settings: {}
    )
  end

  def event_json(event)
    {
      id:               event.id,
      slug:             event.slug,
      token:            event.token,
      name:             event.name,
      event_type:       event.event_type,
      event_date:       event.event_date,
      venue_name:       event.venue_name,
      venue_address:    event.venue_address,
      rsvp_list_public: event.rsvp_list_public,
      messages_public:  event.messages_public,
      settings:         event.settings || {},
      stats: {
        rsvps:    event.rsvps.where(attending: "yes").count,
        messages: event.messages.count,
        photos:   event.photos.count
      }
    }
  end
end

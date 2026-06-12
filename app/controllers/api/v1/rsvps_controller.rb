class Api::V1::RsvpsController < Api::V1::EventResourcesController
  before_action :set_event
  def index
    unless @event.rsvp_list_public? || admin_viewing?
      render json: { error: "Lista privada" }, status: :forbidden and return
    end
    render json: @event.rsvps
  end

  def create
    rsvp = @event.rsvps.build(rsvp_params)
    if rsvp.save
      render json: rsvp_json(rsvp), status: :created
    else
      render json: { errors: rsvp.errors.full_messages },
             status: :unprocessable_entity
    end
  end

  private

  def rsvp_params
    params.require(:rsvp).permit(:name, :guests, :attending, :restriction)
  end

  def rsvp_json(rsvp)
    {
      id:          rsvp.id,
      name:        rsvp.name,
      guests:      rsvp.guests,
      attending:   rsvp.attending,
      restriction: rsvp.restriction,
      created_at:  rsvp.created_at
    }
  end

  def set_event
    @event = Event.find_by!(slug: params[:slug], token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Evento não encontrado." }, status: :not_found
  end

  def admin_viewing?
    current_user.present? && (current_user.admin? || @event.user == current_user)
  end
end

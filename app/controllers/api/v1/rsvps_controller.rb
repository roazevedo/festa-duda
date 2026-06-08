class Api::V1::RsvpsController < Api::V1::EventResourcesController
  def index
    rsvps = @event.rsvps.order(created_at: :desc)
    render json: rsvps.map { |r| rsvp_json(r) }
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
end

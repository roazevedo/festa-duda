class Api::V1::EventResourcesController < ApplicationController
  before_action :set_event

  private

  def set_event
    @event = Event.find_by!(slug: params[:slug], token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Evento não encontrado.' }, status: :not_found
  end
end

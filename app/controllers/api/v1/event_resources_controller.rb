class Api::V1::EventResourcesController < ApplicationController
  before_action :set_event

  private

  def set_event
    @event = Event.find_by!(slug: params[:slug], token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Evento não encontrado.' }, status: :not_found
  end

  # Só o dono do evento (ou um admin da plataforma) pode gerenciar
  # os recursos do evento — o slug+token é público (vai no convite),
  # então estar autenticado NÃO basta para autorizar escrita.
  def authorize_owner!
    unless admin_viewing?
      render json: { error: 'Não autorizado.' }, status: :forbidden
    end
  end

  def admin_viewing?
    current_user.present? && (current_user.admin? || @event.user == current_user)
  end
end

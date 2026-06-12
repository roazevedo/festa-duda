module EventOwnable
  extend ActiveSupport::Concern

  included do
    before_action :verify_event_ownership!, only: [ :update, :destroy ]
  end

  private

  def verify_event_ownership!
    unless @event.user == current_user
      render json: { error: "Acesso negado." }, status: :forbidden
    end
  end
end

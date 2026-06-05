class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!

  private

  def current_user_json
    {
      id:    current_user.id,
      email: current_user.email,
      admin: current_user.admin?
    }
  end
end

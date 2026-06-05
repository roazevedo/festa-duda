class Api::V1::ProfileController < Api::V1::BaseController
  def show
    render json: current_user_json
  end
end

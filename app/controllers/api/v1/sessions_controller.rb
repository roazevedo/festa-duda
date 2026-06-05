class Api::V1::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    render json: {
      message: "Login realizado com sucesso.",
      user: {
        id:    resource.id,
        email: resource.email,
        admin: resource.admin?
      }
    }, status: :ok
  end

  def destroy
    sign_out(current_user)
    render json: { message: "Logout realizado com sucesso." }, status: :ok
  end
end

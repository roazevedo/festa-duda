class Api::V1::RegistrationsController < Devise::RegistrationsController
  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: "Cadastro realizado com sucesso.",
        user: { id: resource.id, email: resource.email, admin: resource.admin? }
      }, status: :created
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

class Api::V1::SessionsController < ApplicationController
  def create
    user = User.find_by(email: params.dig(:user, :email))

    if user&.valid_password?(params.dig(:user, :password))
      warden.set_user(user, scope: :user)  # ← dispara o JWT dispatch sem sessão
      render json: {
        message: "Login realizado com sucesso.",
        user: {
          id:    user.id,
          email: user.email,
          admin: user.admin?
        }
      }, status: :ok
    else
      render json: { error: "Credenciais inválidas." }, status: :unauthorized
    end
  end

  def jwt_logout
    token = request.headers["Authorization"]&.split(" ")&.last
    if token.present?
      begin
        payload = JWT.decode(
          token,
          Rails.application.credentials.secret_key_base,
          true,
          algorithms: [ "HS256" ]
        ).first
        JwtDenylist.create!(jti: payload["jti"], exp: Time.at(payload["exp"]))
      rescue StandardError
        # Token inválido ou expirado
      end
    end
    render json: { message: "Logout realizado com sucesso." }, status: :ok
  end
end

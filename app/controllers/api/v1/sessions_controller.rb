class Api::V1::SessionsController < ApplicationController
  def create
    user = User.find_by(email: params.dig(:user, :email))

    if user&.valid_password?(params.dig(:user, :password))
      warden.set_user(user, scope: :user)

      # O token JWT recém-gerado fica em request.env neste ponto —
      # o header Authorization só é escrito DEPOIS, por um middleware
      # do devise-jwt (response.headers ainda estaria nil aqui).
      token = request.env["warden-jwt_auth.token"] ||
              response.headers["Authorization"]&.split(" ")&.last

      if token
        jti = JWT.decode(token, nil, false).first["jti"]
        SessionActivity.store.write(
          "jwt_last_seen:#{jti}", Time.current, expires_in: SessionActivity::INACTIVITY_TIMEOUT
        )
      end

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
          Rails.application.secret_key_base,
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

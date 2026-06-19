class Api::V1::RegistrationsController < ApplicationController
  def create
    user = User.new(sign_up_params)
    user.admin = false # nunca permite que o cadastro público se torne admin

    if user.save
      warden.set_user(user, scope: :user)
      prime_session_activity!

      render json: {
        message: "Cadastro realizado com sucesso.",
        user: { id: user.id, email: user.email, admin: user.admin? }
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  # O JWT recém-gerado pelo devise-jwt fica em request.env neste ponto —
  # o header Authorization da resposta só é escrito depois, por um
  # middleware do próprio devise-jwt (mesmo padrão usado no login).
  def prime_session_activity!
    token = request.env["warden-jwt_auth.token"]
    return unless token

    jti = JWT.decode(token, nil, false).first["jti"]
    SessionActivity.store.write(
      "jwt_last_seen:#{jti}", Time.current, expires_in: SessionActivity::INACTIVITY_TIMEOUT
    )
  end
end

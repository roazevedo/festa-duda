require "net/http"
require "json"

# app/controllers/api/v1/google_auth_controller.rb
#
# Recebe o Google ID Token do frontend (via @react-oauth/google),
# verifica autenticidade junto ao Google, encontra ou cria o usuário
# e retorna um JWT próprio da plataforma — igual ao fluxo de login manual.
class Api::V1::GoogleAuthController < ApplicationController
  GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

  def create
    credential = params[:credential]
    return render json: { error: "Token não informado." }, status: :bad_request unless credential.present?

    payload = verify_google_token(credential)
    return render json: { error: "Token do Google inválido." }, status: :unauthorized unless payload

    user = User.find_or_create_from_google(
      email: payload["email"],
      uid:   payload["sub"],
      name:  payload["name"]
    )

    warden.set_user(user, scope: :user)
    prime_session_activity!

    render json: {
      message: "Login realizado com sucesso.",
      user:    { id: user.id, email: user.email, admin: user.admin? }
    }, status: :ok
  end

  private

  def verify_google_token(credential)
    uri      = URI("#{GOOGLE_TOKEN_INFO_URL}?id_token=#{credential}")
    response = Net::HTTP.get_response(uri)
    return nil unless response.is_a?(Net::HTTPSuccess)

    payload   = JSON.parse(response.body)
    client_id = Rails.application.credentials.google_client_id

    return nil unless payload["email_verified"] == "true"
    return nil unless payload["aud"] == client_id

    payload
  rescue StandardError
    nil
  end

  # Mesmo padrão do SessionsController e RegistrationsController:
  # priming manual porque response.headers ainda não tem o token neste ponto.
  def prime_session_activity!
    token = request.env["warden-jwt_auth.token"]
    return unless token

    jti = JWT.decode(token, nil, false).first["jti"]
    SessionActivity.store.write(
      "jwt_last_seen:#{jti}", Time.current, expires_in: SessionActivity::INACTIVITY_TIMEOUT
    )
  end
end

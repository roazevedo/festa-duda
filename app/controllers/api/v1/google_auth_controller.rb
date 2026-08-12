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

  # `prime_session_activity!` vem do ApplicationController (compartilhado com
  # o fluxo de cadastro e verificação de e-mail).

  def verify_google_token(credential)
    uri  = URI("#{GOOGLE_TOKEN_INFO_URL}?#{URI.encode_www_form(id_token: credential)}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = true
    http.open_timeout = 5
    http.read_timeout = 5

    response = http.get(uri.request_uri)
    return nil unless response.is_a?(Net::HTTPSuccess)

    payload   = JSON.parse(response.body)
    client_id = Rails.application.credentials.google_client_id

    return nil unless payload["email_verified"] == "true"
    return nil unless payload["aud"] == client_id

    payload
  rescue StandardError
    nil
  end
end

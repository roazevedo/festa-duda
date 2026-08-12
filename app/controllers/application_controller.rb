class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include SessionActivity

  rescue_from Rack::Timeout::Error do
    render json: { error: "Tempo de requisição excedido." }, status: :service_unavailable
  end

  PUBLIC_PLATFORM_PATHS = [ "/", "/login", "/dashboard" ].freeze

  def fallback_index_html
    # Páginas de evento (/:slug/:token) não devem ser indexadas —
    # apenas a landing page, login e dashboard da plataforma podem.
    unless PUBLIC_PLATFORM_PATHS.include?(request.path)
      response.set_header("X-Robots-Tag", "noindex, nofollow")
    end

    send_file Rails.root.join("public/index.html"),
              type: "text/html",
              disposition: "inline"
  end

  private

  # O JWT recém-gerado pelo devise-jwt fica em request.env neste ponto — o
  # header Authorization da resposta só é escrito depois, por um middleware do
  # próprio devise-jwt. Registramos o "último acesso" do token para o controle
  # de inatividade (SessionActivity) já valer a partir da emissão.
  def prime_session_activity!
    token = request.env["warden-jwt_auth.token"]
    return unless token

    jti = JWT.decode(token, nil, false).first["jti"]
    SessionActivity.store.write(
      "jwt_last_seen:#{jti}", Time.current, expires_in: SessionActivity::INACTIVITY_TIMEOUT
    )
  end
end

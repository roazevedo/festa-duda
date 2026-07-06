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
end

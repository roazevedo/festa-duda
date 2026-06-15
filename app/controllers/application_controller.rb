class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  rescue_from Rack::Timeout::Error do
    render json: { error: "Tempo de requisição excedido." }, status: :service_unavailable
  end

  def fallback_index_html
    send_file Rails.root.join("public/index.html"),
              type: "text/html",
              disposition: "inline"
  end
end

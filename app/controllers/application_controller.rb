class ApplicationController < ActionController::API
  def fallback_index_html
    send_file Rails.root.join("public/index.html"),
              type: "text/html",
              disposition: "inline"
  end
end

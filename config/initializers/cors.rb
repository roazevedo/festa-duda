Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:5173"  # URL do React em dev

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      expose:  [ "Authorization" ],    # expõe o token JWT
      max_age: 600
  end
end

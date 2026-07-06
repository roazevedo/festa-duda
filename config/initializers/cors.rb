# Em produção o frontend é servido pelo próprio Rails (mesma origem),
# então CORS só é necessário para o dev server do Vite.
if Rails.env.local?
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
end

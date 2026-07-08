Rails.application.routes.draw do
  post   "/api/v1/login",        to: "api/v1/sessions#create"
  delete "/api/v1/logout",       to: "api/v1/sessions#jwt_logout"
  post   "/api/v1/signup",       to: "api/v1/registrations#create"
  post   "/api/v1/auth/google",  to: "api/v1/google_auth#create"

  devise_for :users,
    path: "",
    skip: [ :sessions, :registrations ]

  namespace :api do
    namespace :v1 do
      get    "profile",              to: "profile#show"
      post   "cloudinary/signature", to: "cloudinary_signatures#create"
      get    "events",               to: "events#index"
      post   "events",               to: "events#create"
      get    "events/:slug/:token",  to: "events#show"
      patch  "events/:slug/:token",  to: "events#update"
      delete "events/:slug/:token",  to: "events#destroy"
      get    "events/:slug/:token/rsvps",        to: "rsvps#index"
      post   "events/:slug/:token/rsvps",        to: "rsvps#create"
      get    "events/:slug/:token/messages",     to: "messages#index"
      post   "events/:slug/:token/messages",     to: "messages#create"
      get    "events/:slug/:token/gifts",        to: "gifts#index"
      post   "events/:slug/:token/gifts",        to: "gifts#create"
      patch  "events/:slug/:token/gifts/:id",    to: "gifts#update"
      delete "events/:slug/:token/gifts/:id",    to: "gifts#destroy"
      post   "events/:slug/:token/gifts/:id/checkout", to: "gift_checkouts#create"
      get    "events/:slug/:token/gift_payments", to: "gift_payments#index"
      post   "webhooks/mercado_pago",            to: "mercado_pago_webhooks#create"
      get    "events/:slug/:token/photos",       to: "photos#index"
      post   "events/:slug/:token/photos",       to: "photos#create"
      patch  "events/:slug/:token/photos/:id",   to: "photos#update"
      delete "events/:slug/:token/photos/:id",   to: "photos#destroy"
    end
  end

  # Health check usado pelo Fly.io (isento de host authorization)
  get "up" => "rails/health#show", as: :rails_health_check

  get "/favicon.ico", to: proc { [ 204, {}, [] ] }
  get "*path",
    to: "application#fallback_index_html",
    constraints: ->(req) { !req.xhr? }
end

Rails.application.routes.draw do
  # Rotas de autenticação — controle total, sem Devise routing
  post   "/api/v1/login",  to: "api/v1/sessions#create"
  delete "/api/v1/logout", to: "api/v1/sessions#jwt_logout"

  # Devise apenas para registrations e helpers do model — pula sessions
  devise_for :users,
    path: "",
    skip: [ :sessions ],
    path_names: { registration: "api/v1/signup" },
    controllers: { registrations: "api/v1/registrations" }

  namespace :api do
    namespace :v1 do
      get    "profile",              to: "profile#show"
      get    "events",               to: "events#index"
      post   "events",               to: "events#create"
      get    "events/:slug/:token",  to: "events#show"
      patch  "events/:slug/:token",  to: "events#update"
      delete "events/:slug/:token",  to: "events#destroy"
      get    "events/:slug/:token/rsvps",        to: "rsvps#index"
      post   "events/:slug/:token/rsvps",        to: "rsvps#create"
      get    "events/:slug/:token/messages",     to: "messages#index"
      post   "events/:slug/:token/messages",     to: "messages#create"
      get    "events/:slug/:token/photos",       to: "photos#index"
      post   "events/:slug/:token/photos",       to: "photos#create"
      patch  "events/:slug/:token/photos/:id",   to: "photos#update"
      delete "events/:slug/:token/photos/:id",   to: "photos#destroy"
    end
  end

  get "/favicon.ico", to: proc { [ 204, {}, [] ] }
  get "*path",
    to: "application#fallback_index_html",
    constraints: ->(req) { !req.xhr? }
end

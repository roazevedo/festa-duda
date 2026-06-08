Rails.application.routes.draw do
  devise_for :users,
    path: "",
    path_names: {
      sign_in:      "api/v1/login",
      sign_out:     "api/v1/logout",
      registration: "api/v1/signup"
    },
    controllers: {
      sessions:      "api/v1/sessions",
      registrations: "api/v1/registrations"
    }

  namespace :api do
    namespace :v1 do
      get "profile", to: "profile#show"

      # Eventos
      get    "events",              to: "events#index"
      post   "events",              to: "events#create"
      get    "events/:slug/:token", to: "events#show"
      patch  "events/:slug/:token", to: "events#update"
      delete "events/:slug/:token", to: "events#destroy"

      # Recursos do evento
      get  "events/:slug/:token/rsvps",        to: "rsvps#index"
      post "events/:slug/:token/rsvps",        to: "rsvps#create"

      get  "events/:slug/:token/messages",     to: "messages#index"
      post "events/:slug/:token/messages",     to: "messages#create"

      get    "events/:slug/:token/photos",     to: "photos#index"
      post   "events/:slug/:token/photos",     to: "photos#create"
      patch  "events/:slug/:token/photos/:id", to: "photos#update"
      delete "events/:slug/:token/photos/:id", to: "photos#destroy"
    end
  end

  # Ignora requisição do favicon sem dar erro
  get "/favicon.ico", to: proc { [ 204, {}, [] ] }

  get "*path",
    to: "application#fallback_index_html",
    constraints: ->(req) { !req.xhr? }
end

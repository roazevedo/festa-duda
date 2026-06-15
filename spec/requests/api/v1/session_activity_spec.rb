require "rails_helper"

RSpec.describe "Sessão — logout por inatividade", type: :request do
  let(:user) { create(:user, password: "Senha@123456") }

  def login
    post "/api/v1/login",
      params: { user: { email: user.email, password: "Senha@123456" } },
      as:     :json

    response.headers["Authorization"]
  end

  # Garante que cada teste comece com o store de atividade limpo —
  # ele é um singleton em memória e persiste entre exemplos.
  before { SessionActivity.store.clear }

  it "permite requisições normalmente após o login" do
    token = login

    get "/api/v1/profile", headers: { "Authorization" => token }

    expect(response).to have_http_status(:ok)
  end

  it "renova o prazo de inatividade a cada requisição autenticada" do
    token = login

    get "/api/v1/profile", headers: { "Authorization" => token }
    expect(response).to have_http_status(:ok)

    # Avança o tempo quase até o limite — como o request anterior
    # renovou o prazo, ainda deve estar dentro da janela válida.
    travel(SessionActivity::INACTIVITY_TIMEOUT - 1.minute) do
      get "/api/v1/profile", headers: { "Authorization" => token }
      expect(response).to have_http_status(:ok)
    end
  end

  it "bloqueia requisições após o tempo de inatividade" do
    token = login

    travel((SessionActivity::INACTIVITY_TIMEOUT + 1.minute)) do
      get "/api/v1/profile", headers: { "Authorization" => token }

      expect(response).to have_http_status(:unauthorized)
      body = JSON.parse(response.body)
      expect(body["error"]).to eq("Sessão expirada por inatividade.")
    end
  end

  it "não bloqueia requisições públicas (sem token)" do
    travel(SessionActivity::INACTIVITY_TIMEOUT + 1.minute) do
      event = create(:event)
      get "/api/v1/events/#{event.slug}/#{event.token}"

      expect(response).to have_http_status(:ok)
    end
  end

  it "remove o registro de atividade ao fazer logout" do
    token = login

    delete "/api/v1/logout", headers: { "Authorization" => token }
    expect(response).to have_http_status(:ok)

    get "/api/v1/profile", headers: { "Authorization" => token }
    expect(response).to have_http_status(:unauthorized)
  end
end

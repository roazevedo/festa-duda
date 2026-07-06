require "rails_helper"

RSpec.describe "Api::V1::Registrations", type: :request do
  def signup(email:, password:, password_confirmation: password)
    post "/api/v1/signup",
      params: {
        user: {
          email:                 email,
          password:              password,
          password_confirmation: password_confirmation
        }
      },
      as: :json
  end

  describe "POST /api/v1/signup" do
    context "com dados válidos" do
      before { signup(email: "nova@exemplo.com", password: "Senha@123456") }

      it "cria o usuário" do
        expect(User.find_by(email: "nova@exemplo.com")).to be_present
      end

      it "retorna 201" do
        expect(response).to have_http_status(:created)
      end

      it "retorna token JWT no header Authorization" do
        expect(response.headers["Authorization"]).to be_present
        expect(response.headers["Authorization"]).to include("Bearer")
      end

      it "retorna os dados do usuário" do
        body = JSON.parse(response.body)
        expect(body["user"]["email"]).to eq("nova@exemplo.com")
      end

      it "nunca cria o usuário como admin" do
        body = JSON.parse(response.body)
        expect(body["user"]["admin"]).to be false
      end
    end

    context "tentando se cadastrar como admin" do
      it "ignora o parâmetro admin e cria como não-admin" do
        post "/api/v1/signup",
          params: {
            user: {
              email: "hacker@exemplo.com", password: "Senha@123456",
              password_confirmation: "Senha@123456", admin: true
            }
          },
          as: :json

        expect(User.find_by(email: "hacker@exemplo.com").admin?).to be false
      end
    end

    context "com email já cadastrado" do
      before { create(:user, email: "existente@exemplo.com") }

      it "retorna 422" do
        signup(email: "existente@exemplo.com", password: "Senha@123456")
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "retorna mensagem de erro" do
        signup(email: "existente@exemplo.com", password: "Senha@123456")
        body = JSON.parse(response.body)
        expect(body["errors"]).to be_present
      end
    end

    context "com confirmação de senha diferente" do
      it "retorna 422" do
        signup(email: "nova2@exemplo.com", password: "Senha@123456", password_confirmation: "outrasenha")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "com senha muito curta" do
      it "retorna 422" do
        signup(email: "nova3@exemplo.com", password: "123", password_confirmation: "123")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "com email inválido" do
      it "retorna 422" do
        signup(email: "nao-e-um-email", password: "Senha@123456")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "sem email" do
      it "retorna 422" do
        signup(email: "", password: "Senha@123456")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  # ── Isolamento entre contas recém-criadas ───────────────────

  describe "isolamento de eventos entre usuários cadastrados" do
    it "cada usuário só vê os próprios eventos após se cadastrar" do
      signup(email: "ana@exemplo.com",   password: "Senha@123456")
      token_ana = response.headers["Authorization"]
      ana       = User.find_by(email: "ana@exemplo.com")
      create(:event, user: ana, slug: "festa-ana")

      signup(email: "bruno@exemplo.com", password: "Senha@123456")
      token_bruno = response.headers["Authorization"]
      bruno       = User.find_by(email: "bruno@exemplo.com")
      create(:event, user: bruno, slug: "festa-bruno")

      get "/api/v1/events", headers: { "Authorization" => token_ana }
      slugs_ana = JSON.parse(response.body).map { |e| e["slug"] }
      expect(slugs_ana).to include("festa-ana")
      expect(slugs_ana).not_to include("festa-bruno")

      get "/api/v1/events", headers: { "Authorization" => token_bruno }
      slugs_bruno = JSON.parse(response.body).map { |e| e["slug"] }
      expect(slugs_bruno).to include("festa-bruno")
      expect(slugs_bruno).not_to include("festa-ana")
    end

    it "um usuário não pode editar evento de outro usuário" do
      signup(email: "carla@exemplo.com", password: "Senha@123456")
      carla = User.find_by(email: "carla@exemplo.com")
      event = create(:event, user: carla, slug: "festa-carla")

      signup(email: "diego@exemplo.com", password: "Senha@123456")
      token_diego = response.headers["Authorization"]

      patch "/api/v1/events/#{event.slug}/#{event.token}",
        params:  { event: { name: "Nome Alterado" } },
        headers: { "Authorization" => token_diego },
        as:      :json

      expect(response).to have_http_status(:forbidden)
      expect(event.reload.name).not_to eq("Nome Alterado")
    end
  end
end

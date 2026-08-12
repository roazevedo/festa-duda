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

  # Extrai o código de 6 dígitos do último e-mail enviado (o assunto o traz).
  def last_verification_code
    mail = ActionMailer::Base.deliveries.last
    mail&.subject&.match(/(\d{6})/)&.captures&.first
  end

  # Cadastro completo → confirma o código → devolve o token JWT emitido.
  def signup_and_verify(email:, password: "Senha@123456")
    signup(email: email, password: password)
    post "/api/v1/email_verifications/verify",
      params: { email: email, code: last_verification_code }, as: :json
    response.headers["Authorization"]
  end

  before { ActionMailer::Base.deliveries.clear }

  describe "POST /api/v1/signup" do
    context "com dados válidos" do
      before { signup(email: "nova@exemplo.com", password: "Senha@123456") }

      it "cria o usuário (ainda não verificado)" do
        user = User.find_by(email: "nova@exemplo.com")
        expect(user).to be_present
        expect(user.email_verified?).to be false
      end

      it "retorna 201" do
        expect(response).to have_http_status(:created)
      end

      it "NÃO emite token JWT antes da verificação" do
        expect(response.headers["Authorization"]).to be_blank
      end

      it "sinaliza que a verificação é necessária" do
        body = JSON.parse(response.body)
        expect(body["verification_required"]).to be true
        expect(body["email"]).to eq("nova@exemplo.com")
      end

      it "envia o e-mail com o código de verificação" do
        expect(ActionMailer::Base.deliveries.size).to eq(1)
        expect(last_verification_code).to match(/\A\d{6}\z/)
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

    context "com email já cadastrado e verificado" do
      before { create(:user, email: "existente@exemplo.com") }

      it "retorna 422" do
        signup(email: "existente@exemplo.com", password: "Senha@123456")
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "com email cadastrado mas ainda NÃO verificado" do
      before { create(:user, :unverified, email: "pendente@exemplo.com") }

      it "reenvia o código e responde 201 (reaproveita o cadastro)" do
        signup(email: "pendente@exemplo.com", password: "OutraSenha@123")
        expect(response).to have_http_status(:created)
        expect(last_verification_code).to match(/\A\d{6}\z/)
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
      token_ana = signup_and_verify(email: "ana@exemplo.com")
      ana       = User.find_by(email: "ana@exemplo.com")
      create(:event, user: ana, slug: "festa-ana")

      token_bruno = signup_and_verify(email: "bruno@exemplo.com")
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
      token_carla = signup_and_verify(email: "carla@exemplo.com")
      carla = User.find_by(email: "carla@exemplo.com")
      event = create(:event, user: carla, slug: "festa-carla")

      token_diego = signup_and_verify(email: "diego@exemplo.com")

      patch "/api/v1/events/#{event.slug}/#{event.token}",
        params:  { event: { name: "Nome Alterado" } },
        headers: { "Authorization" => token_diego },
        as:      :json

      expect(response).to have_http_status(:forbidden)
      expect(event.reload.name).not_to eq("Nome Alterado")
    end
  end
end

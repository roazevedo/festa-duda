require "rails_helper"

RSpec.describe "Api::V1::EmailVerifications", type: :request do
  before { ActionMailer::Base.deliveries.clear }

  def signup(email: "novo@exemplo.com", password: "Senha@123456")
    post "/api/v1/signup",
      params: { user: { email: email, password: password, password_confirmation: password } },
      as: :json
    email
  end

  def last_code
    ActionMailer::Base.deliveries.last.subject.match(/(\d{6})/)[1]
  end

  describe "POST /api/v1/email_verifications/verify" do
    it "confirma o e-mail e emite o token JWT com o código correto" do
      email = signup
      post "/api/v1/email_verifications/verify", params: { email: email, code: last_code }, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to include("Bearer")
      expect(User.find_by(email: email).email_verified?).to be true
    end

    it "rejeita código errado" do
      email = signup
      post "/api/v1/email_verifications/verify", params: { email: email, code: "000000" }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.headers["Authorization"]).to be_blank
      expect(User.find_by(email: email).email_verified?).to be false
    end

    it "rejeita código expirado" do
      email = signup
      code  = last_code
      User.find_by(email: email).update!(verification_code_sent_at: 20.minutes.ago)

      post "/api/v1/email_verifications/verify", params: { email: email, code: code }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "não permite reusar o código depois de confirmado" do
      email = signup
      code  = last_code
      post "/api/v1/email_verifications/verify", params: { email: email, code: code }, as: :json

      post "/api/v1/email_verifications/verify", params: { email: email, code: code }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "responde erro genérico para e-mail inexistente" do
      post "/api/v1/email_verifications/verify", params: { email: "naoexiste@x.com", code: "123456" }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/email_verifications/resend" do
    it "envia um novo código para conta pendente" do
      email = signup
      ActionMailer::Base.deliveries.clear

      post "/api/v1/email_verifications/resend", params: { email: email }, as: :json
      expect(response).to have_http_status(:ok)
      expect(ActionMailer::Base.deliveries.size).to eq(1)
    end

    it "responde 200 neutro sem enviar e-mail para conta já verificada" do
      create(:user, email: "verificada@exemplo.com")
      post "/api/v1/email_verifications/resend", params: { email: "verificada@exemplo.com" }, as: :json

      expect(response).to have_http_status(:ok)
      expect(ActionMailer::Base.deliveries).to be_empty
    end
  end

  describe "login de conta não verificada" do
    it "bloqueia com 403 e sinaliza unverified" do
      create(:user, :unverified, email: "pendente@exemplo.com", password: "Senha@123456")
      post "/api/v1/login",
        params: { user: { email: "pendente@exemplo.com", password: "Senha@123456" } }, as: :json

      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body["unverified"]).to be true
    end
  end
end

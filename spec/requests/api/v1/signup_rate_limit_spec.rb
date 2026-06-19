require "rails_helper"

RSpec.describe "Rate Limiting — Signup (Rack::Attack)", type: :request, rate_limit: true do
  it "bloqueia após muitas tentativas de cadastro pelo mesmo IP" do
    6.times do |i|
      post "/api/v1/signup",
        params: {
          user: {
            email: "user#{i}@teste.com", password: "Senha@123456",
            password_confirmation: "Senha@123456"
          }
        },
        as: :json
    end

    expect(response).to have_http_status(:too_many_requests)
  end
end

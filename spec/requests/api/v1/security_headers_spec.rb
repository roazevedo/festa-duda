require "rails_helper"

RSpec.describe "Headers de segurança", type: :request do
  it "inclui Referrer-Policy em todas as respostas da API" do
    get "/api/v1/profile"
    expect(response.headers["Referrer-Policy"]).to eq("strict-origin-when-cross-origin")
  end
end

require "rails_helper"
require Rails.root.join("lib/canonical_host_middleware")

RSpec.describe CanonicalHostMiddleware do
  let(:downstream) { ->(_env) { [ 200, { "Content-Type" => "text/plain" }, [ "ok" ] ] } }

  def call(app, method: "GET", host: "convida-me.fly.dev", path: "/dashboard", query: "")
    env = Rack::MockRequest.env_for("https://#{host}#{path}#{query.empty? ? '' : "?#{query}"}",
                                    method: method)
    app.call(env)
  end

  context "com host canônico definido (convidame.app)" do
    subject(:app) { described_class.new(downstream, "convidame.app") }

    it "redireciona (301) um host não-canônico preservando path e query" do
      status, headers, = call(app, path: "/eventos", query: "aba=fotos")
      expect(status).to eq(301)
      expect(headers["Location"]).to eq("https://convidame.app/eventos?aba=fotos")
    end

    it "NÃO redireciona quando já está no host canônico" do
      status, = call(app, host: "convidame.app")
      expect(status).to eq(200)
    end

    it "NÃO redireciona o health check /up (Fly precisa de 200)" do
      status, = call(app, host: "convida-me.fly.dev", path: "/up")
      expect(status).to eq(200)
    end

    it "NÃO redireciona requisições não-GET/HEAD (não quebra POST de abas abertas)" do
      status, = call(app, method: "POST", path: "/api/v1/login")
      expect(status).to eq(200)
    end

    it "redireciona HEAD também" do
      status, = call(app, method: "HEAD")
      expect(status).to eq(301)
    end
  end

  context "sem host canônico (dev/test)" do
    subject(:app) { described_class.new(downstream, nil) }

    it "fica inerte (nunca redireciona)" do
      status, = call(app)
      expect(status).to eq(200)
    end
  end
end

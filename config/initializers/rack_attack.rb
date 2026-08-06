class Rack::Attack
  # ── Com REDIS_URL definido, os contadores são compartilhados entre
  # processos/dynos; sem ele, cache em memória (limite por processo) ──
  Rack::Attack.cache.store =
    if ENV["REDIS_URL"].present?
      ActiveSupport::Cache::RedisCacheStore.new(url: ENV["REDIS_URL"])
    else
      ActiveSupport::Cache::MemoryStore.new
    end

  # IP real do visitante. Usa o remote_ip do ActionDispatch, que respeita os
  # trusted_proxies configurados (Cloudflare + ranges privados) — assim o
  # rate-limit continua por visitante mesmo com a Cloudflare na frente. O
  # req.ip cru do Rack devolveria o IP da Cloudflare.
  def self.client_ip(req)
    ActionDispatch::Request.new(req.env).remote_ip
  end

  ### Throttle geral — protege contra DDoS ###
  throttle("requests by ip", limit: 300, period: 5.minutes) do |req|
    client_ip(req)
  end

  ### Throttle no login — protege contra brute-force ###
  throttle("login attempts by ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/api/v1/login" && req.post?
      client_ip(req)
    end
  end

  throttle("login attempts by email", limit: 5, period: 1.minute) do |req|
    if req.path == "/api/v1/login" && req.post?
      body = req.body.read
      req.body.rewind

      json = JSON.parse(body) rescue {}
      json.dig("user", "email")&.downcase&.strip
    end
  end

  ### Throttle no cadastro — evita criação massiva de contas ###
  throttle("signup attempts by ip", limit: 5, period: 1.hour) do |req|
    if req.path == "/api/v1/signup" && req.post?
      client_ip(req)
    end
  end

  ### Throttle em criação de RSVP/mensagens — evita spam ###
  throttle("rsvp/message creation by ip", limit: 10, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/(rsvps|messages)\z})
      client_ip(req)
    end
  end

  ### Throttle em checkout de presentes — evita flood de preferências MP ###
  throttle("gift checkout by ip", limit: 10, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/gifts/\d+/checkout\z})
      client_ip(req)
    end
  end

  ### Throttle na assinatura de upload Cloudinary — qualquer conta logada
  ### pode pedir assinaturas; limita o abuso de custo/armazenamento ###
  throttle("cloudinary signature by ip", limit: 30, period: 1.minute) do |req|
    if req.post? && req.path == "/api/v1/cloudinary/signature"
      client_ip(req)
    end
  end

  ### Throttle no webhook do MP — cada notificação dispara uma consulta
  ### nossa à API do MP; limita o potencial de amplificação ###
  throttle("mp webhook by ip", limit: 60, period: 1.minute) do |req|
    if req.post? && req.path == "/api/v1/webhooks/mercado_pago"
      client_ip(req)
    end
  end

  ### Resposta customizada quando bloqueado ###
  self.throttled_responder = lambda do |request|
    retry_after = (request.env["rack.attack.match_data"] || {})[:period]
    [
      429,
      {
        "Content-Type"  => "application/json",
        "Retry-After"   => retry_after.to_s
      },
      [ { error: "Muitas requisições. Tente novamente em breve." }.to_json ]
    ]
  end
end

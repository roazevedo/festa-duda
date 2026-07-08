class Rack::Attack
  # ── Com REDIS_URL definido, os contadores são compartilhados entre
  # processos/dynos; sem ele, cache em memória (limite por processo) ──
  Rack::Attack.cache.store =
    if ENV["REDIS_URL"].present?
      ActiveSupport::Cache::RedisCacheStore.new(url: ENV["REDIS_URL"])
    else
      ActiveSupport::Cache::MemoryStore.new
    end

  ### Throttle geral — protege contra DDoS ###
  throttle("requests by ip", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  ### Throttle no login — protege contra brute-force ###
  throttle("login attempts by ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/api/v1/login" && req.post?
      req.ip
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
      req.ip
    end
  end

  ### Throttle em criação de RSVP/mensagens — evita spam ###
  throttle("rsvp/message creation by ip", limit: 10, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/(rsvps|messages)\z})
      req.ip
    end
  end

  ### Throttle em checkout de presentes — evita flood de preferências MP ###
  throttle("gift checkout by ip", limit: 10, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/gifts/\d+/checkout\z})
      req.ip
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

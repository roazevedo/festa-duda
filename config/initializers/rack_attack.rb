class Rack::Attack
  # ── Cache em memória (suficiente para começar) ──
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

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

  ### Throttle em criação de RSVP/mensagens — evita spam ###
  throttle("rsvp/message creation by ip", limit: 10, period: 1.minute) do |req|
    if req.post? && req.path.match?(%r{/(rsvps|messages)\z})
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

# Redireciona (301) qualquer acesso que NÃO esteja no host canônico para
# ele — ex.: convida-me.fly.dev → convidame.app. Assim a plataforma tem um
# endereço "oficial" único (melhor para marca e SEO).
#
# Cuidados:
# - Só age quando CANONICAL_HOST está definido (em dev/test fica inerte).
# - Nunca redireciona o /up: é o health check do Fly, que precisa de 200.
# - Só redireciona GET/HEAD: um POST/PATCH de uma aba já aberta no host
#   antigo continua funcionando (o host antigo segue autorizado), evitando
#   quebrar requisições no meio.
class CanonicalHostMiddleware
  def initialize(app, canonical_host)
    @app            = app
    @canonical_host = canonical_host.to_s
  end

  def call(env)
    request = Rack::Request.new(env)

    if should_redirect?(request)
      location = "https://#{@canonical_host}#{request.fullpath}"
      return [ 301,
               { "Location" => location, "Content-Type" => "text/html" },
               [ %(<html><body>Redirecting to <a href="#{location}">#{location}</a></body></html>) ] ]
    end

    @app.call(env)
  end

  private

  def should_redirect?(request)
    return false if @canonical_host.empty?
    return false if request.host == @canonical_host
    return false if request.path == "/up"
    return false unless request.get? || request.head?

    request.host.present?
  end
end

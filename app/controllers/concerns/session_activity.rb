# app/controllers/concerns/session_activity.rb
#
# Implementa logout automático por inatividade.
#
# Cada token JWT válido tem seu "último acesso" registrado em memória
# (chave = jti do token). Se um token ficar mais de INACTIVITY_TIMEOUT
# sem ser usado em nenhum request autenticado, o próximo request com
# esse token é rejeitado com 401 — mesmo que o JWT em si ainda não
# tenha expirado (expiração padrão do devise-jwt: 30 dias).
module SessionActivity
  extend ActiveSupport::Concern

  INACTIVITY_TIMEOUT = 30.minutes

  # Store dedicado — independente do cache geral da aplicação (que em
  # test/development costuma ser :null_store, o que faria essa
  # verificação falhar sempre).
  #
  # Com REDIS_URL definido, o "último acesso" é compartilhado entre
  # processos/dynos; sem ele, fica em memória (por processo).
  def self.store
    @store ||=
      if ENV["REDIS_URL"].present?
        ActiveSupport::Cache::RedisCacheStore.new(url: ENV["REDIS_URL"])
      else
        ActiveSupport::Cache::MemoryStore.new
      end
  end

  included do
    before_action :check_session_activity!
    after_action  :touch_session_activity
  end

  private

  # Extrai o jti (JWT ID) do token, sem validar assinatura — a
  # validação "de verdade" continua sendo feita pelo Warden via
  # authenticate_user!. Aqui só precisamos identificar QUAL token
  # está sendo usado, para consultar o store de atividade.
  def current_jti
    return @current_jti if defined?(@current_jti)

    token = request.headers["Authorization"]&.split(" ")&.last
    @current_jti = token && JWT.decode(token, nil, false).first["jti"]
  rescue JWT::DecodeError
    @current_jti = nil
  end

  def activity_cache_key
    "jwt_last_seen:#{current_jti}"
  end

  def check_session_activity!
    return unless current_jti
    return if SessionActivity.store.exist?(activity_cache_key)

    render json: { error: "Sessão expirada por inatividade." }, status: :unauthorized
  end

  def touch_session_activity
    return unless current_jti

    SessionActivity.store.write(
      activity_cache_key, Time.current, expires_in: SessionActivity::INACTIVITY_TIMEOUT
    )
  end
end

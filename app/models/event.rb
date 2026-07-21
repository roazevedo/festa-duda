class Event < ApplicationRecord
  belongs_to :user
  has_many :rsvps,         dependent: :destroy
  has_many :messages,      dependent: :destroy
  has_many :photos,        dependent: :destroy
  has_many :gifts,         dependent: :destroy
  has_many :plan_payments, dependent: :destroy

  before_validation :generate_slug, on: :create
  before_create :generate_token

  validates :slug,       presence: true, uniqueness: true,
                         format: { with: /\A[a-z0-9\-]+\z/ }
  validates :name,       presence: true

  # Espelha frontend/src/eventTypes.js — os dois devem andar juntos
  TYPES = %w[quinze_anos casamento aniversario
             cha_de_bebe cha_revelacao bodas_de_ouro
             formatura evento_corporativo outro].freeze

  validates :event_type, presence: true, inclusion: { in: TYPES }
  validates :event_date, presence: true

  # ── Planos ─────────────────────────────────────────────
  # Espelha frontend/src/plans.js — os dois devem andar juntos.
  # gratis: limitado · completo: R$ 149,90 · atelie: sob consulta
  PLANS = %w[gratis completo atelie].freeze

  # nil = ilimitado; lifetime_months conta a partir da data da festa
  PLAN_LIMITS = {
    "gratis"   => { gifts: 10,  photos: 20,  lifetime_months: 3 },
    "completo" => { gifts: nil, photos: nil, lifetime_months: 12 },
    "atelie"   => { gifts: nil, photos: nil, lifetime_months: 12 },
  }.freeze

  # Preço dos upgrades vendidos direto pela plataforma; o Ateliê
  # (R$ 997) é negociado por contato direto, sem checkout próprio
  PLAN_PRICES = { "completo" => 149.90 }.freeze

  # Temas de cores liberados no plano grátis (5 paletas versáteis;
  # espelha FREE_THEMES em frontend/src/plans.js)
  FREE_THEMES = %w[
    classico-dourado noite-de-gala rosa-cha verde-jardim azul-sereno
  ].freeze

  validates :plan, presence: true, inclusion: { in: PLANS }
  validate  :settings_respect_plan
  validate  :settings_within_size_limit

  # settings é jsonb livre (permit(settings: {})); sem teto, um payload
  # de vários MB seria aceito, gravado e reenviado a cada carregamento
  # do evento. 256 KB é folgado para as configurações reais do site.
  MAX_SETTINGS_BYTES = 256 * 1024

  def plan_limits
    PLAN_LIMITS.fetch(plan) { PLAN_LIMITS["gratis"] }
  end

  def free_plan?
    plan == "gratis" || plan.blank?
  end

  # Vigência do site após a data da festa, conforme o plano
  # (espelha frontend/src/eventStatus.js)
  def lifetime
    plan_limits[:lifetime_months].months
  end

  def finished?
    event_date.present? && event_date + lifetime < Time.current
  end

  # Garante que os campos sempre tenham um valor booleano
  validates :rsvp_list_public, inclusion: { in: [ true, false ] }
  validates :messages_public,  inclusion: { in: [ true, false ] }

  def full_path
    "/#{slug}/#{token}"
  end

  private

  # No plano grátis, tema e Save the Date são limitados — barra
  # tentativas de usar recursos pagos direto pela API
  def settings_respect_plan
    return unless free_plan? && settings.present?

    theme = settings["theme"]
    if theme.present? && !FREE_THEMES.include?(theme)
      errors.add(:base, "Este tema de cores está disponível a partir do plano Completo.")
    end

    if settings.dig("sections", "save_the_date", "enabled")
      errors.add(:base, "A seção Save the Date está disponível a partir do plano Completo.")
    end
  end

  def settings_within_size_limit
    return if settings.blank?

    if settings.to_json.bytesize > MAX_SETTINGS_BYTES
      errors.add(:base, "As configurações do site excederam o tamanho máximo permitido.")
    end
  end

  # Gera o slug a partir do nome quando não informado,
  # acrescentando um sufixo aleatório em caso de colisão
  def generate_slug
    return if slug.present?

    base = name.to_s.parameterize
    base = "evento" if base.blank?

    candidate = base
    candidate = "#{base}-#{SecureRandom.hex(2)}" while Event.exists?(slug: candidate)
    self.slug = candidate
  end

  def generate_token
    self.token = SecureRandom.urlsafe_base64(24) until token_unique?
  end

  def token_unique?
    token.present? && !Event.exists?(token: token)
  end
end

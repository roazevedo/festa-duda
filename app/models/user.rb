class User < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  # Teto de eventos por conta — barra criação massiva no plano grátis
  # via API. Admins (operação da plataforma) não têm limite.
  MAX_EVENTS = 100

  has_many :events, dependent: :destroy
  # Pagamentos de plano de novos eventos (existem antes do evento).
  # Nullify preserva o histórico financeiro se a conta for removida.
  has_many :plan_payments, dependent: :nullify

  # Permite senha em branco para usuários OAuth (a senha é gerada aleatoriamente)
  # O Devise :validatable exige password, mas para Google podemos deixar sem validação
  validates :password, length: { minimum: 6 }, allow_nil: true

  # Janela de validade do código de verificação de e-mail.
  VERIFICATION_CODE_TTL = 15.minutes

  def admin?
    admin
  end

  def email_verified?
    email_verified_at.present?
  end

  # Gera um código de 6 dígitos, guarda apenas o digest (bcrypt) e devolve
  # o código em texto puro para ser enviado por e-mail. O texto puro nunca
  # é persistido.
  def generate_verification_code!
    code = format("%06d", SecureRandom.random_number(1_000_000))
    update!(
      verification_code_digest:  BCrypt::Password.create(code),
      verification_code_sent_at: Time.current
    )
    code
  end

  # Confere o código informado. Só aceita se: existe um código pendente,
  # ainda dentro do TTL e o digest bate. Em caso de sucesso marca o e-mail
  # como verificado e limpa o código (uso único).
  def verify_code(code)
    return false if verification_code_digest.blank?
    return false if verification_code_sent_at.blank?
    return false if verification_code_sent_at < VERIFICATION_CODE_TTL.ago
    return false unless BCrypt::Password.new(verification_code_digest) == code.to_s

    update!(
      email_verified_at:         Time.current,
      verification_code_digest:  nil,
      verification_code_sent_at: nil
    )
    true
  rescue BCrypt::Errors::InvalidHash
    false
  end

  # Encontra ou cria um usuário a partir do payload do Google ID Token.
  # Ordem de busca:
  #   1. Pelo par provider+uid (usuário Google já registrado)
  #   2. Pelo email (conta manual existente — vincula o Google)
  #   3. Cria novo usuário
  def self.find_or_create_from_google(email:, uid:, name:)
    user = find_by(provider: "google", uid: uid)
    return user if user

    user = find_by(email: email)
    if user
      # Vincula a conta Google a uma conta manual existente. O Google já
      # verifica o e-mail, então garantimos a conta como verificada.
      user.update(
        provider:          "google",
        uid:               uid,
        name:              name,
        email_verified_at: user.email_verified_at || Time.current
      )
      return user
    end

    create!(
      email:             email,
      provider:          "google",
      uid:               uid,
      name:              name,
      password:          Devise.friendly_token[0, 20],
      admin:             false,
      email_verified_at: Time.current
    )
  end
end

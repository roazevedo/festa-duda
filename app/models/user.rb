class User < ApplicationRecord
  devise :database_authenticatable,
         :registerable,
         :recoverable,
         :validatable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  has_many :events, dependent: :destroy
  # Pagamentos de plano de novos eventos (existem antes do evento).
  # Nullify preserva o histórico financeiro se a conta for removida.
  has_many :plan_payments, dependent: :nullify

  # Permite senha em branco para usuários OAuth (a senha é gerada aleatoriamente)
  # O Devise :validatable exige password, mas para Google podemos deixar sem validação
  validates :password, length: { minimum: 6 }, allow_nil: true

  def admin?
    admin
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
      # Vincula a conta Google a uma conta manual existente
      user.update(provider: "google", uid: uid, name: name)
      return user
    end

    create!(
      email:    email,
      provider: "google",
      uid:      uid,
      name:     name,
      password: Devise.friendly_token[0, 20],
      admin:    false
    )
  end
end

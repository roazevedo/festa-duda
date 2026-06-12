class Event < ApplicationRecord
  belongs_to :user
  has_many :rsvps,    dependent: :destroy
  has_many :messages, dependent: :destroy
  has_many :photos,   dependent: :destroy

  before_create :generate_token

  validates :slug,       presence: true, uniqueness: true,
                         format: { with: /\A[a-z0-9\-]+\z/ }
  validates :name,       presence: true
  validates :event_type, presence: true,
                         inclusion: { in: %w[quinze_anos casamento aniversario] }
  validates :event_date, presence: true

  # Garante que os campos sempre tenham um valor booleano
  validates :rsvp_list_public, inclusion: { in: [ true, false ] }
  validates :messages_public,  inclusion: { in: [ true, false ] }

  def full_path
    "/#{slug}/#{token}"
  end

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64(24) until token_unique?
  end

  def token_unique?
    token.present? && !Event.exists?(token: token)
  end
end

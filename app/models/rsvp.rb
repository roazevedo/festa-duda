class Rsvp < ApplicationRecord
  belongs_to :event

  MAX_COMPANIONS = 20

  validates :name,        presence: true, length: { maximum: 100 }
  validates :attending,   inclusion: { in: %w[yes no maybe] }
  validates :guests,      numericality: { greater_than_or_equal_to: 0,
                                          less_than_or_equal_to: MAX_COMPANIONS }
  validates :restriction, length: { maximum: 500 }, allow_nil: true
  validate  :companion_names_within_limits

  private

  def companion_names_within_limits
    return if companion_names.blank?

    unless companion_names.is_a?(Array)
      errors.add(:companion_names, "deve ser uma lista de nomes")
      return
    end

    if companion_names.size > MAX_COMPANIONS
      errors.add(:companion_names, "aceita no máximo #{MAX_COMPANIONS} acompanhantes")
    end

    if companion_names.any? { |n| !n.is_a?(String) || n.length > 100 }
      errors.add(:companion_names, "cada nome deve ter no máximo 100 caracteres")
    end
  end
end

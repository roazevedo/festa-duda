class Rsvp < ApplicationRecord
  belongs_to :event

  MAX_COMPANIONS = 20

  # before_validation para validar presença/tamanho já sobre o texto
  # limpo (um nome só de tags viraria vazio depois do strip_tags).
  before_validation :sanitize_fields

  validates :name,        presence: true, length: { maximum: 100 }
  validates :attending,   inclusion: { in: %w[yes no maybe] }
  validates :guests,      numericality: { greater_than_or_equal_to: 0,
                                          less_than_or_equal_to: MAX_COMPANIONS }
  validates :restriction, length: { maximum: 500 }, allow_nil: true
  validate  :companion_names_within_limits
  validate  :companion_children_well_formed

  private

  # Mesma defesa em profundidade do Message: o frontend é React
  # (auto-escape), mas estes campos também vão para o painel do dono e
  # eventuais exportações/e-mails, então removemos qualquer tag na entrada.
  def sanitize_fields
    strip = ->(v) { v.is_a?(String) ? ActionController::Base.helpers.strip_tags(v) : v }
    self.name        = strip.call(name)
    self.restriction = strip.call(restriction)
    self.companion_names = companion_names.map(&strip) if companion_names.is_a?(Array)
  end

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

  # Alinhado por índice com companion_names (true = criança abaixo de 8 anos)
  def companion_children_well_formed
    return if companion_children.blank?

    unless companion_children.is_a?(Array) &&
           companion_children.all? { |c| [true, false].include?(c) }
      errors.add(:companion_children, "deve ser uma lista de sim/não")
      return
    end

    if companion_children.size > MAX_COMPANIONS
      errors.add(:companion_children, "aceita no máximo #{MAX_COMPANIONS} acompanhantes")
    end
  end
end

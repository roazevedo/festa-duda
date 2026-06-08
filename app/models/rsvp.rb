class Rsvp < ApplicationRecord
  belongs_to :event

  validates :name,      presence: true
  validates :attending, inclusion: { in: %w[yes no maybe] }
  validates :guests,    numericality: { greater_than_or_equal_to: 0 }
end

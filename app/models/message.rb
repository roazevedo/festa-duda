class Message < ApplicationRecord
  belongs_to :event

  validates :name, presence: true
  validates :body, presence: true
end

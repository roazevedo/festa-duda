class Message < ApplicationRecord
  belongs_to :event
  before_save :sanitize_fields

  validates :name, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { maximum: 2000 }

  private

  def sanitize_fields
    self.name = ActionController::Base.helpers.strip_tags(name)
    self.body = ActionController::Base.helpers.strip_tags(body)
  end
end

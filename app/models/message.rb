class Message < ApplicationRecord
  belongs_to :event
  # before_validation (não before_save) para que a presença/tamanho
  # sejam checados JÁ sobre o texto sem tags — senão um corpo só de
  # tags (ex.: "<br>") passa no presence e é salvo vazio.
  before_validation :sanitize_fields

  validates :name, presence: true, length: { maximum: 100 }
  validates :body, presence: true, length: { maximum: 2000 }

  private

  def sanitize_fields
    self.name = ActionController::Base.helpers.strip_tags(name)
    self.body = ActionController::Base.helpers.strip_tags(body)
  end
end

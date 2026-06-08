class Photo < ApplicationRecord
  belongs_to :event

  validates :url,           presence: true
  validates :cloudinary_id, presence: true
end

class Photo < ApplicationRecord
  belongs_to :event

  validates :url,           presence: true
  validates :cloudinary_id, presence: true

  ALLOWED_EXTENSIONS = %w[jpg jpeg png gif webp].freeze

  validates :url, format: {
    with: /\Ahttps:\/\/res\.cloudinary\.com\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?\z/i,
    message: "deve ser uma URL válida do Cloudinary"
  }
  validates :cloudinary_id, format: {
    with: /\A[\w\-\/]+\z/,
    message: "formato inválido"
  }
end

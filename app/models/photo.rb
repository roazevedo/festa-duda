class Photo < ApplicationRecord
  belongs_to :event

  # Deve bater com VITE_CLOUDINARY_CLOUD_NAME do frontend — impede que
  # URLs de outras contas Cloudinary sejam registradas como fotos do evento.
  CLOUD_NAME = ENV.fetch("CLOUDINARY_CLOUD_NAME", "dnntixnor")

  validates :url,           presence: true
  validates :cloudinary_id, presence: true

  ALLOWED_EXTENSIONS = %w[jpg jpeg png gif webp].freeze

  validates :url, format: {
    with: /\Ahttps:\/\/res\.cloudinary\.com\/#{Regexp.escape(CLOUD_NAME)}\/.+\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)(\?.*)?\z/i,
    message: "deve ser uma URL válida do Cloudinary"
  }
  validates :cloudinary_id, format: {
    with: /\A[\w\-\/]+\z/,
    message: "formato inválido"
  }
end

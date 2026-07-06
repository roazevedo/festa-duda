require "digest"

# Gera a assinatura exigida pelo Cloudinary para uploads signed.
# O frontend pede a assinatura aqui e envia o arquivo direto ao
# Cloudinary com ela — o api_secret nunca sai do servidor.
#
# Qualquer usuário autenticado pode assinar um upload, mas anexar a
# foto a um evento continua restrito ao dono/admin (PhotosController).
class Api::V1::CloudinarySignaturesController < Api::V1::BaseController
  ALLOWED_FOLDERS = %r{\Afesta-duda(/[a-z_]+)?\z}

  def create
    folder = params[:folder].presence || "festa-duda"
    unless folder.match?(ALLOWED_FOLDERS)
      return render json: { error: "Pasta inválida." }, status: :unprocessable_entity
    end

    api_key    = cloudinary_config(:api_key)
    api_secret = cloudinary_config(:api_secret)
    unless api_key.present? && api_secret.present?
      return render json: { error: "Upload não configurado no servidor." },
                    status: :service_unavailable
    end

    timestamp = Time.current.to_i
    preset    = ENV.fetch("CLOUDINARY_UPLOAD_PRESET", "convida.me")

    # Assinatura = SHA1 dos parâmetros em ordem alfabética + api_secret.
    # O frontend deve enviar exatamente estes parâmetros (além de file,
    # api_key e signature), senão o Cloudinary rejeita.
    to_sign   = "folder=#{folder}&timestamp=#{timestamp}&upload_preset=#{preset}"
    signature = Digest::SHA1.hexdigest("#{to_sign}#{api_secret}")

    render json: {
      signature:     signature,
      timestamp:     timestamp,
      api_key:       api_key,
      upload_preset: preset,
      folder:        folder,
      cloud_name:    Photo::CLOUD_NAME
    }
  end

  private

  def cloudinary_config(key)
    ENV["CLOUDINARY_#{key.to_s.upcase}"].presence ||
      Rails.application.credentials.dig(:cloudinary, key)
  end
end

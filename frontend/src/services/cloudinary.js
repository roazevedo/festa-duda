import { getCloudinarySignature } from './api'

/**
 * Faz upload de um arquivo para o Cloudinary (fluxo signed).
 *
 * A assinatura é gerada pelo backend (POST /api/v1/cloudinary/signature,
 * exige login) — o upload em si vai direto do navegador ao Cloudinary.
 *
 * @param {File} file - arquivo de imagem ou vídeo
 * @param {string} folder - pasta no Cloudinary (ex: 'festa-duda/galeria')
 * @param {string} resourceType - 'image' (padrão) ou 'video'
 * @returns {Promise<{url, thumb_url, cloudinary_id}>}
 */
export async function uploadToCloudinary(file, folder = 'festa-duda', resourceType = 'image') {
  // Limite de 9MB para imagens (margem abaixo do limite de 10MB do Cloudinary)
  const MAX_IMAGE_SIZE = 9 * 1024 * 1024
  // Limite de 95MB para vídeos
  const MAX_VIDEO_SIZE = 95 * 1024 * 1024

  const maxSize = resourceType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  const sizeMB  = (file.size / 1024 / 1024).toFixed(0)
  const limitMB = resourceType === 'video' ? 95 : 9

  if (file.size > maxSize) {
    throw new Error(
      `Arquivo muito grande (${sizeMB}MB). O limite é ${limitMB}MB para ${resourceType === 'video' ? 'vídeos' : 'imagens'}.`
    )
  }

  const sig = await getCloudinarySignature(folder)

  // Deve conter exatamente os parâmetros assinados pelo backend
  // (folder, timestamp, upload_preset) além de file/api_key/signature.
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sig.api_key)
  formData.append('timestamp', sig.timestamp)
  formData.append('signature', sig.signature)
  formData.append('upload_preset', sig.upload_preset)
  formData.append('folder', sig.folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`,
    { method: 'POST', body: formData }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error?.message || 'Erro ao fazer upload para o Cloudinary')
  }

  if (!data.secure_url) {
    throw new Error('URL não retornada pelo Cloudinary')
  }

  const thumb_url = resourceType === 'video'
    ? data.secure_url
        .replace('/upload/', '/upload/w_800,q_auto,f_auto/')
        .replace(/\.\w+$/, '.jpg')
    : data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/')

  return {
    url:           data.secure_url,
    thumb_url,
    cloudinary_id: data.public_id,
  }
}

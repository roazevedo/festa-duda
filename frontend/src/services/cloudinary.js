// ─────────────────────────────────────────────────────────────
//  Configure com seus dados do Cloudinary
//  1. Entre em cloudinary.com → Settings → Upload → Upload Presets
//  2. Crie um preset com "Signing Mode = Unsigned"
//  3. Cole os valores abaixo
// ─────────────────────────────────────────────────────────────
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME   || 'SEU_CLOUD_NAME'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'SEU_PRESET'

/**
 * Faz upload de um arquivo para o Cloudinary
 * @param {File} file - arquivo de imagem
 * @param {string} folder - pasta no Cloudinary (ex: 'festa-duda/galeria')
 * @returns {Promise<{url, thumb_url, cloudinary_id}>}
 */
export async function uploadToCloudinary(file, folder = 'festa-duda') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    throw new Error('Erro ao fazer upload para o Cloudinary')
  }

  const data = await res.json()

  if (!data.secure_url) {
    throw new Error('URL não retornada pelo Cloudinary')
  }

  return {
    url:           data.secure_url,
    thumb_url:     data.secure_url.replace('/upload/', '/upload/w_800,q_auto,f_auto/'),
    cloudinary_id: data.public_id,
  }
}

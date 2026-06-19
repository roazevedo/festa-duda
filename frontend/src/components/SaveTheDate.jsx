import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './SaveTheDate.css'

export default function SaveTheDate() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true
  const fileRef         = useRef(null)

  const [video, setVideo]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'save_the_date')
        setVideo(data[0] || null)
      } catch (err) {
        console.error('Erro ao carregar o vídeo:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, token])

  const handleUpload = async (file) => {
    if (!file.type.startsWith('video/')) {
      alert('Selecione um arquivo de vídeo.')
      return
    }
    setUploading(true)
    try {
      const cloudData = await uploadToCloudinary(file, 'festa-duda/save-the-date', 'video')
      const photo = await createPhoto(slug, token, {
        ...cloudData,
        caption:  'save_the_date',
        category: 'save_the_date',
      })
      setVideo(photo)
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Erro ao enviar o vídeo. Verifique as configurações do Cloudinary.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!video) return
    if (!window.confirm('Remover este vídeo?')) return
    try {
      await deletePhoto(slug, token, video.id)
      setVideo(null)
    } catch (err) {
      console.error('Erro ao remover o vídeo:', err)
    }
  }

  // Sem vídeo e sem ser admin: a seção simplesmente não aparece para o convidado
  if (!loading && !video && !isAdmin) return null

  return (
    <section className="std-section">
      <p className="std-eyebrow">guarde a data</p>
      <h2 className="std-title">Save the Date</h2>

      <div className="std-frame">
        {video ? (
          <>
            <video
              className="std-video"
              src={video.url}
              poster={video.thumb_url}
              controls
              playsInline
            />
            {isAdmin && (
              <button className="std-remove-btn" onClick={handleDelete} title="Remover vídeo">
                ✕
              </button>
            )}
          </>
        ) : uploading ? (
          <div className="std-uploading">
            <div className="std-spinner" />
            <p className="std-uploading-text">Enviando vídeo...</p>
          </div>
        ) : (
          isAdmin && (
            <button className="std-add-btn" onClick={() => fileRef.current?.click()}>
              <span className="std-add-icon">+</span>
              <span className="std-add-label">Adicionar vídeo</span>
            </button>
          )
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />
    </section>
  )
}

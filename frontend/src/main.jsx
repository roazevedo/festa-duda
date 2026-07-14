import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Após um deploy, abas abertas com o build antigo falham ao baixar módulos
// sob demanda (jspdf, leaflet, qrcode...) porque o nome dos arquivos muda.
// Recarrega a página uma única vez para pegar o build novo.
window.addEventListener('vite:preloadError', (event) => {
  const last = Number(sessionStorage.getItem('preload-error-reload') || 0)
  if (Date.now() - last < 30000) return // evita loop de reload
  sessionStorage.setItem('preload-error-reload', String(Date.now()))
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)

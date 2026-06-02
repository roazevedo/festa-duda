import { useState } from 'react'
import AtoHeader from './AtoHeader'
import './Galeria.css'

const PHOTOS = [
  { id: 1, label: 'Ensaio I',   sub: 'Dezembro 2025' },
  { id: 2, label: 'Ensaio II',  sub: 'Dezembro 2025' },
  { id: 3, label: 'Detalhe',    sub: 'Tiara e joias' },
  { id: 4, label: 'Escadaria',  sub: 'Classico'      },
  { id: 5, label: 'Close',      sub: 'Olhar marcante' },
  { id: 6, label: 'P&B',        sub: 'Arte em preto e branco' },
]

export default function Galeria() {
  const [active, setActive] = useState(null)

  return (
    <section className="section">
      <AtoHeader
        number="VII"
        title="O Ensaio"
        subtitle="momentos que antecipam a magia da festa"
      />

      <div className="galeria-grid">
        {PHOTOS.map((photo, index) => (
          <div
            key={photo.id}
            className={'galeria-item' + (index === 0 || index === 3 ? ' galeria-tall' : '')}
            onClick={() => setActive(photo)}
          >
            <div className="galeria-placeholder">
              <p className="galeria-label">{photo.label}</p>
              <p className="galeria-sub">{photo.sub}</p>
            </div>
            <div className="galeria-overlay">
              <span className="galeria-zoom">+</span>
            </div>
          </div>
        ))}
      </div>

      <p className="galeria-note">
        As fotos da festa serao adicionadas apos o evento
      </p>

      {active && (
        <div className="galeria-lightbox" onClick={() => setActive(null)}>
          <div className="galeria-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <div className="galeria-lightbox-img">
              <p className="galeria-label">{active.label}</p>
              <p className="galeria-sub">{active.sub}</p>
            </div>
            <button className="galeria-close" onClick={() => setActive(null)}>
              fechar
            </button>
          </div>
        </div>
      )}

    </section>
  )
}

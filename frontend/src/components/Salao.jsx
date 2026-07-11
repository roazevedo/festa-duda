import { useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import './Salao.css'
import 'leaflet/dist/leaflet.css'

// ── Coordenadas do Salão Elite ─────────────────────────────
// Se o pino aparecer deslocado, ajuste esses valores usando:
// maps.google.com → clique direito na localização exata → "O que há aqui?"
const LAT = -22.906002544192084
const LNG = -43.257624334972235

const ADDRESS = 'Salao Elite, Rua Vitor Meireles, 485, Riachuelo, Rio de Janeiro'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADDRESS)

export default function Salao() {
  const mapRef         = useRef(null)   // referência ao elemento <div> do mapa
  const mapInstanceRef = useRef(null)   // referência à instância do Leaflet

  useEffect(() => {
    // Evita reinicializar se o mapa já foi criado (React StrictMode chama
    // useEffect duas vezes em desenvolvimento, então essa guarda é necessária)
    if (mapInstanceRef.current) return

    // Import dinâmico — Leaflet acessa `window` internamente, então só pode
    // ser carregado no navegador (não durante SSR ou build)
    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center:          [LAT, LNG],
        zoom:            16,
        zoomControl:     true,
        scrollWheelZoom: false,  // evita zoom acidental ao rolar a página
      })

      // Tiles do CartoDB Dark Matter — gratuito, sem API key
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
          subdomains: 'abcd',
          maxZoom:    19,
        }
      ).addTo(map)

      // Marcador customizado usando DivIcon (CSS puro, sem imagem)
      // — evita o bug do Leaflet com Vite que quebra as imagens padrão do marcador
      const customIcon = L.divIcon({
        className:  '',            // remove a classe padrão do Leaflet
        html:       '<div class="salao-pin"></div>',
        iconSize:   [16, 16],
        iconAnchor: [8, 8],        // ancora no centro do círculo
        popupAnchor: [0, -14],     // popup aparece acima do pino
      })

      L.marker([LAT, LNG], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div class="salao-popup-inner">
             <p class="salao-popup-name">Casa de Festas Elite</p>
             <p class="salao-popup-addr">Rua Vítor Meireles, 485<br>Riachuelo · Rio de Janeiro</p>
           </div>`,
          { className: 'salao-popup' }
        )
        .openPopup()

      mapInstanceRef.current = map
    })

    // Cleanup — remove o mapa quando o componente desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])  // [] = roda só uma vez, ao montar

  return (
    <section className="section">
      <AtoHeader
        number="VIII"
        title="O Salao"
        subtitle="Elite · Rua Vitor Meireles, 485 · Riachuelo"
      />

      <div className="salao-wrapper">

        {/* O div abaixo é o "canvas" do Leaflet — precisa de altura definida no CSS */}
        <div ref={mapRef} className="salao-map" />

        <div className="salao-info">
          <div className="salao-detail">
            <span className="salao-detail-label">local</span>
            <span className="salao-detail-value">Casa de Festas Elite</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">endereco</span>
            <span className="salao-detail-value">
              Rua Vítor Meireles, 485<br />
              Riachuelo · Rio de Janeiro, RJ
            </span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">data</span>
            <span className="salao-detail-value">sabado, 29 de agosto de 2026</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">hora</span>
            <span className="salao-detail-value">20 horas</span>
          </div>
          <div className="salao-detail aviso-destaque">
            <span className="salao-detail-label">importante</span>
            <span className="salao-detail-value">
              <strong>
                não será permitida a entrada de bebidas alcoólicas trazidas de fora
              </strong>
            </span>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="salao-btn"
          >
            abrir no maps
          </a>
        </div>

      </div>
    </section>
  )
}

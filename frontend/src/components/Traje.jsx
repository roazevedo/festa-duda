import AtoHeader from './AtoHeader'
import './Traje.css'

const REFS = [
  { label: 'REFERÊNCIA', sub: 'VESTIDO LONGO'  },
  { label: 'REFERÊNCIA', sub: 'ESMOQUIM'        },
  { label: 'REFERÊNCIA', sub: 'MIDI DE GALA'    },
  { label: 'REFERÊNCIA', sub: 'TERNO ESCURO'    },
]

const COLORS = [
  { name: 'PRETO',     sub: 'Smoking · Vestido longo',  hex: '#0e0a08', textLight: true,  avoid: false },
  { name: 'DOURADO',   sub: 'Cetim · Lantejoula',        hex: '#c9a84c', textLight: false, avoid: false },
  { name: 'BORGONHA',  sub: 'reservado · evitar',        hex: '#6b0a0a', textLight: true,  avoid: true  },
  { name: 'CHAMPANHE', sub: 'Tons metálicos suaves',     hex: '#d4b896', textLight: false, avoid: false },
  { name: 'ESMERALDA', sub: 'Veludo · Cetim profundo',   hex: '#1a4a2e', textLight: true,  avoid: false },
]

export default function Traje() {
  return (
    <section className="section">
      <AtoHeader
        number="VI"
        title="O Traje"
        subtitle="social completo · uma releitura dos anos 20"
      />

      {/* Topo: card esquerdo + aviso direito */}
      <div className="traje-top">

        <div className="traje-card">
          <p className="traje-card-eyebrow">TRAJE</p>
          <h3 className="traje-card-title">Social Completo</h3>
          <p className="traje-card-text">
            Nossa celebração será inspirada na elegância e no glamour
            dos anos 20, em uma releitura moderna e sofisticada.
          </p>
          <p className="traje-card-text" style={{ marginTop: 10 }}>
            <em>Não é necessário utilizar trajes temáticos ou fantasias.</em>
          </p>
        </div>

        <div className="traje-warning">
          {/* Leque SVG */}
          <svg className="traje-fan" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#c9a84c" strokeWidth="1">
              {[...Array(9)].map((_, i) => {
                const a = (i / 8) * Math.PI
                return (
                  <line key={i}
                    x1="30" y1="40"
                    x2={30 + 28 * Math.cos(a)}
                    y2={40 - 28 * Math.sin(a)}
                    strokeWidth={i === 4 ? 1.5 : 0.8}
                  />
                )
              })}
              <path d="M 2 40 A 28 28 0 0 1 58 40" strokeWidth="1.2" />
              <path d="M 9 40 A 21 21 0 0 1 51 40" strokeWidth="0.7" opacity="0.6" />
            </g>
          </svg>

          <p className="traje-warning-text">
            Para valorizar a debutante em seu momento especial, pedimos
            gentilmente que as convidadas{' '}
            <strong style={{ color: '#e8c84a', fontStyle: 'italic', fontWeight: 400 }}>
              evitem trajes em tons de vermelho, vinho e marsala.
            </strong>
          </p>

          <div className="traje-rule" />

          <p className="traje-ref-note">
            As imagens abaixo servem como referência do nível de formalidade
            esperado para a ocasião.
          </p>
        </div>

      </div>

      {/* Grade de referências */}
      <div className="traje-refs">
        {REFS.map((r, i) => (
          <div key={i} className="traje-ref-item">
            <div className="traje-ref-img">
              <div className="traje-ref-lines">
                {[...Array(12)].map((_, j) => (
                  <div key={j} className="ref-line" />
                ))}
              </div>
              <p className="traje-ref-label">{r.label} · {r.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Paleta de cores */}
      <p className="traje-palette-title">CORES SUGERIDAS ·</p>
      <div className="traje-palette">
        {COLORS.map((c) => (
          <div key={c.name} className="traje-color">
            <div
              className={'traje-swatch' + (c.avoid ? ' traje-swatch-avoid' : '')}
              style={{ background: c.hex }}
            >
              {c.avoid && (
                <svg viewBox="0 0 100 100" className="traje-avoid-line">
                  <line x1="10" y1="10" x2="90" y2="90" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
                </svg>
              )}
              <span
                className="traje-swatch-name"
                style={{ color: c.textLight ? 'rgba(240,230,200,0.7)' : 'rgba(20,10,0,0.7)' }}
              >
                {c.name}
              </span>
            </div>
            <p className={'traje-color-sub' + (c.avoid ? ' traje-avoid-text' : '')}>
              {c.sub}
            </p>
          </div>
        ))}
      </div>

      <p className="traje-footer-note">
        o branco é reservado à aniversariante · vermelho, vinho e marsala, à debutante.
      </p>
    </section>
  )
}

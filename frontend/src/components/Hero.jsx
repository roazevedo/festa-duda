import { useEffect, useState } from 'react'
import './Hero.css'

export default function Hero() {
  const [opened, setOpened]           = useState(false)
  const [contentVisible, setContent]  = useState(false)
  const [lightsOn, setLights]         = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setOpened(true),  700)
    const t2 = setTimeout(() => setContent(true), 1600)
    const t3 = setTimeout(() => setLights(true),  1800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <section className="hero">

      {/* Ornamentos laterais — fora do palco */}
      <div className="side-orn side-orn-left">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <path d="M18 28 L0 0 L36 0 Z" fill="none" stroke="#c9a84c" strokeWidth="1"/>
          {[...Array(7)].map((_, i) => (
            <line key={i}
              x1="18" y1="28"
              x2={i * 6} y2="0"
              stroke="#c9a84c" strokeWidth="0.8" opacity="0.7"
            />
          ))}
        </svg>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="orn-arrow">▼</div>
        ))}
        <div className="orn-circle" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="orn-arrow">▼</div>
        ))}
        <div className="orn-circle" />
      </div>

      <div className="side-orn side-orn-right">
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <path d="M18 28 L0 0 L36 0 Z" fill="none" stroke="#c9a84c" strokeWidth="1"/>
          {[...Array(7)].map((_, i) => (
            <line key={i}
              x1="18" y1="28"
              x2={i * 6} y2="0"
              stroke="#c9a84c" strokeWidth="0.8" opacity="0.7"
            />
          ))}
        </svg>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="orn-arrow">▼</div>
        ))}
        <div className="orn-circle" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="orn-arrow">▼</div>
        ))}
        <div className="orn-circle" />
      </div>

      {/*
        .stage-wrapper engloba palco + cortinas como irmãos.
        As cortinas ficam sobre o palco com position:absolute
        mas podem deslizar ALÉM da borda sem serem cortadas.
      */}
      <div className="stage-wrapper">

        {/* ── PALCO ── */}
        <div className="stage">

          {/* Luzes dentro da moldura */}
          <div className="stage-bulbs">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={'bulb' + (lightsOn ? ' bulb-on' : '')}
                style={{ transitionDelay: `${i * 0.06}s` }}
              />
            ))}
          </div>

          {/* Conteúdo */}
          <div className={'stage-content' + (contentVisible ? ' visible' : '')}>

            <p className="hero-eyebrow">ESTA NOITE, EM APRESENTAÇÃO ÚNICA</p>

            <p className="hero-sub">os quinze anos de</p>

            <h1 className="hero-name">
              Maria<br />Eduarda
            </h1>

            <div className="hero-xv-row">
              <span className="hero-rule" />
              <span className="hero-xv">XV</span>
              <span className="hero-rule" />
            </div>

            <p className="hero-venue">SALÃO ELITE · RIO DE JANEIRO</p>

            <p className="hero-roman">XXIX · VIII · MMXXVI</p>

            <p className="hero-time">cortinas às 21 horas</p>

          </div>
        </div>

        {/* ── CORTINAS — irmãs do palco, não filhas ── */}
        <div className={'curtain curtain-l' + (opened ? ' open' : '')} />
        <div className={'curtain curtain-r' + (opened ? ' open' : '')} />

      </div>
    </section>
  )
}

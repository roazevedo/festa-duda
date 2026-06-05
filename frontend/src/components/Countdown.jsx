import { useState, useEffect } from 'react'
import AtoHeader from './AtoHeader'
import './Countdown.css'

const PARTY_DATE = new Date('2026-08-29T21:00:00')

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = PARTY_DATE - new Date()
      if (diff <= 0) return
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { value: time.days,    label: 'DIAS'     },
    { value: time.hours,   label: 'HORAS'    },
    { value: time.minutes, label: 'MINUTOS'  },
    { value: time.seconds, label: 'SEGUNDOS' },
  ]

  return (
    <section className="countdown-section">
      <div className="section">
        <AtoHeader
          number="II"
          title="A Espera"
          subtitle="cada segundo até as cortinas se abrirem"
        />
        <div className="countdown-grid">
          {units.map(({ value, label }) => (
            <div key={label} className="countdown-unit">
              <div className="countdown-box">
                <span className="countdown-value">
                  {String(value).padStart(4, '0')}
                </span>
              </div>
              <span className="countdown-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

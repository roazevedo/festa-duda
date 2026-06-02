import Hero from '../components/Hero'
import Convite from '../components/Convite'
import Countdown from '../components/Countdown'

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="section-divider" />
      <Convite />
      <div className="section-divider" />
      <Countdown />
    </main>
  )
}

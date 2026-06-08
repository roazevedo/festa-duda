import { useState, useEffect } from 'react'
import { EventContext } from './EventContext'
import { getEvent } from '../services/api'

export function EventProvider({ slug, token, children }) {
  const [event, setEvent]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEvent(slug, token)
        setEvent(data)
      } catch {
        setError('Evento não encontrado.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug, token])

  return (
    <EventContext.Provider value={{ event, slug, token, loading, error }}>
      {children}
    </EventContext.Provider>
  )
}

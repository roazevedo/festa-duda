import { useContext } from 'react'
import { EventContext } from './EventContext'

export function useEvent() {
  return useContext(EventContext)
}

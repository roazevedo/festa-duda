import { useAuth } from './useAuth'
import { useEvent } from './useEvent'

// Verdadeiro quando o usuário logado pode administrar o evento atual:
// admin global da plataforma ou dono (criador) do evento.
export function useEventAdmin() {
  const { user }  = useAuth()
  const { event } = useEvent()

  if (!user) return false
  if (user.admin === true) return true
  return event?.user_id != null && event.user_id === user.id
}

import { useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

/**
 * Detecta inatividade do usuário (sem mouse/teclado/scroll) e dispara
 * callbacks após determinado tempo.
 *
 * @param {number}   timeout      - tempo total de inatividade em ms até o logout
 * @param {number}   warningTime  - quanto tempo antes do logout o aviso deve aparecer (em ms)
 * @param {Function} onIdle       - chamado quando o tempo de inatividade é atingido
 * @param {Function} onWarning    - chamado quando entra no período de aviso
 * @param {boolean}  enabled      - se false, o timer fica desativado (ex: usuário deslogado)
 */
export function useIdleTimer({ timeout, warningTime = 0, onIdle, onWarning, enabled = true }) {
  const idleTimer    = useRef(null)
  const warningTimer = useRef(null)

  const clearTimers = useCallback(() => {
    if (idleTimer.current)    clearTimeout(idleTimer.current)
    if (warningTimer.current) clearTimeout(warningTimer.current)
  }, [])

  const resetTimers = useCallback(() => {
    clearTimers()
    if (!enabled) return

    if (warningTime > 0 && onWarning) {
      warningTimer.current = setTimeout(onWarning, Math.max(timeout - warningTime, 0))
    }
    idleTimer.current = setTimeout(onIdle, timeout)
  }, [clearTimers, enabled, timeout, warningTime, onIdle, onWarning])

  useEffect(() => {
    if (!enabled) {
      clearTimers()
      return
    }

    resetTimers()
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimers))

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimers))
    }
  }, [enabled, resetTimers, clearTimers])

  // Permite resetar manualmente (ex: botão "continuar conectado")
  return { resetTimers }
}

import { useState, useCallback } from 'react'
import ConfirmModal from './ConfirmModal'

// Hook para usar o ConfirmModal como o window.confirm:
//   const [confirm, confirmModal] = useConfirm()
//   ...
//   if (!(await confirm('Remover esta foto?'))) return
//   ...
//   return <section>...{confirmModal}</section>
export function useConfirm() {
  const [state, setState] = useState(null)

  const confirm = useCallback(
    (message, confirmLabel) =>
      new Promise((resolve) => setState({ message, confirmLabel, resolve })),
    []
  )

  const close = (answer) => {
    state.resolve(answer)
    setState(null)
  }

  const modal = state ? (
    <ConfirmModal
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null

  return [confirm, modal]
}

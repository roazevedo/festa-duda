import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPlanCheckout } from '../services/api'
import './PaymentReturn.css'

// Página de retorno do Checkout Pro do MP para NOVO evento pago.
// Confirma o pagamento e, se aprovado, cria/recupera o evento e leva o
// usuário direto para o site dele. Enquanto pendente, tenta de novo.
const MAX_TRIES = 5
const PENDING = ['pending', 'in_process', 'authorized']

export default function PaymentReturn() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [state, setState] = useState('checking') // checking | pending | error
  const tries = useRef(0)

  useEffect(() => {
    const reference = params.get('external_reference')
    const paymentId = params.get('payment_id') || params.get('collection_id')

    if (!reference) {
      navigate('/dashboard', { replace: true })
      return
    }

    let cancelled = false
    let timer

    const check = async () => {
      try {
        const res = await confirmPlanCheckout(reference, paymentId)
        if (cancelled) return

        if (res.status === 'approved' && res.event) {
          navigate(
            `/${res.event.slug}/${res.event.token}?editar=1&plano=sucesso`,
            { replace: true }
          )
          return
        }

        if (PENDING.includes(res.status) && tries.current < MAX_TRIES) {
          tries.current += 1
          setState('pending')
          timer = setTimeout(check, 3000)
          return
        }

        // pendente por tempo demais ou pagamento não aprovado
        setState(PENDING.includes(res.status) ? 'pending' : 'error')
      } catch {
        if (!cancelled) setState('error')
      }
    }

    check()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [params, navigate])

  return (
    <div className="payret">
      <div className="payret-box">
        {state === 'error' ? (
          <>
            <h1 className="payret-title">Pagamento não concluído</h1>
            <p className="payret-text">
              Não identificamos um pagamento aprovado. Nenhum valor foi
              cobrado e nenhum evento foi criado. Seus dados continuam
              salvos — você pode tentar de novo.
            </p>
            <div className="payret-actions">
              <button
                className="payret-btn payret-btn-primary"
                onClick={() => navigate('/dashboard/novo?plano=completo')}
              >
                Voltar à criação do evento
              </button>
              <button className="payret-btn" onClick={() => navigate('/dashboard')}>
                Ir para o painel
              </button>
            </div>
          </>
        ) : state === 'pending' ? (
          <>
            <div className="payret-spinner" />
            <h1 className="payret-title">Pagamento em processamento</h1>
            <p className="payret-text">
              Assim que o Mercado Pago confirmar, seu evento é criado
              automaticamente. Você pode acompanhar pelo painel.
            </p>
            <div className="payret-actions">
              <button className="payret-btn" onClick={() => navigate('/dashboard')}>
                Ir para o painel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="payret-spinner" />
            <h1 className="payret-title">Confirmando seu pagamento...</h1>
            <p className="payret-text">Só um instante.</p>
          </>
        )}
      </div>
    </div>
  )
}

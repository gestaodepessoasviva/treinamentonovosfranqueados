import { useEffect } from 'react'

// Caixinha de confirmação para ações que não têm volta.
export default function Confirmar({ titulo, children, sim = 'Sim, excluir', onSim, onNao }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onNao() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onNao])
  return (
    <div className="cf-fundo" onClick={onNao}>
      <div className="cf" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" onClick={e => e.stopPropagation()}>
        <b id="cf-t">{titulo}</b>
        <div className="mut">{children}</div>
        <div className="cf-bt">
          <button className="cf-nao" onClick={onNao} autoFocus>Cancelar</button>
          <button className="cf-sim" onClick={onSim}>{sim}</button>
        </div>
      </div>
    </div>
  )
}

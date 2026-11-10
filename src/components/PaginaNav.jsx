import { MENU } from '../data'
import { useApp } from '../state'

// "← Anterior / Próxima →" no fim de cada tela, na mesma ordem do menu.
export default function PaginaNav() {
  const { s, go } = useApp()
  const i = MENU.findIndex(m => m.id === s.tela)
  if (i < 0) return null
  const ir = id => { go(id); window.scrollTo(0, 0) }
  const ant = MENU[i - 1], prox = MENU[i + 1]
  return (
    <nav className="etp-nav pg-nav" aria-label="Navegar entre as telas">
      {ant ? <button onClick={() => ir(ant.id)}><small>← Anterior</small>{ant.nome}</button> : <span />}
      {prox && <button className="n" onClick={() => ir(prox.id)}><small>Próxima →</small>{prox.nome}</button>}
    </nav>
  )
}

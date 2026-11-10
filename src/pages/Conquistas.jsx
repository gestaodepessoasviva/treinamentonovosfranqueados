import Icone from '../components/Icone'
import { CONQUISTAS } from '../data'
import { useApp } from '../state'

export default function Conquistas() {
  const { s } = useApp()
  const tem = q => s.conquistas.includes(q.nome)
  return (
    <>
      <h1>Conquistas</h1>
      <p className="mut">{s.conquistas.length} de {CONQUISTAS.length} desbloqueadas</p>
      <div className="grid cq-grid">
        {CONQUISTAS.map(q => (
          <div key={q.nome} className={`card cq ${tem(q) ? '' : 'off'}`}>
            <span className="selo"><Icone nome={q.icone} tamanho={26} traco={1.7} /></span>
            <b>{q.nome}</b>
            <div className="mut sm">{q.quando}</div>
            <div className="st">{tem(q) ? '✓ Conquistada' : 'Bloqueada'}</div>
          </div>
        ))}
      </div>
    </>
  )
}

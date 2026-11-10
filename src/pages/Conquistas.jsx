import { CONQUISTAS } from '../data'
import { useApp } from '../state'

export default function Conquistas() {
  const { s } = useApp()
  const tem = q => s.conquistas.includes(q.nome)
  return (
    <>
      <h1>Conquistas</h1>
      <p className="mut">{s.conquistas.length} de {CONQUISTAS.length} desbloqueadas</p>
      <div className="grid">
        {CONQUISTAS.map(q => (
          <div key={q.nome} className={`card ${tem(q) ? '' : 'lock'}`}>
            <div className="em">{q.emoji}</div>
            <b>{q.nome}</b>
            <div className="mut sm">{q.quando}</div>
            <div className="mut sm" style={{ marginTop: 4, fontWeight: 800 }}>{tem(q) ? 'Conquistada' : 'Bloqueada'}</div>
          </div>
        ))}
      </div>
    </>
  )
}

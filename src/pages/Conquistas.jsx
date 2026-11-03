import { CONQUISTAS } from '../data'
import { useApp } from '../state'

export default function Conquistas() {
  const { conquistadas } = useApp()
  return (
    <>
      <h1>Conquistas</h1>
      <p className="mut">{conquistadas} de {CONQUISTAS.length} desbloqueadas</p>
      <div className="grid">
        {CONQUISTAS.map((q, i) => (
          <div key={q.nome} className={`card ${i < conquistadas ? '' : 'lock'}`}>
            <div className="em">{q.emoji}</div>
            <b>{q.nome}</b>
            <div className="mut sm">{i < conquistadas ? 'Conquistada' : 'Bloqueada'}</div>
          </div>
        ))}
      </div>
    </>
  )
}

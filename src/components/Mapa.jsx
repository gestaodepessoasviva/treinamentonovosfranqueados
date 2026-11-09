import imgMapa from '../assets/mapa-campus.jpg'
import { useApp } from '../state'
import { Barra } from './ui'

const TEXTO = { d: 'concluída', c: 'você está aqui', a: 'disponível', l: 'bloqueada' }
const ICONE = { d: '✓', c: '🔥', l: '🔒' }

export function Mapa({ compacto }) {
  const { s, statusEtapa, abrirEtapa } = useApp()
  return (
    <div className={`map${compacto ? ' sm' : ''}`}>
      <img src={imgMapa} alt="Mapa do campus com as 6 etapas da jornada" />
      {s.etapas.map((e, i) => {
        const t = statusEtapa(i)
        return (
          <button key={i} className={`nd ${t}${i === s.selecionada ? ' sel' : ''}`} style={{ left: `${e.x}%`, top: `${e.y}%` }}
            onClick={() => abrirEtapa(i)} aria-label={`${e.nome}: ${TEXTO[t]}`}>
            {ICONE[t] ?? i + 1}
            {t === 'c' && <span className="pin">VOCÊ ESTÁ AQUI</span>}
          </button>
        )
      })}
    </div>
  )
}

export function MapaCard({ compacto }) {
  const { s, progresso, abrirEtapa } = useApp()
  const explorar = () => abrirEtapa(s.atual)
  return (
    <section className="card">
      <b>🗺️ Mapa da sua jornada</b>
      <Mapa compacto={compacto} />
      <Barra pct={progresso} />
      <div className="mut">{progresso}% da jornada concluída · Você está em: <b>{s.etapas[s.atual].nome}</b></div>
      {compacto
        ? <button className="lk" style={{ margin: '6px 0 0' }} onClick={explorar}>Explorar mapa →</button>
        : <button className="go w" onClick={explorar}>Explorar mapa</button>}
    </section>
  )
}

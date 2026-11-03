import { Mapa } from '../components/Mapa'
import { Barra, Chip } from '../components/ui'
import { useApp } from '../state'

const ICONE_CHIP = { d: '✅', c: '🔥', a: '○', l: '🔒' }
const STATUS = { d: 'Concluída', c: 'Em andamento', a: 'Disponível', l: 'Bloqueada' }
const ICONE_ATIV = ['○', '✅', '🔥']

export default function Jornada() {
  const { s, statusEtapa, abrirEtapa, avancar, reiniciar, go } = useApp()
  const i = s.selecionada
  const etapa = s.etapas[i]
  const t = statusEtapa(i)
  const feitas = etapa.atividades.filter(x => x[1] === 1).length
  const pct = Math.round((feitas / etapa.atividades.length) * 100)

  return (
    <>
      <h1>Minha Jornada</h1>
      <p className="mut">Toque em uma etapa do mapa para ver as atividades.</p>
      <Mapa />
      <div className="chs">
        {s.etapas.map((e, k) => (
          <button key={k} className={`ch ${k === i ? 'on' : ''}`} onClick={() => abrirEtapa(k)}>
            {ICONE_CHIP[statusEtapa(k)]} {e.nome}
          </button>
        ))}
      </div>
      <section className="card">
        <b>{etapa.emoji} {etapa.nome}</b>{' '}
        <Chip c={t === 'd' ? 'cv' : t === 'l' ? 'cl' : 'cp'}>{STATUS[t]}</Chip>
        <Barra pct={pct} />
        <div className="mut">{pct}% concluída{etapa.pts > 0 && t !== 'l' && ` · +${etapa.pts} pontos nesta etapa`}</div>
        {etapa.atividades.map(([nome, st]) => (
          <div className="row" key={nome}><span>{t === 'l' ? '🔒' : ICONE_ATIV[st]} {nome}</span></div>
        ))}
        {i === 0 && <button className="go" onClick={() => go('guia')}>📖 Abrir Guia da Jornada</button>}
      </section>
      <section className="card">
        <b>🧪 Teste o mapa</b>
        <div className="mut">Só no protótipo: cada clique conclui a próxima atividade da etapa atual e o mapa se atualiza.</div>
        <button className="go" onClick={avancar}>Concluir próxima atividade</button>
        <button className="lk" onClick={reiniciar}>Reiniciar</button>
      </section>
    </>
  )
}

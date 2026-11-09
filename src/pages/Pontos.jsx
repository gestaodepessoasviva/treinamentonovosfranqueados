import { Barra } from '../components/ui'
import { CONQUISTAS, ENTREGAS, EXTRAS, FATOR_ATRASO, fmt, NIVEIS, REGRAS, SEMESTRE } from '../data'
import { dataBR, nomeAula, prazoInfo, useApp } from '../state'

export default function Pontos() {
  const { s, nivel, go } = useApp()
  const minhaTurma = s.turmas.find(t => t.codigo === s.turma)
  const prox = NIVEIS[nivel + 1]
  const base = NIVEIS[nivel].min

  return (
    <>
      <h1>Pontos</h1>
      <section className="card">
        <div className="mut">Seu saldo</div>
        <div className="big">{fmt(s.pontos)} <small>pontos</small></div>
        {prox ? (
          <>
            <Barra pct={Math.min(100, ((s.pontos - base) / (prox.min - base)) * 100)} />
            <div className="mut">Faltam {fmt(Math.max(0, prox.min - s.pontos))} pontos para o nível {nivel + 2} ({prox.nome})</div>
          </>
        ) : <div className="mut">Nível máximo!</div>}
        <button className="go" onClick={() => go('benef')}>Ver benefícios</button>
        <div className="mut sm" style={{ marginTop: 8 }}>Última atualização: hoje, 08h</div>
      </section>

      <h2>Níveis</h2>
      <section className="card">
        {NIVEIS.map((n, i) => (
          <div key={n.nome} className={`lv ${i < nivel ? 'done' : i === nivel ? 'cur' : ''}`}>
            <b>{i < nivel ? '✓' : i + 1}</b>
            <span>{n.nome}<br /><span className="mut sm">{n.desc}</span></span>
            <small>{fmt(n.min)}+ pts</small>
          </div>
        ))}
      </section>

      <h2>Como acumular pontos</h2>
      <section className="card">
        <b>📚 Ações do curso</b>
        {REGRAS.map(r => (
          <div className="row" key={r.id}>
            <span>{r.acao}<br /><span className="mut sm">{r.obs}</span></span>
            <span className="pl">+{r.pontos}</span>
          </div>
        ))}
      </section>
      <section className="card">
        <b>🏗️ Entregas da implantação</b>
        <div className="mut sm">
          As mesmas 9 entregas para toda a turma, validadas pela Expansão no Sults. Pontuam quando concluídas durante
          o semestre ({SEMESTRE}). Concluídas depois do prazo valem {FATOR_ATRASO * 100}% dos pontos.
        </div>
        {ENTREGAS.map(e => ({ ...e, p: prazoInfo(e.nome, minhaTurma) })).sort((a, b) => a.p.data.localeCompare(b.p.data)).map(({ nome, pontos, p }) => (
          <div className="row" key={nome}>
            <span>{nome}<br /><span className="mut sm">Prazo: {dataBR(p.data)} ({p.provisorio ? 'provisório' : p.regra}){p.aula && ` · ${nomeAula(p.aula)}`}</span></span>
            <span className="pl">+{pontos}</span>
          </div>
        ))}
      </section>
      <section className="card">
        <b>🚀 Pontos extras</b>
        {EXTRAS.map(e => (
          <div className="row" key={e.acao}>
            <span>{e.acao}{e.max > 1 && <><br /><span className="mut sm">Máximo de {e.max} no semestre</span></>}</span>
            <span className="pl">+{e.pontos}</span>
          </div>
        ))}
      </section>

      <h2>Conquistas</h2>
      <section className="card">
        <div className="mut sm">Selos que você desbloqueia ao longo da jornada.</div>
        {CONQUISTAS.map(q => (
          <div className="row" key={q.nome}>
            <span>{q.emoji} {q.nome}<br /><span className="mut sm">{q.quando}</span></span>
            <span className="chip cp">{q.tipo}</span>
          </div>
        ))}
        <button className="go" onClick={() => go('conq')}>Ver minhas conquistas</button>
      </section>
    </>
  )
}

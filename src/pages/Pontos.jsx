import { useEffect, useRef, useState } from 'react'
import { Barra } from '../components/ui'
import { ENTREGAS, EXTRAS, fmt, NIVEIS, REGRAS } from '../data'
import { dataBR, nomeAula, prazoInfo, useApp } from '../state'

const EMOJI_NIVEL = ['🌱', '🎒', '🤝', '🎯', '🎓']

// Níveis em carrossel: faixas compridas e baixas, uma por vez, começando no nível atual.
// As bolinhas embaixo mostram a posição e levam ao nível tocado.
function Niveis({ nivel, pontos }) {
  const trilho = useRef(null)
  const [vendo, setVendo] = useState(nivel)
  const irPara = (i, suave = true) => {
    const el = trilho.current?.children[i]
    if (el) trilho.current.scrollTo({ left: el.offsetLeft - trilho.current.offsetLeft, behavior: suave ? 'smooth' : 'auto' })
  }
  useEffect(() => { irPara(nivel, false); setVendo(nivel) }, [nivel])
  const rolou = () => {
    const t = trilho.current
    const larg = t.children[0]?.offsetWidth || 1
    setVendo(Math.min(NIVEIS.length - 1, Math.round(t.scrollLeft / (larg + 10))))
  }
  return (
    <>
      <div className="niveis" ref={trilho} onScroll={rolou}>
        {NIVEIS.map((n, i) => {
          const st = i < nivel ? 'done' : i === nivel ? 'cur' : 'next'
          const prox = NIVEIS[i + 1]
          const pct = st === 'done' ? 100 : st === 'next' ? 0 : prox ? Math.min(100, ((pontos - n.min) / (prox.min - n.min)) * 100) : 100
          return (
            <div className={`nv ${st}`} key={n.nome}>
              <span className="nv-em">{EMOJI_NIVEL[i]}</span>
              <span className="nv-n">Nível {i + 1}{st === 'cur' ? ' · atual' : st === 'done' ? ' · ✓ conquistado' : ''}</span>
              <span className="nv-pts">{fmt(n.min)}+ pts</span>
              <b>{n.nome}</b>
              <span className="nv-d">{n.desc}</span>
              <span className="nv-bar"><i style={{ width: `${pct}%` }} /></span>
            </div>
          )
        })}
      </div>
      <div className="nv-dots">
        {NIVEIS.map((n, i) => <button key={n.nome} className={i === vendo ? 'on' : ''} aria-label={`Ver nível ${i + 1}: ${n.nome}`} onClick={() => irPara(i)} />)}
      </div>
    </>
  )
}

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
      <Niveis nivel={nivel} pontos={s.pontos} />

      <h2>Como acumular pontos</h2>
      <section className="card fx k1">
        <b>📚 Ações do curso</b>
        {REGRAS.map(r => (
          <div className="row" key={r.id}>
            <span>{r.acao}<br /><span className="mut sm">{r.obs}</span></span>
            <span className="pl">+{r.pontos}</span>
          </div>
        ))}
      </section>
      <section className="card fx k2">
        <b>🏗️ Entregas da implantação</b>
        <div className="mut sm">Pontuam quando concluídas no prazo estipulado.</div>
        {ENTREGAS.map(e => ({ ...e, p: prazoInfo(e.nome, minhaTurma) })).sort((a, b) => a.p.data.localeCompare(b.p.data)).map(({ nome, pontos, p }) => (
          <div className="row" key={nome}>
            <span>{nome}<br /><span className="mut sm">Prazo: {dataBR(p.data)} ({p.provisorio ? 'provisório' : p.regra}){p.aula && ` · ${nomeAula(p.aula)}`}</span></span>
            <span className="pl">+{pontos}</span>
          </div>
        ))}
      </section>
      <section className="card fx k3">
        <b>🚀 Pontos extras</b>
        {EXTRAS.map(e => (
          <div className="row" key={e.acao}>
            <span>{e.acao}{e.max > 1 && <><br /><span className="mut sm">Máximo de {e.max} no semestre</span></>}</span>
            <span className="pl">+{e.pontos}</span>
          </div>
        ))}
      </section>
    </>
  )
}

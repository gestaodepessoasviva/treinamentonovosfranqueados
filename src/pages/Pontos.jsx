import { Barra } from '../components/ui'
import { fmt, NIVEIS, REGRAS } from '../data'
import { useApp } from '../state'

export default function Pontos() {
  const { s, nivel, go } = useApp()
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
        <button className="go" onClick={() => go('benef')}>Trocar pontos</button>
        <div className="mut sm" style={{ marginTop: 8 }}>Última atualização: hoje, 08h</div>
      </section>

      <h2>Níveis</h2>
      <section className="card">
        {NIVEIS.map((n, i) => (
          <div key={n.nome} className={`lv ${i < nivel ? 'done' : i === nivel ? 'cur' : ''}`}>
            <b>{i < nivel ? '✓' : i + 1}</b><span>{n.nome}</span><small>{fmt(n.min)}+ pts</small>
          </div>
        ))}
      </section>

      <h2>Como acumular pontos</h2>
      <section className="card">
        {REGRAS.map(r => (
          <div className="row" key={r.texto}>
            <span><span className="tag">{r.tag}</span>{r.texto}{r.bonus && <><br /><span className="mut sm">{r.bonus}</span></>}</span>
            <span className="pl">{r.pts}</span>
          </div>
        ))}
      </section>

      <h2>Extrato</h2>
      <section className="card">
        {s.extrato.map((e, i) => (
          <div className="row" key={i}>
            <span>{e.texto}<br /><span className="mut sm">{e.data}</span></span>
            <span className={e.valor > 0 ? 'pl' : 'mn'}>{e.valor > 0 ? '+' : ''}{e.valor}</span>
          </div>
        ))}
      </section>
    </>
  )
}

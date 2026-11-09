import { fmt } from '../data'
import { useApp } from '../state'

export default function Beneficios() {
  const { s, trocar } = useApp()
  const catalogo = s.beneficios.filter(b => b.ativo)
  return (
    <>
      <h1>Benefícios</h1>
      <p className="mut">Seu saldo: <b>{fmt(s.pontos)} pontos</b></p>
      {catalogo.length === 0 && (
        <section className="card nt">
          <span className="em">🎁</span>
          <div>
            <b>Catálogo em breve</b>
            <div className="mut">Os benefícios estão sendo definidos. Seus pontos ficam guardados e poderão ser trocados quando o catálogo abrir.</div>
          </div>
        </section>
      )}
      {catalogo.map(b => {
        const esgotado = b.estoque <= 0
        const falta = s.pontos < b.custo
        return (
          <section className={`card nt ${esgotado ? 'lock' : ''}`} key={b.id}>
            <span className="em">{b.emoji}</span>
            <div style={{ flex: 1 }}>
              <b>{b.nome}</b>
              {b.descricao && <div className="mut sm">{b.descricao}</div>}
              <div className="mut">{fmt(b.custo)} pontos · {esgotado ? 'Esgotado' : `${b.estoque} disponíve${b.estoque === 1 ? 'l' : 'is'}`}</div>
              <button className="go" disabled={falta || esgotado} onClick={() => trocar(b)}>
                {esgotado ? 'Esgotado' : falta ? `Faltam ${fmt(b.custo - s.pontos)} pts` : 'Trocar agora'}
              </button>
            </div>
          </section>
        )
      })}
    </>
  )
}

import { BENEFICIOS, fmt } from '../data'
import { useApp } from '../state'

export default function Beneficios() {
  const { s, trocar } = useApp()
  return (
    <>
      <h1>Benefícios</h1>
      <p className="mut">Seu saldo: <b>{fmt(s.pontos)} pontos</b></p>
      {BENEFICIOS.map(b => {
        const falta = s.pontos < b.custo
        return (
          <section className="card nt" key={b.nome}>
            <span className="em">{b.emoji}</span>
            <div style={{ flex: 1 }}>
              <b>{b.nome}</b>
              <div className="mut">{fmt(b.custo)} pontos</div>
              <button className="go" disabled={falta} onClick={() => trocar(b)}>
                {falta ? `Faltam ${fmt(b.custo - s.pontos)} pts` : 'Trocar'}
              </button>
            </div>
          </section>
        )
      })}
    </>
  )
}

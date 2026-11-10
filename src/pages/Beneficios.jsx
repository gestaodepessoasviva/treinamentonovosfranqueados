import { useState } from 'react'
import Icone from '../components/Icone'
import { fmt } from '../data'
import { useApp } from '../state'

const FUNDOS = ['f1', 'f2', 'f3'] // degradês alternados: laranja, grafite, laranja claro

export default function Beneficios() {
  const { s, trocar } = useApp()
  const [aba, setAba] = useState('todos')
  const catalogo = s.beneficios.filter(b => b.ativo)
  const minhas = (s.extrato || []).filter(x => x.tipo === 'Troca')

  return (
    <>
      <h1>Benefícios</h1>
      <div className="saldo-bn"><span>Seu saldo</span><b>{fmt(s.pontos)} pts</b></div>
      <div className="filtros" role="tablist">
        <button role="tab" aria-selected={aba === 'todos'} className={aba === 'todos' ? 'on' : ''} onClick={() => setAba('todos')}>Todos</button>
        <button role="tab" aria-selected={aba === 'minhas'} className={aba === 'minhas' ? 'on' : ''} onClick={() => setAba('minhas')}>Minhas trocas{minhas.length > 0 && ` (${minhas.length})`}</button>
      </div>

      {aba === 'todos' && (catalogo.length === 0
        ? (
          <section className="card nt">
            <span className="em">🎁</span>
            <div>
              <b>Catálogo em breve</b>
              <div className="mut">Os benefícios estão sendo definidos. Seus pontos ficam guardados e poderão ser trocados quando o catálogo abrir.</div>
            </div>
          </section>
        )
        : (
          <div className="vitrine">
            {catalogo.map((b, i) => {
              const esgotado = b.estoque <= 0
              const falta = s.pontos < b.custo
              const bloqueado = esgotado || falta
              return (
                <article className={`bn ${bloqueado ? 'off' : ''}`} key={b.id}>
                  <div className={`bn-capa ${FUNDOS[i % FUNDOS.length]}`}>
                    <Icone nome={b.emoji} />
                    <span className="bn-pts">{fmt(b.custo)} pts</span>
                  </div>
                  <div className="bn-cx">
                    <b>{b.nome}</b>
                    {b.descricao && <span className="mut sm">{b.descricao}</span>}
                    <span className="mut sm">{esgotado ? 'Esgotado' : falta ? `Faltam ${fmt(b.custo - s.pontos)} pontos` : `${b.estoque} disponíve${b.estoque === 1 ? 'l' : 'is'}`}</span>
                    <button className="bn-go" disabled={bloqueado} onClick={() => trocar(b)}>{esgotado ? 'Esgotado' : falta ? 'Bloqueado' : 'Trocar'}</button>
                  </div>
                </article>
              )
            })}
          </div>
        ))}

      {aba === 'minhas' && (
        <section className="card">
          {minhas.length === 0 && <p className="mut" style={{ margin: 0 }}>Você ainda não trocou nenhum benefício.</p>}
          {minhas.map(x => (
            <div className="row" key={x.id}>
              <span>{x.texto.replace(/^Troca: /, '')}<br /><span className="mut sm">{x.data}</span></span>
              <span className="mn">−{fmt(Math.abs(x.valor))}</span>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

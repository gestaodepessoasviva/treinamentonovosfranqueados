import { useApp } from '../../state'
import { pendenciasDe } from './comum'
import { BotoesEntrega, BotoesExtra } from './Ficha'

export default function Validacoes() {
  const { s, adminAbrir } = useApp()
  const { entregas, extras } = pendenciasDe(s.franqueados)
  const Nome = ({ f }) => <button className="lk inline" onClick={() => adminAbrir(f.id)}>{f.nome}</button>

  return (
    <>
      <h1>Validações</h1>
      <p className="mut">Um clique valida e já lança os pontos. O franqueado recebe uma notificação.</p>

      <h2>🏗️ Entregas aguardando validação ({entregas.length})</h2>
      <section className="card">
        {entregas.length === 0 && <p className="mut">Nenhuma entrega aguardando. ✅</p>}
        {entregas.map(({ f, e }) => (
          <div className="row quebra" key={f.id + e.nome}>
            <span><b>{e.nome}</b><br /><span className="mut sm"><Nome f={f} /> · {f.franquia}</span></span>
            <BotoesEntrega f={f} e={e} />
          </div>
        ))}
        <p className="mut sm">Para validar uma entrega que ainda não foi enviada, abra a ficha do franqueado.</p>
      </section>

      <h2>🚀 Ações extras aguardando aprovação ({extras.length})</h2>
      <section className="card">
        {extras.length === 0 && <p className="mut">Nenhuma ação extra aguardando. ✅</p>}
        {extras.map(({ f, x }) => (
          <div className="row quebra" key={x.id}>
            <span><b>{x.acao}</b><br /><span className="mut sm"><Nome f={f} /> · {x.data} · {x.obs}</span></span>
            <BotoesExtra f={f} x={x} />
          </div>
        ))}
      </section>
    </>
  )
}

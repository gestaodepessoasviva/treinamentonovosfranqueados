import { CONQUISTAS, fmt, NIVEIS } from '../data'
import { useApp } from '../state'

export default function Perfil() {
  const { s, nivel, conquistadas, sair } = useApp()
  const iniciais = s.nome.split(' ').map(x => x[0]).join('')
  return (
    <section className="card pf">
      <div className="av">{iniciais}</div>
      <h1>{s.nome}</h1>
      <div className="mut">{s.franquia}</div>
      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card"><b>Nível {nivel + 1}</b><div className="mut">{NIVEIS[nivel].nome}</div></div>
        <div className="card"><b>{fmt(s.pontos)}</b><div className="mut">pontos</div></div>
        <div className="card"><b>{conquistadas} de {CONQUISTAS.length}</b><div className="mut">conquistas</div></div>
        <div className="card"><b>Etapa {s.atual + 1}</b><div className="mut">{s.etapas[s.atual].nome}</div></div>
      </div>
      <p className="mut sm">A foto real entra na versão final.</p>
      <button className="go w" onClick={sair}>Sair</button>
    </section>
  )
}

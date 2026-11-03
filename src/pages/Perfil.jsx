import { CONQUISTAS, fmt, NIVEIS, USUARIO } from '../data'
import { useApp } from '../state'

export default function Perfil() {
  const { s, nivel, conquistadas, sair } = useApp()
  return (
    <section className="card pf">
      <div className="av">AS</div>
      <h1>{USUARIO.nome}</h1>
      <div className="mut">{USUARIO.franquia}</div>
      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card"><b>Nível {nivel + 1}</b><div className="mut">{NIVEIS[nivel].nome}</div></div>
        <div className="card"><b>{fmt(s.pontos)}</b><div className="mut">pontos</div></div>
        <div className="card"><b>{conquistadas} de {CONQUISTAS.length}</b><div className="mut">conquistas</div></div>
        <div className="card"><b>Fase 2</b><div className="mut">Inauguração</div></div>
      </div>
      <p className="mut sm">A foto real entra na versão final.</p>
      <button className="go w" onClick={sair}>Sair</button>
    </section>
  )
}

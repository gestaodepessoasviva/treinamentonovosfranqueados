import { useApp } from '../state'

export default function Notificacoes() {
  const { s } = useApp()
  return (
    <>
      <h1>Notificações</h1>
      {s.notificacoes.map((n, i) => (
        <section key={i} className={`card nt ${i < s.vistas ? 'new' : ''}`}>
          <span className="em" style={{ fontSize: 24 }}>{n.emoji}</span>
          <div><div>{n.texto}</div><div className="mut sm">{n.quando}</div></div>
        </section>
      ))}
      <p className="mut sm">Na versão final, cada pessoa escolhe quais avisos quer receber.</p>
    </>
  )
}

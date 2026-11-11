import Icone from '../components/Icone'
import { useApp } from '../state'

// Histórico de tudo o que aconteceu com a pessoa na Jornada (o mais recente primeiro).
export default function Notificacoes() {
  const { s } = useApp()
  return (
    <>
      <h1>Notificações</h1>
      <p className="mut">Tudo o que aconteceu na sua jornada: pontos, trocas, conquistas, níveis e suas ações na plataforma.</p>
      {s.notificacoes.length === 0 && <section className="card"><p className="mut" style={{ margin: 0 }}>Ainda não há nada por aqui. Seus pontos, conquistas e ações vão aparecer nesta lista.</p></section>}
      {s.notificacoes.map((n, i) => (
        <section key={n.id || i} className={`card nt ${(n.nova ?? i < s.vistas) ? 'new' : ''}`}>
          {n.icone
            ? <span className="nt-ic"><Icone nome={n.icone} tamanho={20} traco={1.8} /></span>
            : <span className="em" style={{ fontSize: 24 }}>{n.emoji}</span>}
          <div>
            <div>{n.texto}</div>
            {n.detalhe && <div className="mut sm">{n.detalhe}</div>}
            <div className="mut sm">{n.quando}</div>
          </div>
        </section>
      ))}
    </>
  )
}

import { MapaCard } from '../components/Mapa'
import { Chip, Progresso } from '../components/ui'
import { fmt, NIVEIS, USUARIO } from '../data'
import { useApp } from '../state'

function Missao() {
  const { toast } = useApp()
  return (
    <>
      <section className="mis">
        <div className="mt"><span className="fl">🔥</span> Sua próxima missão</div>
        <div className="mb">Concluir a trilha de Vendas</div>
        <div className="md">⏰ Prazo: 30/10 · 🎯 <b>+100 pontos</b></div>
        <button className="go2" onClick={() => toast('Na versão final: abre a trilha no Academy')}>Ir para a missão →</button>
      </section>
      <section className="card"><div className="mut">Próxima aula</div><b>29/10 · 09h · Aula 7: Vendas</b></section>
    </>
  )
}

export default function Inicio() {
  const { s, nivel, setLayout } = useApp()
  return (
    <>
      <div className="seg" role="group" aria-label="Teste de layout">
        <button className={s.layout === 'A' ? 'on' : ''} onClick={() => setLayout('A')}>A · Missão no topo</button>
        <button className={s.layout === 'B' ? 'on' : ''} onClick={() => setLayout('B')}>B · Mapa compacto</button>
      </div>
      <div className="mut">Olá,</div>
      <h1>{USUARIO.nome}</h1>
      <div className="mut">{USUARIO.franquia} · Nível {nivel + 1} {NIVEIS[nivel].nome} · <b>{fmt(s.pontos)} pontos</b></div>

      {s.layout === 'A' ? <><Missao /><MapaCard /></> : <><MapaCard compacto /><Missao /></>}

      <section className="card">
        <b>Seu progresso na fase</b>
        <Progresso nome="Academy" valor="78%" pct={78} />
        <Progresso nome="Aulas ao vivo" valor="6 de 7" pct={86} />
        <Progresso nome="Avaliações" valor="4 de 5" pct={80} />
      </section>
      <section className="card">
        <b>Pendências</b>
        <div className="row"><span>Trilha de Vendas</span><Chip c="cp">Pendente</Chip></div>
        <div className="row"><span>Missão: 2ª reunião comercial</span><Chip c="cv">Em validação</Chip></div>
      </section>
    </>
  )
}

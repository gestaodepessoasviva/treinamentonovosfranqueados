import { MapaCard } from '../components/Mapa'
import { Chip, Progresso } from '../components/ui'
import { fmt, NIVEIS } from '../data'
import { dataBR, hojeISO, nomeAula, proximaAula, useApp } from '../state'

const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// Card da próxima aula ao vivo da turma; abre o calendário.
function ProximaAula() {
  const { s, go } = useApp()
  const a = proximaAula(s.turmas.find(t => t.codigo === s.turma))
  if (!a) return null
  const dias = Math.round((new Date(a.data + 'T12:00') - new Date(hojeISO() + 'T12:00')) / 864e5)
  const quando = dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`
  return (
    <section className="pa">
      <div className="dt"><b>{a.data.slice(8, 10)}</b><span>{MES[Number(a.data.slice(5, 7)) - 1]}</span></div>
      <div className="pi">
        <div className="pk">📅 Próxima aula ao vivo · {quando}</div>
        <b>{nomeAula(a)}</b>
        <div className="mut sm">{SEM[new Date(a.data + 'T12:00').getDay()]}, {dataBR(a.data).slice(0, 5)} · {a.horario || 'horário a confirmar'} · Google Meet</div>
        <button className="lk" style={{ margin: '6px 0 0' }} onClick={() => go('calendario')}>Ver calendário da turma →</button>
      </div>
    </section>
  )
}

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
      <ProximaAula />
    </>
  )
}

export default function Inicio() {
  const { s, nivel } = useApp()
  return (
    <>
      <div className="mut">Olá,</div>
      <h1>{s.nome}</h1>
      <div className="mut">{s.franquia} · Nível {nivel + 1} {NIVEIS[nivel].nome} · <b>{fmt(s.pontos)} pontos</b></div>

      <Missao />
      <MapaCard />

      <section className="card">
        <b>Seu progresso na fase</b>
        <Progresso nome="Academy" valor="100%" pct={100} />
        <Progresso nome="Aulas ao vivo" valor="86%" pct={86} />
        <Progresso nome="Avaliações" valor="80%" pct={80} />
      </section>
      <section className="card">
        <b>Pendências</b>
        <div className="row"><span>Trilha de Vendas</span><Chip c="cp">Pendente</Chip></div>
        <div className="row"><span>Missão: 2ª reunião comercial</span><Chip c="cv">Em validação</Chip></div>
      </section>
    </>
  )
}

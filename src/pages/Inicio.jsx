import { MapaCard } from '../components/Mapa'
import { Chip, Progresso } from '../components/ui'
import { ENTREGAS, fmt, NIVEIS } from '../data'
import { dataBR, hojeISO, metaDe, nomeAula, prazoInfo, proximaAula, useApp } from '../state'

const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const diaSem = iso => SEM[new Date(iso + 'T12:00').getDay()]

// Card da próxima aula ao vivo da turma; abre o calendário ou entra na aula.
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
        <div className="mut sm">{diaSem(a.data)}, {dataBR(a.data).slice(0, 5)} · {a.horario || '14h'} · Google Meet</div>
        <div className="pa-acoes">
          {a.link && <a className="go3" href={a.link} target="_blank" rel="noreferrer">Entrar na aula ↗</a>}
          <button className="lk" onClick={() => go('calendario')}>Ver calendário da turma →</button>
        </div>
      </div>
    </section>
  )
}

// Próxima missão = primeira atividade pendente da etapa atual.
// O botão depende da atividade: trilha do Academy, aula ao vivo, página do app.
// Entregas e ações sem link não têm botão, só a informação do que fazer.
function Missao() {
  const { s, go, concluirMinha } = useApp()
  const etapa = s.etapas[s.atual]
  const ativ = etapa.atividades.find(x => x[1] !== 1)
  if (!ativ) return null
  const meta = metaDe(s.atual, ativ[0])
  const turma = s.turmas.find(t => t.codigo === s.turma)

  let titulo = ativ[0].replace(/^Academy: /, 'Concluir a trilha de ').replace(/^Entrega: /, 'Entregar: ')
  let detalhe = null
  let acao = null
  if (meta.link) {
    detalhe = meta.pontos ? <>🎯 <b>+{meta.pontos} pontos</b> no prazo</> : null
    acao = <a className="go2" href={meta.link} target="_blank" rel="noreferrer" onClick={() => concluirMinha('Acessar o Academy')}>{meta.link.includes('section.php') ? 'Ir para a trilha no Academy ↗' : 'Abrir o Academy ↗'}</a>
  } else if (meta.aulas) {
    const aulas = meta.aulas.map(id => turma?.aulas.find(a => a.id === id)).filter(Boolean)
    const a = aulas.find(x => (x.fim || x.data) >= hojeISO()) || aulas[0]
    if (a) {
      detalhe = meta.tnf
        ? <>📍 Presencial · {dataBR(a.data).slice(0, 5)} a {dataBR(a.fim).slice(0, 5)} · 🏅 conquista Presente no TNF</>
        : <>⏰ {diaSem(a.data)}, {dataBR(a.data).slice(0, 5)} às {a.horario || '14h'} · 🎯 <b>+30 pontos</b> (presença e avaliação)</>
      acao = a.link
        ? <a className="go2" href={a.link} target="_blank" rel="noreferrer">Entrar na aula ↗</a>
        : <button className="go2" onClick={() => go('calendario')}>Ver no calendário →</button>
    }
  } else if (meta.entrega) {
    const p = prazoInfo(meta.entrega, turma)
    const pts = ENTREGAS.find(e => e.nome === meta.entrega).pontos
    detalhe = <>⏰ Prazo: {dataBR(p.data)} · 🎯 <b>+{pts} pontos</b> no prazo</>
    acao = <div className="mi2">📌 Conclua a entrega no Sults. A Expansão valida e os pontos entram aqui.</div>
  } else if (meta.tela) {
    acao = <button className="go2" onClick={() => go(meta.tela)}>{meta.tela === 'guia' ? 'Abrir o Guia →' : 'Abrir o calendário →'}</button>
  } else if (meta.pontos) {
    detalhe = <>🎯 <b>+{meta.pontos} pontos</b></>
  }

  return (
    <section className="mis">
      <div className="mt"><span className="fl">🔥</span> Sua próxima missão</div>
      <div className="mb">{titulo}</div>
      {detalhe && <div className="md">{detalhe}</div>}
      {acao}
    </section>
  )
}

export default function Inicio() {
  const { s, nivel } = useApp()
  // Próximas entregas da implantação ainda não lançadas, pela ordem do prazo.
  const turma = s.turmas.find(t => t.codigo === s.turma)
  const pendentes = s.entregas.filter(e => e.status !== 'validada')
    .map(e => ({ nome: e.nome, prazo: prazoInfo(e.nome, turma).data, pontos: ENTREGAS.find(x => x.nome === e.nome).pontos }))
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, 3)
  return (
    <>
      <div className="mut">Olá,</div>
      <h1>{s.nome}</h1>
      <div className="mut">Nível {nivel + 1} {NIVEIS[nivel].nome} · <b>{fmt(s.pontos)} pontos</b></div>

      <Missao />
      <ProximaAula />
      <MapaCard />

      <section className="card">
        <b>Seu progresso na fase</b>
        <Progresso nome="Academy" valor="100%" pct={100} />
        <Progresso nome="Aulas ao vivo" valor="86%" pct={86} />
        <Progresso nome="Avaliações" valor="80%" pct={80} />
      </section>
      {pendentes.length > 0 && (
        <section className="card">
          <b>🏗️ Próximas entregas</b>
          {pendentes.map(e => (
            <div className="row" key={e.nome}>
              <span>{e.nome}<br /><span className="mut sm">Prazo: {dataBR(e.prazo)} · +{e.pontos} pontos</span></span>
              <Chip c={e.prazo < hojeISO() ? 'ca' : 'cp'}>{e.prazo < hojeISO() ? 'Atrasada' : 'Pendente'}</Chip>
            </div>
          ))}
        </section>
      )}
    </>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { dataBR, ehAula, hojeISO, nomeAula, proximaAula, useApp } from '../state'

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const iso = (a, m, d) => `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const diaSem = s => SEM[new Date(s + 'T12:00').getDay()]
const mesDe = s => ({ a: Number(s.slice(0, 4)), m: Number(s.slice(5, 7)) - 1 })
const ordem = ({ a, m }) => a * 12 + m

// Evento do dia: aula no próprio dia ou período (TNF) que cobre o dia.
const eventoDe = (eventos, s) => eventos.find(e => (e.fim ? s >= e.data && s <= e.fim : e.data === s))

function Detalhe({ e }) {
  if (e.tipo === 'tnf') return <><b>{e.tema}</b><div>{diaSem(e.data)}, {dataBR(e.data).slice(0, 5)} a {diaSem(e.fim)}, {dataBR(e.fim).slice(0, 5)}</div><div className="bmut">Presencial · sem aulas ao vivo nesta semana</div></>
  if (e.tipo === 'folga') return <><b>{e.tema}</b><div>{diaSem(e.data)}, {dataBR(e.data).slice(0, 5)}</div><div className="bmut">Não há aula ao vivo neste dia</div></>
  return (
    <>
      <b>{nomeAula(e)}</b>
      <div className="bmut">{e.professor ? `Professor(a): ${e.professor}` : 'Professor(a) a confirmar'}</div>
      <div>{diaSem(e.data)}, {dataBR(e.data).slice(0, 5)} · {e.horario || '14h'} · Google Meet</div>
      {e.link && <a className="entrar" href={e.link} target="_blank" rel="noreferrer">Entrar na aula ↗</a>}
    </>
  )
}

export default function Calendario() {
  const { s, concluirMinha } = useApp()
  // Abrir o calendário conclui a atividade "Consultar o calendário da turma".
  useEffect(() => { concluirMinha('Consultar o calendário da turma') }, [])
  const turma = s.turmas.find(t => t.codigo === s.turma)
  const eventos = [...(turma?.aulas || [])].filter(e => e.data).sort((a, b) => a.data.localeCompare(b.data))
  const prox = proximaAula(turma)
  const hoje = hojeISO()
  const [sel, setSel] = useState(prox?.data ?? null)

  const cal = useRef(null)
  const balao = useRef(null)
  const [pos, setPos] = useState(null)

  // Posiciona o balão sobre a data; se não couber em cima, abre embaixo.
  useLayoutEffect(() => {
    if (!sel || !cal.current || !balao.current) return setPos(null)
    const botao = cal.current.querySelector(`[data-s="${sel}"]`)
    if (!botao) return setPos(null)
    const rc = cal.current.getBoundingClientRect()
    const rb = botao.getBoundingClientRect()
    const w = balao.current.offsetWidth
    const h = balao.current.offsetHeight
    const centro = rb.left - rc.left + rb.width / 2
    const left = Math.max(6, Math.min(centro - w / 2, rc.width - w - 6))
    let top = rb.top - rc.top - h - 10
    const baixo = top < 4
    if (baixo) top = rb.bottom - rc.top + 10
    setPos({ left, top, seta: centro - left, baixo })
  }, [sel])

  if (!eventos.length) {
    return <><h1>Calendário da turma</h1><p className="mut">O calendário da sua turma ainda não foi publicado.</p></>
  }

  // Todos os meses da turma, do primeiro ao último evento, na mesma tela.
  const primeiro = ordem(mesDe(eventos[0].data))
  const ultimo = ordem(mesDe(eventos.at(-1).fim || eventos.at(-1).data))
  const meses = Array.from({ length: ultimo - primeiro + 1 }, (_, i) => ({ a: Math.floor((primeiro + i) / 12), m: (primeiro + i) % 12 }))
  const evSel = sel && eventoDe(eventos, sel)
  const qtdAulas = eventos.filter(ehAula).length

  return (
    <>
      <h1>Calendário da turma</h1>
      <div className="mut">{turma.nome} · {qtdAulas} aulas ao vivo, sempre às 14h</div>
      <div className="mut">Toque numa data marcada para ver a aula.</div>
      <div className="cal" ref={cal}>
        <div className="meses">
          {meses.map(mes => {
            const ini = new Date(mes.a, mes.m, 1).getDay()
            const total = new Date(mes.a, mes.m + 1, 0).getDate()
            return (
              <div className="mes" key={`${mes.a}-${mes.m}`}>
                <div className="cab"><b>{MESES[mes.m]} {mes.a}</b></div>
                <div className="sem">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((x, i) => <span key={i}>{x}</span>)}</div>
                <div className="dias">
                  {Array.from({ length: ini }, (_, i) => <span key={'v' + i} className="dia fora" />)}
                  {Array.from({ length: total }, (_, i) => {
                    const d = iso(mes.a, mes.m, i + 1)
                    const e = eventoDe(eventos, d)
                    const c = `dia${d === hoje ? ' hoje' : ''}${e ? ' ' + (e.tipo || 'aula') : ''}${sel === d ? ' sel' : ''}`
                    return e
                      ? <button key={d} className={c} data-s={d} onClick={() => setSel(sel === d ? null : d)} aria-label={`${dataBR(d)}: ${nomeAula(e)}`}>{i + 1}</button>
                      : <span key={d} className={c}>{i + 1}</span>
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="leg">
          <span><i className="lg a" />Aula ao vivo</span><span><i className="lg t" />TNF presencial</span>
          <span><i className="lg f" />Sem aula</span><span><i className="lg h" />Hoje</span>
        </div>
        {evSel && (
          <div ref={balao} role="status" className={`balao${pos?.baixo ? ' baixo' : ''}`}
            style={pos ? { left: pos.left, top: pos.top, '--seta': `${pos.seta}px` } : { visibility: 'hidden', left: 0, top: 0 }}>
            <button className="x" onClick={() => setSel(null)} aria-label="Fechar">×</button>
            <Detalhe e={evSel} />
            {evSel === prox && <div className="bmut">Próxima aula</div>}
          </div>
        )}
      </div>
      <p className="mut sm">O calendário pode ser ajustado pela coordenação. Mudanças aparecem aqui.</p>
    </>
  )
}

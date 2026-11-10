import { useState } from 'react'
import { ENTREGAS } from '../../data'
import { aulasOrdenadas, dataBR, prazoInfo, useApp } from '../../state'

let seq = 0
const novaAula = () => ({ id: `au-${Date.now().toString(36)}-${seq++}`, tipo: 'aula', data: '', numero: '', tema: '', professor: '', horario: '14h' })
const TIPOS = { aula: 'Aula ao vivo', tnf: 'TNF presencial', folga: 'Sem aula' }
const curta = iso => dataBR(iso).slice(0, 5)

// Linha da tabela em modo de edição (data, nº, aula, professor).
function EditarLinha({ inicial, onSalvar, onCancelar }) {
  const [a, setA] = useState(inicial)
  const campo = k => e => setA({ ...a, [k]: k === 'numero' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value })
  const tipo = a.tipo || 'aula'
  return (
    <tr className="ed">
      <td>
        <input type="date" aria-label="Data" value={a.data} onChange={campo('data')} />
        {tipo === 'tnf' && <input type="date" aria-label="Último dia" title="Último dia" value={a.fim || ''} onChange={campo('fim')} />}
      </td>
      <td>{tipo === 'aula' && <input type="number" min="1" aria-label="Nº da aula" value={a.numero ?? ''} onChange={campo('numero')} />}</td>
      <td>
        <select aria-label="Tipo" value={tipo} onChange={campo('tipo')}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input aria-label="Aula" placeholder={tipo === 'aula' ? 'Tema (ex.: Vendas)' : 'Descrição'} value={a.tema} onChange={campo('tema')} />
      </td>
      <td>{tipo === 'aula' && <input aria-label="Professor(a)" placeholder="Professor(a)" value={a.professor || ''} onChange={campo('professor')} />}{tipo === "aula" && <input aria-label="Link da aula" placeholder="Link do Meet" value={a.link || ""} onChange={campo("link")} />}</td>
      <td className="acoes">
        <button className="mini ok" onClick={() => onSalvar(a)}>Salvar</button>
        <button className="mini" onClick={onCancelar}>Cancelar</button>
      </td>
    </tr>
  )
}

function Tabela({ turma }) {
  const { adminSalvarAula, adminExcluirAula, toast } = useApp()
  const [editando, setEditando] = useState(null) // id da linha aberta
  const [nova, setNova] = useState(null)
  const linhas = [...(turma.aulas || [])].sort((a, b) => a.data.localeCompare(b.data))

  const salvar = async a => {
    const erro = await adminSalvarAula(turma.codigo, { ...a, tema: a.tema.trim(), horario: a.horario || '14h' })
    if (erro) return toast(erro)
    setEditando(null)
    setNova(null)
  }
  const excluir = a => { if (window.confirm(`Excluir ${curta(a.data)} · ${a.tema}?`)) adminExcluirAula(turma.codigo, a.id) }

  return (
    <section className="card">
      <div className="tabela">
        <table className="cal-adm">
          <thead><tr><th>Data</th><th>Nº</th><th>Aula</th><th>Professor(a) · link</th><th /></tr></thead>
          <tbody>
            {linhas.map(a => (editando === a.id
              ? <EditarLinha key={a.id} inicial={a} onSalvar={salvar} onCancelar={() => setEditando(null)} />
              : (
                <tr key={a.id}>
                  <td>{a.fim ? `${curta(a.data)} a ${curta(a.fim)}` : curta(a.data)}</td>
                  <td>{a.numero ? `#${a.numero}` : ''}</td>
                  <td>{a.tipo === 'tnf' && <span className="tg tnf">TNF</span>}{a.tipo === 'folga' && <span className="tg fo">Sem aula</span>}{a.tema}</td>
                  <td className={a.professor ? "" : "mut"}>{(a.tipo || "aula") === "aula" ? a.professor || "a confirmar" : ""}{a.link && <a className="lk-meet" href={a.link} target="_blank" rel="noreferrer" title={a.link}> 🔗 Meet</a>}</td>
                  <td className="acoes">
                    <button className="mini" onClick={() => { setNova(null); setEditando(a.id) }}>Editar</button>
                    <button className="mini nao" onClick={() => excluir(a)}>Excluir</button>
                  </td>
                </tr>
              )))}
            {nova && <EditarLinha inicial={nova} onSalvar={salvar} onCancelar={() => setNova(null)} />}
          </tbody>
        </table>
      </div>
      {!nova && <button className="go" onClick={() => { setEditando(null); setNova(novaAula()) }}>➕ Adicionar aula</button>}
    </section>
  )
}

// Prazo de cada entrega: aula ligada + antes/depois. Salva na hora.
function Prazos({ turma }) {
  const { adminSalvarRegra } = useApp()
  const aulas = aulasOrdenadas(turma)
  const regras = turma.regras || {}
  return (
    <section className="card">
      <div className="tabela">
        <table className="prazos">
          <thead><tr><th>Entrega</th><th>Aula ligada</th><th>Quando</th><th>Prazo</th></tr></thead>
          <tbody>
            {ENTREGAS.map(e => {
              const r = regras[e.nome]
              const ligada = r && aulas.some(a => a.id === r.aula) ? r : null
              const p = prazoInfo(e.nome, turma)
              return (
                <tr key={e.nome}>
                  <td>{e.nome}</td>
                  <td>
                    <select aria-label={`Aula ligada a ${e.nome}`} value={ligada?.aula || ''} onChange={ev => adminSalvarRegra(turma.codigo, e.nome, { aula: ev.target.value, momento: ligada?.momento || 'depois' })}>
                      <option value="">Sem aula</option>
                      {aulas.map(a => <option key={a.id} value={a.id}>{a.numero ? `#${a.numero} ` : ''}{a.tema} · {curta(a.data)}</option>)}
                    </select>
                  </td>
                  <td>
                    {ligada
                      ? (
                        <span className="pill" role="radiogroup" aria-label={`Quando vence ${e.nome}`}>
                          {['antes', 'depois'].map(m => (
                            <button key={m} role="radio" aria-checked={ligada.momento === m} className={ligada.momento === m ? 'on' : ''} onClick={() => adminSalvarRegra(turma.codigo, e.nome, { ...ligada, momento: m })}>{m}</button>
                          ))}
                        </span>
                      )
                      : <span className="mut sm">fim do mês</span>}
                  </td>
                  <td><b>{curta(p.data)}</b></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mut sm">"Antes" = até o dia da aula · "Depois" = até a próxima aula. As mudanças valem na hora.</p>
    </section>
  )
}

export default function Calendario() {
  const { s } = useApp()
  const [codigo, setCodigo] = useState(s.turmas[0]?.codigo || '')
  const turma = s.turmas.find(t => t.codigo === codigo)
  return (
    <>
      <h1>Calendário da turma</h1>
      <div className="filtros">
        <select value={codigo} onChange={e => setCodigo(e.target.value)} aria-label="Turma">
          {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.nome}</option>)}
        </select>
        <span className="mut sm" style={{ alignSelf: 'center' }}>Aulas ao vivo sempre às 14h, pelo Google Meet.</span>
      </div>
      {turma
        ? <><Tabela key={turma.codigo} turma={turma} /><h2>Prazo das entregas</h2><Prazos turma={turma} /></>
        : <p className="mut">Cadastre uma turma primeiro.</p>}
    </>
  )
}

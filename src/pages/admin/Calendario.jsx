import { useState } from 'react'
import { ENTREGAS } from '../../data'
import { aulasOrdenadas, dataBR, nomeAula, prazoInfo, useApp } from '../../state'

let seq = 0
const novaAula = () => ({ id: `au-${Date.now().toString(36)}-${seq++}`, tipo: 'aula', data: '', numero: '', tema: '', professor: '', horario: '14h' })
const TIPOS = { aula: 'Aula ao vivo', tnf: 'Treinamento presencial', folga: 'Sem aula' }

// Calendário de aulas ao vivo da turma e ligação de cada entrega com uma aula.
// O prazo da entrega sai daqui: antes da aula = dia da aula; depois = dia da próxima aula.
function EditorTurma({ turma }) {
  const { adminSalvarCalendario, toast } = useApp()
  const [aulas, setAulas] = useState(turma.aulas || [])
  const [regras, setRegras] = useState(turma.regras || {})
  const rascunho = { ...turma, aulas, regras }
  const ordenadas = aulasOrdenadas(rascunho)

  const mudarAula = (id, k, v) => setAulas(aulas.map(a => (a.id === id ? { ...a, [k]: k === 'numero' ? (v === '' ? '' : Number(v)) : v } : a)))
  const removerAula = id => {
    setAulas(aulas.filter(a => a.id !== id))
    setRegras(Object.fromEntries(Object.entries(regras).filter(([, r]) => r.aula !== id)))
  }
  const mudarRegra = (nome, k, v) => {
    const atual = regras[nome] || { aula: '', momento: 'depois' }
    const nova = { ...atual, [k]: v }
    const copia = { ...regras }
    if (nova.aula) copia[nome] = nova
    else delete copia[nome]
    setRegras(copia)
  }
  const salvar = () => {
    const erro = adminSalvarCalendario(turma.codigo, aulas, regras)
    if (erro) toast(erro)
  }

  return (
    <>
      <h2>Aulas e datas da turma</h2>
      <section className="card">
        {aulas.length === 0 && <p className="mut">Nenhuma aula cadastrada. Enquanto isso, os prazos das entregas são provisórios (último dia do mês previsto).</p>}
        {[...aulas].sort((a, b) => (a.data || '9').localeCompare(b.data || '9')).map(a => {
          const tipo = a.tipo || 'aula'
          return (
            <div className="row quebra" key={a.id}>
              <span><b>{a.data ? `${dataBR(a.data).slice(0, 5)} · ${nomeAula({ ...a, tipo })}` : 'Nova data'}</b>{tipo === 'aula' && <><br /><span className="mut sm">{a.professor || 'professor a confirmar'} · {a.horario || 'horário a confirmar'}</span></>}</span>
              <span className="acoes">
                <select aria-label="Tipo" value={tipo} onChange={e => mudarAula(a.id, 'tipo', e.target.value)}>
                  {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input type="date" aria-label="Data da aula" value={a.data} onChange={e => mudarAula(a.id, 'data', e.target.value)} />
                {tipo === 'tnf' && <input type="date" aria-label="Até" title="Último dia" value={a.fim || ''} onChange={e => mudarAula(a.id, 'fim', e.target.value)} />}
                {tipo === 'aula' && <input type="number" min="1" aria-label="Nº da aula" placeholder="Nº" style={{ width: 70 }} value={a.numero ?? ''} onChange={e => mudarAula(a.id, 'numero', e.target.value)} />}
                <input aria-label="Tema da aula" placeholder={tipo === 'aula' ? 'Tema (ex.: Vendas)' : 'Descrição'} value={a.tema} onChange={e => mudarAula(a.id, 'tema', e.target.value)} />
                {tipo === 'aula' && <input aria-label="Professor" placeholder="Professor(a)" value={a.professor || ''} onChange={e => mudarAula(a.id, 'professor', e.target.value)} />}
                {tipo === 'aula' && <input aria-label="Horário" placeholder="Horário (ex.: 14h)" style={{ width: 130 }} value={a.horario || ''} onChange={e => mudarAula(a.id, 'horario', e.target.value)} />}
                <button className="mini nao" onClick={() => removerAula(a.id)}>Remover</button>
              </span>
            </div>
          )
        })}
        <button className="lk" onClick={() => setAulas([...aulas, novaAula()])}>➕ Adicionar data</button>
      </section>

      <h2>Prazo de cada entrega</h2>
      <section className="card">
        <p className="mut sm">Escolha a aula ligada à entrega e se ela é feita antes da aula (vence no dia da aula ao vivo) ou depois (vence no dia da próxima aula).</p>
        {ENTREGAS.map(e => {
          const r = regras[e.nome] || { aula: '', momento: 'depois' }
          const p = prazoInfo(e.nome, rascunho)
          return (
            <div className="row quebra" key={e.nome}>
              <span><b>{e.nome}</b><br /><span className="mut sm">prazo {dataBR(p.data)} {p.provisorio ? '(provisório)' : `(${p.regra})`}</span></span>
              <span className="acoes">
                <select aria-label={`Aula ligada a ${e.nome}`} value={ordenadas.some(a => a.id === r.aula) ? r.aula : ''} onChange={ev => mudarRegra(e.nome, 'aula', ev.target.value)}>
                  <option value="">Sem aula ligada</option>
                  {ordenadas.map(a => <option key={a.id} value={a.id}>{dataBR(a.data).slice(0, 5)} · {nomeAula(a)}</option>)}
                </select>
                <select aria-label={`Momento de ${e.nome}`} value={r.momento} onChange={ev => mudarRegra(e.nome, 'momento', ev.target.value)}>
                  <option value="antes">Antes da aula</option>
                  <option value="depois">Depois da aula</option>
                </select>
              </span>
            </div>
          )
        })}
      </section>
      <button className="go" onClick={salvar}>Salvar calendário</button>
    </>
  )
}

export default function Calendario() {
  const { s } = useApp()
  const [codigo, setCodigo] = useState(s.turmas[0]?.codigo || '')
  const turma = s.turmas.find(t => t.codigo === codigo)
  return (
    <>
      <h1>Calendário da turma</h1>
      <p className="mut">As datas das aulas ao vivo definem o prazo das entregas da implantação. Cada turma tem o seu calendário.</p>
      <label>Turma
        <select value={codigo} onChange={e => setCodigo(e.target.value)}>
          {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.nome} · {t.codigo}</option>)}
        </select>
      </label>
      {turma ? <EditorTurma key={turma.codigo} turma={turma} /> : <p className="mut">Cadastre uma turma primeiro.</p>}
    </>
  )
}

import { useState } from 'react'
import Confirmar from '../../components/Confirmar'
import { avaliarGatilhos, gatilhosDaConfig } from '../../gatilhos'
import { dataBR, useApp } from '../../state'

const CHIP = {
  realizado: ['cr', '✓ Realizado'], apto: ['cv', 'Apto'], pendente: ['cp', 'Pendente'], bloqueado: ['cl', '—'],
}

// Gatilhos da jornada: quem está apto, pendente ou já realizou cada marco.
export default function Gatilhos() {
  const { s, adminGatilho } = useApp()
  const [turma, setTurma] = useState(s.turmas[0]?.codigo || '')
  const [sel, setSel] = useState(null) // [id do franqueado, nº do gatilho]
  const [confirma, setConfirma] = useState(null)
  const t = s.turmas.find(x => x.codigo === turma)
  const GATILHOS = gatilhosDaConfig(s.configGatilhos)
  const lista = s.franqueados.filter(f => f.ativo && (!turma || f.turma === turma)).sort((a, b) => a.nome.localeCompare(b.nome))
  const sit = Object.fromEntries(lista.map(f => [f.id, avaliarGatilhos(f, t, GATILHOS)]))
  const fSel = sel && lista.find(f => f.id === sel[0])
  const gSel = fSel && sit[fSel.id].find(g => g.n === sel[1])

  return (
    <>
      <h1>Gatilhos da jornada</h1>
      <p className="mut">Marcos presenciais da franquia. Cada um fica disponível depois do anterior. <b>Apto</b> = todos os pré-requisitos ok. Clique numa célula para ver o que falta e marcar como realizado. Só a equipe vê esta tela.</p>
      {s.turmas.length > 1 && (
        <label className="mut sm">Turma{' '}
          <select value={turma} onChange={e => { setTurma(e.target.value); setSel(null) }}>
            {s.turmas.map(x => <option key={x.codigo} value={x.codigo}>{x.nome}</option>)}
          </select>
        </label>
      )}
      <section className="card tabela gat-tab">
        <table>
          <thead><tr><th>Franqueado</th>{GATILHOS.map(g => <th key={g.n} title={g.nome}>{g.curto}</th>)}</tr></thead>
          <tbody>
            {lista.map(f => (
              <tr key={f.id}>
                <td><b>{f.nome}</b></td>
                {sit[f.id].map(g => (
                  <td key={g.n}>
                    <button className={`chip ${CHIP[g.status][0]} ${sel && sel[0] === f.id && sel[1] === g.n ? 'sel' : ''}`} onClick={() => setSel([f.id, g.n])} title={g.nome}>
                      {CHIP[g.status][1]}{g.status === 'pendente' && ` (${g.faltam})`}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={GATILHOS.length + 1} className="mut">Nenhum franqueado ativo nesta turma.</td></tr>}
          </tbody>
        </table>
      </section>

      <p className="mut sm">Para mudar os pré-requisitos, edite a aba <b>Config Gatilhos</b> da planilha (uma linha por pré-requisito, com listas suspensas).</p>

      {gSel && (
        <section className="card">
          <b>{fSel.nome} · Gatilho {gSel.n}: {gSel.nome}</b>
          {gSel.realizado && <div className="mut sm">Realizado em {dataBR(gSel.realizado.data)}{gSel.realizado.por && ` · marcado por ${gSel.realizado.por}`}</div>}
          {!gSel.disponivel && <div className="mut sm">Fica disponível depois que o gatilho anterior for realizado.</div>}
          {gSel.reqs.length === 0 && <div className="mut sm" style={{ marginTop: 6 }}>Sem pré-requisitos além do gatilho anterior.</div>}
          {gSel.reqs.map(r => (
            <div className="row" key={r.txt}><span>{r.ok ? '✅' : '⬜'} {r.txt}{r.info && <span className="mut sm"> · {r.info}</span>}</span></div>
          ))}
          <div className="acoes" style={{ marginTop: 10 }}>
            {gSel.realizado
              ? <button className="lk inline perigo" onClick={() => setConfirma({ desfazer: true })}>Desmarcar realizado</button>
              : <button className="go" disabled={!gSel.disponivel} onClick={() => (gSel.faltam ? setConfirma({ desfazer: false }) : adminGatilho(fSel.id, gSel.n, true))}>✓ Marcar como realizado</button>}
            {!gSel.realizado && gSel.disponivel && gSel.faltam > 0 && <span className="mut sm">Há {gSel.faltam} pendência{gSel.faltam > 1 ? 's' : ''}: dá para marcar como exceção.</span>}
          </div>
        </section>
      )}

      {confirma && (
        <Confirmar
          titulo={confirma.desfazer ? 'Desmarcar este gatilho?' : 'Marcar mesmo com pendências?'}
          sim={confirma.desfazer ? 'Sim, desmarcar' : 'Sim, marcar como exceção'}
          onNao={() => setConfirma(null)}
          onSim={() => { const d = confirma.desfazer; setConfirma(null); adminGatilho(fSel.id, gSel.n, !d) }}>
          {confirma.desfazer
            ? <p>O gatilho {gSel.n} de <b>{fSel.nome}</b> volta a ficar como não realizado.</p>
            : <p><b>{fSel.nome}</b> ainda tem {gSel.faltam} pré-requisito{gSel.faltam > 1 ? 's' : ''} pendente{gSel.faltam > 1 ? 's' : ''} para o gatilho {gSel.n}. Use só para exceções combinadas.</p>}
        </Confirmar>
      )}
    </>
  )
}

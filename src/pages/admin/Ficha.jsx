import { useState } from 'react'
import { Chip } from '../../components/ui'
import { ENTREGAS, EXTRAS, FATOR_ATRASO, fmt, NIVEIS, REGRAS } from '../../data'
import { extraDe, limiteAtingido, pontosEntrega, useApp, dataBR, prazoInfo, situacaoCalculada } from '../../state'
import { FormFranqueado, resumo } from './comum'

// Opções do lançamento de pontos, a partir das regras da planilha.
// Entregas e extras têm fluxo próprio (validação e aprovação) logo abaixo na ficha.
const OPCOES = [
  ...REGRAS.map(r => ({ grupo: 'Ações do curso', texto: r.acao, valor: r.pontos })),
  ...ENTREGAS.map(e => ({ grupo: 'Entregas no prazo', texto: 'Entrega validada: ' + e.nome, valor: e.pontos })),
  ...ENTREGAS.map(e => ({ grupo: `Entregas com atraso (${FATOR_ATRASO * 100}%)`, texto: `Entrega com atraso (${FATOR_ATRASO * 100}%): ${e.nome}`, valor: e.pontos * FATOR_ATRASO })),
  ...EXTRAS.map(e => ({ grupo: 'Extras', texto: e.acao, valor: e.pontos })),
]
const GRUPOS = [...new Set(OPCOES.map(o => o.grupo))]

const STATUS_ENTREGA = { pendente: ['cl', 'Pendente'], em_validacao: ['cp', 'Em validação'], validada: ['cv', 'Validada'] }

function LancarPontos({ f }) {
  const { adminLancar, toast } = useApp()
  const [opcao, setOpcao] = useState('0')
  const [valor, setValor] = useState('')
  const [motivo, setMotivo] = useState('')
  const manual = opcao === 'manual'

  const lancar = e => {
    e.preventDefault()
    if (!manual) return adminLancar(f.id, OPCOES[opcao].valor, OPCOES[opcao].texto)
    const v = Math.round(Number(valor))
    if (!v) return toast('Informe um valor diferente de zero.')
    if (!motivo.trim()) return toast('Informe o motivo do ajuste.')
    adminLancar(f.id, v, 'Ajuste: ' + motivo.trim())
    setValor('')
    setMotivo('')
  }

  return (
    <form className="card" onSubmit={lancar}>
      <b>⭐ Lançar pontos</b>
      <label>Ação
        <select value={opcao} onChange={e => setOpcao(e.target.value)}>
          {GRUPOS.map(g => (
            <optgroup label={g} key={g}>
              {OPCOES.map((o, i) => o.grupo === g && <option key={i} value={i}>{o.texto.replace(/^Entrega[^:]*: /, '')} (+{o.valor})</option>)}
            </optgroup>
          ))}
          <option value="manual">Ajuste manual (somar ou tirar pontos)</option>
        </select>
      </label>
      {manual && (
        <>
          <label>Pontos (use negativo para tirar)<input type="number" step="1" placeholder="ex.: 50 ou -20" value={valor} onChange={e => setValor(e.target.value)} /></label>
          <label>Motivo<input type="text" placeholder="ex.: correção de lançamento duplicado" value={motivo} onChange={e => setMotivo(e.target.value)} /></label>
        </>
      )}
      <button className="go" type="submit">Lançar</button>
    </form>
  )
}

export function BotoesEntrega({ f, e }) {
  const { s, adminValidarEntrega, adminDevolverEntrega } = useApp()
  const turma = s.turmas.find(t => t.codigo === f.turma)
  const prazo = prazoInfo(e.nome, turma)
  const sug = situacaoCalculada(e.nome, e.concluidaEm, turma)
  const outra = sug === 'No prazo' ? 'Com atraso' : 'No prazo'
  return (
    <span className="acoes">
      <span className="mut sm">{e.concluidaEm ? `Concluída em ${dataBR(e.concluidaEm)}` : 'Ainda não enviada (conta hoje)'} · prazo {dataBR(prazo.data)}{prazo.provisorio ? ' (provisório)' : ` (${prazo.regra})`}</span>
      <button className="mini ok" title="Situação calculada pela plataforma" onClick={() => adminValidarEntrega(f.id, e.nome, sug)}>Validar: {sug.toLowerCase()} +{pontosEntrega(e.nome, sug)}</button>
      <button className="mini" title="Ajuste manual da equipe" onClick={() => adminValidarEntrega(f.id, e.nome, outra)}>Ajustar: {outra.toLowerCase()} +{pontosEntrega(e.nome, outra)}</button>
      {e.status === 'em_validacao' && <button className="mini nao" onClick={() => adminDevolverEntrega(f.id, e.nome)}>Devolver</button>}
    </span>
  )
}

export function BotoesExtra({ f, x }) {
  const { adminDecidirExtra } = useApp()
  const cheio = limiteAtingido(f, x.acao)
  return (
    <span className="acoes">
      <button className="mini ok" disabled={cheio} title={cheio ? 'Limite desta ação já atingido' : ''} onClick={() => adminDecidirExtra(f.id, x.id, true)}>Aprovar +{extraDe(x.acao).pontos}</button>
      <button className="mini nao" onClick={() => adminDecidirExtra(f.id, x.id, false)}>Recusar</button>
      {cheio && <span className="mut sm">limite de {extraDe(x.acao).max} atingido</span>}
    </span>
  )
}

export default function Ficha() {
  const { s, adminIr, adminMarcar } = useApp()
  const [editando, setEditando] = useState(false)
  const f = s.franqueados.find(x => x.id === s.adminSel)
  const { atual, progresso, nivel } = resumo(f)
  const turma = s.turmas.find(t => t.codigo === f.turma)

  return (
    <>
      <button className="back" onClick={() => adminIr('admin')}>← Painel</button>
      <h1>{f.nome}{!f.ativo && <span className="mut"> · inativo</span>}</h1>
      <div className="mut">{f.franquia} · {f.email}{f.whatsapp && ` · ${f.whatsapp}`}{turma && ` · ${turma.nome}`}</div>
      <button className="lk" style={{ margin: '6px 0 0' }} onClick={() => setEditando(!editando)}>{editando ? 'Fechar edição' : 'Editar cadastro'}</button>
      {editando && <FormFranqueado inicial={f} onPronto={() => setEditando(false)} />}

      <div className="stats">
        <div className="card"><div className="big">{fmt(f.pontos)}</div><div className="mut">pontos · {NIVEIS[nivel].nome}</div></div>
        <div className="card"><div className="big">{progresso}%</div><div className="mut">da jornada</div></div>
        <div className="card"><div className="big">{atual + 1}</div><div className="mut">{f.etapas[atual].nome}</div></div>
      </div>

      <LancarPontos f={f} />

      <h2>Entregas da implantação</h2>
      <section className="card">
        {f.entregas.map(e => (
          <div className="row quebra" key={e.nome}>
            <span>{e.nome} <Chip c={STATUS_ENTREGA[e.status][0]}>{STATUS_ENTREGA[e.status][1]}{e.status === 'validada' && ` · ${e.situacao}`}</Chip>{e.status === 'validada' && e.calculada && e.calculada !== e.situacao && <span className="mut sm"> ajustado pela equipe (calculado: {e.calculada.toLowerCase()})</span>}</span>
            {e.status === 'validada'
              ? <span className="pl">+{pontosEntrega(e.nome, e.situacao)}</span>
              : <BotoesEntrega f={f} e={e} />}
          </div>
        ))}
      </section>

      <h2>Ações extras</h2>
      <section className="card">
        {f.extras.length === 0 && <p className="mut">Nenhuma ação extra registrada.</p>}
        {f.extras.map(x => (
          <div className="row quebra" key={x.id}>
            <span>{x.acao}<br /><span className="mut sm">{x.data} · {x.obs}</span></span>
            {x.status === 'pendente' ? <BotoesExtra f={f} x={x} /> : <Chip c={x.status === 'aprovado' ? 'cv' : 'cl'}>{x.status === 'aprovado' ? 'Aprovado' : 'Recusado'}</Chip>}
          </div>
        ))}
      </section>

      <h2>Atividades</h2>
      <p className="mut sm">Marcar uma atividade não lança pontos sozinho: use "Lançar pontos" quando a ação valer pontos.</p>
      {f.etapas.map((e, i) => {
        const feitas = e.atividades.filter(x => x[1] === 1).length
        return (
          <details key={e.nome} open={i === atual}>
            <summary>
              {e.emoji} {e.nome}{' '}
              <Chip c={feitas === e.atividades.length ? 'cv' : i === atual ? 'cp' : 'cl'}>{feitas}/{e.atividades.length}</Chip>
            </summary>
            {e.atividades.map(([nome, st], k) => (
              <label className="ck" key={nome}>
                <input type="checkbox" checked={st === 1} onChange={ev => adminMarcar(f.id, i, k, ev.target.checked)} />
                <span>{nome}{st === 2 && <span className="mut sm"> · em andamento</span>}</span>
              </label>
            ))}
          </details>
        )
      })}

      <h2>Extrato</h2>
      <section className="card">
        {f.extrato.length === 0 && <p className="mut">Nenhum lançamento ainda.</p>}
        {f.extrato.map((x, i) => (
          <div className="row" key={i}>
            <span>{x.texto}<br /><span className="mut sm">{x.data}</span></span>
            <span className={x.valor > 0 ? 'pl' : 'mn'}>{x.valor > 0 ? '+' : ''}{x.valor}</span>
          </div>
        ))}
      </section>
    </>
  )
}

import { useState } from 'react'
import { Chip } from '../../components/ui'
import { CONQUISTAS, fmt, NIVEIS } from '../../data'
import { dataBR, pontosEntrega, prazoInfo, useApp } from '../../state'
import { FormFranqueado, resumo } from './comum'

const STATUS_ENTREGA = { pendente: ['cl', 'Pendente'], validada: ['cv', 'Lançada'] }

export default function Ficha() {
  const { s, adminIr, adminMarcar, adminLancarPara, adminConquista, adminRedefinirSenha } = useApp()
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
      <button className="lk" style={{ margin: '6px 0 0 14px' }} onClick={() => window.confirm(`Redefinir a senha de ${f.nome}? No próximo acesso ele entra com a senha inicial e cria uma nova.`) && adminRedefinirSenha(f.email)}>🔑 Redefinir senha</button>
      {editando && <FormFranqueado inicial={f} onPronto={() => setEditando(false)} />}

      <div className="stats">
        <div className="card"><div className="big">{fmt(f.pontos)}</div><div className="mut">pontos · {NIVEIS[nivel].nome}</div></div>
        <div className="card"><div className="big">{progresso}%</div><div className="mut">da jornada</div></div>
        <div className="card"><div className="big">{atual + 1}</div><div className="mut">{f.etapas[atual].nome}</div></div>
      </div>

      {f.ativo && <button className="go" onClick={() => adminLancarPara(f.id)}>⭐ Lançar pontos para {f.nome.split(' ')[0]}</button>}

      <h2>Entregas da implantação</h2>
      <section className="card">
        {f.entregas.map(e => {
          const p = prazoInfo(e.nome, turma)
          return (
            <div className="row" key={e.nome}>
              <span>{e.nome} <Chip c={STATUS_ENTREGA[e.status][0]}>{STATUS_ENTREGA[e.status][1]}{e.status === 'validada' && ` · ${e.situacao.toLowerCase()}`}</Chip><br />
                <span className="mut sm">Prazo {dataBR(p.data)}{e.concluidaEm && ` · lançada em ${dataBR(e.concluidaEm)}`}</span></span>
              {e.status === 'validada' && <span className="pl">+{pontosEntrega(e.nome, e.situacao)}</span>}
            </div>
          )
        })}
      </section>

      <h2>🏅 Conquistas</h2>
      <section className="card">
        <p className="mut sm">Marque quando a pessoa conquistar. Ela recebe o aviso no sino 🔔 da plataforma.</p>
        <div className="cqs">
          {CONQUISTAS.map(q => {
            const tem = f.conquistas.includes(q.nome)
            return (
              <label className={`cq${tem ? ' on' : ''}`} key={q.nome} title={q.quando}>
                <input type="checkbox" checked={tem} onChange={ev => adminConquista(f.id, q.nome, ev.target.checked)} />
                <span className="cq-em">{q.emoji}</span>
                <span><b>{q.nome}</b><br /><span className="mut sm">{q.quando}</span></span>
              </label>
            )
          })}
        </div>
      </section>

      <h2>Pontos extras</h2>

      <section className="card">
        {f.extras.length === 0 && <p className="mut">Nenhum ponto extra lançado.</p>}
        {f.extras.map(x => (
          <div className="row" key={x.id}>
            <span>{x.acao}<br /><span className="mut sm">{x.data}</span></span>
            <Chip c="cv">Lançado</Chip>
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
            <span>{x.texto}<br /><span className="mut sm">{x.data}{x.aula && ` · ${x.aula}`}{x.tipo && ` · ${x.tipo}`}</span></span>
            <span className={x.valor > 0 ? 'pl' : 'mn'}>{x.valor > 0 ? '+' : ''}{x.valor}</span>
          </div>
        ))}
      </section>
    </>
  )
}

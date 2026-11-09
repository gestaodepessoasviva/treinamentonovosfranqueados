import { useState } from 'react'
import { Barra } from '../../components/ui'
import { ETAPAS, fmt, NIVEIS } from '../../data'
import { useApp } from '../../state'
import { pendenciasDe, resumo } from './comum'

export default function Painel() {
  const { s, adminAbrir, adminIr } = useApp()
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('progresso')
  const [turma, setTurma] = useState('')

  const lista = s.franqueados.filter(f => !turma || f.turma === turma).map(f => ({ ...f, ...resumo(f) }))
  const media = campo => (lista.length ? Math.round(lista.reduce((a, f) => a + f[campo], 0) / lista.length) : 0)
  const termo = busca.trim().toLowerCase()
  const visiveis = lista
    .filter(f => !termo || `${f.nome} ${f.franquia} ${f.email}`.toLowerCase().includes(termo))
    .sort((a, b) => (ordem === 'nome' ? a.nome.localeCompare(b.nome) : b[ordem] - a[ordem]))
  const pend = pendenciasDe(s.franqueados)
  const totalPend = pend.entregas.length + pend.extras.length

  return (
    <>
      <h1>Painel admin</h1>
      <p className="mut">Acompanhe a turma, marque atividades e ajuste pontos.</p>

      {totalPend > 0 && (
        <button className="card aviso" onClick={() => adminIr('adminValid')}>
          <b>⏳ {totalPend} {totalPend === 1 ? 'item aguarda' : 'itens aguardam'} sua validação</b>
          <span className="mut sm">{pend.entregas.length} entrega(s) · {pend.extras.length} ação(ões) extra(s) → abrir Validações</span>
        </button>
      )}

      <div className="filtros">
        <select value={turma} onChange={e => setTurma(e.target.value)} aria-label="Turma">
          <option value="">Todas as turmas</option>
          {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.codigo} · {t.nome}</option>)}
        </select>
      </div>
      <div className="stats">
        <div className="card"><div className="big">{lista.length}</div><div className="mut">franqueados</div></div>
        <div className="card"><div className="big">{media('progresso')}%</div><div className="mut">progresso médio</div></div>
        <div className="card"><div className="big">{fmt(media('pontos'))}</div><div className="mut">pontos em média</div></div>
      </div>

      <h2>Por etapa</h2>
      <section className="card">
        {ETAPAS.map((e, i) => {
          const qtd = lista.filter(f => f.atual === i).length
          return (
            <div className="row" key={e.nome}>
              <span>{e.emoji} {e.nome}</span>
              <b>{qtd} {qtd === 1 ? 'pessoa' : 'pessoas'}</b>
            </div>
          )
        })}
      </section>

      <h2>Franqueados</h2>
      <div className="filtros">
        <input type="search" placeholder="Buscar por nome, franquia ou e-mail" value={busca} onChange={e => setBusca(e.target.value)} aria-label="Buscar franqueado" />
        <select value={ordem} onChange={e => setOrdem(e.target.value)} aria-label="Ordenar por">
          <option value="progresso">Maior progresso</option>
          <option value="pontos">Mais pontos</option>
          <option value="nome">Nome</option>
        </select>
      </div>
      {visiveis.map(f => (
        <button key={f.id} className={`card fq ${f.ativo ? '' : 'inativo'}`} onClick={() => adminAbrir(f.id)}>
          <span className="fq-top">
            <span><b>{f.nome}</b>{!f.ativo && <span className="mut sm"> · inativo</span>}<br /><span className="mut sm">{f.franquia}</span></span>
            <span className="fq-pts"><b>{fmt(f.pontos)} pts</b><br /><span className="mut sm">{NIVEIS[f.nivel].nome}</span></span>
          </span>
          <Barra pct={f.progresso} />
          <span className="mut sm">{f.progresso}% da jornada · {ETAPAS[f.atual].emoji} {ETAPAS[f.atual].nome}</span>
        </button>
      ))}
      {visiveis.length === 0 && <p className="mut">Nenhum franqueado encontrado.</p>}
    </>
  )
}

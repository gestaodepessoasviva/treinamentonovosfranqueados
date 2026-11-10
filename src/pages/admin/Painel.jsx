import { useState } from 'react'
import { Barra } from '../../components/ui'
import { CONQUISTAS, ETAPAS, fmt, NIVEIS } from '../../data'
import { useApp } from '../../state'
import { resumo } from './comum'

export default function Painel() {
  const { s, adminAbrir } = useApp()
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('nome')
  const [turma, setTurma] = useState('')

  const lista = s.franqueados.filter(f => !turma || f.turma === turma).map(f => ({ ...f, ...resumo(f) }))
  const media = campo => (lista.length ? Math.round(lista.reduce((a, f) => a + f[campo], 0) / lista.length) : 0)
  const termo = busca.trim().toLowerCase()
  const visiveis = lista
    .filter(f => !termo || `${f.nome} ${f.franquia} ${f.email}`.toLowerCase().includes(termo))
    .sort((a, b) => (ordem === 'nome' ? a.nome.localeCompare(b.nome) : b[ordem] - a[ordem]))

  return (
    <>
      <h1>Painel admin</h1>
      <p className="mut">Acompanhe a turma, marque atividades e ajuste pontos.</p>

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

      <h2>Conquistas da turma</h2>
      <section className="card">
        <div className="cq-tot">
          {CONQUISTAS.map(q => {
            const qtd = lista.filter(f => f.conquistas.includes(q.nome)).length
            return (
              <div key={q.nome} title={q.quando}>
                <span className="cq-em">{q.emoji}</span>
                <span><b>{q.nome}</b><br /><span className="mut sm">{qtd} de {lista.length}</span></span>
              </div>
            )
          })}
        </div>
        <p className="mut sm">Para marcar uma conquista, abra a ficha da pessoa.</p>
      </section>

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
          <option value="nome">Ordem alfabética</option>
          <option value="progresso">Maior progresso</option>
          <option value="pontos">Mais pontos</option>
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
          {f.conquistas.length > 0 && <span className="cq-mini" title={f.conquistas.join(", ")}>{CONQUISTAS.filter(q => f.conquistas.includes(q.nome)).map(q => q.emoji).join(" ")}</span>}
        </button>
      ))}
      {visiveis.length === 0 && <p className="mut">Nenhum franqueado encontrado.</p>}
    </>
  )
}

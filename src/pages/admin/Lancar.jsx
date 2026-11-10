import { useEffect, useRef, useState } from 'react'
import { fmt } from '../../data'
import { ACOES, aulasOrdenadas, dataBR, nomeAula, useApp } from '../../state'

const TIPOS = [['Programado', '📘 Ponto programado'], ['Extra', '🚀 Ponto extra']]

// Escolha de um ou mais franqueados da turma: chips no campo + lista com caixas de marcar.
function EscolherFranqueados({ pessoas, ids, setIds }) {
  const [aberto, setAberto] = useState(false)
  const caixa = useRef(null)
  useEffect(() => {
    const fora = e => { if (caixa.current && !caixa.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])
  const todos = pessoas.length > 0 && pessoas.every(f => ids.includes(f.id))
  const alternar = id => setIds(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  const escolhidos = pessoas.filter(f => ids.includes(f.id))

  return (
    <div className="multi-wrap" ref={caixa}>
      <div className={`multi${aberto ? ' on' : ''}`} onClick={() => setAberto(true)}>
        {escolhidos.map(f => (
          <span className="chipx" key={f.id}>{f.nome}
            <button type="button" aria-label={`Tirar ${f.nome}`} onClick={e => { e.stopPropagation(); alternar(f.id) }}>×</button>
          </span>
        ))}
        <button type="button" className="add" aria-expanded={aberto} onClick={e => { e.stopPropagation(); setAberto(!aberto) }}>
          {escolhidos.length ? '+ adicionar' : 'Escolher franqueados'}
        </button>
      </div>
      {aberto && (
        <div className="drop" role="group" aria-label="Franqueados">
          <label className="opc"><input type="checkbox" checked={todos} onChange={() => setIds(todos ? [] : pessoas.map(f => f.id))} /><b>Todos da turma ({pessoas.length})</b></label>
          {pessoas.map(f => (
            <label className="opc" key={f.id}>
              <input type="checkbox" checked={ids.includes(f.id)} onChange={() => alternar(f.id)} />
              <span className="nm">{f.nome}</span><span className="mut sm">{f.franquia}</span>
            </label>
          ))}
          {pessoas.length === 0 && <p className="mut sm">Nenhum franqueado ativo nesta turma.</p>}
        </div>
      )}
    </div>
  )
}

export default function Lancar() {
  const { s, adminLancarPontos, adminDesfazer, adminAbrir, toast } = useApp()
  const [codigo, setCodigo] = useState(() => s.franqueados.find(f => f.id === s.adminPara)?.turma || s.turmas[0]?.codigo || '')
  const [ids, setIds] = useState(() => (s.adminPara ? [s.adminPara] : []))
  const [tipo, setTipo] = useState('Programado')
  const [chave, setChave] = useState(ACOES.Programado[0].chave)
  const [aulaId, setAulaId] = useState('')

  const turma = s.turmas.find(t => t.codigo === codigo)
  const pessoas = s.franqueados.filter(f => f.turma === codigo && f.ativo).sort((a, b) => a.nome.localeCompare(b.nome))
  const aulas = aulasOrdenadas(turma)
  const acao = ACOES[tipo].find(a => a.chave === chave) || ACOES[tipo][0]
  const qtd = ids.filter(id => pessoas.some(f => f.id === id)).length

  const mudarTurma = c => { setCodigo(c); setIds([]); setAulaId('') }
  const mudarTipo = t => { setTipo(t); setChave(ACOES[t][0].chave) }
  const lancar = async e => {
    e.preventDefault()
    const erro = await adminLancarPontos({ ids: ids.filter(id => pessoas.some(f => f.id === id)), tipo, chave: acao.chave, aulaId, codigoTurma: codigo })
    if (erro) toast(erro)
  }

  // Últimos lançamentos feitos pela equipe, de todos os franqueados.
  const ultimos = s.franqueados
    .flatMap(f => f.extrato.filter(x => x.equipe).map(x => ({ ...x, f })))
    .sort((a, b) => (b.id > a.id ? 1 : -1))
    .slice(0, 15)

  return (
    <>
      <h1>Lançar pontos</h1>
      <p className="mut">Os pontos entram no saldo na hora e o franqueado vê o aviso no sino 🔔 da plataforma.</p>

      <form className="card lanc" onSubmit={lancar}>
        <div className="lgrid">
          <label>Turma
            <select value={codigo} onChange={e => mudarTurma(e.target.value)}>
              {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.nome}</option>)}
            </select>
          </label>
          <div className="campo">
            <span className="rot" id="rot-tipo">Tipo de ponto</span>
            <div className="seg2" role="radiogroup" aria-labelledby="rot-tipo">
              {TIPOS.map(([k, nome]) => (
                <button type="button" key={k} role="radio" aria-checked={tipo === k} className={tipo === k ? 'on' : ''} onClick={() => mudarTipo(k)}>{nome}</button>
              ))}
            </div>
          </div>
          <div className="campo cheio">
            <span className="rot">Franqueados <span className="mut sm">(um ou mais)</span></span>
            <EscolherFranqueados pessoas={pessoas} ids={ids} setIds={setIds} />
          </div>
          <label>Ação
            <select value={acao.chave} onChange={e => setChave(e.target.value)}>
              {ACOES[tipo].map(a => <option key={a.chave} value={a.chave}>{a.texto} (+{a.valor})</option>)}
            </select>
          </label>
          <label>Vinculado à aula
            <select value={aulaId} onChange={e => setAulaId(e.target.value)}>
              <option value="">Não vincular a uma aula</option>
              {aulas.map(a => <option key={a.id} value={a.id}>{nomeAula(a)} · {dataBR(a.data).slice(0, 5)}</option>)}
            </select>
          </label>
        </div>
        <button className="go" type="submit" disabled={!qtd}>
          {qtd ? `Lançar +${fmt(acao.valor)} para ${qtd} ${qtd === 1 ? 'franqueado' : 'franqueados'}` : 'Escolha os franqueados'}
        </button>
        <p className="mut sm" style={{ marginTop: 10 }}>
          <b>Ponto programado:</b> aula ao vivo, avaliação da aula, disciplina do Academy, bônus de prazo, prova do período, projeto integrador e as 9 entregas (no prazo ou com atraso).<br />
          <b>Ponto extra:</b> trilhas da equipe, TNF, inauguração na data, primeiro fundo, caso real (máx. 3).<br />
          Quem já tem a entrega lançada ou chegou ao limite do extra é pulado automaticamente.
        </p>
      </form>

      <h2>Últimos lançamentos</h2>
      <section className="card">
        {ultimos.length === 0 && <p className="mut">Nenhum lançamento da equipe ainda.</p>}
        {ultimos.length > 0 && (
          <div className="tabela">
            <table>
              <thead><tr><th>Data</th><th>Franqueado</th><th>Lançamento</th><th>Aula</th><th>Tipo</th><th>Pontos</th><th /></tr></thead>
              <tbody>
                {ultimos.map(x => (
                  <tr key={x.id}>
                    <td>{x.data}</td>
                    <td><button className="lk inline" onClick={() => adminAbrir(x.f.id)}>{x.f.nome}</button></td>
                    <td>{x.texto}</td>
                    <td className="mut">{x.aula ? x.aula.replace('Aula ao vivo ', '') : '—'}</td>
                    <td><span className={`chip ${x.tipo === 'Extra' ? 'ce' : 'cr'}`}>{x.tipo === 'Extra' ? 'Extra' : 'Programado'}</span></td>
                    <td><b>{x.valor > 0 ? '+' : ''}{x.valor}</b></td>
                    <td><button className="mini nao" onClick={() => adminDesfazer(x.f.id, x.id)}>Desfazer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

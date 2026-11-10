import { useState } from 'react'
import Icone, { chaveIcone, ICONES } from '../../components/Icone'
import { fmt } from '../../data'
import { useApp } from '../../state'

const VAZIO = { emoji: 'presente', nome: '', descricao: '', custo: '', estoque: '' }

function FormBeneficio({ inicial, onPronto }) {
  const { adminSalvarBeneficio, toast } = useApp()
  const [b, setB] = useState(inicial ? { emoji: chaveIcone(inicial.emoji), nome: inicial.nome, descricao: inicial.descricao || '', custo: inicial.custo, estoque: inicial.estoque } : VAZIO)
  const campo = k => e => setB({ ...b, [k]: e.target.value })
  const salvar = async e => {
    e.preventDefault()
    const erro = await adminSalvarBeneficio(b, inicial?.id)
    if (erro) return toast(erro)
    if (!inicial) setB(VAZIO)
    onPronto?.()
  }
  return (
    <form className="card" onSubmit={salvar}>
      <b>{inicial ? '✏️ Editar benefício' : '➕ Novo benefício'}</b>
      <div className="form2">
        <label>Nome<input value={b.nome} onChange={campo('nome')} placeholder="ex.: Kit VIVA" /></label>
        <label>Descrição<input value={b.descricao} onChange={campo('descricao')} placeholder="ex.: camiseta, caneca e caderno" /></label>
        <label>Custo em pontos<input type="number" min="1" step="1" value={b.custo} onChange={campo('custo')} /></label>
        <label>{inicial ? 'Estoque' : 'Estoque inicial'}<input type="number" min="0" step="1" value={b.estoque} onChange={campo('estoque')} /></label>
      </div>
      <div className="mut sm" style={{ marginTop: 10 }}>Ícone: <b>{ICONES[b.emoji].nome}</b></div>
      <div className="ic-esc" role="radiogroup" aria-label="Ícone do benefício">
        {Object.entries(ICONES).map(([k, ic]) => (
          <button type="button" key={k} role="radio" aria-checked={b.emoji === k} title={ic.nome} className={b.emoji === k ? 'on' : ''} onClick={() => setB({ ...b, emoji: k })}><Icone nome={k} tamanho={24} /></button>
        ))}
      </div>
      <button className="go" type="submit">{inicial ? 'Salvar' : 'Cadastrar benefício'}</button>
    </form>
  )
}

export default function Beneficios() {
  const { s, adminAjustarEstoque, adminAlternarBeneficio } = useApp()
  const [editando, setEditando] = useState(null)
  const nomeDe = id => s.franqueados.find(f => f.id === id)?.nome ?? '—'

  return (
    <>
      <h1>Benefícios e estoque</h1>
      <p className="mut">A troca é automática: quando o franqueado troca, os pontos saem do saldo e o estoque baixa na hora.</p>

      <h2>Catálogo</h2>
      {s.beneficios.length === 0 && <p className="mut">Nenhum benefício cadastrado. Os franqueados veem "Catálogo em breve".</p>}
      {s.beneficios.map(b => (
        <section key={b.id} className={`card ${b.ativo ? '' : 'inativo'}`}>
          <div className="row quebra">
            <span><span className="em" style={{ color: 'var(--teal)', verticalAlign: 'middle' }}><Icone nome={b.emoji} tamanho={24} /></span> <b>{b.nome}</b>{!b.ativo && <span className="mut sm"> · fora do catálogo</span>}<br />
              <span className="mut sm">{fmt(b.custo)} pontos{b.descricao && ` · ${b.descricao}`}</span></span>
            <span className="acoes">
              <button className="mini" onClick={() => adminAjustarEstoque(b.id, -1)} aria-label="Tirar 1 do estoque">−</button>
              <b className={b.estoque === 0 ? 'mn' : ''}>{b.estoque} em estoque</b>
              <button className="mini" onClick={() => adminAjustarEstoque(b.id, 1)} aria-label="Pôr 1 no estoque">+</button>
              <button className="mini" onClick={() => adminAjustarEstoque(b.id, 10)}>+10</button>
            </span>
          </div>
          <span className="acoes">
            <button className="lk inline" onClick={() => setEditando(editando === b.id ? null : b.id)}>{editando === b.id ? 'Fechar edição' : 'Editar'}</button>
            <button className="lk inline" onClick={() => adminAlternarBeneficio(b.id)}>{b.ativo ? 'Tirar do catálogo' : 'Voltar ao catálogo'}</button>
          </span>
          {editando === b.id && <FormBeneficio inicial={b} onPronto={() => setEditando(null)} />}
        </section>
      ))}
      <FormBeneficio />

      <h2>Trocas realizadas ({s.trocas.length})</h2>
      <section className="card">
        {s.trocas.length === 0 && <p className="mut">Nenhuma troca ainda.</p>}
        {s.trocas.map(t => (
          <div className="row" key={t.id}>
            <span>{t.beneficio}<br /><span className="mut sm">{t.data} · {nomeDe(t.franqueado)}</span></span>
            <span className="mn">−{fmt(t.custo)}</span>
          </div>
        ))}
      </section>
    </>
  )
}

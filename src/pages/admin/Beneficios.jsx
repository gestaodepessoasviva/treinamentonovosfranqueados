import { useRef, useState } from 'react'
import { prepararImagem } from '../../components/Avatar'
import Confirmar from '../../components/Confirmar'
import Icone, { chaveIcone, ICONES } from '../../components/Icone'
import { fmt } from '../../data'
import { useApp } from '../../state'

const VAZIO = { emoji: 'presente', foto: '', nome: '', descricao: '', custo: '', estoque: '' }

function FormBeneficio({ inicial, onPronto }) {
  const { adminSalvarBeneficio, toast } = useApp()
  const [b, setB] = useState(inicial ? { emoji: chaveIcone(inicial.emoji), foto: inicial.foto || '', nome: inicial.nome, descricao: inicial.descricao || '', custo: inicial.custo, estoque: inicial.estoque } : VAZIO)
  const campo = k => e => setB({ ...b, [k]: e.target.value })
  const [modo, setModo] = useState(inicial?.foto ? 'foto' : 'icone')
  const arquivo = useRef(null)
  const escolherFoto = async e => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try { setB(x => ({ ...x, foto: '' })); const foto = await prepararImagem(f, 16 / 9, 480); setB(x => ({ ...x, foto })) } catch (err) { toast(err.message) }
  }
  const salvar = async e => {
    e.preventDefault()
    if (modo === 'foto' && !b.foto) return toast('Escolha uma foto ou volte para "Ícone".')
    const erro = await adminSalvarBeneficio({ ...b, foto: modo === 'foto' ? b.foto : '' }, inicial?.id)
    if (erro) return toast(erro)
    if (!inicial) { setB(VAZIO); setModo('icone') }
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
      <div className="mut sm" style={{ marginTop: 10 }}>Imagem do benefício na vitrine</div>
      <div className="seg2 bn-modo" role="radiogroup" aria-label="Imagem do benefício">
        <button type="button" role="radio" aria-checked={modo === 'icone'} className={modo === 'icone' ? 'on' : ''} onClick={() => setModo('icone')}>Ícone</button>
        <button type="button" role="radio" aria-checked={modo === 'foto'} className={modo === 'foto' ? 'on' : ''} onClick={() => setModo('foto')}>Foto</button>
      </div>
      {modo === 'icone' && <>
        <div className="mut sm" style={{ marginTop: 8 }}>Ícone: <b>{ICONES[b.emoji].nome}</b></div>
        <div className="ic-esc" role="radiogroup" aria-label="Ícone do benefício">
          {Object.entries(ICONES).map(([k, ic]) => (
            <button type="button" key={k} role="radio" aria-checked={b.emoji === k} title={ic.nome} className={b.emoji === k ? 'on' : ''} onClick={() => setB({ ...b, emoji: k })}><Icone nome={k} tamanho={24} /></button>
          ))}
        </div>
      </>}
      {modo === 'foto' && (
        <div className="bn-foto-esc">
          <div className="bn-foto-prev" onClick={() => arquivo.current?.click()}>
            {b.foto ? <img src={b.foto} alt="" /> : <span className="mut sm">Clique para escolher uma foto</span>}
          </div>
          <div className="acoes">
            <button type="button" className="lk inline" onClick={() => arquivo.current?.click()}>{b.foto ? 'Trocar foto' : 'Escolher foto'}</button>
            {b.foto && <button type="button" className="lk inline perigo" onClick={() => setB({ ...b, foto: '' })}>Remover</button>}
          </div>
          <div className="mut sm">JPG ou PNG. A foto é recortada no formato da vitrine (retângulo) e reduzida automaticamente.</div>
          <input ref={arquivo} type="file" accept="image/*" style={{ display: 'none' }} onChange={escolherFoto} />
        </div>
      )}
      <button className="go" type="submit">{inicial ? 'Salvar' : 'Cadastrar benefício'}</button>
    </form>
  )
}

export default function Beneficios() {
  const { s, adminAjustarEstoque, adminAlternarBeneficio, adminExcluirBeneficio, adminCancelarTroca } = useApp()
  const [excluir, setExcluir] = useState(null)
  const [cancelar, setCancelar] = useState(null)
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
            <span>{b.foto ? <img className="bn-mini" src={b.foto} alt="" /> : <span className="em" style={{ color: 'var(--teal)', verticalAlign: 'middle' }}><Icone nome={b.emoji} tamanho={24} /></span>} <b>{b.nome}</b>{!b.ativo && <span className="mut sm"> · fora do catálogo</span>}<br />
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
            <button className="lk inline perigo" onClick={() => setExcluir(b)}>Excluir</button>
          </span>
          {editando === b.id && <FormBeneficio inicial={b} onPronto={() => setEditando(null)} />}
        </section>
      ))}
      <FormBeneficio />
      {excluir && (
        <Confirmar titulo="Tem certeza que deseja excluir?" onNao={() => setExcluir(null)} onSim={() => { const id = excluir.id; setExcluir(null); adminExcluirBeneficio(id) }}>
          <p>O benefício <b>{excluir.nome}</b> sai do catálogo e da lista do admin.</p>
          <p>As trocas que já foram feitas continuam no histórico. Se a ideia é só pausar, use <b>Tirar do catálogo</b>.</p>
        </Confirmar>
      )}

      <h2>Trocas realizadas ({s.trocas.length})</h2>
      <section className="card">
        {s.trocas.length === 0 && <p className="mut">Nenhuma troca ainda.</p>}
        {s.trocas.map(t => (
          <div className="row" key={t.id}>
            <span>{t.beneficio}<br /><span className="mut sm">{t.data} · {nomeDe(t.franqueado)}</span></span>
            <span className="acoes"><span className="mn">−{fmt(t.custo)}</span><button className="lk inline perigo" onClick={() => setCancelar(t)}>Cancelar troca</button></span>
          </div>
        ))}
      </section>
      {cancelar && (
        <Confirmar titulo="Tem certeza que deseja cancelar esta troca?" sim="Sim, cancelar troca" onNao={() => setCancelar(null)} onSim={() => { const t = cancelar; setCancelar(null); adminCancelarTroca(t) }}>
          <p><b>{cancelar.beneficio}</b>, trocado por <b>{nomeDe(cancelar.franqueado)}</b> em {cancelar.data}.</p>
          <p>Os <b>{fmt(cancelar.custo)} pontos</b> voltam para o saldo da pessoa e o benefício volta para o estoque.</p>
        </Confirmar>
      )}
    </>
  )
}

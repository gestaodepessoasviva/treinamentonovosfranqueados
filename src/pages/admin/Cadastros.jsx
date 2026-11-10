import { useState } from 'react'
import { useApp } from '../../state'
import { FormFranqueado } from './comum'

const dataBR = iso => (iso ? iso.split('-').reverse().join('/') : '—')

function NovaTurma() {
  const { adminSalvarTurma, toast } = useApp()
  const vazio = { codigo: '', nome: '', cronograma: '', inicio: '', fim: '' }
  const [t, setT] = useState(vazio)
  const campo = k => e => setT({ ...t, [k]: e.target.value })
  const salvar = async e => {
    e.preventDefault()
    const erro = await adminSalvarTurma(t)
    if (erro) return toast(erro)
    setT(vazio)
  }
  return (
    <form className="card" onSubmit={salvar}>
      <b>➕ Nova turma</b>
      <div className="form2">
        <label>Código<input value={t.codigo} onChange={campo('codigo')} placeholder="ex.: T2027-05" /></label>
        <label>Nome<input value={t.nome} onChange={campo('nome')} placeholder="ex.: Turma Maio 2027" /></label>
        <label>Cronograma (cidade)<input value={t.cronograma} onChange={campo('cronograma')} placeholder="ex.: São Luís – MA" /></label>
        <span />
        <label>Início<input type="date" value={t.inicio} onChange={campo('inicio')} /></label>
        <label>Fim<input type="date" value={t.fim} onChange={campo('fim')} /></label>
      </div>
      <button className="go" type="submit">Cadastrar turma</button>
    </form>
  )
}

export default function Cadastros() {
  const { s, adminAbrir } = useApp()
  return (
    <>
      <h1>Franqueados e turmas</h1>

      <h2>Turmas</h2>
      <section className="card">
        {s.turmas.map(t => {
          const qtd = s.franqueados.filter(f => f.turma === t.codigo).length
          return (
            <div className="row" key={t.codigo}>
              <span><b>{t.nome}</b> <span className="mut sm">· {t.codigo}</span><br /><span className="mut sm">{dataBR(t.inicio)} a {dataBR(t.fim)}{t.cronograma && ` · cronograma ${t.cronograma}`}</span></span>
              <b>{qtd} {qtd === 1 ? 'pessoa' : 'pessoas'}</b>
            </div>
          )
        })}
      </section>
      <NovaTurma />

      <h2>Franqueados</h2>
      <FormFranqueado />
      <section className="card">
        {s.franqueados.map(f => (
          <div className="row" key={f.id}>
            <span><button className="lk inline" onClick={() => adminAbrir(f.id)}>{f.nome}</button>{!f.ativo && <span className="mut sm"> · inativo</span>}<br /><span className="mut sm">{f.email} · {f.franquia}{f.whatsapp && ` · ${f.whatsapp}`}</span></span>
            <span className="mut sm">{f.turma}</span>
          </div>
        ))}
      </section>
      <p className="mut sm">Para editar ou desativar alguém, abra a ficha da pessoa e clique em "Editar cadastro". Desativar mantém o histórico.</p>
    </>
  )
}

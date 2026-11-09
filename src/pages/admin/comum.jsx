import { useState } from 'react'
import { atualDe, nivelDe, progressoDe, useApp } from '../../state'

export const resumo = f => ({ atual: atualDe(f.etapas), progresso: progressoDe(f.etapas), nivel: nivelDe(f.pontos) })

export const pendenciasDe = franqueados => ({
  entregas: franqueados.flatMap(f => f.entregas.filter(e => e.status === 'em_validacao').map(e => ({ f, e }))),
  extras: franqueados.flatMap(f => f.extras.filter(x => x.status === 'pendente').map(x => ({ f, x }))),
})

const VAZIO = { nome: '', email: '', franquia: '', whatsapp: '', turma: '', ativo: true }

// Formulário de cadastro/edição de franqueado. `inicial` presente = edição.
export function FormFranqueado({ inicial, onPronto }) {
  const { s, adminSalvarFranqueado, toast } = useApp()
  const [d, setD] = useState(() => ({ ...VAZIO, turma: s.turmas[0]?.codigo ?? '', ...(inicial ? { nome: inicial.nome, email: inicial.email, franquia: inicial.franquia, whatsapp: inicial.whatsapp, turma: inicial.turma, ativo: inicial.ativo } : {}) }))
  const campo = k => e => setD({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const salvar = e => {
    e.preventDefault()
    const erro = adminSalvarFranqueado(d, inicial?.id)
    if (erro) return toast(erro)
    if (!inicial) setD({ ...VAZIO, turma: d.turma })
    onPronto?.()
  }

  return (
    <form className="card" onSubmit={salvar}>
      <b>{inicial ? '✏️ Editar cadastro' : '➕ Novo franqueado'}</b>
      <div className="form2">
        <label>Nome completo<input value={d.nome} onChange={campo('nome')} /></label>
        <label>E-mail (login)<input type="email" value={d.email} onChange={campo('email')} /></label>
        <label>Unidade (franquia)<input value={d.franquia} onChange={campo('franquia')} placeholder="ex.: VIVA São Luís" /></label>
        <label>WhatsApp<input value={d.whatsapp} onChange={campo('whatsapp')} placeholder="(98) 99999-0000" /></label>
        <label>Turma
          <select value={d.turma} onChange={campo('turma')}>
            {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.codigo} · {t.nome}</option>)}
          </select>
        </label>
        <label className="ck sozinho"><input type="checkbox" checked={d.ativo} onChange={campo('ativo')} /> Ativo (pode acessar a plataforma)</label>
      </div>
      <button className="go" type="submit">{inicial ? 'Salvar alterações' : 'Cadastrar'}</button>
    </form>
  )
}

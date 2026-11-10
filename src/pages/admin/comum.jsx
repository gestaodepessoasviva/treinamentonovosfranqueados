import { useState } from 'react'
import { atualDe, foneBR, nivelDe, progressoDe, useApp } from '../../state'

export const resumo = f => ({ atual: atualDe(f.etapas), progresso: progressoDe(f.etapas), nivel: nivelDe(f.pontos) })

const VAZIO = { nome: '', email: '', franquia: '', uf: '', whatsapp: '', turma: '', ativo: true, loginMoodle: '', nomeAcademy: '' }

// Formulário de cadastro/edição de franqueado. `inicial` presente = edição.
export function FormFranqueado({ inicial, onPronto }) {
  const { s, adminSalvarFranqueado, toast } = useApp()
  const [d, setD] = useState(() => ({ ...VAZIO, turma: s.turmas[0]?.codigo ?? '', ...(inicial ? { nome: inicial.nome, email: inicial.email, franquia: inicial.franquia, uf: inicial.uf || '', whatsapp: inicial.whatsapp, turma: inicial.turma, ativo: inicial.ativo, loginMoodle: inicial.loginMoodle || '', nomeAcademy: inicial.nomeAcademy || '' } : {}) }))
  const campo = k => e => setD({ ...d, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const salvar = async e => {
    e.preventDefault()
    const erro = await adminSalvarFranqueado(d, inicial?.id)
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
        <label>Cidade (franquia)<input value={d.franquia} onChange={campo('franquia')} placeholder="ex.: São Luís" /></label>
        <label>UF<input value={d.uf} onChange={campo('uf')} maxLength={2} placeholder="MA" /></label>
        <label>WhatsApp<input type="tel" value={d.whatsapp} onChange={campo("whatsapp")} onBlur={() => setD(v => ({ ...v, whatsapp: foneBR(v.whatsapp) }))} placeholder="(98) 999990000" /></label>
        <label>Turma
          <select value={d.turma} onChange={campo('turma')}>
            {s.turmas.map(t => <option key={t.codigo} value={t.codigo}>{t.codigo} · {t.nome}</option>)}
          </select>
        </label>
        <label>Login do Moodle<input value={d.loginMoodle} onChange={campo('loginMoodle')} placeholder="em branco = o e-mail" /></label>
        <label>Nome no Academy<input value={d.nomeAcademy} onChange={campo('nomeAcademy')} placeholder="só se for diferente do nome completo" /></label>
        <label className="ck sozinho"><input type="checkbox" checked={d.ativo} onChange={campo('ativo')} /> Ativo (pode acessar a plataforma)</label>
      </div>
      <button className="go" type="submit">{inicial ? 'Salvar alterações' : 'Cadastrar'}</button>
    </form>
  )
}

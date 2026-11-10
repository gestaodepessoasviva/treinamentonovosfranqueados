import { useRef } from 'react'
import Avatar, { prepararFoto } from '../components/Avatar'
import { CONQUISTAS, fmt, NIVEIS } from '../data'
import { useApp } from '../state'

export default function Perfil() {
  const { s, nivel, conquistadas, sair, salvarFoto, toast } = useApp()
  const entrada = useRef(null)

  const escolher = async e => {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    try { salvarFoto(await prepararFoto(arquivo)) } catch (err) { toast(err.message) }
  }

  return (
    <section className="card pf">
      <button className="pf-foto" onClick={() => entrada.current?.click()} disabled={s.ocupado} aria-label="Trocar foto de perfil">
        <Avatar nome={s.nome} foto={s.foto} />
        <span className="pf-cam" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
        </span>
      </button>
      <input ref={entrada} type="file" accept="image/*" style={{ display: 'none' }} onChange={escolher} />
      <div className="pf-acoes">
        <button className="lk inline" onClick={() => entrada.current?.click()} disabled={s.ocupado}>{s.foto ? 'Trocar foto' : 'Adicionar foto'}</button>
        {s.foto && <button className="lk inline" onClick={() => salvarFoto('')} disabled={s.ocupado}>Remover</button>}
      </div>
      <h1>{s.nome}</h1>
      <div className="mut">{s.franquia}</div>
      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card"><b>Nível {nivel + 1}</b><div className="mut">{NIVEIS[nivel].nome}</div></div>
        <div className="card"><b>{fmt(s.pontos)}</b><div className="mut">pontos</div></div>
        <div className="card"><b>{conquistadas} de {CONQUISTAS.length}</b><div className="mut">conquistas</div></div>
        <div className="card"><b>Etapa {s.atual + 1}</b><div className="mut">{s.etapas[s.atual].nome}</div></div>
      </div>
      <button className="go w" onClick={sair}>Sair</button>
    </section>
  )
}

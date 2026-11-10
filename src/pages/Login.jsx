import logo from '../assets/logo-viva-branco.png'
import { useState } from 'react'
import { useApp } from '../state'

// Fundo e logo comuns às telas de entrada.
function Moldura({ children }) {
  return (
    <main>
      <div className="lgbg" aria-hidden="true" />
      <div className="login">
        <div className="wrap">
          <img className="marca" src={logo} alt="VIVA eventos" />
          {children}
        </div>
      </div>
    </main>
  )
}

export default function Login() {
  const { s, entrar, toast, demo } = useApp()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(true)

  const enviar = e => {
    e.preventDefault()
    if (!demo && (!usuario.trim() || !senha)) return toast('Informe e-mail e senha.')
    entrar(usuario, senha, lembrar)
  }

  return (
    <Moldura>
      <form className="card" onSubmit={enviar}>
        <h1>Jornada de Novos Franqueados</h1>
        <label>E-mail<input type="email" autoComplete="username" placeholder="voce@email.com" value={usuario} onChange={e => setUsuario(e.target.value)} /></label>
        <label>Senha<input type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} /></label>
        {!demo && <p className="mut sm" style={{ margin: '6px 0 0' }}>No primeiro acesso, use a senha inicial que a equipe enviou. Em seguida você cria a sua.</p>}
        {!demo && <label className="ck lembrar"><input type="checkbox" checked={lembrar} onChange={e => setLembrar(e.target.checked)} /> Lembrar de mim por 30 dias</label>}
        <button className="go w" type="submit" disabled={s.ocupado}>{s.ocupado ? 'Entrando…' : 'Entrar'}</button>
        <button className="lk" type="button" onClick={() => toast('Fale com a equipe de T&D: ela redefine sua senha e você cria uma nova no próximo acesso.')}>Esqueci minha senha</button>
      </form>
    </Moldura>
  )
}

// Primeiro acesso do franqueado: troca a senha inicial pela dele.
export function CriarSenha() {
  const { s, criarMinhaSenha, sair, toast } = useApp()
  const [nova, setNova] = useState('')
  const [repete, setRepete] = useState('')

  const enviar = async e => {
    e.preventDefault()
    if (nova.length < 8) return toast('A senha precisa ter pelo menos 8 caracteres.')
    if (nova !== repete) return toast('As duas senhas não são iguais.')
    const erro = await criarMinhaSenha(nova)
    if (erro) toast(erro)
  }

  return (
    <Moldura>
      <form className="card" onSubmit={enviar}>
        <h1>Crie sua senha</h1>
        <p className="mut sub">É o seu primeiro acesso. Escolha uma senha só sua para entrar nas próximas vezes.</p>
        <label>Nova senha<input type="password" autoComplete="new-password" value={nova} onChange={e => setNova(e.target.value)} /></label>
        <label>Repita a nova senha<input type="password" autoComplete="new-password" value={repete} onChange={e => setRepete(e.target.value)} /></label>
        <p className="mut sm" style={{ margin: '6px 0 0' }}>Mínimo de 8 caracteres, diferente da senha inicial.</p>
        <button className="go w" type="submit" disabled={s.ocupado}>{s.ocupado ? 'Salvando…' : 'Salvar e entrar'}</button>
        <button className="lk" type="button" onClick={sair}>Sair</button>
      </form>
    </Moldura>
  )
}

import logo from '../assets/logo-viva-branco.png'
import { useState } from 'react'
import { useApp } from '../state'

export default function Login() {
  const { entrar, toast } = useApp()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const enviar = e => {
    e.preventDefault()
    entrar(email, senha)
  }

  return (
    <main>
      <div className="lgbg" aria-hidden="true" />
      <div className="login">
        <div className="wrap">
        <img className="marca" src={logo} alt="VIVA eventos" />
        <form className="card" onSubmit={enviar}>
          <h1>Jornada de Novos Franqueados</h1>
          <p className="mut sub">Capacitação de Novos Franqueados VIVA</p>
          <label>E-mail<input type="email" autoComplete="username" placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} /></label>
          <button className="go w" type="submit">Entrar</button>
          <button className="lk" type="button" onClick={() => toast('Na versão final: link de recuperação por e-mail')}>Esqueci minha senha</button>
          <p className="mut sm">Protótipo: qualquer e-mail e senha entram como franqueado.</p>
        </form>
        </div>
      </div>
    </main>
  )
}

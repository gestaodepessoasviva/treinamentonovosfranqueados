import { useApp } from '../state'

export default function Login() {
  const { entrar, toast } = useApp()
  return (
    <main>
      <div className="login">
        <section className="card">
          <h1>VIVA Academy</h1>
          <p className="mut">Sua jornada de novo franqueado</p>
          <label>E-mail<input type="email" autoComplete="username" placeholder="voce@email.com" /></label>
          <label>Senha<input type="password" autoComplete="current-password" /></label>
          <button className="go w" onClick={entrar}>Entrar</button>
          <button className="lk" onClick={() => toast('Na versão final: link de recuperação por e-mail')}>Esqueci minha senha</button>
          <p className="mut sm">Protótipo: qualquer e-mail e senha entram.</p>
        </section>
      </div>
    </main>
  )
}

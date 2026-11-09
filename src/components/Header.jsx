import logo from '../assets/logo-viva-branco.png'
import { MENU } from '../data'
import { useApp } from '../state'

export default function Header() {
  const { s, go, toggleMenu, sair } = useApp()
  const iniciais = s.nome.split(' ').map(x => x[0]).join('')

  return (
    <>
      <header className="top">
        <button className="ib" onClick={toggleMenu} aria-label="Abrir menu">☰</button>
        <div className="tt"><img src={logo} alt="VIVA eventos" /><span>Jornada de Novos<br />Franqueados</span></div>
        <button className="ib" onClick={() => go('notif')} aria-label="Notificações">
          🔔{s.naoLidas > 0 && <i className="dot">{s.naoLidas}</i>}
        </button>
        <button className="av" onClick={() => go('perfil')} aria-label="Meu perfil">{iniciais}</button>
      </header>
      <div className={`ov ${s.menu ? 'on' : ''}`} onClick={toggleMenu} />
      <nav className={`dr ${s.menu ? 'on' : ''}`} aria-label="Menu">
        <h3>Menu</h3>
        {MENU.map(m => (
          <button key={m.id} className={`mi ${s.tela === m.id ? 'on' : ''}`} onClick={() => go(m.id)}>
            <span>{m.emoji}</span>{m.nome}
          </button>
        ))}
        <button className="mi out" onClick={sair}><span>🚪</span>Sair</button>
      </nav>
    </>
  )
}

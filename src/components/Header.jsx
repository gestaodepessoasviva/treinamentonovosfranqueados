import logo from '../assets/logo-viva-branco.png'
import Avatar from './Avatar'
import Icone from './Icone'
import { MENU } from '../data'
import { useApp } from '../state'

export default function Header() {
  const { s, go, toggleMenu, sair } = useApp()

  return (
    <>
      <header className="top">
        <button className="ib so-cel" onClick={toggleMenu} aria-label="Abrir menu"><Icone nome="menu" tamanho={22} traco={1.9} /></button>
        <div className="tt"><img src={logo} alt="VIVA eventos" /><span>Jornada de Novos<br />Franqueados</span></div>
        <button className="ib" onClick={() => go('notif')} aria-label="Notificações">
          <Icone nome="sino" tamanho={21} traco={1.9} />{s.naoLidas > 0 && <i className="dot">{s.naoLidas}</i>}
        </button>
        <button className="av-bt" onClick={() => go('perfil')} aria-label="Meu perfil"><Avatar nome={s.nome} foto={s.foto} /></button>
      </header>
      <div className={`ov ${s.menu ? 'on' : ''}`} onClick={toggleMenu} />
      <nav className={`dr ${s.menu ? 'on' : ''}`} aria-label="Menu">
        <h3>Menu</h3>
        {MENU.map(m => (
          <button key={m.id} className={`mi ${s.tela === m.id ? 'on' : ''}`} onClick={() => go(m.id)}>
            <Icone nome={m.icone} tamanho={20} traco={1.8} />{m.nome}
          </button>
        ))}
        <button className="mi out" onClick={sair}><Icone nome="sair" tamanho={20} traco={1.8} />Sair</button>
      </nav>
    </>
  )
}

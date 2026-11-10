import logo from './assets/logo-viva-branco.png'
import Header from './components/Header'
import PaginaNav from './components/PaginaNav'
import Toast from './components/Toast'
import AdminBeneficios from './pages/admin/Beneficios'
import Calendario from './pages/admin/Calendario'
import Cadastros from './pages/admin/Cadastros'
import Exportar from './pages/admin/Exportar'
import Ficha from './pages/admin/Ficha'
import Painel from './pages/admin/Painel'
import Lancar from './pages/admin/Lancar'
import Beneficios from './pages/Beneficios'
import CalendarioTurma from './pages/Calendario'
import Conquistas from './pages/Conquistas'
import Guia from './pages/Guia'
import Inicio from './pages/Inicio'
import Jornada from './pages/Jornada'
import Login, { CriarSenha } from './pages/Login'
import Notificacoes from './pages/Notificacoes'
import Perfil from './pages/Perfil'
import Pontos from './pages/Pontos'
import { useApp } from './state'

const TELAS = { inicio: Inicio, jornada: Jornada, pontos: Pontos, benef: Beneficios, conq: Conquistas, notif: Notificacoes, guia: Guia, calendario: CalendarioTurma, perfil: Perfil }
const TELAS_ADMIN = { admin: Painel, adminFranq: Ficha, adminLancar: Lancar, adminCad: Cadastros, adminCal: Calendario, adminBenef: AdminBeneficios, adminExp: Exportar }
const ABAS_ADMIN = [['admin', '📊 Painel'], ['adminLancar', '⭐ Lançar pontos'], ['adminCad', '👥 Cadastros'], ['adminCal', '📅 Calendário'], ['adminBenef', '🎁 Benefícios'], ['adminExp', '⬇️ Exportar']]

function Admin() {
  const { s, sair, adminIr } = useApp()
  const Tela = TELAS_ADMIN[s.tela] ?? Painel
  const ativa = s.tela === 'adminFranq' ? 'admin' : s.tela
  return (
    <>
      <header className="top adm-top">
        <div className="tt"><img src={logo} alt="VIVA eventos" /><span>Jornada de Novos<br />Franqueados · Admin</span></div>
        <button className="sair" onClick={sair}>Sair</button>
      </header>
      <main className="adm">
        <nav className="abas" aria-label="Seções do painel">
          {ABAS_ADMIN.map(([id, nome]) => (
            <button key={id} className={ativa === id ? 'on' : ''} onClick={() => adminIr(id)}>
              {nome}
            </button>
          ))}
        </nav>
        <Tela />
      </main>
    </>
  )
}

export default function App() {
  const { s, go } = useApp()
  const Tela = TELAS[s.tela]

  if (s.carregando) return <div className="carregando"><div className="gira" />Carregando seus dados…</div>
  const ocupado = s.ocupado && s.sessao ? <div className="ocupado" role="status"><div className="gira" />Salvando na planilha…</div> : null
  if (s.criarSenha) return <><CriarSenha /><Toast /></>
  if (!s.sessao) return <><Login /><Toast /></>
  if (s.sessao === 'admin') return <><Admin />{ocupado}<Toast /></>

  return (
    <>
      <Header />
      <main className="com-lado">
        {s.tela !== 'inicio' && <button className="back so-cel" onClick={() => go('inicio')}>← Início</button>}
        <Tela />
        <PaginaNav />
      </main>
      {ocupado}
      <Toast />
    </>
  )
}

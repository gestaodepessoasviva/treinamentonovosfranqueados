import Header from './components/Header'
import Toast from './components/Toast'
import Beneficios from './pages/Beneficios'
import Conquistas from './pages/Conquistas'
import Guia from './pages/Guia'
import Inicio from './pages/Inicio'
import Jornada from './pages/Jornada'
import Login from './pages/Login'
import Notificacoes from './pages/Notificacoes'
import Perfil from './pages/Perfil'
import Pontos from './pages/Pontos'
import { useApp } from './state'

const TELAS = { inicio: Inicio, jornada: Jornada, pontos: Pontos, benef: Beneficios, conq: Conquistas, notif: Notificacoes, guia: Guia, perfil: Perfil }

export default function App() {
  const { s, go } = useApp()
  const Tela = TELAS[s.tela]

  return (
    <>
      {s.logado ? (
        <>
          <Header />
          <main>
            {s.tela !== 'inicio' && <button className="back" onClick={() => go('inicio')}>← Início</button>}
            <Tela />
            <p className="mut sm" style={{ marginTop: 24 }}>Protótipo com dados de exemplo. Cores, fontes, níveis, pontos e benefícios são provisórios.</p>
          </main>
        </>
      ) : <Login />}
      <Toast />
    </>
  )
}

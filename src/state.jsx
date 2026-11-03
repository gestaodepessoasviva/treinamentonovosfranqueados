import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CONQUISTAS, ETAPAS, EXTRATO, NIVEIS, NOTIFICACOES } from './data'

const estadoInicial = () => ({
  layout: 'A',
  atual: 2, // etapa em que a pessoa está
  selecionada: 2, // etapa aberta em Minha Jornada
  logado: false,
  tela: 'inicio',
  menu: false,
  pontos: 1480,
  naoLidas: 2,
  vistas: 2,
  extrato: structuredClone(EXTRATO),
  etapas: structuredClone(ETAPAS),
  notificacoes: structuredClone(NOTIFICACOES),
})

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [s, setS] = useState(estadoInicial)
  const [toastMsg, setToastMsg] = useState({ texto: '', on: false })
  const timer = useRef()

  const toast = useCallback(texto => {
    clearTimeout(timer.current)
    setToastMsg({ texto, on: true })
    timer.current = setTimeout(() => setToastMsg(t => ({ ...t, on: false })), 2600)
  }, [])

  const set = patch => setS(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  const go = tela => {
    set(p => ({ tela, menu: false, ...(tela === 'notif' ? { vistas: p.naoLidas, naoLidas: 0 } : {}) }))
    window.scrollTo(0, 0)
  }

  const actions = {
    toast,
    go,
    setLayout: layout => set({ layout }),
    toggleMenu: () => set(p => ({ menu: !p.menu })),
    entrar: () => set({ logado: true }),
    sair: () => set({ logado: false, menu: false, tela: 'inicio' }),
    reiniciar: () => setS({ ...estadoInicial(), logado: true, tela: 'jornada' }),
    abrirEtapa: i => {
      set({ selecionada: i })
      if (s.tela !== 'jornada') go('jornada')
    },
    trocar: b => {
      if (s.pontos < b.custo) return
      set(p => ({ pontos: p.pontos - b.custo, extrato: [{ data: 'Hoje', texto: 'Troca: ' + b.nome, valor: -b.custo }, ...p.extrato] }))
      toast('Troca solicitada! O T&D vai aprovar.')
    },
    // Só no protótipo: conclui a próxima atividade da etapa atual.
    avancar: () => {
      const n = structuredClone(s)
      const etapa = n.etapas[n.atual]
      const k = etapa.atividades.findIndex(x => x[1] !== 1)
      if (k < 0) return toast('Você concluiu toda a jornada! 🏆')
      etapa.atividades[k][1] = 1
      n.pontos += 20
      n.extrato.unshift({ data: 'Hoje', texto: 'Atividade concluída: ' + etapa.atividades[k][0], valor: 20 })
      const r = etapa.atividades.findIndex(x => x[1] !== 1)
      if (r >= 0) {
        etapa.atividades[r][1] = 2
        toast('+20 pontos! Atividade concluída.')
      } else {
        n.pontos += 100
        n.extrato.unshift({ data: 'Hoje', texto: 'Etapa concluída: ' + etapa.nome, valor: 100 })
        if (n.atual < n.etapas.length - 1) {
          n.atual++
          n.etapas[n.atual].atividades[0][1] = 2
          n.selecionada = n.atual
          n.notificacoes.unshift({ emoji: '🏅', texto: 'Nova etapa liberada: ' + n.etapas[n.atual].nome, quando: 'agora' })
          n.naoLidas++
          toast('🎉 Etapa concluída! +100 pontos. Você avançou no mapa.')
        } else toast('🏆 Jornada concluída!')
      }
      setS(n)
    },
  }

  const nivel = NIVEIS.reduce((a, n, i) => (s.pontos >= n.min ? i : a), 0)
  let feitas = 0, total = 0
  s.etapas.forEach(e => e.atividades.forEach(x => { total++; if (x[1] === 1) feitas++ }))
  const derivados = {
    nivel,
    conquistadas: Math.min(CONQUISTAS.length, 2 + s.atual),
    progresso: Math.round((feitas / total) * 100),
    statusEtapa: i => (i < s.atual ? 'd' : i === s.atual ? 'c' : i === s.atual + 1 ? 'a' : 'l'),
  }

  return <AppContext.Provider value={{ s, ...derivados, ...actions, toastMsg }}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { ADMIN, BENEFICIOS, CONQUISTAS, ENTREGAS, ETAPAS, EXTRAS, EXTRATO, FATOR_ATRASO, FRANQUEADOS, NIVEIS, NOTIFICACOES, TURMAS, pontosDe } from './data'

export const nivelDe = pontos => NIVEIS.reduce((a, n, i) => (pontos >= n.min ? i : a), 0)

// Recalcula os status: concluídas ficam como estão e a primeira pendente fica "em andamento".
function normalizar(etapas) {
  let marcou = false
  etapas.forEach(e => e.atividades.forEach(x => {
    if (x[1] === 1) return
    x[1] = marcou ? 0 : 2
    marcou = true
  }))
  return etapas
}

// Etapas de um franqueado com as `feitas` primeiras atividades concluídas.
function montarEtapas(feitas) {
  let k = 0
  return normalizar(ETAPAS.map(e => ({ ...e, atividades: e.atividades.map(([nome]) => [nome, k++ < feitas ? 1 : 0]) })))
}

// Etapa atual: a primeira que ainda tem atividade pendente.
export const atualDe = etapas => {
  const i = etapas.findIndex(e => e.atividades.some(x => x[1] !== 1))
  return i < 0 ? etapas.length - 1 : i
}

export const progressoDe = etapas => {
  let feitas = 0, total = 0
  etapas.forEach(e => e.atividades.forEach(x => { total++; if (x[1] === 1) feitas++ }))
  return Math.round((feitas / total) * 100)
}

// Pontos de uma entrega conforme a situação (com atraso vale FATOR_ATRASO).
export const pontosEntrega = (nome, situacao) => {
  const base = ENTREGAS.find(e => e.nome === nome).pontos
  return situacao === 'Com atraso' ? base * FATOR_ATRASO : base
}

// Data ISO de hoje, no fuso local.
export const hojeISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10) }
export const dataBR = iso => (iso ? iso.split('-').reverse().join('/') : '')
// Prazo de uma entrega pelo calendário da turma:
//   'antes' da aula ligada  -> vence no dia dessa aula ao vivo;
//   'depois' da aula ligada -> vence no dia da próxima aula (ou no fim da turma, se for a última).
// Sem calendário cadastrado, vale o prazo provisório (último dia do mês previsto).
export const ehAula = a => (a.tipo || 'aula') === 'aula'
// Só as aulas ao vivo (sem TNF e folgas), em ordem de data.
export const aulasOrdenadas = turma => [...(turma?.aulas || [])].filter(a => a.data && ehAula(a)).sort((a, b) => a.data.localeCompare(b.data))
// Próxima aula ao vivo a partir de hoje (inclusive).
export const proximaAula = turma => aulasOrdenadas(turma).find(a => a.data >= hojeISO())
export const nomeAula = a => (ehAula(a) ? `Aula ao vivo${a.numero ? ' #' + a.numero : ''} · ${a.tema}` : a.tema)
export function prazoInfo(nome, turma) {
  const regra = turma?.regras?.[nome]
  const aulas = aulasOrdenadas(turma)
  const i = regra ? aulas.findIndex(a => a.id === regra.aula) : -1
  if (i < 0) return { data: ENTREGAS.find(e => e.nome === nome).prazo, provisorio: !aulas.length, regra: 'até o fim do mês' }
  const aula = aulas[i]
  if (regra.momento === 'antes') return { data: aula.data, aula, regra: 'até a aula ao vivo' }
  const prox = aulas[i + 1]
  return prox ? { data: prox.data, aula, regra: 'até a próxima aula' } : { data: turma.fim && turma.fim > aula.data ? turma.fim : aula.data, aula, regra: 'até o fim da turma' }
}
export const prazoDe = (nome, turma) => prazoInfo(nome, turma).data
// Situação calculada pela plataforma: concluída até o prazo = no prazo.
export const situacaoCalculada = (nome, concluidaEm, turma) => ((concluidaEm || hojeISO()) <= prazoDe(nome, turma) ? 'No prazo' : 'Com atraso')

export const extraDe = acao => EXTRAS.find(e => e.acao === acao)
export const limiteAtingido = (f, acao) => f.extras.filter(x => x.acao === acao && x.status === 'aprovado').length >= extraDe(acao).max

const hoje = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
let seq = 0
const novoId = prefixo => `${prefixo}-${Date.now().toString(36)}-${seq++}`

const novoFranqueado = (f, i) => {
  const validadas = Object.fromEntries((f.validadas || []).map(([nome, sit]) => [nome, sit]))
  const emValidacao = Object.fromEntries((f.emValidacao || []).map(x => (Array.isArray(x) ? x : [x, ''])))
  return {
    id: f.id, nome: f.nome, franquia: f.franquia, email: f.email, whatsapp: f.whatsapp || '', turma: f.turma || '', ativo: f.ativo !== false,
    pontos: f.pontos || 0,
    etapas: montarEtapas(f.feitas || 0),
    entregas: ENTREGAS.map(e => ({
      nome: e.nome,
      status: validadas[e.nome] ? 'validada' : e.nome in emValidacao ? 'em_validacao' : 'pendente',
      situacao: validadas[e.nome] || '',
      concluidaEm: emValidacao[e.nome] || '',
      calculada: '', // situação que a plataforma calculou no momento da validação
    })),
    extras: (f.extras || []).map(x => ({ id: novoId('ex'), ...x })),
    extrato: i === 0 ? structuredClone(EXTRATO) : f.pontos ? [{ data: '—', texto: 'Saldo acumulado até hoje', valor: f.pontos }] : [],
    notificacoes: i === 0 ? structuredClone(NOTIFICACOES) : [],
    naoLidas: i === 0 ? 2 : 0,
    vistas: i === 0 ? 2 : 0,
  }
}

const estadoInicial = () => ({
  sessao: null, // null = deslogado, 'admin' ou id do franqueado
  tela: 'inicio',
  menu: false,
  selecionada: 2, // etapa aberta em Minha Jornada
  adminSel: null, // franqueado aberto no painel admin
  turmas: structuredClone(TURMAS),
  franqueados: FRANQUEADOS.map(novoFranqueado),
  beneficios: BENEFICIOS.map(b => ({ ativo: true, ...b })),
  trocas: [],
})

// Lança pontos no extrato e avisa se o franqueado subiu de nível. Altera `f`.
function aplicarPontos(f, valor, texto) {
  const antes = nivelDe(f.pontos)
  f.pontos += valor
  f.extrato.unshift({ data: hoje(), texto, valor })
  const depois = nivelDe(f.pontos)
  if (depois > antes) notificar(f, '🏅', `Você subiu para o nível ${NIVEIS[depois].nome}!`)
}

function notificar(f, emoji, texto) {
  f.notificacoes.unshift({ emoji, texto, quando: 'agora' })
  f.naoLidas++
}

async function sha256(texto) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

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
  const salvarFranqueado = f => set(p => ({ franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)) }))
  const copiaDe = id => structuredClone(s.franqueados.find(x => x.id === id))

  const eu = s.franqueados.find(x => x.id === s.sessao)
  const atual = eu ? atualDe(eu.etapas) : 0

  const go = tela => {
    set(p => ({
      tela, menu: false,
      ...(tela === 'notif' && eu ? { franqueados: p.franqueados.map(x => (x.id === eu.id ? { ...x, vistas: x.naoLidas, naoLidas: 0 } : x)) } : {}),
    }))
    window.scrollTo(0, 0)
  }

  const actions = {
    toast,
    go,
    toggleMenu: () => set(p => ({ menu: !p.menu })),
    entrar: async (email, senha) => {
      if (email.trim().toLowerCase() === ADMIN.email) {
        if ((await sha256(senha)) !== ADMIN.senhaSha256) return toast('Senha incorreta.')
        return set({ sessao: 'admin', tela: 'admin', adminSel: null })
      }
      const f = s.franqueados[0]
      set({ sessao: f.id, tela: 'inicio', selecionada: atualDe(f.etapas) })
    },
    sair: () => set({ sessao: null, menu: false, tela: 'inicio' }),
    reiniciar: () => setS({ ...estadoInicial(), sessao: s.sessao, tela: 'jornada' }),
    abrirEtapa: i => {
      set({ selecionada: i })
      if (s.tela !== 'jornada') go('jornada')
    },
    // Troca automática: debita os pontos e baixa o estoque na hora, sem aprovação.
    trocar: b => {
      const item = s.beneficios.find(x => x.id === b.id)
      if (!item || !item.ativo || eu.pontos < item.custo || item.estoque <= 0) return
      const f = copiaDe(eu.id)
      aplicarPontos(f, -item.custo, 'Troca: ' + item.nome)
      set(p => ({
        beneficios: p.beneficios.map(x => (x.id === item.id ? { ...x, estoque: x.estoque - 1 } : x)),
        trocas: [{ id: novoId('tr'), data: hoje(), franqueado: f.id, beneficio: item.nome, custo: item.custo }, ...p.trocas],
        franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)),
      }))
      toast(`Troca confirmada! ${item.emoji} ${item.nome}`)
    },
    // Franqueado registra uma ação extra; o admin aprova ou recusa.
    registrarExtra: (acao, obs) => {
      const f = copiaDe(eu.id)
      f.extras.unshift({ id: novoId('ex'), acao, obs, data: hoje(), status: 'pendente' })
      salvarFranqueado(f)
      toast('Enviado! A equipe vai analisar e lançar os pontos.')
    },
    // Só no protótipo: conclui a próxima atividade da etapa atual
    // (vale como disciplina no prazo) e, ao fechar a etapa, a prova do período.
    avancar: () => {
      const f = copiaDe(eu.id)
      const etapa = f.etapas[atual]
      const k = etapa.atividades.findIndex(x => x[1] !== 1)
      if (k < 0) return toast('Você concluiu toda a jornada! 🎓')
      const ativ = pontosDe('disciplina') + pontosDe('prazo')
      etapa.atividades[k][1] = 1
      normalizar(f.etapas)
      aplicarPontos(f, ativ, 'Concluída no prazo: ' + etapa.atividades[k][0])
      const novaAtual = atualDe(f.etapas)
      if (etapa.atividades.some(x => x[1] !== 1)) toast(`+${ativ} pontos! Atividade concluída no prazo.`)
      else {
        const prova = pontosDe('prova')
        aplicarPontos(f, prova, 'Aprovação na prova do período: ' + etapa.nome)
        if (novaAtual !== atual) {
          notificar(f, '🏅', 'Nova etapa liberada: ' + f.etapas[novaAtual].nome)
          set({ selecionada: novaAtual })
          toast(`🎉 Etapa concluída! +${prova} pontos. Você avançou no mapa.`)
        } else toast('🎓 Jornada concluída!')
      }
      salvarFranqueado(f)
    },

    // ===== Painel admin =====
    adminIr: tela => { set({ tela }); window.scrollTo(0, 0) },
    adminAbrir: id => { set({ adminSel: id, tela: 'adminFranq' }); window.scrollTo(0, 0) },
    adminMarcar: (id, e, a, feita) => {
      const f = copiaDe(id)
      const ativ = f.etapas[e].atividades[a]
      ativ[1] = feita ? 1 : 0
      normalizar(f.etapas)
      if (feita) notificar(f, '✅', `Atividade validada pela equipe: ${ativ[0]}`)
      salvarFranqueado(f)
      toast(`${ativ[0]}: ${feita ? 'concluída' : 'reaberta'}`)
    },
    adminLancar: (id, valor, texto) => {
      const f = copiaDe(id)
      aplicarPontos(f, valor, texto)
      notificar(f, valor > 0 ? '⭐' : '📝', `${valor > 0 ? '+' : ''}${valor} pontos: ${texto}`)
      salvarFranqueado(f)
      toast(`${valor > 0 ? '+' : ''}${valor} pontos para ${f.nome}`)
    },
    // Valida a entrega e lança os pontos (cheios ou com desconto de atraso) num clique.
    adminValidarEntrega: (id, nome, situacao) => {
      const f = copiaDe(id)
      const e = f.entregas.find(x => x.nome === nome)
      if (e.status === 'validada') return
      const pts = pontosEntrega(nome, situacao)
      e.status = 'validada'
      e.concluidaEm = e.concluidaEm || hojeISO()
      e.calculada = situacaoCalculada(nome, e.concluidaEm, s.turmas.find(t => t.codigo === f.turma))
      e.situacao = situacao
      aplicarPontos(f, pts, situacao === 'Com atraso' ? `Entrega com atraso (${FATOR_ATRASO * 100}%): ${nome}` : `Entrega validada: ${nome}`)
      notificar(f, '✅', `Entrega validada pela Expansão: ${nome} (+${pts} pontos)`)
      salvarFranqueado(f)
      toast(`${nome} validada para ${f.nome}: +${pts} pontos`)
    },
    adminDevolverEntrega: (id, nome) => {
      const f = copiaDe(id)
      f.entregas.find(x => x.nome === nome).status = 'pendente'
      notificar(f, '↩️', `A entrega ${nome} voltou para ajustes. Confira com a Expansão no Sults.`)
      salvarFranqueado(f)
      toast(`${nome} devolvida para ${f.nome}`)
    },
    adminDecidirExtra: (id, extraId, aprovar) => {
      const f = copiaDe(id)
      const x = f.extras.find(e => e.id === extraId)
      if (!x || x.status !== 'pendente') return
      if (aprovar && limiteAtingido(f, x.acao)) return toast(`Limite atingido: ${x.acao} vale no máximo ${extraDe(x.acao).max}x no semestre.`)
      x.status = aprovar ? 'aprovado' : 'recusado'
      if (aprovar) {
        const pts = extraDe(x.acao).pontos
        aplicarPontos(f, pts, 'Extra: ' + x.acao)
        notificar(f, '🚀', `Ação extra aprovada: ${x.acao} (+${pts} pontos)`)
        toast(`Extra aprovado para ${f.nome}: +${pts} pontos`)
      } else {
        notificar(f, '📝', `Ação extra não aprovada: ${x.acao}. Fale com a equipe se tiver dúvidas.`)
        toast(`Extra recusado para ${f.nome}`)
      }
      salvarFranqueado(f)
    },
    // Cadastros. Retornam uma mensagem de erro (string) ou nada.
    adminSalvarTurma: t => {
      const codigo = t.codigo.trim()
      if (!codigo || !t.nome.trim()) return 'Informe código e nome da turma.'
      if (s.turmas.some(x => x.codigo.toLowerCase() === codigo.toLowerCase())) return 'Já existe uma turma com esse código.'
      set(p => ({ turmas: [...p.turmas, { aulas: [], regras: {}, ...t, codigo }] }))
      toast(`Turma ${codigo} cadastrada`)
    },
    // Salva o calendário de aulas da turma e a ligação de cada entrega com uma aula.
    adminSalvarCalendario: (codigo, aulas, regras) => {
      if (aulas.some(a => !a.data)) return 'Preencha a data de todas as aulas.'
      set(p => ({ turmas: p.turmas.map(t => (t.codigo === codigo ? { ...t, aulas, regras } : t)) }))
      toast('Calendário salvo. Os prazos das entregas foram recalculados.')
    },
    adminSalvarFranqueado: (dados, idExistente) => {
      const email = dados.email.trim().toLowerCase()
      if (!dados.nome.trim() || !email.includes('@')) return 'Informe nome e um e-mail válido.'
      if (email === ADMIN.email) return 'Esse e-mail é do acesso de admin.'
      if (s.franqueados.some(x => x.email.toLowerCase() === email && x.id !== idExistente)) return 'Já existe um franqueado com esse e-mail.'
      if (idExistente) {
        const f = copiaDe(idExistente)
        Object.assign(f, { ...dados, email, nome: dados.nome.trim() })
        salvarFranqueado(f)
        toast('Cadastro atualizado')
      } else {
        const f = novoFranqueado({ ...dados, email, nome: dados.nome.trim(), id: novoId('fq') }, -1)
        set(p => ({ franqueados: [...p.franqueados, f] }))
        toast(`${f.nome} cadastrado(a)`)
      }
    },
    adminSalvarBeneficio: (dados, idExistente) => {
      if (!dados.nome.trim()) return 'Informe o nome do benefício.'
      const custo = Math.round(Number(dados.custo)), estoque = Math.round(Number(dados.estoque))
      if (!(custo > 0)) return 'O custo precisa ser maior que zero.'
      if (!(estoque >= 0)) return 'O estoque não pode ser negativo.'
      const item = { ...dados, nome: dados.nome.trim(), emoji: dados.emoji || '🎁', custo, estoque }
      if (idExistente) set(p => ({ beneficios: p.beneficios.map(x => (x.id === idExistente ? { ...x, ...item } : x)) }))
      else set(p => ({ beneficios: [...p.beneficios, { id: novoId('bn'), ativo: true, ...item }] }))
      toast(idExistente ? 'Benefício atualizado' : 'Benefício cadastrado')
    },
    adminAjustarEstoque: (id, delta) => set(p => ({ beneficios: p.beneficios.map(x => (x.id === id ? { ...x, estoque: Math.max(0, x.estoque + delta) } : x)) })),
    adminAlternarBeneficio: id => set(p => ({ beneficios: p.beneficios.map(x => (x.id === id ? { ...x, ativo: !x.ativo } : x)) })),
  }

  // Na visão do franqueado, `s` traz também os dados dele (pontos, etapas, extrato…).
  const visao = eu ? { ...s, ...eu, atual } : s
  const derivados = eu ? {
    nivel: nivelDe(eu.pontos),
    conquistadas: Math.min(CONQUISTAS.length, 2 + atual),
    progresso: progressoDe(eu.etapas),
    statusEtapa: i => (i < atual ? 'd' : i === atual ? 'c' : i === atual + 1 ? 'a' : 'l'),
  } : {}

  return <AppContext.Provider value={{ s: visao, ...derivados, ...actions, toastMsg }}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ADMIN, BENEFICIOS, CONQUISTAS, ENTREGAS, ETAPAS, EXTRAS, EXTRATO, FATOR_ATRASO, FRANQUEADOS, NIVEIS, NOTIFICACOES, REGRAS, TURMAS } from './data'
import { chamar, fatoDoLancamento, lerSessao, limparSessao, marcarAvisosVistos, MODO_DEMO, montarBeneficio, montarFranqueado, montarTurma, salvarSessao } from './planilha'

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

// Detalhes de uma atividade da jornada (link, aulas, entrega...) pela etapa e pelo nome.
export const metaDe = (etapa, nome) => ETAPAS[etapa]?.atividades.find(a => a[0] === nome)?.[2] || {}

export const extraDe = acao => EXTRAS.find(e => e.acao === acao)
export const limiteAtingido = (f, acao) => f.extras.filter(x => x.acao === acao).length >= extraDe(acao).max

// Telefone no formato (98) 999990001: só DDD entre parênteses, sem hífen.
export const foneBR = v => {
  const d = String(v || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : String(v || '').trim()
}

// Ações que a equipe lança na aba "Lançar pontos". Programado = roteiro do curso; extra = pontos extras.
export const ACOES = {
  Programado: [
    ...REGRAS.map(r => ({ chave: 'r:' + r.id, texto: r.acao, valor: r.pontos })),
    ...ENTREGAS.flatMap(e => [
      { chave: `e:${e.nome}:No prazo`, texto: 'Entrega no prazo: ' + e.nome, valor: e.pontos, entrega: e.nome, situacao: 'No prazo' },
      { chave: `e:${e.nome}:Com atraso`, texto: 'Entrega com atraso: ' + e.nome, valor: e.pontos * FATOR_ATRASO, entrega: e.nome, situacao: 'Com atraso' },
    ]),
  ],
  Extra: EXTRAS.map(e => ({ chave: 'x:' + e.acao, texto: e.acao, valor: e.pontos, extra: e.acao })),
}

const hoje = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
let seq = 0
const novoId = prefixo => `${prefixo}-${Date.now().toString(36)}-${seq++}`

const novoFranqueado = (f, i) => {
  const validadas = Object.fromEntries((f.validadas || []).map(([nome, sit]) => [nome, sit]))
  return {
    id: f.id, nome: f.nome, franquia: f.franquia, email: f.email, whatsapp: foneBR(f.whatsapp), turma: f.turma || '', ativo: f.ativo !== false,
    pontos: f.pontos || 0,
    etapas: montarEtapas(f.feitas || 0),
    entregas: ENTREGAS.map(e => ({
      nome: e.nome,
      status: validadas[e.nome] ? 'validada' : 'pendente',
      situacao: validadas[e.nome] || '',
    })),
    conquistas: [...(f.conquistas || [])],
    extras: (f.extras || []).map(x => ({ id: novoId('ex'), ...x })),
    extrato: (i === 0 ? structuredClone(EXTRATO) : f.pontos ? [{ data: '—', texto: 'Saldo acumulado até hoje', valor: f.pontos, tipo: 'Programado' }] : []).map(x => ({ id: novoId('lc'), ...x })),
    notificacoes: i === 0 ? structuredClone(NOTIFICACOES) : [],
    naoLidas: i === 0 ? 2 : 0,
    vistas: i === 0 ? 2 : 0,
  }
}

// No modo planilha começa vazio: os dados chegam do serviço depois do login.
const estadoInicial = () => ({
  sessao: null, // null = deslogado, 'admin' ou id do franqueado (no modo planilha, o e-mail)
  tela: 'inicio',
  menu: false,
  selecionada: 2, // etapa aberta em Minha Jornada
  adminSel: null, // franqueado aberto no painel admin
  turmas: MODO_DEMO ? structuredClone(TURMAS) : [],
  franqueados: MODO_DEMO ? FRANQUEADOS.map(novoFranqueado) : [],
  beneficios: MODO_DEMO ? BENEFICIOS.map(b => ({ ativo: true, ...b })) : [],
  trocas: [],
  carregando: !MODO_DEMO && !!lerSessao(), // abrindo a sessão guardada
  ocupado: false, // gravando na planilha
  criarSenha: false, // primeiro acesso do franqueado: precisa criar a senha antes de entrar
})

// Lança pontos no extrato e avisa se o franqueado subiu de nível. Altera `f`.
// `extra`: tipo (Programado, Extra, Troca), aula vinculada e se foi lançado pela equipe.
function aplicarPontos(f, valor, texto, extra = {}) {
  const antes = nivelDe(f.pontos)
  f.pontos += valor
  const lanc = { id: novoId('lc'), data: hoje(), texto, valor, tipo: 'Programado', ...extra }
  f.extrato.unshift(lanc)
  const depois = nivelDe(f.pontos)
  if (depois > antes) notificar(f, '🏅', `Você subiu para o nível ${NIVEIS[depois].nome}!`)
  return lanc
}

function notificar(f, emoji, texto) {
  f.notificacoes.unshift({ emoji, texto, quando: 'agora' })
  f.naoLidas++
}

// ===== Marcação automática das atividades da jornada =====
const FINAL = 'Jornada concluída'

// Fecha a etapa "Formatura" quando todo o resto estiver feito e avisa quando a etapa muda. Altera `f`.
function fecharJornada(f, atualAntes) {
  const resto = f.etapas.flatMap(e => e.atividades).filter(a => a[0] !== FINAL)
  const final = f.etapas.at(-1).atividades.find(a => a[0] === FINAL)
  if (final) final[1] = resto.every(a => a[1] === 1) ? 1 : 0
  normalizar(f.etapas)
  const depois = atualDe(f.etapas)
  if (final?.[1] === 1 && atualAntes !== undefined && !f.conquistas.includes('Formado na Universidade VIVA')) {
    notificar(f, '🎓', 'Você concluiu a jornada! Parabéns!')
  } else if (atualAntes !== undefined && depois > atualAntes) notificar(f, '🏅', 'Nova etapa liberada: ' + f.etapas[depois].nome)
}

// Marca como concluída a primeira atividade pendente com esse nome (ou que passa no teste).
// Devolve [etapa, atividade] marcada, para poder desfazer, ou null. Altera `f`.
function concluirAtividade(f, teste) {
  const ok = typeof teste === 'string' ? a => a[0] === teste : teste
  for (let e = 0; e < f.etapas.length; e++) {
    const k = f.etapas[e].atividades.findIndex((a, i) => a[1] !== 1 && ok(a, e, i))
    if (k >= 0) {
      const antes = atualDe(f.etapas)
      f.etapas[e].atividades[k][1] = 1
      fecharJornada(f, antes)
      return [e, k]
    }
  }
  return null
}

function reabrirAtividade(f, pos) {
  if (!pos) return
  const a = f.etapas[pos[0]]?.atividades[pos[1]]
  if (a) a[1] = 0
  fecharJornada(f)
}

// Atividade da jornada ligada a cada ação lançada pela equipe.
const ATIVIDADE_DA_ACAO = {
  'r:prova': 'Prova e banca do período',
  'r:projeto': 'Projeto integrador',
  'x:Inaugurar a unidade na data planejada': 'Inaugurar a unidade',
  'x:Fechar o primeiro fundo': 'Fechar o primeiro fundo',
}
// Conquista que também conclui uma atividade.
const ATIVIDADE_DA_CONQUISTA = {
  'Presente no TNF': 'Treinamento de Novos Franqueados (18 a 23/01)',
  'Portas Abertas': 'Inaugurar a unidade',
  'Primeiro Fundo': 'Fechar o primeiro fundo',
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
      // Primeiro login: ganha a conquista Largada e conclui "Primeiro acesso à plataforma".
      const f = copiaDe(s.franqueados[0].id)
      if (!f.conquistas.includes('Largada')) {
        f.conquistas.push('Largada')
        notificar(f, '🚩', 'Conquista desbloqueada: Largada!')
      }
      concluirAtividade(f, 'Primeiro acesso à plataforma')
      set(p => ({ franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)), sessao: f.id, tela: 'inicio', selecionada: atualDe(f.etapas) }))
    },
    // O franqueado faz algo na plataforma que conclui uma atividade (abrir o calendário, ler o Guia, abrir o Academy).
    concluirMinha: nome => {
      if (!eu) return
      const f = copiaDe(eu.id)
      if (concluirAtividade(f, nome)) salvarFranqueado(f)
    },
    sair: () => set({ sessao: null, menu: false, tela: 'inicio' }),
    criarMinhaSenha: async () => {},
    salvarFoto: foto => {
      const f = copiaDe(eu.id)
      f.foto = foto
      set(p => ({ franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)) }))
      toast(foto ? 'Foto atualizada' : 'Foto removida')
    },
    adminRedefinirSenha: () => toast('Na versão final: a senha volta para a senha inicial'),
    adminExcluirFranqueado: id => {
      const f = s.franqueados.find(x => x.id === id)
      set(p => ({ franqueados: p.franqueados.filter(x => x.id !== id), ...(p.adminSel === id ? { tela: 'adminCad', adminSel: null } : {}) }))
      toast(`Cadastro de ${f?.nome || 'franqueado'} excluído`)
    },
    abrirEtapa: i => {
      set({ selecionada: i })
      if (s.tela !== 'jornada') go('jornada')
    },
    // Troca automática: debita os pontos e baixa o estoque na hora, sem aprovação.
    trocar: b => {
      const item = s.beneficios.find(x => x.id === b.id)
      if (!item || !item.ativo || eu.pontos < item.custo || item.estoque <= 0) return
      const f = copiaDe(eu.id)
      aplicarPontos(f, -item.custo, 'Troca: ' + item.nome, { tipo: 'Troca' })
      set(p => ({
        beneficios: p.beneficios.map(x => (x.id === item.id ? { ...x, estoque: x.estoque - 1 } : x)),
        trocas: [{ id: novoId('tr'), data: hoje(), franqueado: f.id, beneficio: item.nome, custo: item.custo }, ...p.trocas],
        franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)),
      }))
      toast(`Troca confirmada! 🎁 ${item.nome}`)
    },

    // ===== Painel admin =====
    adminIr: tela => { set({ tela, adminPara: null }); window.scrollTo(0, 0) },
    adminLancarPara: id => { set({ tela: 'adminLancar', adminPara: id }); window.scrollTo(0, 0) },
    adminAbrir: id => { set({ adminSel: id, tela: 'adminFranq' }); window.scrollTo(0, 0) },
    // Marca ou desmarca uma conquista do franqueado.
    adminConquista: (id, nome, ganhou) => {
      const f = copiaDe(id)
      f.conquistas = ganhou ? [...new Set([...f.conquistas, nome])] : f.conquistas.filter(x => x !== nome)
      if (ganhou) notificar(f, CONQUISTAS.find(c => c.nome === nome)?.emoji || '🏅', `Conquista desbloqueada: ${nome}!`)
      // Algumas conquistas também concluem a atividade da jornada (TNF, inauguração, primeiro fundo).
      const ativ = ATIVIDADE_DA_CONQUISTA[nome]
      if (ativ && ganhou) concluirAtividade(f, ativ)
      if (ativ && !ganhou) {
        const e = f.etapas.findIndex(x => x.atividades.some(a => a[0] === ativ))
        if (e >= 0) reabrirAtividade(f, [e, f.etapas[e].atividades.findIndex(a => a[0] === ativ)])
      }
      salvarFranqueado(f)
      toast(`${nome}: ${ganhou ? 'marcada' : 'desmarcada'} para ${f.nome}`)
    },
    adminMarcar: (id, e, a, feita) => {
      const f = copiaDe(id)
      const ativ = f.etapas[e].atividades[a]
      const antes = atualDe(f.etapas)
      ativ[1] = feita ? 1 : 0
      fecharJornada(f, antes)
      if (feita) notificar(f, '✅', `Atividade validada pela equipe: ${ativ[0]}`)
      salvarFranqueado(f)
      toast(`${ativ[0]}: ${feita ? 'concluída' : 'reaberta'}`)
    },
    // Lança a mesma ação para um ou mais franqueados. Retorna mensagem de erro (string) ou nada.
    // Entregas já lançadas e extras no limite são pulados para quem já tem.
    adminLancarPontos: ({ ids, tipo, chave, aulaId, codigoTurma }) => {
      const acao = ACOES[tipo]?.find(a => a.chave === chave)
      if (!acao) return 'Escolha a ação.'
      if (!ids.length) return 'Escolha pelo menos um franqueado.'
      const turma = s.turmas.find(t => t.codigo === codigoTurma)
      const aula = turma?.aulas?.find(a => a.id === aulaId)
      const nomeDaAula = aula ? nomeAula(aula) : ''
      let feitos = 0
      const pulados = []
      const atualizados = ids.map(id => {
        const f = copiaDe(id)
        if (acao.entrega && f.entregas.find(e => e.nome === acao.entrega).status === 'validada') { pulados.push(f.nome); return null }
        if (acao.extra && limiteAtingido(f, acao.extra)) { pulados.push(f.nome); return null }
        const lanc = aplicarPontos(f, acao.valor, acao.texto, { tipo, aula: nomeDaAula, aulaId: aula?.id || '', equipe: true })
        if (acao.entrega) Object.assign(f.entregas.find(e => e.nome === acao.entrega), { status: 'validada', situacao: acao.situacao, concluidaEm: hojeISO(), lancamento: lanc.id })
        if (acao.extra) f.extras.push({ id: novoId('ex'), acao: acao.extra, data: hoje(), lancamento: lanc.id })
        // Conclui a atividade da jornada ligada a este lançamento (e guarda qual foi, para o Desfazer).
        if (acao.entrega) lanc.marcou = concluirAtividade(f, 'Entrega: ' + acao.entrega)
        else if (ATIVIDADE_DA_ACAO[acao.chave]) lanc.marcou = concluirAtividade(f, ATIVIDADE_DA_ACAO[acao.chave])
        else if (acao.chave === 'r:aula' && aula) {
          // Presença: a atividade da aula (ou do grupo de aulas) fecha quando tiver presença em todas.
          f.presencas = [...new Set([...(f.presencas || []), aula.id])]
          lanc.presenca = aula.id
          lanc.marcou = concluirAtividade(f, (a, e) => {
            const ids = metaDe(e, a[0]).aulas
            return ids?.includes(aula.id) && ids.every(id => f.presencas.includes(id))
          })
        }
        notificar(f, tipo === 'Extra' ? '🚀' : '⭐', `+${acao.valor} pontos: ${acao.texto}${nomeDaAula ? ` (${nomeDaAula})` : ''}`)
        feitos++
        return f
      }).filter(Boolean)
      set(p => ({ franqueados: p.franqueados.map(x => atualizados.find(f => f.id === x.id) || x) }))
      if (!feitos) return `Nada lançado: ${pulados.join(', ')} já ${pulados.length === 1 ? 'tem' : 'têm'} esse ponto.`
      toast(`+${acao.valor} pontos para ${feitos} ${feitos === 1 ? 'franqueado' : 'franqueados'}${pulados.length ? ` (já tinham: ${pulados.join(', ')})` : ''}`)
    },
    // Desfaz um lançamento da equipe: tira os pontos e reabre a entrega ou o extra ligado a ele.
    adminDesfazer: (fid, lancId) => {
      const f = copiaDe(fid)
      const lanc = f.extrato.find(x => x.id === lancId)
      if (!lanc) return
      f.pontos -= lanc.valor
      f.extrato = f.extrato.filter(x => x.id !== lancId)
      f.entregas.forEach(e => { if (e.lancamento === lancId) Object.assign(e, { status: 'pendente', situacao: '', concluidaEm: '', lancamento: '' }) })
      f.extras = f.extras.filter(x => x.lancamento !== lancId)
      if (lanc.presenca) f.presencas = (f.presencas || []).filter(id => id !== lanc.presenca)
      reabrirAtividade(f, lanc.marcou)
      notificar(f, '📝', `Lançamento corrigido pela equipe: ${lanc.texto} (${lanc.valor > 0 ? '-' : '+'}${Math.abs(lanc.valor)} pontos)`)
      salvarFranqueado(f)
      toast(`Lançamento desfeito para ${f.nome}`)
    },

    // Cadastros. Retornam uma mensagem de erro (string) ou nada.
    adminSalvarTurma: t => {
      const codigo = t.codigo.trim()
      if (!codigo || !t.nome.trim()) return 'Informe código e nome da turma.'
      if (s.turmas.some(x => x.codigo.toLowerCase() === codigo.toLowerCase())) return 'Já existe uma turma com esse código.'
      set(p => ({ turmas: [...p.turmas, { aulas: [], regras: {}, ...t, codigo }] }))
      toast(`Turma ${codigo} cadastrada`)
    },
    // Calendário da turma: salvar (nova ou editada), excluir aula e ligar entrega a uma aula.
    adminSalvarAula: (codigo, aula) => {
      if (!aula.data) return 'Informe a data.'
      if (!String(aula.tema || '').trim()) return 'Informe o nome da aula.'
      set(p => ({ turmas: p.turmas.map(t => (t.codigo !== codigo ? t : {
        ...t, aulas: t.aulas.some(a => a.id === aula.id) ? t.aulas.map(a => (a.id === aula.id ? aula : a)) : [...t.aulas, aula],
      })) }))
      toast('Calendário atualizado')
    },
    adminExcluirAula: (codigo, id) => {
      set(p => ({ turmas: p.turmas.map(t => (t.codigo !== codigo ? t : {
        ...t, aulas: t.aulas.filter(a => a.id !== id), regras: Object.fromEntries(Object.entries(t.regras || {}).filter(([, r]) => r.aula !== id)),
      })) }))
      toast('Data excluída do calendário')
    },
    adminSalvarRegra: (codigo, nome, regra) => set(p => ({ turmas: p.turmas.map(t => {
      if (t.codigo !== codigo) return t
      const regras = { ...(t.regras || {}) }
      if (regra?.aula) regras[nome] = regra
      else delete regras[nome]
      return { ...t, regras }
    }) })),

    adminSalvarFranqueado: (dados, idExistente) => {
      const email = dados.email.trim().toLowerCase()
      if (!dados.nome.trim() || !email.includes('@')) return 'Informe nome e um e-mail válido.'
      if (email === ADMIN.email) return 'Esse e-mail é do acesso de admin.'
      if (s.franqueados.some(x => x.email.toLowerCase() === email && x.id !== idExistente)) return 'Já existe um franqueado com esse e-mail.'
      dados = { ...dados, whatsapp: foneBR(dados.whatsapp) }
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
      const item = { ...dados, nome: dados.nome.trim(), emoji: dados.emoji || 'presente', custo, estoque }
      if (idExistente) set(p => ({ beneficios: p.beneficios.map(x => (x.id === idExistente ? { ...x, ...item } : x)) }))
      else set(p => ({ beneficios: [...p.beneficios, { id: novoId('bn'), ativo: true, ...item }] }))
      toast(idExistente ? 'Benefício atualizado' : 'Benefício cadastrado')
    },
    adminAjustarEstoque: (id, delta) => set(p => ({ beneficios: p.beneficios.map(x => (x.id === id ? { ...x, estoque: Math.max(0, x.estoque + delta) } : x)) })),
    adminAlternarBeneficio: id => set(p => ({ beneficios: p.beneficios.map(x => (x.id === id ? { ...x, ativo: !x.ativo } : x)) })),
    adminCancelarTroca: t => {
      const f = copiaDe(t.franqueado)
      if (f) aplicarPontos(f, t.custo, 'Troca cancelada: ' + t.beneficio, { tipo: 'Ajuste' })
      set(p => ({
        trocas: p.trocas.filter(x => x.id !== t.id),
        beneficios: p.beneficios.map(b => (b.nome === t.beneficio ? { ...b, estoque: b.estoque + 1 } : b)),
        ...(f ? { franqueados: p.franqueados.map(x => (x.id === f.id ? f : x)) } : {}),
      }))
      toast('Troca cancelada: os pontos voltaram para o saldo')
    },
    adminExcluirBeneficio: id => {
      const b = s.beneficios.find(x => x.id === id)
      set(p => ({ beneficios: p.beneficios.filter(x => x.id !== id) }))
      toast(`Benefício ${b?.nome || ''} excluído`)
    },
  }


  // ===== Modo planilha: os dados vêm do serviço e cada ação grava na planilha =====
  // Recarrega tudo do serviço. `inicio` = logo após o login (abre a tela inicial).
  // `pacote`: dados do franqueado que o serviço já devolveu (login e gravações), para não buscar de novo.
  const carregar = async (perfil, inicio, pacote) => {
    if (perfil === 'Admin') {
      const d = await chamar('painel')
      const turmas = d.turmas.map(t => montarTurma(t, d.calendario.filter(a => a['Código da turma*'] === t['Código da turma*']), d.prazos.filter(p => p['Código da turma*'] === t['Código da turma*'])))
      set(p => ({
        turmas, beneficios: d.beneficios.map(montarBeneficio),
        franqueados: d.franqueados.map(pc => montarFranqueado(pc, turmas.find(t => t.codigo === pc.perfil['Código da turma*']))),
        trocas: d.trocas.map(x => ({ id: String(x['ID']), data: String(x['Data']).slice(8, 10) + '/' + String(x['Data']).slice(5, 7), franqueado: String(x['E-mail']).toLowerCase(), beneficio: x['Benefício'], custo: Number(x['Pontos']) || 0 })),
        sessao: 'admin', ...(inicio ? { tela: 'admin', adminSel: null } : { tela: p.tela }),
      }))
    } else {
      const pc = pacote || await chamar('meusDados')
      const turma = montarTurma(pc.turma, pc.calendario, pc.prazos)
      const f = montarFranqueado(pc, turma)
      set(() => ({ turmas: [turma], franqueados: [f], beneficios: (pc.beneficios || []).map(montarBeneficio), sessao: f.id, ...(inicio ? { tela: 'inicio', selecionada: atualDe(f.etapas) } : {}) }))
      return f
    }
  }
  // Roda uma gravação na planilha e recarrega. Devolve a mensagem de erro (string) ou nada.
  const gravar = async (fn, ok) => {
    set({ ocupado: true })
    try {
      const r = await fn()
      const perfil = s.sessao === 'admin' ? 'Admin' : 'Franqueado'
      await carregar(perfil, false, perfil === 'Franqueado' && r && r.perfil && r.calendario ? r : undefined)
      if (ok) toast(ok)
    } catch (e) {
      if (!lerSessao()) setS(estadoInicial())
      return e.message
    } finally {
      set({ ocupado: false })
    }
  }
  const comAviso = async (fn, ok) => { const erro = await gravar(fn, ok); if (erro) toast(erro) }

  // Abre a sessão guardada ("lembrar de mim") ao abrir a página.
  useEffect(() => {
    if (MODO_DEMO) return
    const sessao = lerSessao()
    if (!sessao) return
    carregar(sessao.perfil, true)
      .catch(e => {
        if (/Crie sua senha/.test(e.message)) return set({ criarSenha: true })
        toast(e.message); limparSessao(); setS(estadoInicial())
      })
      .finally(() => set({ carregando: false }))
  }, [])

  const acoesPlanilha = {
    entrar: async (usuario, senha, lembrar) => {
      set({ ocupado: true })
      try {
        const r = await chamar('login', { usuario, senha, lembrar })
        salvarSessao({ token: r.token, perfil: r.perfil }, lembrar)
        if (r.criarSenha) return set({ criarSenha: true })
        await carregar(r.perfil, true, r.pacote || undefined)
      } catch (e) {
        toast(e.message)
      } finally {
        set({ ocupado: false })
      }
    },
    sair: () => { limparSessao(); setS(estadoInicial()) },
    salvarFoto: foto => comAviso(() => chamar('salvarFoto', { foto }), foto ? 'Foto atualizada' : 'Foto removida'),
    // Primeiro acesso: grava a senha nova e abre a plataforma. Devolve a mensagem de erro, se houver.
    criarMinhaSenha: async nova => {
      set({ ocupado: true })
      try {
        const pc = await chamar('trocarSenha', { nova })
        set({ criarSenha: false })
        await carregar('Franqueado', true, pc && pc.perfil ? pc : undefined)
        toast('Senha criada! Use-a nos próximos acessos.')
      } catch (e) {
        if (!lerSessao()) setS(estadoInicial())
        return e.message
      } finally {
        set({ ocupado: false })
      }
    },
    adminRedefinirSenha: email => comAviso(() => chamar('redefinirSenha', { email }), 'Senha redefinida: no próximo acesso ele usa a senha inicial'),
    go: tela => {
      if (tela === 'notif' && eu) marcarAvisosVistos(eu)
      go(tela)
    },
    concluirMinha: async nome => {
      if (!eu || eu.etapas.some(e => e.atividades.some(a => a[0] === nome && a[1] === 1))) return
      try { const pc = await chamar('concluirAtividade', { atividade: nome }); await carregar('Franqueado', false, pc) } catch { /* tenta de novo na próxima vez */ }
    },
    trocar: b => comAviso(() => chamar('trocar', { codigo: b.id }), `Troca confirmada! 🎁 ${b.nome}`),

    adminConquista: (email, conquista, ganhou) => comAviso(() => chamar('conquista', { email, conquista, ganhou }), `${conquista}: ${ganhou ? 'marcada' : 'desmarcada'}`),
    adminMarcar: (email, e, a, feita) => {
      const atividade = s.franqueados.find(f => f.id === email)?.etapas[e]?.atividades[a]?.[0]
      return comAviso(() => chamar('marcarAtividade', { email, atividade, feita }), `${atividade}: ${feita ? 'concluída' : 'reaberta'}`)
    },
    adminLancarPontos: async ({ ids, tipo, chave, aulaId, codigoTurma }) => {
      const acao = ACOES[tipo]?.find(a => a.chave === chave)
      if (!acao) return 'Escolha a ação.'
      if (!ids.length) return 'Escolha pelo menos um franqueado.'
      const aula = s.turmas.find(t => t.codigo === codigoTurma)?.aulas.find(a => a.id === aulaId)
      let fato
      try { fato = fatoDoLancamento(acao, aula, hojeISO()) } catch (e) { return e.message }
      // Pula quem já tem: entrega já lançada, extra no limite, presença na mesma aula.
      const pulados = []
      const emails = ids.filter(id => {
        const f = s.franqueados.find(x => x.id === id)
        const tem = (acao.entrega && f.entregas.find(e => e.nome === acao.entrega).status === 'validada') ||
          (acao.extra && limiteAtingido(f, acao.extra)) || (acao.chave === 'r:aula' && aula && f.presencas?.includes(aula.id))
        if (tem) pulados.push(f.nome)
        return !tem
      })
      if (!emails.length) return `Nada lançado: ${pulados.join(', ')} já ${pulados.length === 1 ? 'tem' : 'têm'} esse ponto.`
      return gravar(() => chamar('lancar', { emails, tipo: fato.tipo, dados: fato.dados }),
        `+${acao.valor} pontos para ${emails.length} ${emails.length === 1 ? 'franqueado' : 'franqueados'}${pulados.length ? ` (já tinham: ${pulados.join(', ')})` : ''}`)
    },
    adminDesfazer: (email, id) => {
      const lanc = s.franqueados.find(f => f.id === email)?.extrato.find(x => x.id === id)
      if (!lanc?.aba) return toast('Esse ponto é calculado (bônus). Desfaça o lançamento de origem.')
      return comAviso(() => chamar('desfazer', { aba: lanc.aba, id }), 'Lançamento desfeito')
    },
    adminSalvarTurma: t => {
      if (!t.codigo.trim() || !t.nome.trim()) return 'Informe código e nome da turma.'
      return gravar(() => chamar('salvarTurma', { t: { ...t, codigo: t.codigo.trim() } }), `Turma ${t.codigo.trim()} cadastrada`)
    },
    adminSalvarAula: (codigoTurma, aula) => {
      if (!aula.data) return 'Informe a data.'
      if (!String(aula.tema || '').trim()) return 'Informe o nome da aula.'
      return gravar(() => chamar('salvarAula', { codigoTurma, aula: { ...aula, id: aula.id.startsWith('au-') ? '' : aula.id } }), 'Calendário atualizado')
    },
    adminExcluirAula: (codigo, id) => comAviso(() => chamar('excluirAula', { id }), 'Data excluída do calendário'),
    adminSalvarRegra: (codigoTurma, entrega, regra) => comAviso(() => chamar('salvarPrazo', { codigoTurma, entrega, aulaId: regra?.aula || '', momento: regra?.momento || 'depois' })),
    adminExcluirFranqueado: async email => {
      const f = s.franqueados.find(x => x.id === email)
      const erro = await gravar(() => chamar('excluirFranqueado', { email }), `Cadastro de ${f?.nome || 'franqueado'} excluído`)
      if (erro) return toast(erro)
      if (s.adminSel === email) set({ tela: 'adminCad', adminSel: null })
    },
    adminSalvarFranqueado: (dados, emailAntigo) => {
      const email = dados.email.trim().toLowerCase()
      if (!dados.nome.trim() || !email.includes('@')) return 'Informe nome e um e-mail válido.'
      if (s.franqueados.some(x => x.email === email && x.id !== emailAntigo)) return 'Já existe um franqueado com esse e-mail.'
      return gravar(() => chamar('salvarFranqueado', { emailAntigo: emailAntigo || '', dados: {
        email, nome: dados.nome.trim(), cidade: dados.franquia, uf: dados.uf, whatsapp: foneBR(dados.whatsapp), turma: dados.turma,
        ativo: dados.ativo, loginMoodle: dados.loginMoodle, nomeAcademy: dados.nomeAcademy,
      } }), emailAntigo ? 'Cadastro atualizado' : `${dados.nome.trim()} cadastrado(a)`)
    },
    adminSalvarBeneficio: (dados, id) => {
      if (!dados.nome.trim()) return 'Informe o nome do benefício.'
      const custo = Math.round(Number(dados.custo)), estoque = Math.round(Number(dados.estoque))
      if (!(custo > 0)) return 'O custo precisa ser maior que zero.'
      if (!(estoque >= 0)) return 'O estoque não pode ser negativo.'
      const atual = s.beneficios.find(b => b.id === id)
      return gravar(() => chamar('salvarBeneficio', { b: { codigo: id || '', nome: dados.nome.trim(), descricao: dados.descricao || '', custo, estoque, ativo: atual ? atual.ativo : true, emoji: dados.emoji || 'presente' } }),
        id ? 'Benefício atualizado' : 'Benefício cadastrado')
    },
    adminAjustarEstoque: (id, delta) => {
      const b = s.beneficios.find(x => x.id === id)
      return comAviso(() => chamar('salvarBeneficio', { b: { ...b, codigo: id, estoque: Math.max(0, b.estoque + delta) } }))
    },
    adminCancelarTroca: t => comAviso(() => chamar('cancelarTroca', { id: t.id }), 'Troca cancelada: os pontos voltaram para o saldo'),
    adminExcluirBeneficio: id => {
      const b = s.beneficios.find(x => x.id === id)
      return comAviso(() => chamar('excluirBeneficio', { codigo: id }), `Benefício ${b?.nome || ''} excluído`)
    },
    adminAlternarBeneficio: id => {
      const b = s.beneficios.find(x => x.id === id)
      return comAviso(() => chamar('salvarBeneficio', { b: { ...b, codigo: id, ativo: !b.ativo } }))
    },
  }

  // Na visão do franqueado, `s` traz também os dados dele (pontos, etapas, extrato…).
  const visao = eu ? { ...s, ...eu, atual } : s
  const derivados = eu ? {
    nivel: nivelDe(eu.pontos),
    conquistadas: eu.conquistas.length,
    progresso: progressoDe(eu.etapas),
    statusEtapa: i => (i < atual ? 'd' : i === atual ? 'c' : i === atual + 1 ? 'a' : 'l'),
  } : {}

  const acoes = MODO_DEMO ? actions : { ...actions, ...acoesPlanilha }
  return <AppContext.Provider value={{ s: visao, ...derivados, ...acoes, toastMsg, demo: MODO_DEMO }}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)

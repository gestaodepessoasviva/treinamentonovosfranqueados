// Ligação da plataforma com a planilha (Apps Script publicado como App da Web).
// A planilha guarda os fatos (presenças, trilhas, avaliações, entregas, extras, ajustes, conquistas, trocas);
// aqui eles viram pontos, extrato e o mapa da jornada, no mesmo formato que as telas já usam.
import { CONQUISTAS, ENTREGAS, ETAPAS, EXTRAS, FATOR_ATRASO, NIVEIS, REGRAS } from './data'

// Endereço do serviço. Não é segredo: sem login válido o serviço não entrega nada.
const PADRAO = 'https://script.google.com/macros/s/AKfycbwDZvtmz0ACZmdlGtntZ18vxq0LUgvGJpo-z-vde8J-mScBrT2CsMr4peuB9GvugYLe/exec'
export const API_URL = import.meta.env.VITE_API_URL ?? PADRAO

// Modo demonstração (dados de exemplo, qualquer e-mail e senha entram): por enquanto é o padrão,
// para apresentar à equipe. A versão ligada à planilha abre com ?planilha no endereço.
// Para voltar a usar a planilha como padrão, troque ABERTO para false.
const ABERTO = false
const params = new URLSearchParams(window.location.search)
// No site publicado só entra quem tem cadastro: o ?demo funciona apenas no computador de desenvolvimento.
export const MODO_DEMO = !API_URL || (import.meta.env.DEV && params.has('demo')) || (ABERTO && !params.has('planilha'))

// ===== Sessão: "lembrar de mim" guarda no navegador; sem isso, só até fechar a aba =====
const CHAVE = 'jornada-sessao'
export function lerSessao() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || sessionStorage.getItem(CHAVE) || 'null') } catch { return null }
}
export function salvarSessao(sessao, lembrar) {
  try {
    limparSessao()
    ;(lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(sessao))
  } catch { /* navegador sem armazenamento: a sessão vale só nesta página */ }
}
export function limparSessao() {
  try { localStorage.removeItem(CHAVE); sessionStorage.removeItem(CHAVE) } catch { /* nada */ }
}

// Chamada ao serviço. Content-Type text/plain evita a checagem extra do navegador (CORS) que o Apps Script não atende.
export async function chamar(acao, params = {}) {
  const token = lerSessao()?.token
  let resp
  try {
    resp = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ acao, token, ...params }) })
  } catch {
    throw new Error('Sem conexão com a planilha. Confira a internet e tente de novo.')
  }
  const r = await resp.json().catch(() => ({ ok: false, erro: 'Resposta inesperada do servidor.' }))
  if (!r.ok) {
    if (/Sessão (inválida|expirou)|sessão expirou/i.test(r.erro || '')) limparSessao()
    throw new Error(r.erro || 'Erro desconhecido.')
  }
  return r.dados
}

// ===== Conversão dos dados da planilha =====
const ddmm = iso => (iso ? `${String(iso).slice(8, 10)}/${String(iso).slice(5, 7)}` : '—')
const pts = id => REGRAS.find(r => r.id === id)?.pontos || 0
const sim = v => String(v || '').trim().toLowerCase() === 'sim'

export function montarTurma(t, calendario, prazos) {
  const aulas = calendario.map(a => ({
    id: String(a['ID']), tipo: a['Tipo*'] || 'aula', data: a['Data*'], fim: a['Até'] || '', numero: a['Nº da aula'] === '' ? '' : Number(a['Nº da aula']),
    tema: a['Tema*'], professor: a['Professor(a)'] || '', horario: a['Horário'] || '14h', link: a['Link do Meet'] || '',
  }))
  const regras = {}
  prazos.forEach(p => { if (p['ID da aula']) regras[p['Entrega*']] = { aula: String(p['ID da aula']), momento: p['Momento'] || 'depois' } })
  return {
    codigo: t['Código da turma*'], nome: t['Nome da turma*'], cronograma: t['Cronograma (cidade)'] || '',
    inicio: t['Data de início*'] || '', fim: t['Data de fim*'] || '', aulas, regras,
  }
}

export const montarBeneficio = b => ({
  id: String(b['Código*']), nome: b['Nome*'], descricao: b['Descrição'] || '', custo: Number(b['Custo em pontos*']) || 0,
  estoque: Number(b['Estoque*']) || 0, ativo: !/^n[aã]o$/i.test(String(b['Ativo*'] || '')), emoji: b['Emoji'] || 'presente',
})

// Um franqueado a partir do "pacote" que o serviço devolve.
export function montarFranqueado(p, turma) {
  const perfil = p.perfil
  const email = String(perfil['E-mail*']).toLowerCase()
  const aulaPorNumero = n => turma?.aulas.find(a => a.tipo === 'aula' && Number(a.numero) === Number(n))
  const extrato = []
  const lanc = (aba, x, data, texto, valor, tipo, extra = {}) =>
    extrato.push({ id: String(x['ID'] || `${aba}-${extrato.length}`), aba, iso: data || '', data: ddmm(data), texto, valor, tipo, equipe: x['Origem'] === 'Equipe', ...extra })

  // Presença ao vivo
  const presencas = new Set()
  const avaliadas = new Set() // aulas com a avaliação aprovada
  p.aulas.forEach(x => {
    if (String(x['Participação*']).toLowerCase() !== 'ao vivo') return
    const a = aulaPorNumero(x['Nº da aula*'])
    if (a) presencas.add(a.id)
    lanc('Aulas ao vivo', x, x['Data da aula*'], 'Participar da aula ao vivo', pts('aula'), 'Programado', { aula: a ? `Aula ao vivo #${a.numero} · ${a.tema}` : `Aula #${x['Nº da aula*']}` })
  })
  // Avaliações: da aula (Moodle), prova e banca do período, projeto integrador
  let provas = 0, projeto = false
  p.avaliacoes.forEach(x => {
    if (String(x['Resultado*']).toLowerCase() !== 'aprovado') return
    const tipo = String(x['Tipo*'])
    if (tipo === 'Avaliação da aula') {
      const a = aulaPorNumero(x['Nº da aula'])
      if (a) avaliadas.add(a.id)
      lanc('Avaliações', x, x['Data*'], 'Passar na avaliação da aula', pts('avaliacao'), 'Programado', { aula: a ? `Aula ao vivo #${a.numero} · ${a.tema}` : '' })
    } else if (/projeto/i.test(tipo)) {
      projeto = true
      lanc('Avaliações', x, x['Data*'], 'Aprovação no projeto integrador', pts('projeto'), 'Programado')
    } else {
      provas++
      lanc('Avaliações', x, x['Data*'], `Aprovação na prova e banca do período${x['Período (1 a 3)'] ? ' ' + x['Período (1 a 3)'] : ''}`, pts('prova'), 'Programado')
    }
  })
  // Trilhas/disciplinas do Academy (+ bônus quando concluída até o prazo)
  p.disciplinas.forEach(x => {
    const nome = x['Trilha'] || x['Disciplina*']
    lanc('Disciplinas Academy', x, x['Data de conclusão*'], 'Concluir no Academy: ' + nome, pts('disciplina'), 'Programado')
    if (x['Prazo*'] && x['Data de conclusão*'] && String(x['Data de conclusão*']) <= String(x['Prazo*'])) {
      extrato.push({ id: String(x['ID']) + '-bonus', aba: '', iso: x['Data de conclusão*'], data: ddmm(x['Data de conclusão*']), texto: 'Bônus: concluída no prazo · ' + nome, valor: pts('prazo'), tipo: 'Programado' })
    }
  })
  // Entregas da implantação
  const entregasFeitas = {}
  p.entregas.forEach(x => {
    const e = ENTREGAS.find(y => y.nome === x['Entrega*'])
    if (!e) return
    const atraso = /atraso/i.test(String(x['Situação*']))
    entregasFeitas[e.nome] = { situacao: atraso ? 'Com atraso' : 'No prazo', concluidaEm: x['Data de conclusão*'] || '', lancamento: String(x['ID'] || '') }
    lanc('Entregas implantação', x, x['Data de conclusão*'], `Entrega ${atraso ? 'com atraso' : 'no prazo'}: ${e.nome}`, atraso ? e.pontos * FATOR_ATRASO : e.pontos, 'Programado')
  })
  // Pontos extras
  const extras = p.extras.map(x => {
    const e = EXTRAS.find(y => y.acao === x['Ação extra*'])
    lanc('Extras', x, x['Data*'], x['Ação extra*'], e ? e.pontos : 0, 'Extra')
    return { id: String(x['ID']), acao: x['Ação extra*'], data: ddmm(x['Data*']), lancamento: String(x['ID']) }
  })
  // Ajustes da equipe e trocas de benefícios
  p.ajustes.forEach(x => lanc('Ajustes de pontos', { ...x, Origem: 'Equipe' }, x['Data*'], 'Ajuste: ' + x['Motivo*'], Number(x['Pontos (+ ou -)*']) || 0, 'Ajuste'))
  p.trocas.forEach(x => lanc('Trocas', x, x['Data'], 'Troca: ' + x['Benefício'], -(Number(x['Pontos']) || 0), 'Troca'))
  extrato.sort((a, b) => String(b.iso).localeCompare(String(a.iso)))

  const conquistas = p.conquistas.map(x => x['Conquista*']).filter(n => CONQUISTAS.some(c => c.nome === n))
  const academy = {}
  p.progressoAcademy.forEach(x => { academy[Number(String(x['Trilha']).slice(0, 1))] = Number(x['% concluído']) || 0 })

  // Mapa da jornada: cada atividade é concluída pelos fatos da planilha.
  const marcadas = new Set(p.atividades.map(x => x['Atividade*']))
  const temExtra = n => extras.some(x => x.acao === n)
  let provasUsadas = 0
  const etapas = ETAPAS.map((e, ei) => ({
    ...e,
    atividades: e.atividades.map(([nome, , meta]) => {
      let feita = marcadas.has(nome)
      if (nome.startsWith('Entrega: ')) feita ||= !!entregasFeitas[nome.slice(9)]
      else if (meta?.tnf) feita ||= conquistas.includes('Presente no TNF')
      else if (meta?.aulas) feita ||= meta.aulas.every(id => presencas.has(id))
      else if (nome.startsWith('Academy: ')) feita ||= (academy[ei] || 0) >= 100
      else if (nome === 'Prova e banca do período') { if (provasUsadas < provas) { feita = true; provasUsadas++ } }
      else if (nome === 'Projeto integrador') feita ||= projeto
      else if (nome === 'Inaugurar a unidade') feita ||= temExtra('Inaugurar a unidade na data planejada') || conquistas.includes('Portas Abertas')
      else if (nome === 'Fechar o primeiro fundo') feita ||= temExtra('Fechar o primeiro fundo') || conquistas.includes('Primeiro Fundo')
      return [nome, feita ? 1 : 0]
    }),
  }))
  const final = etapas.at(-1).atividades.find(a => a[0] === 'Jornada concluída')
  if (final) final[1] = etapas.flatMap(e => e.atividades).filter(a => a !== final).every(a => a[1] === 1) ? 1 : 0
  let marcou = false
  etapas.forEach(e => e.atividades.forEach(x => { if (x[1] !== 1) { x[1] = marcou ? 0 : 2; marcou = true } }))

  // Notificações = histórico de tudo o que aconteceu com a pessoa, do mais recente para o mais antigo:
  // pontos recebidos, trocas de benefícios, ajustes, conquistas, níveis e ações feitas na plataforma.
  const eventos = []
  const ev = (id, iso, icone, texto, detalhe = '') => eventos.push({ id, iso: String(iso || '').slice(0, 10), icone, texto, detalhe })
  extrato.forEach(x => {
    if (x.tipo === 'Troca') ev('p:' + x.id, x.iso, 'presente', `Você trocou ${Math.abs(x.valor)} pontos por ${x.texto.replace(/^Troca: /, '')}`)
    else if (x.tipo === 'Ajuste') ev('p:' + x.id, x.iso, 'grafico', `Ajuste de ${x.valor > 0 ? '+' : ''}${x.valor} pontos`, x.texto.replace(/^Ajuste: /, ''))
    else ev('p:' + x.id, x.iso, x.tipo === 'Extra' ? 'foguete' : 'estrela', `Você recebeu +${x.valor} pontos${x.tipo === 'Extra' ? ' extras' : ''}`, x.texto + (x.aula ? ' · ' + x.aula : ''))
  })
  p.conquistas.forEach(x => ev('c:' + (x['ID'] || x['Conquista*']), x['Data*'], 'medalha', 'Conquista desbloqueada: ' + x['Conquista*'],
    CONQUISTAS.find(c => c.nome === x['Conquista*'])?.quando || ''))
  const TEXTO_ATIV = { 'Primeiro acesso à plataforma': 'Seu primeiro acesso à plataforma. Boas-vindas à Jornada!', 'Ler o Guia da Jornada': 'Você abriu o Guia da Jornada',
    'Consultar o calendário da turma': 'Você consultou o calendário da turma', 'Acessar o Academy': 'Seu acesso ao Academy foi registrado',
    'Criou a senha de acesso': 'Você criou sua senha de acesso', 'Atualizou a foto de perfil': 'Você atualizou sua foto de perfil',
    'Trocou a senha de acesso': 'Você trocou sua senha de acesso', 'Removeu a foto de perfil': 'Você removeu sua foto de perfil' }
  p.atividades.forEach(x => ev('a:' + (x['ID'] || x['Atividade*']), x['Data*'], /foto de perfil/.test(x['Atividade*']) ? 'camera' : 'bandeira',
    TEXTO_ATIV[x['Atividade*']] || 'Atividade concluída: ' + x['Atividade*']))
  // Mudança de nível: soma os pontos em ordem de data e avisa quando passa de um corte.
  let soma = 0, nivel = 0
  ;[...extrato].sort((a, b) => String(a.iso).localeCompare(String(b.iso))).forEach(x => {
    soma += x.valor
    while (nivel < NIVEIS.length - 1 && soma >= NIVEIS[nivel + 1].min) { nivel++; ev('n:' + NIVEIS[nivel].nome, x.iso, 'trofeu', `Você subiu para o nível ${nivel + 1}: ${NIVEIS[nivel].nome}`, NIVEIS[nivel].desc) }
  })
  // Mais recente primeiro; no mesmo dia, a subida de nível aparece acima dos pontos que a causaram.
  eventos.sort((a, b) => b.iso.localeCompare(a.iso) || (b.id.startsWith('n:') - a.id.startsWith('n:')))
  let vistos = []
  try { vistos = JSON.parse(localStorage.getItem('jornada-vistos:' + email) || '[]') } catch { /* nada */ }
  const notificacoes = eventos.map(x => ({ ...x, quando: quando(x.iso), nova: !vistos.includes(x.id) }))
  const naoLidas = notificacoes.filter(n => n.nova).length

  return {
    id: email, email, foto: p.foto || '', nome: perfil['Nome completo*'], franquia: perfil['Cidade'] || '', uf: perfil['UF'] || '', whatsapp: perfil['WhatsApp'] || '',
    turma: perfil['Código da turma*'] || '', ativo: !/^n[aã]o$/i.test(String(perfil['Ativo*'] || '')), loginMoodle: perfil['Login do Moodle'] || '',
    nomeAcademy: perfil['Nome no Academy'] || '',
    pontos: extrato.reduce((s, x) => s + x.valor, 0),
    etapas,
    entregas: ENTREGAS.map(e => ({ nome: e.nome, status: entregasFeitas[e.nome] ? 'validada' : 'pendente', situacao: entregasFeitas[e.nome]?.situacao || '', concluidaEm: entregasFeitas[e.nome]?.concluidaEm || '', lancamento: entregasFeitas[e.nome]?.lancamento || '' })),
    conquistas, extras, extrato, academy, presencas: [...presencas], avaliadas: [...avaliadas],
    gatilhos: (p.gatilhos || []).map(x => ({ gatilho: Number(x['Gatilho*']), data: x['Data*'], por: x['Marcado por'] || '', id: String(x['ID'] || '') })),
    notificacoes, naoLidas, vistas: 0, ultimoAcesso: p.ultimoAcesso || '',
  }
}

// "hoje", "ontem" ou a data (dd/mm).
function quando(iso) {
  if (!iso) return ''
  const dia = d => new Date(d + 'T12:00').getTime()
  const hoje = new Date(); const h = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
  const dif = Math.round((dia(h) - dia(iso)) / 864e5)
  return dif === 0 ? 'hoje' : dif === 1 ? 'ontem' : ddmm(iso)
}

export function marcarAvisosVistos(f) {
  try { localStorage.setItem('jornada-vistos:' + f.email, JSON.stringify(f.notificacoes.map(n => n.id))) } catch { /* nada */ }
}

// Cada ação da aba "Lançar pontos" vira um fato numa aba da planilha.
export function fatoDoLancamento(acao, aula, hoje) {
  const [tipoChave, resto] = [acao.chave.slice(0, 1), acao.chave.slice(2)]
  if (tipoChave === 'e') return { tipo: 'entrega', dados: { 'Entrega*': acao.entrega, 'Data de conclusão*': hoje, 'Validada no Sults?*': 'Sim', 'Situação*': acao.situacao } }
  if (tipoChave === 'x') return { tipo: 'extra', dados: { 'Ação extra*': acao.extra, 'Data*': hoje, 'Observação': aula ? `Aula #${aula.numero}` : '' } }
  switch (resto) {
    case 'aula':
      if (!aula) throw new Error('Escolha a aula para lançar a presença.')
      return { tipo: 'aula', dados: { 'Nº da aula*': aula.numero, 'Data da aula*': aula.data, 'Participação*': 'Ao vivo' } }
    case 'avaliacao':
      if (!aula) throw new Error('Escolha a aula da avaliação.')
      return { tipo: 'avaliacao', dados: { 'Tipo*': 'Avaliação da aula', 'Nº da aula': aula.numero, 'Data*': hoje, 'Resultado*': 'Aprovado' } }
    case 'prova': return { tipo: 'avaliacao', dados: { 'Tipo*': 'Prova e banca do período', 'Data*': hoje, 'Resultado*': 'Aprovado' } }
    case 'projeto': return { tipo: 'avaliacao', dados: { 'Tipo*': 'Projeto integrador', 'Data*': hoje, 'Resultado*': 'Aprovado' } }
    case 'disciplina': return { tipo: 'disciplina', dados: { 'Disciplina*': 'Disciplina do Academy (lançada pela equipe)', 'Data de conclusão*': hoje } }
    case 'prazo': return { tipo: 'ajuste', dados: { 'Pontos (+ ou -)*': acao.valor, 'Motivo*': 'Bônus: disciplina concluída no prazo', 'Data*': hoje } }
    default: throw new Error('Ação desconhecida.')
  }
}

export const simNao = v => (v ? 'Sim' : 'Não')
export { sim }

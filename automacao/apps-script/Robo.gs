/**
 * Robô da Jornada de Novos Franqueados
 *
 * Roda dentro do Google Sheets (cópia do "Modelo de Importação - Jornada do Franqueado")
 * e preenche sozinho as abas:
 *   - Disciplinas Academy  ← conclusão de cursos no Moodle
 *   - Avaliações           ← notas de provas / projeto integrador no Moodle
 *   - Aulas ao vivo        ← presença no Google Meet + nota do quiz da aula no Moodle
 *
 * O que ligar a quê fica nas abas "Config · Disciplinas", "Config · Aulas" e "Config · Provas"
 * (crie pelo menu 🤖 Jornada → Criar abas de configuração).
 * Endereço e token do Moodle ficam guardados nas propriedades do script, nunca no código.
 */

// ===================== Ajustes =====================
const AJUSTES = {
  NOTA_MINIMA: 0.8,          // 80% da nota máxima = aprovado / passou na avaliação
  DIAS_RETROATIVOS_MEET: 30, // só busca no Meet aulas dos últimos N dias (as antigas já estão na planilha)
  HORA_DIARIA: 6,            // hora da atualização automática
  LOTE: 40,                  // chamadas ao Moodle em paralelo
}

const ABA = {
  franqueados: 'Franqueados',
  disciplinas: 'Disciplinas Academy',
  avaliacoes: 'Avaliações',
  aulas: 'Aulas ao vivo',
  log: 'Log do robô',
  cfgDisciplinas: 'Config · Disciplinas',
  cfgAulas: 'Config · Aulas',
  cfgProvas: 'Config · Provas',
}

const CONFIG_ABAS = {
  [ABA.cfgDisciplinas]: {
    cabecalho: ['Disciplina', 'Etapa', 'ID do curso no Moodle', 'Prazo'],
    exemplo: ['Modelo de Negócio', 'Implantação', 12, new Date(2026, 11, 20)],
    ajuda: 'Uma linha por disciplina do Academy. O ID do curso aparece no endereço do curso no Moodle: .../course/view.php?id=12',
  },
  [ABA.cfgAulas]: {
    cabecalho: ['Nº da aula', 'Data', 'Código do Meet', 'ID do curso no Moodle', 'ID da avaliação no Moodle'],
    exemplo: [6, new Date(2026, 11, 17), 'abc-defg-hij', 90, 12, 345],
    ajuda: 'Uma linha por aula ao vivo. Código do Meet: o final do link meet.google.com/abc-defg-hij. ID da avaliação: o número depois de id= no endereço do quiz da aula (.../mod/quiz/view.php?id=345).',
  },
  [ABA.cfgProvas]: {
    cabecalho: ['Tipo', 'Período', 'ID do curso no Moodle', 'ID da atividade no Moodle'],
    exemplo: ['Prova e banca do período', 1, 12, 400],
    ajuda: 'Uma linha por prova do período e uma para o projeto integrador. Tipo: "Prova e banca do período" ou "Projeto integrador". ID da atividade: o número depois de id= no endereço da prova ou tarefa (.../mod/quiz/view.php?id=400).',
  },
}

// ===================== Menu =====================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🤖 Jornada')
    .addItem('Atualizar agora', 'atualizarTudo')
    .addSeparator()
    .addItem('Configurar acesso ao Moodle', 'configurarMoodle')
    .addItem('Testar conexão com o Moodle', 'testarMoodle')
    .addItem('Criar abas de configuração', 'criarAbasDeConfiguracao')
    .addSeparator()
    .addItem('Ativar atualização diária', 'ativarDiario')
    .addItem('Desativar atualização diária', 'desativarDiario')
    .addToUi()
}

function configurarMoodle() {
  const ui = SpreadsheetApp.getUi()
  const props = PropertiesService.getScriptProperties()
  const url = ui.prompt('Endereço do Moodle', 'Ex.: https://academy.suaempresa.com.br', ui.ButtonSet.OK_CANCEL)
  if (url.getSelectedButton() !== ui.Button.OK) return
  const token = ui.prompt('Token do serviço web', 'Token criado pelo administrador do Moodle (ver guia de instalação).', ui.ButtonSet.OK_CANCEL)
  if (token.getSelectedButton() !== ui.Button.OK) return
  props.setProperty('MOODLE_URL', url.getResponseText().trim().replace(/\/+$/, ''))
  props.setProperty('MOODLE_TOKEN', token.getResponseText().trim())
  ui.alert('Acesso salvo. Use "Testar conexão com o Moodle" para conferir.')
}

function testarMoodle() {
  const info = moodle('core_webservice_get_site_info', {})
  SpreadsheetApp.getUi().alert(`Conectado ao Moodle "${info.sitename}" como ${info.username}.`)
}

function criarAbasDeConfiguracao() {
  const ss = SpreadsheetApp.getActive()
  Object.entries(CONFIG_ABAS).forEach(([nome, c]) => {
    if (ss.getSheetByName(nome)) return
    const sh = ss.insertSheet(nome)
    sh.getRange(1, 1, 1, c.cabecalho.length).setValues([c.cabecalho]).setFontWeight('bold').setBackground('#d9480f').setFontColor('#ffffff')
    sh.getRange(2, 1, 1, c.exemplo.length).setValues([c.exemplo]).setFontStyle('italic').setFontColor('#808080')
    sh.getRange(1, 1).setNote(c.ajuda + '\n\nA linha 2 é um exemplo: substitua pelos dados reais.')
    sh.setFrozenRows(1)
    sh.autoResizeColumns(1, c.cabecalho.length)
  })
  SpreadsheetApp.getUi().alert('Abas de configuração prontas. Preencha-as seguindo o guia de instalação.')
}

function ativarDiario() {
  desativarDiario()
  ScriptApp.newTrigger('atualizarTudo').timeBased().everyDays(1).atHour(AJUSTES.HORA_DIARIA).create()
  SpreadsheetApp.getUi().alert(`Atualização diária ativada, por volta das ${AJUSTES.HORA_DIARIA}h.`)
}

function desativarDiario() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'atualizarTudo').forEach(t => ScriptApp.deleteTrigger(t))
}

// ===================== Atualização =====================
function atualizarTudo() {
  const emails = emailsCadastrados()
  const etapas = [
    ['Disciplinas', () => importarDisciplinas(emails)],
    ['Avaliações', () => importarProvas(emails)],
    ['Aulas ao vivo', () => importarAulas(emails)],
  ]
  etapas.forEach(([nome, fn]) => {
    try {
      const r = fn()
      registrar(nome, r.novas, r.atualizadas, r.obs || '')
    } catch (e) {
      registrar(nome, 0, 0, 'ERRO: ' + e.message)
    }
  })
}

function importarDisciplinas(emails) {
  const cfg = lerConfig(ABA.cfgDisciplinas)
  const linhas = []
  cfg.forEach(c => {
    const curso = Number(c['ID do curso no Moodle'])
    if (!curso) return
    const alunos = alunosDoCurso(curso, emails)
    const respostas = moodleLote('core_completion_get_course_completion_status', alunos.map(a => ({ courseid: curso, userid: a.id })))
    alunos.forEach((a, i) => {
      const st = respostas[i] && respostas[i].completionstatus
      if (!st || !st.completed) return
      const tempos = (st.completions || []).map(x => x.timecompleted).filter(Boolean)
      linhas.push({
        'E-mail*': a.email,
        'Disciplina*': c['Disciplina'],
        'Etapa*': c['Etapa'],
        'Data de conclusão*': tempos.length ? new Date(Math.max(...tempos) * 1000) : new Date(),
        'Prazo*': c['Prazo'] || '',
      })
    })
  })
  return gravar(ABA.disciplinas, linhas, ['E-mail*', 'Disciplina*'])
}

function importarProvas(emails) {
  const cfg = lerConfig(ABA.cfgProvas)
  const linhas = []
  cfg.forEach(c => {
    const curso = Number(c['ID do curso no Moodle'])
    const ativ = Number(c['ID da atividade no Moodle'])
    if (!curso || !ativ) return
    notasDaAtividade(curso, ativ, emails).forEach(n => {
      linhas.push({
        'E-mail*': n.email,
        'Tipo*': c['Tipo'],
        'Período (1 a 3)': c['Tipo'] === 'Projeto integrador' ? '' : c['Período'],
        'Data*': n.data,
        'Resultado*': n.aprovado ? 'Aprovado' : 'Reprovado',
      })
    })
  })
  return gravar(ABA.avaliacoes, linhas, ['E-mail*', 'Tipo*', 'Período (1 a 3)'])
}

// Presença ao vivo vem do Meet; a avaliação da aula, do Moodle.
// Quem não esteve ao vivo mas fez a avaliação entra como "Gravação".
function importarAulas(emails) {
  const cfg = lerConfig(ABA.cfgAulas)
  const linhas = []
  const limite = new Date(Date.now() - AJUSTES.DIAS_RETROATIVOS_MEET * 864e5)
  let obs = ''
  cfg.forEach(c => {
    const data = c['Data'] instanceof Date ? c['Data'] : null
    if (!data || data > new Date()) return

    const tempo = {}
    if (c['Código do Meet'] && data >= limite) {
      try {
        Object.assign(tempo, presencaNoMeet(c['Código do Meet'], data))
      } catch (e) {
        obs = 'Meet indisponível: ' + e.message
      }
    }

    const notas = {}
    const curso = Number(c['ID do curso no Moodle'])
    const ativ = Number(c['ID da avaliação no Moodle'])
    if (curso && ativ) notasDaAtividade(curso, ativ, emails).forEach(n => { notas[n.email] = n })

    const pessoas = new Set([...Object.keys(tempo), ...Object.keys(notas)].filter(e => emails.has(e)))
    pessoas.forEach(email => {
      const aoVivo = (tempo[email] || 0) > 0 // apareceu na lista de presença do Meet
      const nota = notas[email]
      if (!aoVivo && !nota) return
      linhas.push({
        'E-mail*': email,
        'Nº da aula*': c['Nº da aula'],
        'Data da aula*': data,
        'Participação*': aoVivo ? 'Ao vivo' : 'Gravação',
        'Passou na avaliação?*': nota && nota.aprovado ? 'Sim' : 'Não',
      })
    })
  })
  const r = gravar(ABA.aulas, linhas, ['E-mail*', 'Nº da aula*'])
  r.obs = obs
  return r
}

// ===================== Moodle =====================
function credenciais() {
  const p = PropertiesService.getScriptProperties()
  const url = p.getProperty('MOODLE_URL'), token = p.getProperty('MOODLE_TOKEN')
  if (!url || !token) throw new Error('Acesso ao Moodle não configurado (menu 🤖 Jornada → Configurar acesso ao Moodle).')
  return { url: url + '/webservice/rest/server.php', token }
}

// Transforma {courseids: [1, 2]} em {'courseids[0]': 1, 'courseids[1]': 2}, como o Moodle espera.
function achatar(obj, prefixo, saida) {
  saida = saida || {}
  Object.keys(obj).forEach(k => {
    const nome = prefixo ? `${prefixo}[${k}]` : k
    const v = obj[k]
    if (v !== null && typeof v === 'object') achatar(v, nome, saida)
    else saida[nome] = v
  })
  return saida
}

function pedido(fn, params) {
  const { url, token } = credenciais()
  return {
    url, method: 'post', muteHttpExceptions: true,
    payload: achatar({ wstoken: token, wsfunction: fn, moodlewsrestformat: 'json', ...params }),
  }
}

function lerResposta(fn, resp) {
  const json = JSON.parse(resp.getContentText())
  if (json && json.exception) throw new Error(`${fn}: ${json.message}`)
  return json
}

function moodle(fn, params) {
  const p = pedido(fn, params)
  return lerResposta(fn, UrlFetchApp.fetch(p.url, p))
}

function moodleLote(fn, listaParams) {
  const saida = []
  for (let i = 0; i < listaParams.length; i += AJUSTES.LOTE) {
    const lote = listaParams.slice(i, i + AJUSTES.LOTE).map(p => pedido(fn, p))
    UrlFetchApp.fetchAll(lote).forEach(r => saida.push(lerResposta(fn, r)))
  }
  return saida
}

const cacheAlunos = {}
function alunosDoCurso(curso, emails) {
  if (!cacheAlunos[curso]) {
    cacheAlunos[curso] = moodle('core_enrol_get_enrolled_users', { courseid: curso })
      .map(u => ({ id: u.id, email: String(u.email || '').toLowerCase() }))
  }
  return cacheAlunos[curso].filter(a => emails.has(a.email))
}

// O número do endereço (.../view.php?id=N) identifica a página da atividade; as notas usam
// o tipo (quiz, assign…) e o número interno dela. O Moodle informa os dois.
const cacheAtividades = {}
function atividade(idDoEndereco) {
  if (!cacheAtividades[idDoEndereco]) {
    const cm = moodle('core_course_get_course_module', { cmid: idDoEndereco }).cm
    cacheAtividades[idDoEndereco] = { modulo: cm.modname, instancia: Number(cm.instance) }
  }
  return cacheAtividades[idDoEndereco]
}

const cacheNotas = {}
// Notas de uma atividade (quiz ou tarefa) para todos os alunos do curso, numa só chamada.
function notasDaAtividade(curso, idDoEndereco, emails) {
  const { modulo, instancia } = atividade(idDoEndereco)
  if (!cacheNotas[curso]) cacheNotas[curso] = moodle('gradereport_user_get_grade_items', { courseid: curso }).usergrades || []
  const porId = {}
  alunosDoCurso(curso, emails).forEach(a => { porId[a.id] = a.email })
  const saida = []
  cacheNotas[curso].forEach(ug => {
    const email = porId[ug.userid]
    if (!email) return
    const item = (ug.gradeitems || []).find(g => g.itemmodule === modulo && Number(g.iteminstance) === instancia)
    if (!item || item.graderaw === null || item.graderaw === undefined || !item.grademax) return
    const quando = item.gradedategraded || item.gradedatesubmitted
    saida.push({ email, aprovado: item.graderaw / item.grademax >= AJUSTES.NOTA_MINIMA, data: quando ? new Date(quando * 1000) : new Date() })
  })
  return saida
}

// ===================== Google Meet =====================
// Lê os registros de "chamada encerrada" do Meet (Admin Console → Relatórios) no dia da aula
// e soma quanto tempo cada e-mail ficou na reunião.
function presencaNoMeet(codigo, data) {
  const alvo = String(codigo).replace(/[^a-z]/gi, '').toUpperCase()
  const ini = new Date(data); ini.setHours(0, 0, 0, 0)
  const fim = new Date(ini.getTime() + 864e5)
  const tempo = {}
  let pageToken
  do {
    const res = AdminReports.Activities.list('all', 'meet', {
      eventName: 'call_ended', startTime: ini.toISOString(), endTime: fim.toISOString(), maxResults: 1000, pageToken,
    })
    ;(res.items || []).forEach(it => (it.events || []).forEach(ev => {
      const p = {}
      ;(ev.parameters || []).forEach(x => { p[x.name] = x.value !== undefined ? x.value : x.intValue })
      if (String(p.meeting_code || '').replace(/[^a-z]/gi, '').toUpperCase() !== alvo) return
      const email = String(p.identifier || '').toLowerCase()
      if (!email.includes('@')) return
      tempo[email] = (tempo[email] || 0) + Number(p.duration_seconds || 0)
    }))
    pageToken = res.nextPageToken
  } while (pageToken)
  return tempo
}

// ===================== Planilha =====================
function emailsCadastrados() {
  const sh = SpreadsheetApp.getActive().getSheetByName(ABA.franqueados)
  const dados = sh.getDataRange().getValues()
  const col = dados[0].indexOf('E-mail*')
  const colAtivo = dados[0].indexOf('Ativo*')
  return new Set(dados.slice(1)
    .filter(l => l[col] && (colAtivo < 0 || l[colAtivo] !== 'Não'))
    .map(l => String(l[col]).trim().toLowerCase()))
}

function lerConfig(nome) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nome)
  if (!sh) return []
  const [cab, ...dados] = sh.getDataRange().getValues()
  return dados.filter(l => l.some(v => v !== '')).map(l => Object.fromEntries(cab.map((h, i) => [h, l[i]])))
}

const chaveDe = (obj, campos) => campos.map(c => {
  const v = obj[c]
  return v instanceof Date ? Utilities.formatDate(v, 'America/Sao_Paulo', 'yyyy-MM-dd') : String(v === undefined ? '' : v).trim().toLowerCase()
}).join('|')

// Insere linhas novas e atualiza as que já existem com a mesma chave. Não apaga nada.
function gravar(nomeAba, linhas, campos) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nomeAba)
  if (!sh) throw new Error(`Aba "${nomeAba}" não encontrada.`)
  const dados = sh.getDataRange().getValues()
  const cab = dados[0]
  campos.concat(Object.keys(linhas[0] || {})).forEach(c => { if (cab.indexOf(c) < 0) throw new Error(`Coluna "${c}" não encontrada em "${nomeAba}".`) })

  const indice = {}
  for (let i = 1; i < dados.length; i++) {
    const obj = Object.fromEntries(cab.map((h, j) => [h, dados[i][j]]))
    if (obj[campos[0]] !== '') indice[chaveDe(obj, campos)] = i
  }

  const comoTexto = valores => chaveDe(Object.fromEntries(cab.map((h, j) => [h, valores[j]])), cab)

  let novas = 0, atualizadas = 0
  const acrescentar = []
  linhas.forEach(l => {
    const k = chaveDe(l, campos)
    const i = indice[k]
    if (i === -1) return // repetida no mesmo lote
    // Colunas que o robô não preenche (ex.: Tentativa) mantêm o que já estava na planilha.
    const nova = cab.map((h, j) => (h in l ? l[h] : i !== undefined ? dados[i][j] : ''))
    if (i === undefined) {
      acrescentar.push(nova)
      indice[k] = -1
      novas++
    } else if (comoTexto(dados[i]) !== comoTexto(nova)) {
      sh.getRange(i + 1, 1, 1, cab.length).setValues([nova])
      atualizadas++
    }
  })
  if (acrescentar.length) {
    const primeira = ultimaLinhaPreenchida(sh, dados) + 1
    sh.getRange(primeira, 1, acrescentar.length, cab.length).setValues(acrescentar)
  }
  return { novas, atualizadas }
}

// A área de preenchimento tem cor de fundo; a última linha "de verdade" é a última com e-mail/código.
function ultimaLinhaPreenchida(sh, dados) {
  for (let i = dados.length - 1; i >= 1; i--) if (dados[i][0] !== '') return i + 1
  return 1
}

function registrar(etapa, novas, atualizadas, obs) {
  const ss = SpreadsheetApp.getActive()
  let sh = ss.getSheetByName(ABA.log)
  if (!sh) {
    sh = ss.insertSheet(ABA.log)
    sh.appendRow(['Quando', 'Etapa', 'Linhas novas', 'Linhas atualizadas', 'Observação'])
    sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#d9480f').setFontColor('#ffffff')
    sh.setFrozenRows(1)
  }
  sh.insertRowAfter(1)
  sh.getRange(2, 1, 1, 5).setValues([[new Date(), etapa, novas, atualizadas, obs]])
}

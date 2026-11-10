/**
 * Banco de dados da Jornada de Novos Franqueados (Google Planilhas + Apps Script)
 *
 * Esta planilha é a base única da plataforma. O script faz três coisas:
 *   1. Arruma a planilha (menu 🗄️ Banco → Preparar a planilha): cria as abas e colunas que faltam,
 *      sem apagar nada e SEM mexer na aba IMPORTAÇÃO ACADEMY.
 *   2. Atualiza todo dia às 8h:
 *        - Disciplinas Academy  ← percentuais da IMPORTAÇÃO ACADEMY (só leitura)
 *        - Aulas ao vivo        ← listas de presença do Meet na pasta do Drive
 *   3. Serve a plataforma (Implantar → App da Web): login, dados de cada franqueado e as ações do admin.
 *
 * Segredos (chave de assinatura do login, pasta das listas) ficam nas Propriedades do script, nunca no código.
 */

const TZ = 'America/Sao_Paulo'
const HORA_DIARIA = 8
const IMPORTACAO = 'IMPORTAÇÃO ACADEMY' // nunca é alterada pelo script

// Estrutura das abas. Colunas que faltarem são criadas no fim, sem mexer nas existentes.
const ABAS = {
  'Turmas': ['Código da turma*', 'Nome da turma*', 'Cronograma (cidade)', 'Data de início*', 'Data de fim*'],
  'Franqueados': ['E-mail*', 'Nome completo*', 'Cidade', 'UF', 'WhatsApp', 'Código da turma*', 'Perfil*', 'Ativo*', 'Nome no Academy', 'Login do Moodle'],
  'Calendário': ['ID', 'Código da turma*', 'Tipo*', 'Data*', 'Até', 'Nº da aula', 'Tema*', 'Professor(a)', 'Horário', 'Link do Meet'],
  'Prazos das entregas': ['Código da turma*', 'Entrega*', 'ID da aula', 'Momento'],
  'Aulas ao vivo': ['E-mail*', 'Nº da aula*', 'Data da aula*', 'Participação*', 'ID', 'Origem', 'Lançado por', 'Lançado em'],
  'Disciplinas Academy': ['E-mail*', 'Disciplina*', 'Trilha', 'Etapa*', 'Data de conclusão*', 'Prazo*', 'ID', 'Origem', 'Lançado por', 'Lançado em'],
  'Avaliações': ['E-mail*', 'Tipo*', 'Período (1 a 3)', 'Data*', 'Resultado*', 'Tentativa (1 ou 2)', 'ID', 'Origem', 'Lançado por', 'Lançado em'],
  'Entregas implantação': ['E-mail*', 'Entrega*', 'Data de conclusão*', 'Validada no Sults?*', 'Situação*', 'ID', 'Origem', 'Lançado por', 'Lançado em'],
  'Extras': ['E-mail*', 'Ação extra*', 'Data*', 'Observação', 'ID', 'Origem', 'Lançado por', 'Lançado em'],
  'Ajustes de pontos': ['E-mail*', 'Pontos (+ ou -)*', 'Motivo*', 'Lançado por*', 'Data*', 'ID'],
  'Conquistas': ['E-mail*', 'Conquista*', 'Data*', 'Marcado por', 'ID'],
  'Atividades': ['E-mail*', 'Atividade*', 'Data*', 'Marcado por', 'ID'],
  'Benefícios': ['Código*', 'Nome*', 'Descrição', 'Custo em pontos*', 'Estoque*', 'Ativo*', 'Emoji'],
  'Trocas': ['ID', 'Data', 'E-mail', 'Código do benefício', 'Benefício', 'Pontos'],
  'Progresso Academy': ['E-mail', 'Trilha', '% concluído', 'Atualizado em'],
  'Config Academy': ['Trilha*', 'Coluna na IMPORTAÇÃO ACADEMY*', 'Etapa', 'Prazo'],
  'Arquivos de presença': ['ID do arquivo', 'Nome do arquivo', 'Lido em', 'Aula', 'Pessoas encontradas', 'Observação'],
  'Acessos': ['E-mail', 'Perfil', 'Sal', 'Senha (hash)', 'Último acesso', 'Foto'],
  'Registro do robô': ['Quando', 'Etapa', 'Resultado'],
}
// Colunas que saem da planilha: a Cidade é a franquia; a avaliação da aula não é mais registrada na presença.
const REMOVER = { 'Franqueados': ['Unidade (franquia)*'], 'Aulas ao vivo': ['Passou na avaliação?*'] }

// Abas que o próprio script mantém (a equipe só consulta).
const SO_LEITURA = ['Progresso Academy', 'Arquivos de presença', 'Registro do robô', 'Acessos']

// Primeira carga do calendário da turma de novembro (só entra se a aba estiver vazia).
const CALENDARIO_INICIAL = [
  ['t11-01', 'aula', '2026-11-12', '', 1, 'Modelo de Negócios', 'Everdan', 'https://meet.google.com/qph-kgti-cce'],
  ['t11-02', 'aula', '2026-11-24', '', 2, 'Marketing', 'Jhonny', ''],
  ['t11-03', 'aula', '2026-11-26', '', 3, 'Marketing', 'Guilherme', ''],
  ['t11-04', 'aula', '2026-12-08', '', 4, 'Fornecedor', '', ''],
  ['t11-05', 'aula', '2026-12-10', '', 5, 'Precificação de OP', 'Ronin', ''],
  ['t11-06', 'aula', '2026-12-15', '', 6, 'Vendas', '', ''],
  ['t11-07', 'aula', '2026-12-17', '', 7, 'Vendas', '', ''],
  ['t11-08', 'aula', '2027-01-05', '', 8, 'Vendas', '', ''],
  ['t11-09', 'aula', '2027-01-07', '', 9, 'Pós-vendas', '', ''],
  ['t11-10', 'aula', '2027-01-12', '', 10, 'Pós-vendas', '', ''],
  ['t11-11', 'aula', '2027-01-14', '', 11, 'Modelo de Negócios 2', 'Everdan', ''],
  ['t11-12', 'tnf', '2027-01-18', '2027-01-23', '', 'Treinamento de Novos Franqueados (TNF)', '', ''],
  ['t11-13', 'aula', '2027-01-26', '', 12, 'Gestão de Pessoas', 'Régis', ''],
  ['t11-14', 'folga', '2027-02-09', '', '', 'Sem aula: Carnaval', '', ''],
  ['t11-15', 'aula', '2027-02-16', '', 13, 'Atendimento', 'Maria', ''],
  ['t11-16', 'aula', '2027-02-23', '', 14, 'Atendimento', 'Maria', ''],
  ['t11-17', 'aula', '2027-03-02', '', 15, 'Relacionamento', 'Babi', ''],
  ['t11-18', 'aula', '2027-03-09', '', 16, 'Relacionamento', 'Babi', ''],
  ['t11-19', 'aula', '2027-03-16', '', 17, 'Relacionamento', 'Babi', ''],
  ['t11-20', 'aula', '2027-03-23', '', 18, 'Produção', 'Alessandra', ''],
  ['t11-21', 'aula', '2027-03-31', '', 19, 'Produção', 'Alessandra', ''],
]
const PRAZOS_INICIAIS = [
  ['Mapeamento de mercado', 't11-01', 'depois'], ['Parceiros e atléticas', 't11-03', 'depois'],
  ['Mapeamento de fornecedores', 't11-04', 'depois'], ['Construção e validação da OP', 't11-05', 'depois'],
  ['Análise de concorrência', 't11-07', 'antes'], ['CNPJ e alvará', 't11-11', 'depois'],
  ['Contratação da equipe', 't11-13', 'depois'], ['Primeiras reuniões com turmas', 't11-15', 'depois'],
]
// As 4 jornadas do franqueado no Academy (uma por etapa) e a coluna de cada uma na IMPORTAÇÃO ACADEMY.
const CONFIG_ACADEMY_INICIAL = [
  ['1. Implantação', '%_1_franq', 'Implantação'],
  ['2. Inauguração', '%_2_franq', 'Inauguração'],
  ['3. Primeiro Fundo', '%_3_franq', 'Primeiro Fundo'],
  ['4. Ativação de Evento', '%_4_franq', 'Ativação do Evento'],
]

// ============================================================
// Menu da planilha
// ============================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('🗄️ Banco')
    .addItem('1. Preparar a planilha (abas e colunas)', 'prepararPlanilha')
    .addItem('2. Informar a pasta das listas de presença', 'configurarPasta')
    .addItem('3. Definir a senha inicial dos franqueados', 'definirSenhaInicial')
    .addItem('4. Redefinir a senha de um franqueado', 'redefinirSenhaFranqueado')
    .addItem('5. Criar ou trocar a senha de um admin', 'criarAdmin')
    .addSeparator()
    .addItem('Atualizar agora (Academy e presença)', 'atualizarTudo')
    .addItem('Ativar atualização diária às 8h', 'ativarDiario')
    .addItem('Desativar atualização diária', 'desativarDiario')
    .addToUi()
}

function prepararPlanilha() {
  const ss = SpreadsheetApp.getActive()
  const feitos = []
  if (ss.getSpreadsheetTimeZone() !== TZ) { acertarFuso(ss); feitos.push('fuso da planilha ajustado para Brasília') }
  Object.entries(REMOVER).forEach(([nome, cols]) => {
    const sh = ss.getSheetByName(nome)
    if (!sh || !sh.getLastColumn()) return
    const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String)
    cols.map(c => cab.indexOf(c)).filter(i => i >= 0).sort((a, b) => b - a).forEach(i => {
      sh.deleteColumn(i + 1)
      feitos.push(`${nome}: coluna removida ${cab[i]}`)
    })
  })
  Object.entries(ABAS).forEach(([nome, cab]) => {
    let sh = ss.getSheetByName(nome)
    if (!sh) {
      sh = ss.insertSheet(nome)
      feitos.push('aba criada: ' + nome)
    }
    const atual = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : []
    const faltam = cab.filter(c => !atual.includes(c))
    if (faltam.length) {
      let ultima = atual.length
      while (ultima > 0 && !atual[ultima - 1]) ultima--
      sh.getRange(1, ultima + 1, 1, faltam.length).setValues([faltam])
      if (atual.length) feitos.push(`${nome}: colunas novas ${faltam.join(', ')}`)
    }
    const n = sh.getLastColumn()
    sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#FC5B00').setFontColor('#ffffff')
    sh.setFrozenRows(1)
  })
  // Lista suspensa da coluna Trilha (as 4 jornadas do franqueado).
  const da = ss.getSheetByName('Disciplinas Academy')
  const colTrilha = da.getRange(1, 1, 1, da.getLastColumn()).getValues()[0].indexOf('Trilha') + 1
  if (colTrilha) da.getRange(2, colTrilha, da.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(CONFIG_ACADEMY_INICIAL.map(c => c[0]), true).setAllowInvalid(false).build())
  // IDs nas linhas que já existiam (para a plataforma conseguir desfazer um lançamento).
  ;['Aulas ao vivo', 'Disciplinas Academy', 'Avaliações', 'Entregas implantação', 'Extras', 'Ajustes de pontos', 'Conquistas', 'Atividades'].forEach(preencherIds)
  // Primeira carga: calendário, prazos e configuração das trilhas.
  const cal = ss.getSheetByName('Calendário')
  if (cal.getLastRow() < 2) {
    cal.getRange(2, 1, CALENDARIO_INICIAL.length, 10).setValues(CALENDARIO_INICIAL.map(([id, tipo, data, ate, n, tema, prof, link]) =>
      [id, 'T2026-11', tipo, data, ate, n, tema, prof, tipo === 'aula' ? '14h' : '', link]))
    feitos.push('calendário da turma T2026-11 carregado')
  }
  const pz = ss.getSheetByName('Prazos das entregas')
  if (pz.getLastRow() < 2) pz.getRange(2, 1, PRAZOS_INICIAIS.length, 4).setValues(PRAZOS_INICIAIS.map(([e, a, m]) => ['T2026-11', e, a, m]))
  const ca = ss.getSheetByName('Config Academy')
  if (ca.getLastRow() < 2) ca.getRange(2, 1, CONFIG_ACADEMY_INICIAL.length, 3).setValues(CONFIG_ACADEMY_INICIAL)
  // A aba de acessos fica escondida e protegida (só o dono edita).
  const ac = ss.getSheetByName('Acessos')
  ac.hideSheet()
  if (!ac.getProtections(SpreadsheetApp.ProtectionType.SHEET).length) {
    const prot = ac.protect().setDescription('Acessos da plataforma: só o script altera')
    prot.removeEditors(prot.getEditors().filter(u => u.getEmail() !== Session.getEffectiveUser().getEmail()))
  }
  SO_LEITURA.forEach(nome => ss.getSheetByName(nome).getRange(1, 1).setNote('Aba mantida pelo script. Não edite à mão.'))
  // Segredo do login (gerado uma vez).
  const props = PropertiesService.getScriptProperties()
  if (!props.getProperty('SEGREDO')) props.setProperty('SEGREDO', Utilities.getUuid() + Utilities.getUuid())
  registrar('Preparar planilha', feitos.length ? feitos.join(' · ') : 'nada a mudar')
  aviso('Planilha preparada.\n\n' + (feitos.join('\n') || 'Já estava tudo certo.') +
    '\n\nAs 4 jornadas do franqueado já estão ligadas às colunas %_1_franq a %_4_franq (aba Config Academy).')
}

// Mostra a mensagem na planilha; se a função rodar pelo editor do Apps Script, a mensagem vai para o registro de execução.
function aviso(msg) {
  try { SpreadsheetApp.getUi().alert(msg) } catch (e) { console.log(msg) }
}

function configurarPasta() {
  const ui = SpreadsheetApp.getUi()
  const r = ui.prompt('Pasta das listas de presença', 'Cole o link da pasta do Drive onde ficam as listas de presença do Meet.', ui.ButtonSet.OK_CANCEL)
  if (r.getSelectedButton() !== ui.Button.OK) return
  const id = (r.getResponseText().match(/[-\w]{25,}/) || [])[0]
  if (!id) return ui.alert('Não reconheci o link da pasta.')
  const pasta = DriveApp.getFolderById(id)
  PropertiesService.getScriptProperties().setProperty('PASTA_PRESENCA', id)
  ui.alert(`Pasta "${pasta.getName()}" configurada.`)
}

function ativarDiario() {
  desativarDiario()
  ScriptApp.newTrigger('atualizarTudo').timeBased().everyDays(1).atHour(HORA_DIARIA).inTimezone(TZ).create()
  SpreadsheetApp.getUi().alert(`Pronto: a planilha vai se atualizar todo dia por volta das ${HORA_DIARIA}h.`)
}

function desativarDiario() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'atualizarTudo').forEach(t => ScriptApp.deleteTrigger(t))
}

// ============================================================
// Atualização diária
// ============================================================
function atualizarTudo() {
  const etapas = [['Academy', importarAcademy], ['Presença', importarPresencas]]
  etapas.forEach(([nome, fn]) => {
    try { registrar(nome, fn()) } catch (e) { registrar(nome, 'ERRO: ' + e.message) }
  })
}

// Lê a IMPORTAÇÃO ACADEMY (sem alterar) e:
//   - grava o percentual de cada trilha em "Progresso Academy";
//   - quando uma trilha chega a 100%, registra a conclusão em "Disciplinas Academy" com a data de hoje.
// A importação traz o nome da pessoa: o franqueado é achado pela coluna "Nome no Academy" (ou pelo nome completo).
function importarAcademy() {
  const ss = SpreadsheetApp.getActive()
  const imp = ss.getSheetByName(IMPORTACAO)
  if (!imp) throw new Error(`Aba "${IMPORTACAO}" não encontrada.`)
  const [cab, ...linhas] = imp.getDataRange().getValues()
  const colNome = cab.indexOf('nome_completo')
  const porNome = {}
  linhas.forEach(l => { if (l[colNome]) porNome[normalizar(l[colNome])] = l })

  const config = ler('Config Academy').filter(c => c['Trilha*'] && cab.includes(c['Coluna na IMPORTAÇÃO ACADEMY*']))
  const franqueados = ler('Franqueados').filter(f => f['E-mail*'] && f['Ativo*'] !== 'Não' && f['Perfil*'] !== 'Admin')
  const jaConcluidas = new Set(ler('Disciplinas Academy').filter(d => d['Trilha']).map(d => chave(d['E-mail*'], d['Trilha'])))
  const hoje = hojeISO()
  const progresso = []
  const concluidas = []
  const semMatch = []
  // "Acessar o Academy" (Boas-vindas): marcado quando a pessoa tem progresso em qualquer curso da importação.
  const colunasPct = cab.map((h, j) => (/^%/.test(String(h)) ? j : -1)).filter(j => j >= 0)
  const jaAcessou = new Set(ler('Atividades').filter(a => a['Atividade*'] === 'Acessar o Academy').map(a => String(a['E-mail*']).toLowerCase()))
  const acessos = []

  franqueados.forEach(f => {
    const email = String(f['E-mail*']).trim().toLowerCase()
    const l = porNome[normalizar(f['Nome no Academy'] || f['Nome completo*'])]
    if (!l) return semMatch.push(f['Nome completo*'])
    if (!jaAcessou.has(email) && colunasPct.some(j => Number(l[j]) > 0)) acessos.push(email)
    config.forEach(c => {
      const v = l[cab.indexOf(c['Coluna na IMPORTAÇÃO ACADEMY*'])]
      const pct = v === '' || v === null ? 0 : Number(v)
      progresso.push([email, c['Trilha*'], Math.round(pct * 100), hoje])
      if (pct >= 1 && !jaConcluidas.has(chave(email, c['Trilha*']))) {
        concluidas.push({ 'E-mail*': email, 'Disciplina*': 'Trilha completa (100%)', 'Trilha': c['Trilha*'], 'Etapa*': c['Etapa'] || '', 'Data de conclusão*': hoje,
          'Prazo*': c['Prazo'] || '', 'Origem': 'Robô (Academy)', 'Lançado por': 'Robô', 'Lançado em': new Date() })
      }
    })
  })
  const pg = ss.getSheetByName('Progresso Academy')
  if (pg.getLastRow() > 1) pg.getRange(2, 1, pg.getLastRow() - 1, 4).clearContent()
  if (progresso.length) pg.getRange(2, 1, progresso.length, 4).setValues(progresso)
  concluidas.forEach(c => inserir('Disciplinas Academy', c))
  acessos.forEach(email => inserir('Atividades', { 'E-mail*': email, 'Atividade*': 'Acessar o Academy', 'Data*': hoje, 'Marcado por': 'Robô (Academy)' }))
  return `${franqueados.length - semMatch.length} franqueados achados · ${concluidas.length} trilhas concluídas hoje` + (acessos.length ? ` · ${acessos.length} com acesso ao Academy marcado` : '') +
    (semMatch.length ? ` · sem correspondência no Academy: ${semMatch.join(', ')} (preencha "Nome no Academy")` : '')
}

// Lê as listas de presença do Meet da pasta configurada que ainda não foram lidas.
// Aceita Planilha Google e .csv. Formato do relatório do Meet: Nome do participante, E-mail do participante,
// Duração, Horário de entrada, Horário de saída (o robô procura as colunas pelo conteúdo, em qualquer ordem).
// A aula é achada, nesta ordem: pelo código do Meet no nome do arquivo, pela data no nome do arquivo
// ou pela data do "Horário de entrada" dentro da lista.
// Quem estiver na lista conta como presente "Ao vivo" (sem tempo mínimo).
function importarPresencas() {
  const id = PropertiesService.getScriptProperties().getProperty('PASTA_PRESENCA')
  if (!id) return 'pasta das listas de presença não configurada (menu 🗄️ Banco → 2)'
  const lidos = new Set(ler('Arquivos de presença').map(a => a['ID do arquivo']))
  const aulas = ler('Calendário').filter(a => a['Tipo*'] === 'aula' && a['Data*'])
  const franqueados = ler('Franqueados').filter(f => f['E-mail*'])
  const porEmail = {}, porNome = {}
  franqueados.forEach(f => {
    const email = String(f['E-mail*']).trim().toLowerCase()
    porEmail[email] = email
    porNome[normalizar(f['Nome completo*'])] = email
    if (f['Nome no Academy']) porNome[normalizar(f['Nome no Academy'])] = email
  })
  const jaTem = new Set(ler('Aulas ao vivo').map(a => chave(a['E-mail*'], a['Nº da aula*'])))
  let arquivos = 0, presencas = 0, ignorados = 0
  const arqs = DriveApp.getFolderById(id).getFiles()
  while (arqs.hasNext()) {
    const arq = arqs.next()
    if (lidos.has(arq.getId())) continue
    const tipo = arq.getMimeType()
    if (tipo !== MimeType.GOOGLE_SHEETS && tipo !== MimeType.CSV && !/\.csv$/i.test(arq.getName())) {
      if (/spreadsheetml|ms-excel/.test(tipo)) {
        inserir('Arquivos de presença', { 'ID do arquivo': arq.getId(), 'Nome do arquivo': arq.getName(), 'Lido em': new Date(), 'Aula': '', 'Pessoas encontradas': 0,
          'Observação': 'Arquivo do Excel: abra no Drive e use Arquivo → Salvar como Planilhas Google. Depois apague esta linha.' })
      } else ignorados++
      continue
    }
    const linhas = linhasDoArquivo(arq)
    const aula = aulaDoArquivo(arq.getName(), aulas) || aulaPelasDatas(linhas, aulas)
    if (!aula) {
      inserir('Arquivos de presença', { 'ID do arquivo': '', 'Nome do arquivo': arq.getName(), 'Lido em': new Date(), 'Aula': '', 'Pessoas encontradas': 0,
        'Observação': 'Não achei a aula: a data dos horários de entrada não bate com nenhuma aula da aba Calendário.' })
      continue
    }
    const pessoas = pessoasDaLista(linhas, porEmail, porNome)
    pessoas.forEach(email => {
      if (jaTem.has(chave(email, aula['Nº da aula']))) return
      inserir('Aulas ao vivo', { 'E-mail*': email, 'Nº da aula*': aula['Nº da aula'], 'Data da aula*': iso(aula['Data*']), 'Participação*': 'Ao vivo',
        'Origem': 'Robô (lista do Meet)', 'Lançado por': 'Robô', 'Lançado em': new Date() })
      jaTem.add(chave(email, aula['Nº da aula']))
      presencas++
    })
    inserir('Arquivos de presença', { 'ID do arquivo': arq.getId(), 'Nome do arquivo': arq.getName(), 'Lido em': new Date(),
      'Aula': `#${aula['Nº da aula']} · ${iso(aula['Data*'])}`, 'Pessoas encontradas': pessoas.length,
      'Observação': pessoas.length ? '' : 'Ninguém da lista bate com a aba Franqueados (e-mail ou nome completo).' })
    arquivos++
  }
  return `${arquivos} listas novas lidas · ${presencas} presenças lançadas` + (ignorados ? ` · ${ignorados} arquivos de outro tipo ignorados` : '')
}

// Todas as linhas do arquivo (todas as abas, se for Planilha Google). Datas da planilha vêm como Date.
function linhasDoArquivo(arq) {
  if (arq.getMimeType() === MimeType.GOOGLE_SHEETS) {
    return SpreadsheetApp.openById(arq.getId()).getSheets().reduce((tudo, sh) => tudo.concat(sh.getDataRange().getValues()), [])
  }
  return Utilities.parseCsv(arq.getBlob().getDataAsString())
}

function aulaDoArquivo(nome, aulas) {
  const n = String(nome)
  const codigo = (n.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/i) || [])[0]
  if (codigo) {
    const a = aulas.find(x => String(x['Link do Meet'] || '').toLowerCase().includes(codigo.toLowerCase()))
    if (a) return a
  }
  return aulaDaData(n, aulas)
}

// Acha a aula pela primeira data escrita no texto (2026-11-12, 12/11/2026, 12/11, 12-11, 12.11).
function aulaDaData(texto, aulas) {
  const n = String(texto)
  let m = n.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m) return aulas.find(a => iso(a['Data*']) === `${m[1]}-${m[2]}-${m[3]}`)
  m = n.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/)
  if (!m) return null
  const dd = m[1].padStart(2, '0'), mm = m[2].padStart(2, '0')
  return aulas.find(a => iso(a['Data*']).slice(5) === `${mm}-${dd}` && (!m[3] || iso(a['Data*']).slice(2, 4) === m[3].slice(-2)))
}

// Sem data no nome: usa a data que mais aparece nas células com data e hora (o "Horário de entrada").
function aulaPelasDatas(linhas, aulas) {
  const conta = {}
  linhas.forEach(l => l.forEach(c => {
    let d = ''
    if (c instanceof Date) { if (c.getFullYear() >= 2020) d = iso(c) }
    else {
      const t = String(c)
      let m = t.match(/(20\d\d)-(\d{2})-(\d{2})/)
      if (m) d = `${m[1]}-${m[2]}-${m[3]}`
      else if ((m = t.match(/(\d{1,2})\/(\d{1,2})\/(20\d\d)/))) d = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    }
    if (d) conta[d] = (conta[d] || 0) + 1
  }))
  const datas = Object.keys(conta).sort((a, b) => conta[b] - conta[a])
  for (const d of datas) {
    const a = aulas.find(x => iso(x['Data*']) === d)
    if (a) return a
  }
  return null
}

// Reconhece a pessoa pelo e-mail; se não houver, pelo nome (inteiro numa célula ou nome + sobrenome em células vizinhas).
// Telefones e salas do Meet não batem com ninguém e são ignorados.
function pessoasDaLista(linhas, porEmail, porNome) {
  const achados = new Set()
  linhas.forEach(l => {
    const cel = l.map(c => (c instanceof Date ? '' : String(c).trim()))
    let achou = false
    cel.forEach(t => {
      const email = (t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0]
      if (email && porEmail[email.toLowerCase()]) { achados.add(porEmail[email.toLowerCase()]); achou = true }
    })
    if (achou) return
    cel.forEach((t, i) => {
      if (t && porNome[normalizar(t)]) achados.add(porNome[normalizar(t)])
      else if (t && cel[i + 1] && porNome[normalizar(t + ' ' + cel[i + 1])]) achados.add(porNome[normalizar(t + ' ' + cel[i + 1])])
    })
  })
  return [...achados]
}

// ============================================================
// Login (sem depender do Academy)
//   - Franqueado: entra com o e-mail. No primeiro acesso usa a SENHA INICIAL (igual para todos, definida
//     pelo menu 🗄️ Banco → 3) e a plataforma pede para ele criar a senha dele.
//   - Admin: senha própria (menu 🗄️ Banco → 5).
//   Nenhuma senha fica legível: a planilha e as propriedades guardam só o hash (código embaralhado).
// ============================================================
const SAL_INICIAL = 'senha-inicial'

function definirSenhaInicial() {
  const ui = SpreadsheetApp.getUi()
  const s = ui.prompt('Senha inicial dos franqueados', 'Senha do primeiro acesso, igual para todos (mínimo 8 caracteres).\nNo primeiro login cada franqueado cria a própria senha.', ui.ButtonSet.OK_CANCEL)
  if (s.getSelectedButton() !== ui.Button.OK) return
  if (s.getResponseText().length < 8) return ui.alert('A senha precisa ter pelo menos 8 caracteres.')
  PropertiesService.getScriptProperties().setProperty('SENHA_INICIAL_HASH', hashSenha(s.getResponseText(), SAL_INICIAL))
  ui.alert('Senha inicial salva. Quem ainda não criou a própria senha entra com ela.')
}

function redefinirSenhaFranqueado() {
  const ui = SpreadsheetApp.getUi()
  const e = ui.prompt('Redefinir senha', 'E-mail do franqueado. Ele volta a entrar com a senha inicial e cria uma nova:', ui.ButtonSet.OK_CANCEL)
  if (e.getSelectedButton() !== ui.Button.OK) return
  try { voltarParaSenhaInicial(e.getResponseText().trim().toLowerCase()); ui.alert('Pronto: no próximo login ele usa a senha inicial e cria uma nova.') }
  catch (err) { ui.alert(err.message) }
}

function voltarParaSenhaInicial(email) {
  const ac = acessoDe(email)
  if (ac && ac['Perfil'] === 'Admin') throw new Error('Esse e-mail é de admin. Use a opção 5 do menu.')
  if (!ler('Franqueados').some(f => String(f['E-mail*']).trim().toLowerCase() === email)) throw new Error('Franqueado não encontrado: ' + email)
  if (ac) atualizar('Acessos', ac._linha, { 'Sal': '', 'Senha (hash)': '' })
}

function temSenhaPropria(email) {
  const ac = acessoDe(email)
  return !!(ac && ac['Senha (hash)'])
}

function senhaFranqueadoConfere(email, senha) {
  const ac = acessoDe(email)
  if (ac && ac['Senha (hash)']) return hashSenha(senha, ac['Sal']) === ac['Senha (hash)']
  const inicial = PropertiesService.getScriptProperties().getProperty('SENHA_INICIAL_HASH')
  if (!inicial) throw new Error('O acesso dos franqueados ainda não foi liberado. Fale com a equipe.')
  return hashSenha(senha, SAL_INICIAL) === inicial
}

function criarAdmin() {
  const ui = SpreadsheetApp.getUi()
  const e = ui.prompt('Acesso de admin', 'E-mail do admin:', ui.ButtonSet.OK_CANCEL)
  if (e.getSelectedButton() !== ui.Button.OK) return
  const s = ui.prompt('Acesso de admin', 'Senha (mínimo 8 caracteres). Ela não fica visível em lugar nenhum:', ui.ButtonSet.OK_CANCEL)
  if (s.getSelectedButton() !== ui.Button.OK) return
  if (s.getResponseText().length < 8) return ui.alert('A senha precisa ter pelo menos 8 caracteres.')
  definirSenha(e.getResponseText().trim().toLowerCase(), s.getResponseText(), 'Admin')
  ui.alert('Acesso de admin salvo.')
}


function definirSenha(email, senha, perfil) {
  const sal = Utilities.getUuid()
  const dados = { 'Perfil': perfil, 'Sal': sal, 'Senha (hash)': hashSenha(senha, sal) }
  const ac = acessoDe(email)
  if (ac) atualizar('Acessos', ac._linha, dados)
  else inserir('Acessos', { 'E-mail': email, 'Último acesso': '', ...dados })
}

function segredo() {
  const props = PropertiesService.getScriptProperties()
  if (!props.getProperty('SEGREDO')) props.setProperty('SEGREDO', Utilities.getUuid() + Utilities.getUuid())
  return props.getProperty('SEGREDO')
}

function hashSenha(senha, sal) {
  let h = sal + '|' + senha + '|' + segredo()
  for (let i = 0; i < 1500; i++) h = hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h, Utilities.Charset.UTF_8))
  return h
}

function acessoDe(email) {
  return ler('Acessos').find(a => String(a['E-mail']).toLowerCase() === email)
}

// Token assinado: e-mail|perfil|validade + assinatura HMAC. "Lembrar de mim" = 30 dias; senão 12 horas.
function emitirToken(email, perfil, lembrar) {
  const exp = Date.now() + (lembrar ? 30 * 864e5 : 12 * 36e5)
  const corpo = Utilities.base64EncodeWebSafe(`${email}|${perfil}|${exp}`)
  return corpo + '.' + assinar(corpo)
}

function lerToken(token) {
  const [corpo, ass] = String(token || '').split('.')
  if (!corpo || ass !== assinar(corpo)) throw new Error('Sessão inválida. Entre de novo.')
  const [email, perfil, exp] = Utilities.newBlob(Utilities.base64DecodeWebSafe(corpo)).getDataAsString().split('|')
  if (Date.now() > Number(exp)) throw new Error('Sua sessão expirou. Entre de novo.')
  return { email, perfil }
}

function assinar(texto) {
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(texto, segredo())).replace(/=+$/, '')
}

// Limita tentativas erradas: 5 por e-mail a cada 15 minutos.
function checarTentativas(email) {
  const c = CacheService.getScriptCache()
  if (Number(c.get('t:' + email) || 0) >= 5) throw new Error('Muitas tentativas. Espere 15 minutos e tente de novo.')
}
function errouSenha(email) {
  const c = CacheService.getScriptCache()
  c.put('t:' + email, String(Number(c.get('t:' + email) || 0) + 1), 900)
}

// ============================================================
// App da Web: a plataforma chama este endereço com POST {acao, ...}
// ============================================================
function doPost(e) {
  let saida
  try {
    const req = JSON.parse(e.postData.contents)
    saida = { ok: true, dados: rotear(req) }
  } catch (err) {
    saida = { ok: false, erro: err.message }
  }
  return ContentService.createTextOutput(JSON.stringify(saida)).setMimeType(ContentService.MimeType.JSON)
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, servico: 'Jornada de Novos Franqueados' })).setMimeType(ContentService.MimeType.JSON)
}

const ACOES_PUBLICAS = {
  // `usuario`: e-mail do admin ou do franqueado.
  login: ({ usuario, senha, lembrar }) => {
    usuario = String(usuario || '').trim().toLowerCase()
    senha = String(senha || '')
    if (!usuario || !senha) throw new Error('Informe usuário e senha.')
    checarTentativas(usuario)
    const ac = acessoDe(usuario)
    if (ac && ac['Perfil'] === 'Admin') {
      if (hashSenha(senha, ac['Sal']) !== ac['Senha (hash)']) { errouSenha(usuario); throw new Error('Usuário ou senha incorretos.') }
      atualizar('Acessos', ac._linha, { 'Último acesso': new Date() })
      return { token: emitirToken(usuario, 'Admin', lembrar), perfil: 'Admin' }
    }
    const f = ler('Franqueados').find(x => x['Perfil*'] !== 'Admin' && String(x['E-mail*']).trim().toLowerCase() === usuario)
    if (!f) { errouSenha(usuario); throw new Error('E-mail não encontrado na Jornada. Confira o e-mail ou fale com a equipe.') }
    if (f['Ativo*'] === 'Não') throw new Error('Seu acesso está desativado. Fale com a equipe.')
    const email = String(f['E-mail*']).trim().toLowerCase()
    if (!senhaFranqueadoConfere(email, senha)) { errouSenha(usuario); throw new Error('E-mail ou senha incorretos.') }
    const meu = acessoDe(email)
    if (meu) atualizar('Acessos', meu._linha, { 'Último acesso': new Date() })
    else inserir('Acessos', { 'E-mail': email, 'Perfil': 'Franqueado', 'Último acesso': new Date() })
    // Primeiro login: conquista Largada e atividade "Primeiro acesso à plataforma".
    if (!ler('Conquistas').some(c => String(c['E-mail*']).toLowerCase() === email && c['Conquista*'] === 'Largada')) {
      inserir('Conquistas', { 'E-mail*': email, 'Conquista*': 'Largada', 'Data*': hojeISO(), 'Marcado por': 'Plataforma' })
    }
    if (!ler('Atividades').some(a => String(a['E-mail*']).toLowerCase() === email && a['Atividade*'] === 'Primeiro acesso à plataforma')) {
      inserir('Atividades', { 'E-mail*': email, 'Atividade*': 'Primeiro acesso à plataforma', 'Data*': hojeISO(), 'Marcado por': 'Plataforma' })
    }
    return { token: emitirToken(email, 'Franqueado', lembrar), perfil: 'Franqueado', criarSenha: !temSenhaPropria(email) }
  },
}


const ACOES_FRANQUEADO = {
  // Foto de perfil: JPEG pequeno (já reduzido na plataforma), guardado na aba escondida Acessos. '' remove.
  salvarFoto: (u, { foto }) => {
    foto = String(foto || '')
    if (foto && (!/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(foto) || foto.length > 48000)) throw new Error('Foto inválida ou grande demais. Tente outra imagem.')
    const ac = acessoDe(u.email)
    if (ac) atualizar('Acessos', ac._linha, { 'Foto': foto })
    else inserir('Acessos', { 'E-mail': u.email, 'Perfil': 'Franqueado', 'Último acesso': '', 'Foto': foto })
    return { ok: true }
  },
  // Primeiro acesso: cria a senha. Depois: troca, informando a senha atual.
  trocarSenha: (u, { nova, atual }) => {
    nova = String(nova || '')
    if (nova.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.')
    if (temSenhaPropria(u.email)) {
      checarTentativas(u.email)
      if (!senhaFranqueadoConfere(u.email, String(atual || ''))) { errouSenha(u.email); throw new Error('Senha atual incorreta.') }
    }
    const inicial = PropertiesService.getScriptProperties().getProperty('SENHA_INICIAL_HASH')
    if (inicial && hashSenha(nova, SAL_INICIAL) === inicial) throw new Error('Escolha uma senha diferente da senha inicial.')
    definirSenha(u.email, nova, 'Franqueado')
    return { ok: true }
  },
  meusDados: u => pacoteDoFranqueado(u.email),
  concluirAtividade: (u, { atividade }) => {
    const permitidas = ['Primeiro acesso à plataforma', 'Ler o Guia da Jornada', 'Consultar o calendário da turma', 'Acessar o Academy']
    if (!permitidas.includes(atividade)) throw new Error('Atividade não pode ser marcada pelo franqueado.')
    if (!ler('Atividades').some(a => a['E-mail*'] === u.email && a['Atividade*'] === atividade)) {
      inserir('Atividades', { 'E-mail*': u.email, 'Atividade*': atividade, 'Data*': hojeISO(), 'Marcado por': 'Plataforma' })
    }
    return pacoteDoFranqueado(u.email)
  },
  trocar: (u, { codigo }) => {
    const b = ler('Benefícios').find(x => x['Código*'] === codigo && x['Ativo*'] !== 'Não')
    if (!b || Number(b['Estoque*']) <= 0) throw new Error('Benefício indisponível.')
    inserir('Trocas', { 'Data': hojeISO(), 'E-mail': u.email, 'Código do benefício': codigo, 'Benefício': b['Nome*'], 'Pontos': Number(b['Custo em pontos*']) })
    atualizar('Benefícios', b._linha, { 'Estoque*': Number(b['Estoque*']) - 1 })
    return pacoteDoFranqueado(u.email)
  },
}

// Ações do admin. `lancar` grava o fato na aba certa; os pontos a plataforma calcula a partir dos fatos.
const ACOES_ADMIN = {
  redefinirSenha: (u, { email }) => { voltarParaSenhaInicial(String(email || '').toLowerCase()); return { email } },
  painel: () => ({
    turmas: ler('Turmas').map(limpo), calendario: ler('Calendário').map(limpo), prazos: ler('Prazos das entregas').map(limpo),
    beneficios: ler('Benefícios').map(limpo), trocas: ler('Trocas').map(limpo),
    franqueados: ler('Franqueados').filter(f => f['E-mail*'] && f['Perfil*'] !== 'Admin').map(f => pacoteDoFranqueado(String(f['E-mail*']).toLowerCase(), true)),
  }),
  lancar: (u, { emails, tipo, dados }) => {
    const ABA_DO_TIPO = { aula: 'Aulas ao vivo', disciplina: 'Disciplinas Academy', avaliacao: 'Avaliações', entrega: 'Entregas implantação', extra: 'Extras', ajuste: 'Ajustes de pontos' }
    const aba = ABA_DO_TIPO[tipo]
    if (!aba) throw new Error('Tipo de lançamento desconhecido.')
    const ids = (emails || []).map(email => inserir(aba, { ...dados, 'E-mail*': String(email).toLowerCase(), 'Origem': 'Equipe', 'Lançado por': u.email, 'Lançado em': new Date(), ...(tipo === 'ajuste' ? { 'Lançado por*': u.email } : {}) }))
    return { aba, ids }
  },
  desfazer: (u, { aba, id }) => {
    const permitidas = ['Aulas ao vivo', 'Disciplinas Academy', 'Avaliações', 'Entregas implantação', 'Extras', 'Ajustes de pontos', 'Conquistas', 'Atividades', 'Trocas']
    if (!permitidas.includes(aba)) throw new Error('Aba não permitida.')
    apagarPorId(aba, id)
    return { aba, id }
  },
  conquista: (u, { email, conquista, ganhou }) => {
    const atual = ler('Conquistas').find(c => c['E-mail*'] === email && c['Conquista*'] === conquista)
    if (ganhou && !atual) inserir('Conquistas', { 'E-mail*': email, 'Conquista*': conquista, 'Data*': hojeISO(), 'Marcado por': u.email })
    if (!ganhou && atual) apagarPorId('Conquistas', atual['ID'])
    return pacoteDoFranqueado(email, true)
  },
  marcarAtividade: (u, { email, atividade, feita }) => {
    const atual = ler('Atividades').find(a => a['E-mail*'] === email && a['Atividade*'] === atividade)
    if (feita && !atual) inserir('Atividades', { 'E-mail*': email, 'Atividade*': atividade, 'Data*': hojeISO(), 'Marcado por': u.email })
    if (!feita && atual) apagarPorId('Atividades', atual['ID'])
    return pacoteDoFranqueado(email, true)
  },
  // Exclui o cadastro e o acesso. Os lançamentos (pontos, presenças etc.) ficam na planilha como histórico.
  excluirFranqueado: (u, { email }) => {
    email = String(email || '').trim().toLowerCase()
    const f = ler('Franqueados').find(x => String(x['E-mail*']).trim().toLowerCase() === email && x['Perfil*'] !== 'Admin')
    if (!f) throw new Error('Cadastro não encontrado (pode já ter sido excluído).')
    SpreadsheetApp.getActive().getSheetByName('Franqueados').deleteRow(f._linha)
    delete CACHE['Franqueados']
    const ac = acessoDe(email)
    if (ac && ac['Perfil'] !== 'Admin') { SpreadsheetApp.getActive().getSheetByName('Acessos').deleteRow(ac._linha); delete CACHE['Acessos'] }
    return { email }
  },
  salvarFranqueado: (u, { dados, emailAntigo }) => {
    const email = String(dados.email || '').trim().toLowerCase()
    if (!dados.nome || !email.includes('@')) throw new Error('Informe nome e um e-mail válido.')
    const lista = ler('Franqueados')
    if (lista.some(f => String(f['E-mail*']).toLowerCase() === email && email !== emailAntigo)) throw new Error('Já existe um franqueado com esse e-mail.')
    const linha = { 'E-mail*': email, 'Nome completo*': dados.nome, 'Cidade': dados.cidade || dados.franquia || '', 'UF': dados.uf || '',
      'WhatsApp': foneBR(dados.whatsapp), 'Código da turma*': dados.turma || '', 'Perfil*': 'Franqueado', 'Ativo*': dados.ativo === false ? 'Não' : 'Sim', 'Nome no Academy': dados.nomeAcademy || '', 'Login do Moodle': dados.loginMoodle || '' }
    const atual = emailAntigo && lista.find(f => String(f['E-mail*']).toLowerCase() === emailAntigo)
    if (atual) atualizar('Franqueados', atual._linha, linha)
    else inserir('Franqueados', linha)
    return { email }
  },
  salvarTurma: (u, { t }) => {
    if (ler('Turmas').some(x => x['Código da turma*'] === t.codigo)) throw new Error('Já existe uma turma com esse código.')
    inserir('Turmas', { 'Código da turma*': t.codigo, 'Nome da turma*': t.nome, 'Cronograma (cidade)': t.cronograma || '', 'Data de início*': t.inicio, 'Data de fim*': t.fim })
    return ler('Turmas').map(limpo)
  },
  salvarAula: (u, { codigoTurma, aula }) => {
    const linha = { 'ID': aula.id || novoId(), 'Código da turma*': codigoTurma, 'Tipo*': aula.tipo || 'aula', 'Data*': aula.data, 'Até': aula.fim || '',
      'Nº da aula': aula.numero || '', 'Tema*': aula.tema, 'Professor(a)': aula.professor || '', 'Horário': aula.horario || '14h', 'Link do Meet': aula.link || '' }
    const atual = ler('Calendário').find(a => a['ID'] === linha['ID'])
    if (atual) atualizar('Calendário', atual._linha, linha)
    else inserir('Calendário', linha)
    return ler('Calendário').map(limpo)
  },
  excluirAula: (u, { id }) => {
    apagarPorId('Calendário', id)
    ler('Prazos das entregas').filter(p => p['ID da aula'] === id).reverse().forEach(p => SpreadsheetApp.getActive().getSheetByName('Prazos das entregas').deleteRow(p._linha))
    delete CACHE['Prazos das entregas']
    return ler('Calendário').map(limpo)
  },
  salvarPrazo: (u, { codigoTurma, entrega, aulaId, momento }) => {
    const atual = ler('Prazos das entregas').find(p => p['Código da turma*'] === codigoTurma && p['Entrega*'] === entrega)
    const linha = { 'Código da turma*': codigoTurma, 'Entrega*': entrega, 'ID da aula': aulaId || '', 'Momento': momento || 'depois' }
    if (atual) atualizar('Prazos das entregas', atual._linha, linha)
    else inserir('Prazos das entregas', linha)
    return ler('Prazos das entregas').map(limpo)
  },
  // Cancela uma troca: apaga a linha em Trocas (os pontos voltam, porque o saldo é calculado dos fatos)
  // e devolve 1 unidade ao estoque do benefício.
  cancelarTroca: (u, { id }) => {
    const t = ler('Trocas').find(x => String(x['ID']) === String(id))
    if (!t) throw new Error('Troca não encontrada (pode já ter sido cancelada).')
    const b = ler('Benefícios').find(x => String(x['Código*']) === String(t['Código do benefício']))
    if (b) atualizar('Benefícios', b._linha, { 'Estoque*': Number(b['Estoque*'] || 0) + 1 })
    apagarPorId('Trocas', t['ID'])
    return { id }
  },
  // Exclui o benefício do catálogo. As trocas já feitas ficam na aba Trocas como histórico.
  excluirBeneficio: (u, { codigo }) => {
    const b = ler('Benefícios').find(x => String(x['Código*']) === String(codigo))
    if (!b) throw new Error('Benefício não encontrado (pode já ter sido excluído).')
    SpreadsheetApp.getActive().getSheetByName('Benefícios').deleteRow(b._linha)
    delete CACHE['Benefícios']
    return ler('Benefícios').map(limpo)
  },
  salvarBeneficio: (u, { b }) => {
    const linha = { 'Código*': b.codigo || novoId(), 'Nome*': b.nome, 'Descrição': b.descricao || '', 'Custo em pontos*': Number(b.custo), 'Estoque*': Number(b.estoque), 'Ativo*': b.ativo === false ? 'Não' : 'Sim', 'Emoji': b.emoji || 'presente' }
    const atual = ler('Benefícios').find(x => x['Código*'] === linha['Código*'])
    if (atual) atualizar('Benefícios', atual._linha, linha)
    else inserir('Benefícios', linha)
    return ler('Benefícios').map(limpo)
  },
}

function rotear(req) {
  if (ACOES_PUBLICAS[req.acao]) return comTrava(() => ACOES_PUBLICAS[req.acao](req))
  const u = lerToken(req.token)
  if (ACOES_FRANQUEADO[req.acao]) {
    if (u.perfil === 'Admin') throw new Error('Esta ação é do franqueado.')
    if (req.acao !== 'trocarSenha' && !temSenhaPropria(u.email)) throw new Error('Crie sua senha para continuar.')
    return comTrava(() => ACOES_FRANQUEADO[req.acao](u, req))
  }
  if (ACOES_ADMIN[req.acao]) {
    if (u.perfil !== 'Admin') throw new Error('Acesso só para a equipe.')
    return comTrava(() => ACOES_ADMIN[req.acao](u, req))
  }
  throw new Error('Ação desconhecida: ' + req.acao)
}

function comTrava(fn) {
  const trava = LockService.getScriptLock()
  trava.waitLock(20000)
  try { return fn() } finally { trava.releaseLock() }
}

// Tudo o que a plataforma precisa de um franqueado. Os pontos são calculados na plataforma a partir destes fatos.
function pacoteDoFranqueado(email, comoAdmin) {
  email = String(email).toLowerCase()
  const f = ler('Franqueados').find(x => String(x['E-mail*']).toLowerCase() === email)
  if (!f) throw new Error('Cadastro não encontrado.')
  const meu = aba => ler(aba).filter(x => String(x['E-mail*'] || x['E-mail']).toLowerCase() === email).map(limpo)
  const turma = f['Código da turma*']
  const pacote = {
    perfil: limpo(f),
    turma: limpo(ler('Turmas').find(t => t['Código da turma*'] === turma) || {}),
    calendario: ler('Calendário').filter(a => a['Código da turma*'] === turma).map(limpo),
    prazos: ler('Prazos das entregas').filter(p => p['Código da turma*'] === turma).map(limpo),
    aulas: meu('Aulas ao vivo'), disciplinas: meu('Disciplinas Academy'), avaliacoes: meu('Avaliações'),
    entregas: meu('Entregas implantação'), extras: meu('Extras'), ajustes: meu('Ajustes de pontos'),
    conquistas: meu('Conquistas'), atividades: meu('Atividades'), trocas: meu('Trocas'), progressoAcademy: meu('Progresso Academy'),
  }
  if (!comoAdmin) pacote.beneficios = ler('Benefícios').filter(b => b['Ativo*'] !== 'Não').map(limpo)
  pacote.foto = (acessoDe(email) || {})['Foto'] || ''
  if (comoAdmin) pacote.ultimoAcesso = iso((acessoDe(email) || {})['Último acesso'] || '')
  return pacote
}

// ============================================================
// Ajudantes de planilha
// ============================================================
// Leituras ficam guardadas durante a execução; qualquer gravação na aba limpa a cópia.
const CACHE = {}
function ler(nome) {
  if (CACHE[nome]) return CACHE[nome]
  const sh = SpreadsheetApp.getActive().getSheetByName(nome)
  if (!sh || sh.getLastRow() < 2) return (CACHE[nome] = [])
  const [cab, ...dados] = sh.getDataRange().getValues()
  return CACHE[nome] = dados.map((l, i) => ({ ...Object.fromEntries(cab.map((h, j) => [h, l[j]])), _linha: i + 2 }))
    .filter(o => cab.some(h => o[h] !== '' && o[h] !== null))
}

// Grava uma linha nova (colunas pelo nome). Devolve o ID da linha.
function inserir(nome, obj) {
  delete CACHE[nome]
  const sh = SpreadsheetApp.getActive().getSheetByName(nome)
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
  if (cab.includes('ID') && !obj['ID']) obj['ID'] = novoId()
  // Grava logo abaixo da última linha com a 1ª coluna preenchida (e-mail, código ou ID).
  // O appendRow pularia linhas que só têm formatação, lista suspensa, espaços ou fórmulas.
  const col1 = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : []
  let ultima = col1.length
  while (ultima > 0 && String(col1[ultima - 1][0]).trim() === '') ultima--
  sh.getRange(ultima + 2, 1, 1, cab.length).setValues([cab.map(h => (h in obj ? obj[h] : ''))])
  return obj['ID']
}

function atualizar(nome, linha, obj) {
  delete CACHE[nome]
  const sh = SpreadsheetApp.getActive().getSheetByName(nome)
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
  const atual = sh.getRange(linha, 1, 1, cab.length).getValues()[0]
  sh.getRange(linha, 1, 1, cab.length).setValues([cab.map((h, j) => (h in obj ? obj[h] : atual[j]))])
}

function apagarPorId(nome, id) {
  const alvo = ler(nome).find(x => x['ID'] === id)
  if (!alvo) throw new Error('Registro não encontrado (pode já ter sido apagado).')
  SpreadsheetApp.getActive().getSheetByName(nome).deleteRow(alvo._linha)
  delete CACHE[nome]
}

function preencherIds(nome) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nome)
  if (!sh || sh.getLastRow() < 2) return
  const cab = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
  const col = cab.indexOf('ID')
  if (col < 0) return
  const r = sh.getRange(2, 1, sh.getLastRow() - 1, cab.length)
  const v = r.getValues()
  let mudou = false
  v.forEach(l => { if (l[0] !== '' && !l[col]) { l[col] = novoId(); mudou = true } })
  if (mudou) sh.getRange(2, col + 1, v.length, 1).setValues(v.map(l => [l[col]]))
}

// Linha pronta para a plataforma: sem a coluna interna, datas em AAAA-MM-DD.
function limpo(o) {
  const out = {}
  Object.keys(o).forEach(k => { if (k !== '_linha') out[k] = o[k] instanceof Date ? iso(o[k]) : o[k] })
  return out
}

function registrar(etapa, resultado) {
  const ss = SpreadsheetApp.getActive()
  acertarFuso(ss)
  const sh = ss.getSheetByName('Registro do robô')
  if (!sh) return
  sh.insertRowAfter(1)
  // A linha nova herda o laranja do cabeçalho: volta para o formato normal.
  sh.getRange(2, 1, 1, 3).setBackground(null).setFontColor(null).setFontWeight('normal').setValues([[new Date(), etapa, String(resultado).slice(0, 4000)]])
  // Mostra dia e hora na coluna Quando (vale também para as linhas antigas).
  sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).setNumberFormat('dd/MM/yyyy HH:mm')
}

// A planilha mostra as horas no fuso dela; deixa sempre no horário de Brasília.
function acertarFuso(ss) {
  if (ss.getSpreadsheetTimeZone() !== TZ) ss.setSpreadsheetTimeZone(TZ)
}

const novoId = () => Utilities.getUuid().slice(0, 8)
const hojeISO = () => Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd')
const iso = v => (v instanceof Date ? Utilities.formatDate(v, TZ, 'yyyy-MM-dd') : String(v || '').slice(0, 10))
const chave = (...p) => p.map(x => normalizar(x)).join('|')
const hex = bytes => bytes.map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('')
const normalizar = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
function foneBR(v) {
  const d = String(v || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  return d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : String(v || '').trim()
}

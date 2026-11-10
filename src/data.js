// Dados de exemplo do protótipo. Na versão final virão da API / Academy.
// Regras de pontuação, entregas, extras e níveis: planilha "Pontuacao Universidade VIVA.xlsx".

// Protótipo: a senha é conferida no navegador pelo hash SHA-256. Isso NÃO é seguro
// para produção; na versão final o login de admin precisa ser validado num servidor.
export const ADMIN = {
  email: 'gestaodepessoas@vivaeventos.com.br',
  senhaSha256: '5a4e98e4a0a4280a6c5e3bbc335cbbec5491ff364c6742d4b92a545c02c4ecd8',
}

export const TURMAS = [
  { codigo: 'T2026-11', nome: 'Turma Novembro 2026', cronograma: 'São Luís – MA', inicio: '2026-11-12', fim: '2027-03-31', regras: {
    'Mapeamento de mercado': { aula: 't11-01', momento: 'depois' },
    'Parceiros e atléticas': { aula: 't11-03', momento: 'depois' },
    'Mapeamento de fornecedores': { aula: 't11-04', momento: 'depois' },
    'Construção e validação da OP': { aula: 't11-05', momento: 'depois' },
    'Análise de concorrência': { aula: 't11-07', momento: 'antes' },
    'CNPJ e alvará': { aula: 't11-11', momento: 'depois' },
    'Contratação da equipe': { aula: 't11-13', momento: 'depois' },
    'Primeiras reuniões com turmas': { aula: 't11-15', momento: 'depois' },
  },
    // Calendário enviado pela coordenação. tipo: aula | tnf (presencial) | folga. Professor vazio = a confirmar.
    aulas: [
      { id: 't11-01', tipo: 'aula', data: '2026-11-12', numero: 1, tema: 'Modelo de Negócios', professor: 'Everdan', horario: '14h', link: 'https://meet.google.com/qph-kgti-cce' },
      { id: 't11-02', tipo: 'aula', data: '2026-11-24', numero: 2, tema: 'Marketing', professor: 'Jhonny', horario: '14h' },
      { id: 't11-03', tipo: 'aula', data: '2026-11-26', numero: 3, tema: 'Marketing', professor: 'Guilherme', horario: '14h' },
      { id: 't11-04', tipo: 'aula', data: '2026-12-08', numero: 4, tema: 'Fornecedor', professor: '', horario: '14h' },
      { id: 't11-05', tipo: 'aula', data: '2026-12-10', numero: 5, tema: 'Precificação de OP', professor: 'Ronin', horario: '14h' },
      { id: 't11-06', tipo: 'aula', data: '2026-12-15', numero: 6, tema: 'Vendas', professor: '', horario: '14h' },
      { id: 't11-07', tipo: 'aula', data: '2026-12-17', numero: 7, tema: 'Vendas', professor: '', horario: '14h' },
      { id: 't11-08', tipo: 'aula', data: '2027-01-05', numero: 8, tema: 'Vendas', professor: '', horario: '14h' },
      { id: 't11-09', tipo: 'aula', data: '2027-01-07', numero: 9, tema: 'Pós-vendas', professor: '', horario: '14h' },
      { id: 't11-10', tipo: 'aula', data: '2027-01-12', numero: 10, tema: 'Pós-vendas', professor: '', horario: '14h' },
      { id: 't11-11', tipo: 'aula', data: '2027-01-14', numero: 11, tema: 'Modelo de Negócios 2', professor: 'Everdan', horario: '14h' },
      { id: 't11-12', tipo: 'tnf', data: '2027-01-18', fim: '2027-01-23', tema: 'Treinamento de Novos Franqueados (TNF)', professor: '', horario: '' },
      { id: 't11-13', tipo: 'aula', data: '2027-01-26', numero: 12, tema: 'Gestão de Pessoas', professor: 'Régis', horario: '14h' },
      { id: 't11-14', tipo: 'folga', data: '2027-02-09', tema: 'Sem aula: Carnaval', professor: '', horario: '' },
      { id: 't11-15', tipo: 'aula', data: '2027-02-16', numero: 13, tema: 'Atendimento', professor: 'Maria', horario: '14h' },
      { id: 't11-16', tipo: 'aula', data: '2027-02-23', numero: 14, tema: 'Atendimento', professor: 'Maria', horario: '14h' },
      { id: 't11-17', tipo: 'aula', data: '2027-03-02', numero: 15, tema: 'Relacionamento', professor: 'Babi', horario: '14h' },
      { id: 't11-18', tipo: 'aula', data: '2027-03-09', numero: 16, tema: 'Relacionamento', professor: 'Babi', horario: '14h' },
      { id: 't11-19', tipo: 'aula', data: '2027-03-16', numero: 17, tema: 'Relacionamento', professor: 'Babi', horario: '14h' },
      { id: 't11-20', tipo: 'aula', data: '2027-03-23', numero: 18, tema: 'Produção', professor: 'Alessandra', horario: '14h' },
      { id: 't11-21', tipo: 'aula', data: '2027-03-31', numero: 19, tema: 'Produção', professor: 'Alessandra', horario: '14h' },
    ],
  },
]

// Turma de exemplo. `feitas` = quantas atividades do mapa já foram concluídas, em ordem.
// `validadas` = entregas já lançadas pela equipe ([nome, situação]).
// `extras` = pontos extras já lançados pela equipe.
// No login de franqueado, o protótipo entra sempre como a primeira da lista.
export const FRANQUEADOS = [
  {
    id: 'ana', nome: 'Ana Souza', franquia: 'VIVA Exemplo', email: 'ana@exemplo.com', whatsapp: '(98) 999990001', turma: 'T2026-11', feitas: 2, pontos: 995, conquistas: ['Largada'],
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Parceiros e atléticas', 'Com atraso']],
    extras: [{ acao: 'Compartilhar um caso real na aula', data: '15/12' }],
  },
  {
    id: 'bruno', nome: 'Bruno Lima', franquia: 'VIVA São Luís', email: 'bruno@exemplo.com', whatsapp: '(98) 999990002', turma: 'T2026-11', feitas: 14, pontos: 1240, conquistas: ['Largada', 'Visão de Mercado'],
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Análise de concorrência', 'No prazo'], ['Mapeamento de fornecedores', 'No prazo'], ['Parceiros e atléticas', 'No prazo']],
    extras: [],
  },
  {
    id: 'carla', nome: 'Carla Mendes', franquia: 'VIVA Teresina', email: 'carla@exemplo.com', whatsapp: '(86) 999990003', turma: 'T2026-11', feitas: 9, pontos: 610, conquistas: ['Largada'],
    validadas: [['Mapeamento de mercado', 'No prazo']],
    extras: [],
  },
  {
    id: 'diego', nome: 'Diego Rocha', franquia: 'VIVA Belém', email: 'diego@exemplo.com', whatsapp: '(91) 999990004', turma: 'T2026-11', feitas: 3, pontos: 180, conquistas: [],
    validadas: [], extras: [],
  },
  {
    id: 'elisa', nome: 'Elisa Martins', franquia: 'VIVA Fortaleza', email: 'elisa@exemplo.com', whatsapp: '(85) 999990005', turma: 'T2026-11', feitas: 30, pontos: 1520, conquistas: ['Largada', 'Visão de Mercado', 'Presente no TNF', 'Portas Abertas'],
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Análise de concorrência', 'No prazo'], ['Mapeamento de fornecedores', 'No prazo'], ['Parceiros e atléticas', 'No prazo'], ['CNPJ e alvará', 'No prazo'], ['Contratação da equipe', 'Com atraso'], ['Ponto comercial', 'No prazo']],
    extras: [{ acao: 'Inaugurar a unidade na data planejada', data: '10/02' }],
  },
]


export const SEMESTRE = '12/11/2026 a 31/03/2027'

// Pontos de corte fixos: o nível muda assim que o acumulado atinge o corte.
export const NIVEIS = [
  { nome: 'Calouro', min: 0, desc: 'Acabou de entrar e está conhecendo o negócio' },
  { nome: 'Veterano', min: 200, desc: 'Já conhece a rotina do curso e participa da turma' },
  { nome: 'Monitor', min: 550, desc: 'Aplica o conteúdo na unidade e ajuda os colegas' },
  { nome: 'Formando', min: 900, desc: 'Reta final, com o projeto integrador em andamento' },
  { nome: 'Bacharel VIVA', min: 1700, desc: 'Concluiu a turma e está pronto para operar com autonomia' },
]

// Ações habituais do curso.
export const REGRAS = [
  { id: 'aula', acao: 'Participar da aula ao vivo', pontos: 20, obs: '19 aulas no semestre' },
  { id: 'avaliacao', acao: 'Passar na avaliação da aula', pontos: 10, obs: 'Vale também para quem assiste à gravação' },
  { id: 'disciplina', acao: 'Concluir uma disciplina no Academy', pontos: 30, obs: '14 disciplinas: 6 Implantação, 6 Inauguração, 2 Primeiro Fundo' },
  { id: 'prazo', acao: 'Bônus: disciplina concluída no prazo', pontos: 10, obs: 'Soma aos pontos da disciplina' },
  { id: 'prova', acao: 'Aprovação na prova e na banca do período', pontos: 100, obs: '3 períodos' },
  { id: 'projeto', acao: 'Aprovação no projeto integrador', pontos: 200, obs: '1 vez, no fim do semestre' },
]
export const pontosDe = id => REGRAS.find(r => r.id === id).pontos

// Entrega da implantação concluída com atraso vale esta fração dos pontos.
export const FATOR_ATRASO = 0.5

// Lista fixa para toda a turma. Validação pela Expansão no Sults.
// O prazo segue a aula ligada no calendário da turma (admin > Calendário): "antes" = dia da aula,
// "depois" = dia da próxima aula. Sem aula ligada, vale `prazo` (último dia do mês do prazo).
// A plataforma compara o prazo com a data de conclusão e sugere "No prazo" ou "Com atraso";
// a equipe confirma ou ajusta na validação.
export const ENTREGAS = [
  { nome: 'Mapeamento de mercado', aula: '#1 Modelo de Negócios', mes: 'Nov', prazo: '2026-11-30', pontos: 60 },
  { nome: 'Análise de concorrência', aula: '#7 Vendas', mes: 'Dez', prazo: '2026-12-31', pontos: 40 },
  { nome: 'Mapeamento de fornecedores', aula: '#4 Fornecedor', mes: 'Dez', prazo: '2026-12-31', pontos: 60 },
  { nome: 'Parceiros e atléticas', aula: '#3 Marketing', mes: 'Dez', prazo: '2026-12-31', pontos: 30 },
  { nome: 'CNPJ e alvará', aula: '#11 Modelo de Negócios 2', mes: 'Jan', prazo: '2027-01-31', pontos: 40 },
  { nome: 'Contratação da equipe', aula: '#12 Gestão de Pessoas', mes: 'Fev', prazo: '2027-02-28', pontos: 50 },
  { nome: 'Ponto comercial', aula: 'sem aula ligada', mes: 'Fev', prazo: '2027-02-28', pontos: 40 },
  { nome: 'Primeiras reuniões com turmas', aula: '#13 Atendimento', mes: 'Fev', prazo: '2027-02-28', pontos: 50 },
  { nome: 'Construção e validação da OP', aula: '#5 Precificação de OP', mes: 'Dez', prazo: '2026-12-31', pontos: 50 },
]


export const EXTRAS = [
  { acao: 'Inaugurar a unidade na data planejada', pontos: 50, max: 1 },
  { acao: 'Fechar o primeiro fundo', pontos: 100, max: 1 },
  { acao: 'Compartilhar um caso real na aula', pontos: 15, max: 3 },
]

// Catálogo inicial (ainda em definição). O admin cadastra e controla o estoque pelo painel.
// A troca é automática e baixa o estoque.
// Formato: { id: 'kit', nome: 'Kit VIVA', custo: 600, estoque: 20, emoji: '🎁', ativo: true }
export const BENEFICIOS = []

// Selos da jornada (não dão pontos). tipo: Todo mundo · Jornada · Marco da franquia · Esforço extra.
export const CONQUISTAS = [
  { nome: 'Largada', emoji: '🚩', icone: 'bandeira', quando: 'Primeiro login na plataforma', tipo: 'Todo mundo' },
  { nome: 'Visão de Mercado', emoji: '🔭', icone: 'grafico', quando: 'Aulas de Modelo de Negócio e Vendas + entregas Mapeamento de mercado e Análise de concorrência', tipo: 'Jornada' },
  { nome: 'Presente no TNF', emoji: '🤝', icone: 'pessoas', quando: 'Participar do Treinamento de Novos Franqueados', tipo: 'Jornada' },
  { nome: 'Portas Abertas', emoji: '🚪', icone: 'porta', quando: 'Inaugurar a unidade na data planejada', tipo: 'Marco da franquia' },
  { nome: 'Primeiro Fundo', emoji: '💰', icone: 'carteira', quando: 'Fechar o primeiro fundo', tipo: 'Marco da franquia' },
  { nome: 'Mestre do Academy', emoji: '📚', icone: 'livro', quando: 'Concluir as trilhas da Implantação, da Inauguração e do 1º Fundo', tipo: 'Esforço extra' },
  { nome: 'Voz da Turma', emoji: '🎤', icone: 'microfone', quando: 'Compartilhar 3 casos reais nas aulas', tipo: 'Esforço extra' },
  { nome: 'Formado na Universidade VIVA', emoji: '🎓', icone: 'formatura', quando: 'Concluir a jornada (aulas, provas e projeto integrador)', tipo: 'Todo mundo' },
]


export const NOTIFICACOES = [
  { emoji: '🏅', texto: 'Você subiu para o nível Monitor!', quando: 'hoje' },
  { emoji: '⭐', texto: '+40 pontos! Você concluiu Modelo de Negócio dentro do prazo.', quando: 'hoje' },
  { emoji: '⏰', texto: 'A entrega Análise de concorrência está prevista para dezembro.', quando: 'ontem' },
  { emoji: '✅', texto: 'Sua entrega Mapeamento de mercado foi validada pela Expansão.', quando: 'há 5 dias' },
]

export const MENU = [
  { id: 'inicio', icone: 'casa', nome: 'Início' },
  { id: 'jornada', icone: 'mapa', nome: 'Minha Jornada' },
  { id: 'pontos', icone: 'estrela', nome: 'Pontos' },
  { id: 'benef', icone: 'presente', nome: 'Benefícios' },
  { id: 'conq', icone: 'medalha', nome: 'Conquistas' },
  { id: 'calendario', icone: 'calendario', nome: 'Calendário da turma' },
  { id: 'guia', icone: 'livro', nome: 'Guia da Jornada' },
]

// Extrato e notificações de exemplo da primeira franqueada.
export const EXTRATO = [
  { data: '19/12', texto: 'Concluir uma disciplina no Academy + bônus de prazo: Modelo de Negócio', valor: 40, tipo: 'Programado' },
  { data: '17/12', texto: 'Participar da aula ao vivo', aula: 'Aula ao vivo #7 · Vendas', valor: 20, tipo: 'Programado' },
  { data: '17/12', texto: 'Passar na avaliação da aula', aula: 'Aula ao vivo #7 · Vendas', valor: 10, tipo: 'Programado' },
  { data: '15/12', texto: 'Compartilhar um caso real na aula', aula: 'Aula ao vivo #6 · Vendas', valor: 15, tipo: 'Extra' },
  { data: '12/12', texto: 'Entrega com atraso: Parceiros e atléticas', valor: 15, tipo: 'Programado' },
  { data: '28/11', texto: 'Entrega no prazo: Mapeamento de mercado', valor: 60, tipo: 'Programado' },
]

// Guia da Jornada em PDF no Google Drive. Enquanto estiver vazio, a página do Guia avisa que o link vem em breve.
export const GUIA_LINK = 'https://drive.google.com/file/d/1CFlhBGncPQA-aCb_ZX0r9IYSygSJshKz/view?usp=sharing'

// Links das trilhas no Academy.
export const ACADEMY = 'https://academy.vivaeventos.com.br'
const trilha = id => `${ACADEMY}/course/section.php?id=${id}`

// Modelo das etapas. O status de cada atividade é montado por franqueado (state.jsx):
// 0 = pendente, 1 = concluída, 2 = em andamento.
// x / y = posição do marcador no mapa do campus (%).
// Cada atividade: [nome, status inicial, detalhes]. Detalhes dizem o que a missão abre:
//   link (Academy), aulas (ids do calendário), entrega (nome), tela (página do app) ou nada.
export const ETAPAS = [
  { nome: 'Boas-vindas', emoji: '🚩', x: 13.7, y: 85, ate: 'até a 1ª aula (12/11)', atividades: [
    ['Primeiro acesso à plataforma', 0, {}],
    ['Ler o Guia da Jornada', 0, { tela: 'guia' }],
    ['Consultar o calendário da turma', 0, { tela: 'calendario' }],
    ['Acessar o Academy', 0, { link: ACADEMY }],
  ] },
  { nome: 'Implantação', emoji: '🧭', x: 26.3, y: 69.8, ate: 'da 1ª aula até o TNF', atividades: [
    ['Academy: Modelo de Negócio', 0, { link: trilha(332), pontos: 40 }],
    ['Aula ao vivo #1 · Modelo de Negócios', 0, { aulas: ['t11-01'] }],
    ['Entrega: Mapeamento de mercado', 0, { entrega: 'Mapeamento de mercado' }],
    ['Aulas ao vivo #2 e #3 · Marketing', 0, { aulas: ['t11-02', 't11-03'] }],
    ['Entrega: Parceiros e atléticas', 0, { entrega: 'Parceiros e atléticas' }],
    ['Aula ao vivo #4 · Fornecedor', 0, { aulas: ['t11-04'] }],
    ['Entrega: Mapeamento de fornecedores', 0, { entrega: 'Mapeamento de fornecedores' }],
    ['Aula ao vivo #5 · Precificação de OP', 0, { aulas: ['t11-05'] }],
    ['Entrega: Construção e validação da OP', 0, { entrega: 'Construção e validação da OP' }],
    ['Academy: Vendas', 0, { link: trilha(58), pontos: 40 }],
    ['Aulas ao vivo #6 a #8 · Vendas', 0, { aulas: ['t11-06', 't11-07', 't11-08'] }],
    ['Entrega: Análise de concorrência', 0, { entrega: 'Análise de concorrência' }],
    ['Academy: Pós-vendas', 0, { link: trilha(239), pontos: 40 }],
    ['Aulas ao vivo #9 e #10 · Pós-vendas', 0, { aulas: ['t11-09', 't11-10'] }],
    ['Academy: Cultura', 0, { link: trilha(309), pontos: 40 }],
    ['Academy: Administrativo-financeiro', 0, { link: trilha(208), pontos: 40 }],
    ['Aula ao vivo #11 · Modelo de Negócios 2', 0, { aulas: ['t11-11'] }],
    ['Entrega: CNPJ e alvará', 0, { entrega: 'CNPJ e alvará' }],
    ['Treinamento de Novos Franqueados (18 a 23/01)', 0, { aulas: ['t11-12'], tnf: true }],
    ['Prova e banca do período', 0, { pontos: 100 }],
  ] },
  { nome: 'Inauguração', emoji: '🏠', x: 40.8, y: 62.5, ate: 'Gestão de Pessoas e Atendimento', atividades: [
    ['Academy: Gestão de Pessoas', 0, { link: trilha(204), pontos: 40 }],
    ['Aula ao vivo #12 · Gestão de Pessoas', 0, { aulas: ['t11-13'] }],
    ['Entrega: Contratação da equipe', 0, { entrega: 'Contratação da equipe' }],
    ['Academy: Atendimento', 0, { link: trilha(205), pontos: 40 }],
    ['Aulas ao vivo #13 e #14 · Atendimento', 0, { aulas: ['t11-15', 't11-16'] }],
    ['Entrega: Primeiras reuniões com turmas', 0, { entrega: 'Primeiras reuniões com turmas' }],
    ['Entrega: Ponto comercial', 0, { entrega: 'Ponto comercial' }],
    ['Inaugurar a unidade', 0, {}],
    ['Prova e banca do período', 0, { pontos: 100 }],
  ] },
  { nome: 'Primeiro Fundo', emoji: '💰', icone: 'carteira', x: 55.6, y: 60.8, ate: 'Relacionamento', atividades: [
    ['Academy: Performance Rede VIVA', 0, { link: trilha(382), pontos: 40 }],
    ['Aulas ao vivo #15 a #17 · Relacionamento', 0, { aulas: ['t11-17', 't11-18', 't11-19'] }],
    ['Fechar o primeiro fundo', 0, {}],
  ] },
  { nome: 'Ativação do Evento', emoji: '🎪', x: 73.8, y: 59.7, ate: 'Produção', atividades: [
    ['Aulas ao vivo #18 e #19 · Produção', 0, { aulas: ['t11-20', 't11-21'] }],
    ['Projeto integrador', 0, { pontos: 200 }],
    ['Prova e banca do período', 0, { pontos: 100 }],
  ] },
  { nome: 'Formatura', emoji: '🎓', x: 90.5, y: 57.7, ate: 'quando concluir tudo', atividades: [
    ['Jornada concluída', 0, {}],
  ] },
]


export const fmt = n => n.toLocaleString('pt-BR')

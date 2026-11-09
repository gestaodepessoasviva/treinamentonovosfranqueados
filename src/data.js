// Dados de exemplo do protótipo. Na versão final virão da API / Academy.
// Regras de pontuação, entregas, extras e níveis: planilha "Pontuacao Universidade VIVA.xlsx".

// Protótipo: a senha é conferida no navegador pelo hash SHA-256. Isso NÃO é seguro
// para produção; na versão final o login de admin precisa ser validado num servidor.
export const ADMIN = {
  email: 'gestaodepessoas@gmail.com',
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
      { id: 't11-01', tipo: 'aula', data: '2026-11-12', numero: 1, tema: 'Modelo de Negócios', professor: 'Everdan', horario: '14h' },
      { id: 't11-02', tipo: 'aula', data: '2026-11-24', numero: 2, tema: 'Marketing', professor: 'Guilherme', horario: '14h' },
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
// `validadas` = entregas já validadas pela Expansão ([nome, situação]); `emValidacao` = aguardando ([nome, data de conclusão]).
// `extras` = ações extras registradas pelo franqueado.
// No login de franqueado, o protótipo entra sempre como a primeira da lista.
export const FRANQUEADOS = [
  {
    id: 'ana', nome: 'Ana Souza', franquia: 'VIVA Exemplo', email: 'ana@exemplo.com', whatsapp: '(98) 99999-0001', turma: 'T2026-11', feitas: 16, pontos: 995,
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Parceiros e atléticas', 'Com atraso']],
    emValidacao: [['Mapeamento de fornecedores', '2026-11-20'], ['Análise de concorrência', '2027-01-08']],
    extras: [{ acao: 'Compartilhar um caso real na aula', obs: 'Aula 6: negociação com atlética', data: '15/12', status: 'aprovado' }],
  },
  {
    id: 'bruno', nome: 'Bruno Lima', franquia: 'VIVA São Luís', email: 'bruno@exemplo.com', whatsapp: '(98) 99999-0002', turma: 'T2026-11', feitas: 22, pontos: 1240,
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Análise de concorrência', 'No prazo'], ['Mapeamento de fornecedores', 'No prazo'], ['Parceiros e atléticas', 'No prazo']],
    emValidacao: [['CNPJ e alvará', '2027-01-25']],
    extras: [
      { acao: 'Compartilhar um caso real na aula', obs: 'Aula 8: primeiro contrato com turma de Medicina', data: '05/01', status: 'pendente' },
      { acao: 'Participar do TNF', obs: 'Presente nos 6 dias', data: '23/01', status: 'pendente' },
    ],
  },
  {
    id: 'carla', nome: 'Carla Mendes', franquia: 'VIVA Teresina', email: 'carla@exemplo.com', whatsapp: '(86) 99999-0003', turma: 'T2026-11', feitas: 9, pontos: 610,
    validadas: [['Mapeamento de mercado', 'No prazo']],
    emValidacao: [['Parceiros e atléticas', '2026-12-03']],
    extras: [{ acao: 'Compartilhar um caso real na aula', obs: 'Aula 4: parceria com atlética de Direito', data: '02/12', status: 'pendente' }],
  },
  {
    id: 'diego', nome: 'Diego Rocha', franquia: 'VIVA Belém', email: 'diego@exemplo.com', whatsapp: '(91) 99999-0004', turma: 'T2026-11', feitas: 4, pontos: 180,
    validadas: [], emValidacao: [], extras: [],
  },
  {
    id: 'elisa', nome: 'Elisa Martins', franquia: 'VIVA Fortaleza', email: 'elisa@exemplo.com', whatsapp: '(85) 99999-0005', turma: 'T2026-11', feitas: 28, pontos: 1520,
    validadas: [['Mapeamento de mercado', 'No prazo'], ['Análise de concorrência', 'No prazo'], ['Mapeamento de fornecedores', 'No prazo'], ['Parceiros e atléticas', 'No prazo'], ['CNPJ e alvará', 'No prazo'], ['Contratação da equipe', 'Com atraso'], ['Ponto comercial', 'No prazo']],
    emValidacao: [['Construção e validação da OP', '2027-03-05']],
    extras: [{ acao: 'Inaugurar a unidade na data planejada', obs: 'Inauguração em 10/02', data: '10/02', status: 'aprovado' }],
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
// "depois" = dia da próxima aula. `prazo` aqui é o mesmo prazo, usado se a turma não tiver calendário.
// A plataforma compara o prazo com a data de conclusão e sugere "No prazo" ou "Com atraso";
// a equipe confirma ou ajusta na validação.
export const ENTREGAS = [
  { nome: 'Mapeamento de mercado', aula: '#1 Modelo de Negócios', mes: 'Nov', prazo: '2026-11-24', pontos: 60 },
  { nome: 'Análise de concorrência', aula: '#7 Vendas', mes: 'Dez', prazo: '2026-12-17', pontos: 40 },
  { nome: 'Mapeamento de fornecedores', aula: '#4 Fornecedor', mes: 'Dez', prazo: '2026-12-10', pontos: 60 },
  { nome: 'Parceiros e atléticas', aula: '#3 Marketing', mes: 'Dez', prazo: '2026-12-08', pontos: 30 },
  { nome: 'CNPJ e alvará', aula: '#11 Modelo de Negócios 2', mes: 'Jan', prazo: '2027-01-26', pontos: 40 },
  { nome: 'Contratação da equipe', aula: '#12 Gestão de Pessoas', mes: 'Fev', prazo: '2027-02-16', pontos: 50 },
  { nome: 'Ponto comercial', aula: 'sem aula ligada', mes: 'Fev', prazo: '2027-02-28', pontos: 40 },
  { nome: 'Primeiras reuniões com turmas', aula: '#13 Atendimento', mes: 'Fev', prazo: '2027-02-23', pontos: 50 },
  { nome: 'Construção e validação da OP', aula: '#5 Precificação de OP', mes: 'Dez', prazo: '2026-12-15', pontos: 50 },
]


export const EXTRAS = [
  { acao: 'Equipe com as trilhas do Academy concluídas', pontos: 40, max: 1 },
  { acao: 'Participar do TNF', pontos: 50, max: 1 },
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
  { nome: 'Largada', emoji: '🚩', quando: 'Primeiro login na plataforma', tipo: 'Todo mundo' },
  { nome: 'Visão de Mercado', emoji: '🔭', quando: 'Aulas de Modelo de Negócio e Vendas + mapeamento de mercado e de concorrentes', tipo: 'Jornada' },
  { nome: 'Presente no TNF', emoji: '🤝', quando: 'Participar do Treinamento de Novos Franqueados', tipo: 'Jornada' },
  { nome: 'Portas Abertas', emoji: '🚪', quando: 'Inaugurar a unidade na data planejada', tipo: 'Marco da franquia' },
  { nome: 'Primeiro Fundo', emoji: '💰', quando: 'Fechar o primeiro fundo', tipo: 'Marco da franquia' },
  { nome: 'Mestre do Academy', emoji: '📚', quando: 'Concluir as trilhas da Implantação, da Inauguração e do 1º Fundo', tipo: 'Esforço extra' },
  { nome: 'Voz da Turma', emoji: '🎤', quando: 'Compartilhar 3 casos reais nas aulas', tipo: 'Esforço extra' },
  { nome: 'Formado na Universidade VIVA', emoji: '🎓', quando: 'Concluir a jornada (aulas, provas e projeto integrador)', tipo: 'Todo mundo' },
]


export const NOTIFICACOES = [
  { emoji: '🏅', texto: 'Você subiu para o nível Monitor!', quando: 'hoje' },
  { emoji: '⭐', texto: '+40 pontos! Você concluiu Modelo de Negócio dentro do prazo.', quando: 'hoje' },
  { emoji: '⏰', texto: 'A entrega Análise de concorrência está prevista para dezembro.', quando: 'ontem' },
  { emoji: '✅', texto: 'Sua entrega Mapeamento de mercado foi validada pela Expansão.', quando: 'há 5 dias' },
]

export const MENU = [
  { id: 'inicio', emoji: '🏠', nome: 'Início' },
  { id: 'jornada', emoji: '🗺️', nome: 'Minha Jornada' },
  { id: 'pontos', emoji: '⭐', nome: 'Pontos' },
  { id: 'benef', emoji: '🎁', nome: 'Benefícios' },
  { id: 'conq', emoji: '🏅', nome: 'Conquistas' },
  { id: 'calendario', emoji: '📅', nome: 'Calendário da turma' },
  { id: 'guia', emoji: '📖', nome: 'Guia da Jornada' },
]

// Extrato e notificações de exemplo da primeira franqueada.
export const EXTRATO = [
  { data: '19/12', texto: 'Disciplina concluída no prazo: Modelo de Negócio', valor: 40 },
  { data: '17/12', texto: 'Aula ao vivo 6: presença', valor: 20 },
  { data: '17/12', texto: 'Avaliação da aula 6: aprovada', valor: 10 },
  { data: '15/12', texto: 'Caso real compartilhado na aula', valor: 15 },
  { data: '12/12', texto: 'Entrega com atraso (50%): Parceiros e atléticas', valor: 15 },
  { data: '28/11', texto: 'Entrega validada: Mapeamento de mercado', valor: 60 },
]

// Modelo das etapas. O status de cada atividade é montado por franqueado (state.jsx):
// 0 = pendente, 1 = concluída, 2 = em andamento.
// x / y = posição do marcador no mapa do campus (%).
export const ETAPAS = [
  { nome: 'Boas-vindas', emoji: '🚩', x: 13.7, y: 85, atividades: [['Primeiro acesso', 1], ['Entrar no grupo de WhatsApp', 1], ['Receber o Guia do Franqueado', 1], ['Confirmar leitura do Guia', 1], ['Consultar o calendário da jornada', 1], ['Acessar o Academy', 1]] },
  { nome: 'Implantação', emoji: '🧭', x: 26.3, y: 69.8, atividades: [['Academy: Método Empresarial', 1], ['Academy: Modelo de Negócio', 1], ['Academy: Marketing e Vendas', 1], ['Academy: Cultura VIVA e LGPD', 1], ['Aulas ao vivo da etapa', 1], ['Treinamento de Novos Franqueados', 1], ['Avaliação da fase', 1]] },
  { nome: 'Inauguração', emoji: '🏠', x: 40.8, y: 62.5, atividades: [['Academy da etapa', 1], ['Aula de Relacionamento', 1], ['Aula de Atendimento', 1], ['2ª reunião comercial', 2], ['Missão de campo', 0], ['Avaliação da fase', 0]] },
  { nome: 'Primeiro Fundo', emoji: '💰', x: 55.6, y: 60.8, atividades: [['Conteúdos específicos', 0], ['Acompanhamento do SAF', 0], ['SAF Produção', 0], ['Missão prática', 0], ['Pré-evento e 1º evento', 0], ['Avaliação da fase', 0]] },
  { nome: 'Ativação do Evento', emoji: '🎪', x: 73.8, y: 59.7, atividades: [['Operação aplicada', 0], ['Fechamento do evento', 0], ['Transferência das margens (se mantida)', 0], ['Entregas finais', 0], ['Projeto integrador', 0]] },
  { nome: 'Formatura', emoji: '🎓', x: 90.5, y: 57.7, atividades: [['Projeto concluído', 0], ['Avaliações concluídas', 0], ['Banca de aprovação final', 0], ['Jornada 100% concluída', 0]] },
]

export const fmt = n => n.toLocaleString('pt-BR')

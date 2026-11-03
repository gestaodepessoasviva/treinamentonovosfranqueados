// Dados de exemplo do protótipo. Na versão final virão da API / Academy.

export const USUARIO = { nome: 'Ana Souza', franquia: 'VIVA Exemplo' }

export const NIVEIS = [
  { nome: 'Largada', min: 0 },
  { nome: 'Em rota', min: 500 },
  { nome: 'Na estrada', min: 1200 },
  { nome: 'Reta final', min: 2200 },
  { nome: 'Formado', min: 3500 },
]

export const REGRAS = [
  { tag: 'Aprender', texto: 'Concluir conteúdo no Academy', pts: '+80', bonus: 'bônus +20 no prazo' },
  { tag: 'Aprender', texto: 'Passar no quiz (80% ou mais)', pts: '+30', bonus: '' },
  { tag: 'Participar', texto: 'Aula ao vivo (presença mínima)', pts: '+50', bonus: 'aula gravada +25' },
  { tag: 'Aplicar', texto: 'Missão de campo validada', pts: '+120', bonus: '' },
  { tag: 'Aplicar', texto: 'Projeto integrador aprovado', pts: '+200', bonus: 'bônus +30 no prazo' },
  { tag: 'Evoluir', texto: 'Aprovação na prova da fase', pts: '+150', bonus: '1ª tentativa +50' },
  { tag: 'Evoluir', texto: 'Concluir uma fase', pts: '+300', bonus: '' },
]

export const BENEFICIOS = [
  { nome: 'Live exclusiva com a diretoria', custo: 300, emoji: '🎤' },
  { nome: 'Kit VIVA', custo: 600, emoji: '🎁' },
  { nome: 'Mentoria com franqueado veterano', custo: 800, emoji: '🤝' },
  { nome: 'Convite para evento da rede', custo: 1500, emoji: '🎟️' },
]

export const CONQUISTAS = [
  { nome: 'Largada', emoji: '🚩' },
  { nome: 'Visão de mercado', emoji: '🔭' },
  { nome: 'Formado na VIVA', emoji: '🎓' },
  { nome: 'Pronto pra abrir', emoji: '🔑' },
  { nome: 'Voz no comercial', emoji: '📣' },
  { nome: 'Cliente em foco', emoji: '🎯' },
  { nome: 'Cliente na mão', emoji: '🤲' },
  { nome: 'Mão na massa', emoji: '🛠️' },
]

export const NOTIFICACOES = [
  { emoji: '🏅', texto: 'Nova conquista: Pronto pra abrir', quando: 'hoje' },
  { emoji: '⭐', texto: '+100 pontos! Você concluiu Modelo de Negócio dentro do prazo.', quando: 'hoje' },
  { emoji: '⏰', texto: 'A trilha de Vendas vence em 3 dias.', quando: 'ontem' },
  { emoji: '✅', texto: 'Sua missão de campo foi validada pelo SAF.', quando: 'há 5 dias' },
]

export const MENU = [
  { id: 'inicio', emoji: '🏠', nome: 'Início' },
  { id: 'jornada', emoji: '🗺️', nome: 'Minha Jornada' },
  { id: 'pontos', emoji: '⭐', nome: 'Pontos' },
  { id: 'benef', emoji: '🎁', nome: 'Benefícios' },
  { id: 'conq', emoji: '🏅', nome: 'Conquistas' },
  { id: 'guia', emoji: '📖', nome: 'Guia da Jornada' },
]

export const EXTRATO = [
  { data: '19/10', texto: 'Concluiu Modelo de Negócio no prazo', valor: 100 },
  { data: '17/10', texto: 'Aula ao vivo 6: presença', valor: 50 },
  { data: '15/10', texto: 'Missão de campo validada (SAF)', valor: 120 },
  { data: '12/10', texto: 'Quiz da aula 5: 90%', valor: 30 },
  { data: '08/10', texto: 'Aula ao vivo 5: presença', valor: 50 },
]

// Status da atividade: 0 = pendente, 1 = concluída, 2 = em andamento.
// x / y = posição do marcador no mapa (%).
export const ETAPAS = [
  { nome: 'Boas-vindas', emoji: '🚩', x: 7.9, y: 29.9, pts: 60, atividades: [['Primeiro acesso', 1], ['Entrar no grupo de WhatsApp', 1], ['Receber o Guia do Franqueado', 1], ['Confirmar leitura do Guia', 1], ['Consultar o calendário da jornada', 1], ['Acessar o Academy', 1]] },
  { nome: 'Implantação', emoji: '🧭', x: 43.9, y: 28.1, pts: 520, atividades: [['Academy: Método Empresarial', 1], ['Academy: Modelo de Negócio', 1], ['Academy: Marketing e Vendas', 1], ['Academy: Cultura VIVA e LGPD', 1], ['Aulas ao vivo da etapa', 1], ['Treinamento de Novos Franqueados', 1], ['Avaliação da fase', 1]] },
  { nome: 'Inauguração', emoji: '🏠', x: 75.3, y: 40.1, pts: 430, atividades: [['Academy da etapa', 1], ['Aula de Relacionamento', 1], ['Aula de Atendimento', 1], ['2ª reunião comercial', 2], ['Missão de campo', 0], ['Avaliação da fase', 0]] },
  { nome: 'Primeiro Fundo', emoji: '💰', x: 78.7, y: 76.4, pts: 0, atividades: [['Conteúdos específicos', 0], ['Acompanhamento do SAF', 0], ['SAF Produção', 0], ['Missão prática', 0], ['Pré-evento e 1º evento', 0], ['Avaliação da fase', 0]] },
  { nome: 'Ativação do Evento', emoji: '🎪', x: 42.8, y: 78.3, pts: 0, atividades: [['Operação aplicada', 0], ['Fechamento do evento', 0], ['Transferência das margens (se mantida)', 0], ['Entregas finais', 0], ['Projeto integrador', 0]] },
  { nome: 'Conclusão', emoji: '🏆', x: 9, y: 82.4, pts: 0, atividades: [['Projeto concluído', 0], ['Avaliações concluídas', 0], ['Banca de aprovação final', 0], ['Jornada 100% concluída', 0]] },
]

// Posição das sombras sobre as etapas bloqueadas (%).
export const SOMBRAS = [[16.6, 27.6], [49.7, 18.4], [82.9, 28.5], [84.3, 71.8], [48.3, 66.3], [16.6, 75.5]]

export const fmt = n => n.toLocaleString('pt-BR')

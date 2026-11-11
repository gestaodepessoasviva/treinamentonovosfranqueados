// Gatilhos da jornada (só para a equipe, no painel admin).
// Cada gatilho é um marco presencial da franquia. Ele fica disponível quando o anterior foi realizado
// e "Apto" quando todos os pré-requisitos estão ok. A equipe marca quando o gatilho acontece.
//
// Para mudar um pré-requisito, edite a lista abaixo. Tipos de pré-requisito:
//   academy  → trilha do Academy da etapa (1 Implantação, 2 Inauguração, 3 Primeiro Fundo) em 100%
//   aulas    → presença nas aulas de "de" a "ate" (números do calendário), com mínimo "min" (0.8 = 80%)
//   prova    → prova e banca do período da etapa aprovada
//   projeto  → projeto integrador aprovado
//   entrega  → entrega da implantação lançada
export const GATILHOS = [
  { n: 1, nome: 'Participação do Treinamento de Novos Franqueados (TNF)', curto: '1. TNF', reqs: [
    { tipo: 'academy', etapa: 1, txt: 'Trilha da Implantação no Academy (100%)' },
    { tipo: 'aulas', de: 1, ate: 11, min: 0.8, txt: 'Aulas ao vivo #1 a #11 (mínimo 80%)' },
    { tipo: 'prova', etapa: 1, txt: 'Prova e banca do período 1' },
  ] },
  { n: 2, nome: 'Inauguração presencial da franquia', curto: '2. Inauguração', reqs: [
    { tipo: 'academy', etapa: 2, txt: 'Trilha da Inauguração no Academy (100%)' },
    { tipo: 'entrega', nome: 'CNPJ e alvará', txt: 'Entrega: CNPJ e alvará' },
    { tipo: 'entrega', nome: 'Contratação da equipe', txt: 'Entrega: Contratação da equipe' },
    { tipo: 'entrega', nome: 'Ponto comercial', txt: 'Entrega: Ponto comercial' },
  ] },
  { n: 3, nome: 'Participação do SAF Comercial em 2 reuniões comerciais', curto: '3. SAF Comercial', reqs: [
    { tipo: 'entrega', nome: 'Primeiras reuniões com turmas', txt: 'Entrega: Primeiras reuniões com turmas' },
  ] },
  { n: 4, nome: 'Início do acompanhamento SAF Relacionamento e Atendimento ao primeiro fundo', curto: '4. SAF Relac.', reqs: [
    { tipo: 'academy', etapa: 3, txt: 'Trilha do Primeiro Fundo no Academy (100%)' },
    { tipo: 'aulas', de: 15, ate: 17, min: 0.8, txt: 'Aulas ao vivo #15 a #17 · Relacionamento (mínimo 80%)' },
  ] },
  { n: 5, nome: 'Acompanhamento SAF Produção no primeiro pré-evento', curto: '5. SAF Produção', reqs: [
    { tipo: 'aulas', de: 18, ate: 19, min: 0.8, txt: 'Aulas ao vivo #18 e #19 · Produção (mínimo 80%)' },
  ] },
  { n: 6, nome: 'Execução presencial do primeiro evento oficial', curto: '6. 1º evento', reqs: [
    { tipo: 'projeto', txt: 'Projeto integrador aprovado' },
  ] },
  { n: 7, nome: 'Repasse das margens do evento para o franqueado no primeiro fechamento', curto: '7. Margens', reqs: [] },
]

// Monta os gatilhos a partir da aba "Config Gatilhos" da planilha (uma linha por pré-requisito).
// Sem configuração (modo demonstração ou aba vazia), vale a lista padrão acima.
const ETAPA_NOME = ['', 'Implantação', 'Inauguração', 'Primeiro Fundo', 'Ativação de Evento']
export function gatilhosDaConfig(linhas) {
  if (!linhas || !linhas.length) return GATILHOS
  const porN = {}
  linhas.forEach(l => {
    const n = Number(l['Gatilho*'])
    if (!n) return
    const g = porN[n] ||= { n, nome: String(l['Nome do gatilho*'] || 'Gatilho ' + n), curto: GATILHOS.find(x => x.n === n)?.curto || 'Gatilho ' + n, reqs: [] }
    const tipo = String(l['Pré-requisito*'] || '').trim()
    const etapa = Number(l['Etapa (1 a 4)']) || 1
    const min = Number(l['Mínimo %']) || 100
    const de = Number(l['Aula de']) || 0, ate = Number(l['Aula até']) || de
    if (tipo === 'Trilha do Academy') g.reqs.push({ tipo: 'academy', etapa, min, txt: `Trilha ${ETAPA_NOME[etapa] ? 'da ' + ETAPA_NOME[etapa] : etapa} no Academy (${min}%)` })
    else if (tipo === 'Aulas ao vivo') g.reqs.push({ tipo: 'aulas', de, ate, min: min / 100, txt: `Aulas ao vivo #${de} a #${ate} (mínimo ${min}%)` })
    else if (tipo === 'Prova do período') g.reqs.push({ tipo: 'prova', etapa, txt: `Prova e banca do período ${etapa}` })
    else if (tipo === 'Projeto integrador') g.reqs.push({ tipo: 'projeto', txt: 'Projeto integrador aprovado' })
    else if (tipo === 'Entrega' && l['Entrega']) g.reqs.push({ tipo: 'entrega', nome: String(l['Entrega']), txt: 'Entrega: ' + l['Entrega'] })
  })
  return Object.values(porN).sort((a, b) => a.n - b.n)
}

const feita = (f, etapa, nome) => !!f.etapas?.[etapa]?.atividades.some(a => a[0] === nome && a[1] === 1)

// Situação de cada gatilho para um franqueado.
export function avaliarGatilhos(f, turma, lista = GATILHOS) {
  const realizados = Object.fromEntries((f.gatilhos || []).map(g => [Number(g.gatilho), g]))
  return lista.map((g, i) => {
    const reqs = g.reqs.map(r => {
      if (r.tipo === 'academy') {
        const trilhas = f.etapas?.[r.etapa]?.atividades.filter(a => a[0].startsWith('Academy: ')) || []
        const pct = f.academy && f.academy[r.etapa] !== undefined ? Math.round(f.academy[r.etapa])
          : (trilhas.length ? Math.round(trilhas.filter(a => a[1] === 1).length / trilhas.length * 100) : 0)
        return { ...r, ok: pct >= (r.min || 100), info: pct + '%' }
      }
      if (r.tipo === 'aulas') {
        const ids = (turma?.aulas || []).filter(a => a.numero >= r.de && a.numero <= r.ate).map(a => a.id)
        const c = ids.filter(id => (f.presencas || []).includes(id)).length
        return { ...r, ok: ids.length > 0 && c / ids.length >= r.min, info: `${c} de ${ids.length}` }
      }
      if (r.tipo === 'prova') {
        const provas = (f.etapas || []).flatMap(e => e.atividades.filter(a => a[0] === 'Prova e banca do período'))
        return { ...r, ok: provas[r.etapa - 1]?.[1] === 1 }
      }
      if (r.tipo === 'projeto') return { ...r, ok: f.etapas?.some((e, i) => feita(f, i, 'Projeto integrador')) }
      if (r.tipo === 'entrega') return { ...r, ok: f.entregas?.some(e => e.nome === r.nome && e.status === 'validada') }
      return { ...r, ok: false }
    })
    const realizado = realizados[g.n] || null
    const anterior = lista[i - 1]
    const disponivel = !anterior || !!realizados[anterior.n]
    const faltam = reqs.filter(r => !r.ok).length
    const status = realizado ? 'realizado' : !disponivel ? 'bloqueado' : faltam ? 'pendente' : 'apto'
    return { ...g, reqs, realizado, disponivel, faltam, status }
  })
}

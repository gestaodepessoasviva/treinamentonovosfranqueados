import { useState } from 'react'
import { ENTREGAS, NIVEIS } from '../../data'
import { pontosEntrega, useApp, dataBR, prazoDe } from '../../state'
import { resumo } from './comum'

const STATUS_ENTREGA = { pendente: 'Pendente', em_validacao: 'Em validação', validada: 'Validada' }
const STATUS_EXTRA = { pendente: 'Em análise', aprovado: 'Aprovado', recusado: 'Recusado' }
const STATUS_ATIV = ['Pendente', 'Concluída', 'Em andamento']

// Monta as abas da planilha a partir do estado atual.
function abas(s) {
  const fs = s.franqueados
  return [
    ['Resumo', ['Nome', 'E-mail', 'Unidade', 'WhatsApp', 'Turma', 'Ativo', 'Pontos', 'Nível', 'Progresso (%)', 'Etapa atual', 'Entregas validadas', 'Extras aprovados'],
      fs.map(f => {
        const r = resumo(f)
        return [f.nome, f.email, f.franquia, f.whatsapp, f.turma, f.ativo ? 'Sim' : 'Não', f.pontos, NIVEIS[r.nivel].nome, r.progresso, f.etapas[r.atual].nome,
          `${f.entregas.filter(e => e.status === 'validada').length} de ${ENTREGAS.length}`, f.extras.filter(x => x.status === 'aprovado').length]
      })],
    ['Extrato', ['Franqueado', 'E-mail', 'Data', 'Lançamento', 'Pontos'],
      fs.flatMap(f => f.extrato.map(x => [f.nome, f.email, x.data, x.texto, x.valor]))],
    ['Entregas', ['Franqueado', 'E-mail', 'Entrega', 'Status', 'Prazo', 'Concluída em', 'Calculado pela plataforma', 'Situação final', 'Ajustado pela equipe?', 'Pontos'],
      fs.flatMap(f => f.entregas.map(e => [f.nome, f.email, e.nome, STATUS_ENTREGA[e.status], dataBR(prazoDe(e.nome, s.turmas.find(t => t.codigo === f.turma))), dataBR(e.concluidaEm), e.calculada, e.situacao,
        e.calculada ? (e.calculada !== e.situacao ? 'Sim' : 'Não') : '', e.status === 'validada' ? pontosEntrega(e.nome, e.situacao) : '']))],
    ['Extras', ['Franqueado', 'E-mail', 'Ação', 'Descrição', 'Data', 'Status'],
      fs.flatMap(f => f.extras.map(x => [f.nome, f.email, x.acao, x.obs, x.data, STATUS_EXTRA[x.status]]))],
    ['Atividades', ['Franqueado', 'E-mail', 'Etapa', 'Atividade', 'Status'],
      fs.flatMap(f => f.etapas.flatMap(e => e.atividades.map(([nome, st]) => [f.nome, f.email, e.nome, nome, STATUS_ATIV[st]])))],
    ['Benefícios', ['Benefício', 'Descrição', 'Custo em pontos', 'Estoque', 'No catálogo'],
      s.beneficios.map(b => [b.nome, b.descricao || '', b.custo, b.estoque, b.ativo ? 'Sim' : 'Não'])],
    ['Trocas', ['Data', 'Franqueado', 'Benefício', 'Pontos'],
      s.trocas.map(t => [t.data, fs.find(f => f.id === t.franqueado)?.nome ?? '', t.beneficio, t.custo])],
    ['Turmas', ['Código', 'Nome', 'Cronograma', 'Início', 'Fim'],
      s.turmas.map(t => [t.codigo, t.nome, t.cronograma, t.inicio, t.fim])],
  ]
}

async function baixarPlanilha(s) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  abas(s).forEach(([nome, cab, linhas]) => {
    const ws = wb.addWorksheet(nome, { views: [{ state: 'frozen', ySplit: 1 }] })
    ws.addRow(cab)
    linhas.forEach(l => ws.addRow(l))
    ws.getRow(1).eachCell(c => {
      c.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9480F' } }
    })
    ws.columns.forEach((col, i) => {
      const maior = Math.max(cab[i].length, ...linhas.map(l => String(l[i] ?? '').length))
      col.width = Math.min(60, maior + 2)
      col.font = { name: 'Arial' }
    })
  })
  const blob = new Blob([await wb.xlsx.writeBuffer()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `jornada-do-franqueado-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Exportar() {
  const { s, toast } = useApp()
  const [gerando, setGerando] = useState(false)
  const lista = abas(s)

  const baixar = async () => {
    setGerando(true)
    try {
      await baixarPlanilha(s)
      toast('Planilha gerada!')
    } catch (e) {
      toast('Não foi possível gerar a planilha: ' + e.message)
    } finally {
      setGerando(false)
    }
  }

  return (
    <>
      <h1>Exportar dados</h1>
      <p className="mut">Baixe uma planilha do Excel com a situação atual de toda a turma.</p>
      <section className="card">
        <b>📊 O que vem na planilha</b>
        {lista.map(([nome, , linhas]) => (
          <div className="row" key={nome}><span>{nome}</span><span className="mut sm">{linhas.length} {linhas.length === 1 ? 'linha' : 'linhas'}</span></div>
        ))}
        <button className="go" onClick={baixar} disabled={gerando}>{gerando ? 'Gerando…' : 'Baixar planilha (.xlsx)'}</button>
      </section>
      <p className="mut sm">A planilha traz dados pessoais dos franqueados: guarde e compartilhe só com quem precisa.</p>
    </>
  )
}

import { useState } from 'react'
import { ENTREGAS, NIVEIS } from '../../data'
import { dataBR, nomeAula, pontosEntrega, prazoInfo, useApp } from '../../state'
import { resumo } from './comum'

const STATUS_ATIV = ['Pendente', 'Concluída', 'Em andamento']
const TIPOS_AULA = { aula: 'Aula ao vivo', tnf: 'TNF presencial', folga: 'Sem aula' }
const somaTipo = (f, tipo) => f.extrato.filter(x => (x.tipo || 'Programado') === tipo).reduce((a, x) => a + x.valor, 0)

// Monta as abas da planilha a partir do estado atual.
function abas(s) {
  const fs = [...s.franqueados].sort((a, b) => a.nome.localeCompare(b.nome))
  const turmaDe = f => s.turmas.find(t => t.codigo === f.turma)
  return [
    ['Resumo', ['Nome', 'E-mail', 'Unidade', 'WhatsApp', 'Turma', 'Ativo', 'Pontos programados', 'Pontos extras', 'Trocas', 'Saldo', 'Nível', 'Progresso (%)', 'Etapa atual', 'Entregas lançadas', 'Conquistas'],
      fs.map(f => {
        const r = resumo(f)
        return [f.nome, f.email, f.franquia, f.whatsapp, f.turma, f.ativo ? 'Sim' : 'Não', somaTipo(f, 'Programado'), somaTipo(f, 'Extra'), somaTipo(f, 'Troca'), f.pontos,
          NIVEIS[r.nivel].nome, r.progresso, f.etapas[r.atual].nome, `${f.entregas.filter(e => e.status === 'validada').length} de ${ENTREGAS.length}`, f.conquistas.join(', ')]
      })],
    ['Lançamentos', ['Data', 'Franqueado', 'E-mail', 'Lançamento', 'Aula', 'Tipo', 'Lançado pela equipe', 'Pontos'],
      fs.flatMap(f => f.extrato.map(x => [x.data, f.nome, f.email, x.texto, x.aula || '', x.tipo || 'Programado', x.equipe ? 'Sim' : '', x.valor]))],
    ['Entregas', ['Franqueado', 'E-mail', 'Entrega', 'Aula ligada', 'Prazo', 'Lançada em', 'Situação', 'Pontos'],
      fs.flatMap(f => f.entregas.map(e => {
        const p = prazoInfo(e.nome, turmaDe(f))
        return [f.nome, f.email, e.nome, p.aula ? nomeAula(p.aula) : 'Sem aula (fim do mês)', dataBR(p.data), dataBR(e.concluidaEm), e.status === 'validada' ? e.situacao : 'Pendente',
          e.status === 'validada' ? pontosEntrega(e.nome, e.situacao) : '']
      }))],
    ['Atividades', ['Franqueado', 'E-mail', 'Etapa', 'Atividade', 'Status'],
      fs.flatMap(f => f.etapas.flatMap(e => e.atividades.map(([nome, st]) => [f.nome, f.email, e.nome, nome, STATUS_ATIV[st]])))],
    ['Benefícios', ['Benefício', 'Descrição', 'Custo em pontos', 'Estoque', 'No catálogo'],
      s.beneficios.map(b => [b.nome, b.descricao || '', b.custo, b.estoque, b.ativo ? 'Sim' : 'Não'])],
    ['Trocas', ['Data', 'Franqueado', 'Benefício', 'Pontos'],
      s.trocas.map(t => [t.data, s.franqueados.find(f => f.id === t.franqueado)?.nome ?? '', t.beneficio, t.custo])],
    ['Turmas', ['Código', 'Nome', 'Cronograma', 'Início', 'Fim'],
      s.turmas.map(t => [t.codigo, t.nome, t.cronograma, dataBR(t.inicio), dataBR(t.fim)])],
    ['Calendário', ['Turma', 'Data', 'Até', 'Tipo', 'Nº', 'Aula', 'Professor(a)', 'Horário', 'Link da aula'],
      s.turmas.flatMap(t => [...(t.aulas || [])].sort((a, b) => a.data.localeCompare(b.data)).map(a => [t.codigo, dataBR(a.data), dataBR(a.fim), TIPOS_AULA[a.tipo || 'aula'], a.numero || '', a.tema,
        (a.tipo || 'aula') === 'aula' ? a.professor || 'a confirmar' : '', (a.tipo || 'aula') === 'aula' ? a.horario || '14h' : '', a.link || '']))],
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
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFC5B00' } }
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
  a.download = `jornada-de-novos-franqueados-${new Date().toISOString().slice(0, 10)}.xlsx`
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

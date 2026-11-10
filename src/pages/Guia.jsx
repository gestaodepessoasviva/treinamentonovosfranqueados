import { GUIA_LINK } from '../data'
import { useApp } from '../state'
import imgMapa from '../assets/mapa-campus.jpg'

// Conteúdo do "Guia da Jornada" (PDF na pasta Documentos) + link para o PDF no Drive e confirmação de leitura.

const Item = ({ titulo, aberto, children }) => (
  <details open={aberto}><summary>{titulo}</summary><div style={{ marginTop: 8 }}>{children}</div></details>
)

const DATAS = [
  ['🟠', '12/11/2026', 'Início das aulas'],
  ['⚫', '18 a 23/01/2027', 'Treinamento de Novos Franqueados (TNF), presencial'],
  ['⚪', '09/02/2027', 'Sem aula: Carnaval'],
  ['🟠', '31/03/2027', 'Última aula (previsão) e formatura'],
]

const PERIODOS = [
  ['1º', 'Implantação', 'LGPD, Método Empresarial, Modelo de Negócio, Vendas, Marketing e Cultura VIVA'],
  ['2º', 'Inauguração', 'Gestão de Pessoas, Relacionamento, Atendimento, Produção, Administrativo/Financeiro e Performance da Rede VIVA'],
  ['3º', 'Primeiro Fundo', 'Relacionamento e Produção'],
  ['4º', 'Ativação de evento', 'Mão na massa'],
]

const PASSOS = [
  ['Conteúdo no Academy', 'Você conhece os conceitos e os fundamentos.'],
  ['Aula ao vivo', 'Aprofunda o tema e tira dúvidas com os especialistas.'],
  ['Atividade prática', 'Aplica o conteúdo numa situação próxima da sua franquia.'],
  ['Avaliação', 'Confirma se os conhecimentos principais foram compreendidos.'],
  ['Próxima disciplina', 'A turma segue para o próximo tema do período.'],
]

const MARCOS = [
  ['Para sair do 1º período · Implantação', ['Ter participado do Treinamento de Novos Franqueados (TNF)']],
  ['Para sair do 2º período · Inauguração', ['Ter feito a inauguração presencial da sua franquia', 'Ter feito 2 reuniões comerciais com acompanhamento do SAF Comercial', 'Ter iniciado o acompanhamento do SAF de Relacionamento e Atendimento no seu primeiro fundo']],
  ['Para sair do 3º período · Primeiro Fundo', ['Ter feito o primeiro pré-evento com acompanhamento do SAF de Produção', 'Ter executado presencialmente o seu primeiro evento oficial']],
  ['Para concluir o 4º período · Ativação do Evento', ['Ter recebido o repasse das margens no fechamento do seu primeiro evento']],
]

const CONTATOS = [
  ['Conteúdo de aula ou disciplina', 'Tema estudado no Academy ou na aula', 'Professor da disciplina', 'Contato será disponibilizado'],
  ['Processo da formação', 'Prazos, datas, notas e regras', 'Fernanda ou Laura', 'WhatsApp (32) 99197-4917'],
  ['Acesso às plataformas', 'VIVA Academy ou Plataforma da Jornada', 'Fernanda ou Laura', 'WhatsApp (32) 99197-4917'],
  ['Pendências do período', 'Atividades e avaliações em aberto', 'Fernanda ou Laura', 'WhatsApp (32) 99197-4917'],
  ['Entregas da franquia', 'Itens específicos da sua unidade', 'Expansão', 'Pelo Sults e pelos contatos já enviados'],
]

const EQUIPE = [
  ['Coordenação', [['Fernanda', 'Processo da formação'], ['Laura', 'Processo da formação']]],
  ['Professores', [['Everdan', 'Modelo de Negócio'], ['Jhonny', 'Marketing'], ['Guilherme', 'Marketing'], ['Ronin', 'Vendas · Precificação de OP'], ['Thomas', 'Pós-vendas'], ['Babi', 'Pós-vendas · Relacionamento'], ['Bruna', 'Pós-vendas'], ['Régis', 'Gestão de Pessoas'], ['Maria', 'Pós-vendas · Vendas · Atendimento'], ['Alessandra', 'Pós-vendas · Produção']]],
]

const FAQ = [
  ['Perdeu uma aula?', 'Assista à gravação no Academy e, se necessário, entregue a avaliação da aula. O professor corrige e envia o feedback para você.'],
  ['Perdi o prazo de uma atividade. E agora?', 'Avise o quanto antes, de preferência antes do prazo vencer. Fale com Laura ou Fernanda para combinar uma solução.'],
  ['Não passei em uma avaliação. Posso refazer?', 'Sim. O professor envia um feedback e você tem uma nova chance. Use o feedback para revisar os pontos que ficaram em aberto.'],
  ['Quanto tempo dura cada aula?', 'Cerca de 1h30, com conteúdo, atividade e espaço para dúvidas.'],
  ['Posso fazer as trilhas do Academy fora de ordem?', 'Não. As trilhas seguem o cronograma da turma, ligado ao tema de cada aula. Você só avança para o período seguinte quando conclui o anterior.'],
  ['Onde vejo meus pontos e meu nível?', 'Aqui na Plataforma da Jornada, junto com suas conquistas, pendências e próximas ações.'],
  ['O acompanhamento acaba na formatura?', 'Não. Depois da formatura, a equipe continua acompanhando os primeiros marcos da sua franquia.'],
]

const LER = 'Ler o Guia da Jornada'

export default function Guia() {
  const { s, concluirMinha } = useApp()
  const lido = s.etapas?.some(e => e.atividades.some(a => a[0] === LER && a[1] === 1))
  return (
    <>
      <h1>Guia da Jornada</h1>
      <p className="mut">Universidade VIVA · Formação de Novos Franqueados · Turma novembro 2026 a março 2027</p>
      <section className="card guia">
        <div className="guia-em">📖</div>
        <div>
          <b>Guia em PDF</b>
          <p className="mut sm">O mesmo conteúdo desta página, no arquivo para baixar ou imprimir.</p>
          <div className="guia-acoes">
            {GUIA_LINK
              ? <a className="go3" href={GUIA_LINK} target="_blank" rel="noreferrer" onClick={() => s.etapas && !lido && concluirMinha(LER)}>Abrir o Guia (PDF) ↗</a>
              : <span className="mut sm"><b>O link do PDF vai aparecer aqui em breve.</b></span>}
            {s.etapas && lido && <span className="guia-ok">✅ Leitura confirmada</span>}
          </div>
        </div>
      </section>


      <Item titulo="1. Sua turma: datas principais" aberto>
        {DATAS.map(([cor, data, texto]) => (
          <div className="row" key={data}><span>{cor} {texto}</span><b>{data}</b></div>
        ))}
      </Item>

      <Item titulo="2. Combinados">
        <p>A jornada tem um combinado dos dois lados:</p>
        <b>O que esperamos de você</b>
        <ul className="lista">
          <li>Participar das aulas ao vivo e chegar com as trilhas do VIVA Academy em dia.</li>
          <li>Cumprir os prazos das atividades e provas.</li>
          <li>Aplicar o que aprender na sua unidade, desde o começo.</li>
          <li>Tomar decisões como dono e pedir ajuda quando precisar.</li>
        </ul>
        <b>O que você recebe</b>
        <ul className="lista">
          <li>Conteúdo prático, pensado para a rotina de uma franquia VIVA.</li>
          <li>Acompanhamento da equipe durante o semestre e também depois da formatura.</li>
          <li>Pontos, níveis e benefícios conforme avança no curso.</li>
          <li>Diploma da Universidade VIVA ao concluir a turma.</li>
        </ul>
      </Item>

      <Item titulo="3. Conteúdos de cada período">
        <p>São 4 períodos, cada um ligado a um momento real da sua franquia. Você só avança para o próximo quando conclui o anterior, sem pular etapas (<i>por mais que dê vontade!</i> 😬).</p>
        {PERIODOS.map(([n, nome, temas]) => (
          <div className="row" key={nome}><span><b>{n} {nome}</b><br /><span className="mut sm">{temas}</span></span></div>
        ))}
        <p style={{ marginTop: 12 }}><b>Sua formação combina 3 frentes:</b></p>
        <ul className="lista">
          <li><b>Aulas ao vivo:</b> encontros com especialistas, com conteúdo, discussão, atividade prática e espaço para dúvidas.</li>
          <li><b>VIVA Academy:</b> conteúdos que apoiam e aprofundam os temas da formação.</li>
          <li><b>Treinamento presencial (TNF):</b> imersão com prática, dinâmicas e troca com a rede VIVA.</li>
        </ul>
        <p style={{ marginTop: 12 }}><b>Cada disciplina segue os mesmos 5 passos:</b></p>
        <ol className="lista">
          {PASSOS.map(([t, d]) => <li key={t}><b>{t}:</b> {d}</li>)}
        </ol>
        <p className="mut sm">A cada nova disciplina, o ciclo recomeça. O bloco só fecha no fim do período.</p>
      </Item>

      <Item titulo="4. O mapa do campus">
        <img src={imgMapa} alt="Mapa do campus com as 6 etapas da jornada" style={{ width: '100%', borderRadius: 10 }} />
        <p className="mut sm">Este é o caminho que todos percorrem: das boas-vindas à formatura, passando pelos 4 períodos. Em Minha Jornada você vê onde está.</p>
      </Item>

      <Item titulo="5. Marcos da franquia">
        <p>Para passar ao próximo período, além das aulas e avaliações, você precisa viver alguns marcos importantes. Eles são pré-requisitos e mostram que você está aplicando o que aprendeu.</p>
        {MARCOS.map(([titulo, itens]) => (
          <div key={titulo} style={{ marginBottom: 10 }}>
            <b>{titulo}</b>
            <ul className="lista">{itens.map(i => <li key={i}>✅ {i}</li>)}</ul>
          </div>
        ))}
      </Item>

      <Item titulo="6. Com quem falar">
        <p>Dúvida é normal, ainda mais no começo. Veja quem pode te ajudar:</p>
        {CONTATOS.map(([assunto, desc, quem, como]) => (
          <div className="row" key={assunto}>
            <span><b>{assunto}</b><br /><span className="mut sm">{desc}</span></span>
            <span style={{ textAlign: 'right' }}><b>{quem}</b><br /><span className="mut sm">{como}</span></span>
          </div>
        ))}
        <p className="mut sm">O WhatsApp da coordenação também está no grupo da turma.</p>
      </Item>

      <Item titulo="7. Equipe da formação">
        {EQUIPE.map(([grupo, pessoas]) => (
          <div key={grupo} style={{ marginBottom: 10 }}>
            <b>{grupo}</b>
            <div className="equipe">
              {pessoas.map(([nome, area]) => <div key={nome} className="card"><b>{nome}</b><div className="mut sm">{area}</div></div>)}
            </div>
          </div>
        ))}
      </Item>

      <Item titulo="8. Seu diploma">
        <p><b>Chegou ao fim? Parabéns, você se formou!</b> 🎓 E a sua jornada está só começando…</p>
        <p>Sua franquia continuará vivendo novos marcos: primeiro fundo, primeiro pré-evento, primeiro evento oficial e primeiro fechamento. Cada um desses momentos ensina alguma coisa nova, e a gente continua do seu lado em todos eles.</p>
      </Item>

      <Item titulo="9. Perguntas frequentes">
        {FAQ.map(([p, r]) => (
          <div key={p} style={{ marginBottom: 10 }}><b>❓ {p}</b><div className="mut">{r}</div></div>
        ))}
      </Item>
    </>
  )
}

import imgMapa from '../assets/mapa-jornada.jpg'
import { fmt, NIVEIS, REGRAS } from '../data'
import { useApp } from '../state'

const Item = ({ titulo, children }) => (
  <details><summary>{titulo}</summary><div style={{ marginTop: 8 }}>{children}</div></details>
)

export default function Guia() {
  const { s } = useApp()
  return (
    <>
      <h1>Guia da Jornada</h1>
      <p className="mut">Tudo o que você precisa saber para percorrer a jornada.</p>
      <Item titulo="1. Bem-vindo à jornada">Você vai passar por 6 marcos ao longo de 6 meses, do primeiro acesso até a conclusão, aprendendo e aplicando na prática.</Item>
      <Item titulo="2. O mapa completo">
        <img src={imgMapa} alt="Mapa completo da jornada" style={{ width: '100%', borderRadius: 10 }} />
        <p className="mut sm">Este é o caminho que todos percorrem. Em Minha Jornada você vê onde está.</p>
      </Item>
      <Item titulo="3. Como funciona cada etapa">
        {s.etapas.map((e, i) => (
          <div key={e.nome}><b>{i + 1}. {e.nome}:</b> {e.atividades.map(x => x[0]).join(', ')}.</div>
        ))}
      </Item>
      <Item titulo="4. Como ganhar pontos">
        {REGRAS.map(r => (
          <div className="row" key={r.texto}><span><span className="tag">{r.tag}</span>{r.texto}</span><span className="pl">{r.pts}</span></div>
        ))}
        <p className="mut sm">Cumpriu a atividade: pontos-base. No prazo ou com nota alta: pontos-bônus.</p>
      </Item>
      <Item titulo="5. Níveis e conquistas">
        {NIVEIS.map((n, i) => <div key={n.nome}>Nível {i + 1}: <b>{n.nome}</b> ({fmt(n.min)}+ pontos)</div>)}
        <p className="mut sm">Conquistas são emblemas por marcos da jornada, como concluir uma etapa.</p>
      </Item>
      <Item titulo="6. Avaliações e aprovação">Cada etapa termina com uma prova. Nota mínima: <b>80%</b>. Você tem <b>2 tentativas</b> e <b>10 dias</b> para recuperação.</Item>
      <Item titulo="7. E se eu perder uma aula?">Assista à aula gravada e entregue o teste preenchido. O professor corrige e dá o retorno por escrito.</Item>
      <Item titulo="8. Quem pode me ajudar?">
        <b>T&amp;D:</b> trilhas, aulas e pontos.<br /><b>SAF:</b> acompanhamento prático e missões de campo.<br /><b>Professores:</b> dúvidas de conteúdo.
      </Item>
      <Item titulo="9. Perguntas frequentes">
        <b>Os pontos vencem?</b> A definir.<br /><b>Posso trocar meus pontos?</b> Sim, em Benefícios.<br /><b>Pontuei e não apareceu?</b> Fale com o T&amp;D.
      </Item>
    </>
  )
}

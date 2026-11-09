# Robô da Jornada de Novos Franqueados: guia de instalação

O robô roda dentro de uma planilha Google e preenche sozinho, todo dia, três abas do
**Modelo de Importação**:

| Aba | De onde vem | Regra |
|---|---|---|
| Disciplinas Academy | Moodle: conclusão do curso | Curso marcado como concluído no Moodle |
| Avaliações | Moodle: nota da prova ou tarefa | Aprovado com 80% da nota máxima ou mais |
| Aulas ao vivo | Google Meet: lista de presença + Moodle: nota do quiz da aula | Ao vivo = aparece na lista de presença do Meet da aula. Quem não esteve ao vivo mas fez o quiz entra como "Gravação". Passou na avaliação = 80% ou mais |

O robô **não apaga nada**: só acrescenta linhas novas e atualiza as que mudaram (por exemplo,
alguém que refez o quiz e passou). Rodar várias vezes não duplica linhas. Cada execução fica
registrada na aba **Log do robô**.

As outras abas (Turmas, Franqueados, Entregas, Extras, Benefícios, Ajustes) continuam sendo
preenchidas pela equipe.

Arquivos:
- `apps-script/Robo.gs`: o código do robô
- `apps-script/appsscript.json`: configurações e permissões do script
- A planilha e a versão em Word deste guia ficam na pasta **Documentos** do projeto.

---

## Parte 1 · Administrador do Moodle (≈ 30 min)

O Moodle precisa estar acessível pela internet, porque o robô roda nos servidores do Google.

1. **Ativar serviços web:** Administração do site → Recursos avançados → marcar **Ativar serviços web**.
2. **Ativar o protocolo REST:** Administração do site → Servidor → Serviços web → Gerenciar protocolos → ativar **REST**.
3. **Criar um usuário só para o robô**, por exemplo `robo-jornada` (autenticação manual, senha forte).
   Não use a conta de uma pessoa: o robô para quando a pessoa sai.
4. **Criar um papel "Robô Jornada"** no contexto *Sistema* e atribuir ao usuário do robô, com as permissões:
   - `webservice/rest:use`
   - `moodle/course:viewparticipants` e `moodle/course:enrolreview`
   - `moodle/site:viewuseridentity` (o robô reconhece as pessoas pelo e-mail)
   - `moodle/grade:viewall` e `gradereport/user:view`
   - `report/completion:view`

   Confira também se **e-mail** está marcado em Administração do site → Usuários → Permissões →
   Política do usuário → *Mostrar identidade do usuário*.
5. **Criar o serviço:** Administração do site → Servidor → Serviços web → Serviços externos → Adicionar
   - Nome: `Jornada do Franqueado` · Ativado · **Somente usuários autorizados**
   - Em *Funções*, adicionar:
     `core_webservice_get_site_info`, `core_enrol_get_enrolled_users`,
     `core_completion_get_course_completion_status`, `core_course_get_course_module`,
     `gradereport_user_get_grade_items`
   - Em *Usuários autorizados*, adicionar o usuário do robô.
6. **Criar o token:** Servidor → Serviços web → Gerenciar tokens → Criar token para o usuário do robô e o
   serviço `Jornada do Franqueado`. Deixe *Restrição de IP* em branco (o Google usa IPs variáveis).
7. **Enviar ao T&D por canal seguro** (não por e-mail aberto ou grupo): o endereço do Moodle e o token.

Para que a conclusão de disciplina funcione, cada curso precisa ter **Conclusão de curso** configurada
(Curso → Mais → Conclusão do curso), com os critérios que vocês considerarem que "concluiu".

---

## Parte 2 · Administrador do Google Workspace (≈ 20 min)

1. **Conferir os registros do Meet:** Admin Console → Relatórios → Auditoria e investigação →
   **Eventos de registro do Meet**. Se essa opção não existir na edição de vocês, o robô não consegue
   ler a presença; avise o T&D (há alternativas, como o relatório de presença do Meet).
2. **Criar uma conta para o robô**, por exemplo `automacao@suaempresa.com.br`.
3. **Dar a essa conta acesso só a relatórios:** Admin Console → Conta → Papéis de administrador →
   Criar papel "Relatórios da Jornada" com o privilégio **Relatórios** → atribuir à conta do robô.
4. As aulas ao vivo precisam ser **organizadas por uma conta da empresa**, para aparecerem nos registros.

---

## Parte 3 · T&D: instalar o robô na planilha (≈ 30 min, logado na conta do robô)

1. No Google Drive, envie o arquivo **Modelo de Importação - Jornada do Franqueado.xlsx**, abra com
   Planilhas Google e use **Arquivo → Salvar como Planilhas Google**. Use sempre essa versão Google.
2. Na planilha: **Extensões → Apps Script**.
3. Apague o conteúdo do arquivo `Código.gs` e cole todo o conteúdo de `Robo.gs`.
4. Em **Configurações do projeto** (engrenagem), marque *Mostrar o arquivo de manifesto "appsscript.json"*.
   Volte ao Editor, abra `appsscript.json` e substitua o conteúdo pelo do arquivo `appsscript.json`.
5. Salve (ícone de disquete) e **recarregue a planilha**. Aparece o menu **🤖 Jornada**.
6. **🤖 Jornada → Criar abas de configuração.** Na primeira vez o Google pede autorização: aceite.
7. **🤖 Jornada → Configurar acesso ao Moodle:** cole o endereço e o token da Parte 1.
8. **🤖 Jornada → Testar conexão com o Moodle:** deve aparecer o nome do Moodle.
9. Preencha as abas de configuração (a linha 2 de cada uma é um exemplo: substitua):
   - **Config · Disciplinas:** uma linha por disciplina, com o ID do curso no Moodle e o prazo.
     O ID está no endereço do curso: `.../course/view.php?id=`**12**
   - **Config · Aulas:** uma linha por aula ao vivo, com data, código do Meet
     (`meet.google.com/`**abc-defg-hij**), duração em minutos, ID do curso e ID do quiz da aula
     (`.../mod/quiz/view.php?id=`**345**).
   - **Config · Provas:** uma linha por prova do período e uma para o projeto integrador, com o ID da atividade.
10. Confira a aba **Franqueados**: o e-mail de cada pessoa precisa ser **o mesmo** que ela usa no Moodle
    e no Meet. Apague as linhas de exemplo (linha 2, em cinza) das abas de dados.
11. **🤖 Jornada → Atualizar agora** e confira a aba **Log do robô**.
12. Se tudo estiver certo: **🤖 Jornada → Ativar atualização diária** (roda por volta das 6h).

---

## Combinados com os franqueados

- Entrar no **Meet e no Moodle sempre com o e-mail cadastrado**. É por ele que o robô reconhece a pessoa.
  Quem entra como convidado sem login não é identificado.
- Presença ao vivo conta para quem **aparece na lista de presença do Meet**, sem tempo mínimo.

## Ajustes no código

No começo de `Robo.gs`, o bloco `AJUSTES` define a nota mínima (80%),
quantos dias para trás o robô busca no Meet (30) e o horário da atualização (6h).

## Se der erro

O erro aparece na aba **Log do robô**, na coluna Observação. Os mais comuns:

| Mensagem | O que fazer |
|---|---|
| Acesso ao Moodle não configurado | Refazer o passo 7 da Parte 3 |
| `Access control exception` / `Exceção de controle de acesso` | Falta função no serviço (Parte 1, passo 5) ou usuário não autorizado |
| `Sem permissão` / `nopermissions` | Falta permissão no papel do robô (Parte 1, passo 4) |
| Meet indisponível | A conta do robô não tem o privilégio Relatórios (Parte 2, passo 3) |
| Coluna "…" não encontrada | Um cabeçalho da planilha foi renomeado: volte ao nome original |
| Ninguém aparece | Os e-mails do Moodle/Meet não batem com a aba Franqueados |

# Banco de dados da Jornada: guia de instalação

A planilha do Google vira a base da plataforma: login, cadastros, pontos, presenças, conquistas e calendário ficam nela. O script `Banco.gs`:

- prepara as abas;
- atualiza a planilha todo dia às 8h;
- responde à plataforma (login e dados de cada franqueado).

> **Antes de tudo: feche o compartilhamento.** A planilha precisa ficar como **"Restrito"**, compartilhada só com T&D, Expansão e a conta que vai rodar o script. Hoje ela está aberta para "qualquer pessoa com o link", e isso expõe os dados de mais de 400 pessoas. Os franqueados **não** precisam de acesso à planilha: eles veem só os próprios dados pela plataforma.

## 1. Colar o script na planilha
1. Abra a planilha e vá em **Extensões → Apps Script**.
2. Apague o que estiver no arquivo `Código.gs` e cole todo o conteúdo de `Banco.gs`.
3. Salve (ícone de disquete) e dê o nome **Banco da Jornada** ao projeto.
4. Volte à planilha e recarregue a página. Vai aparecer o menu **🗄️ Banco**.

## 2. Preparar a planilha
Clique em **🗄️ Banco → 1. Preparar a planilha**. Na primeira vez, o Google pede autorização: clique em *Continuar*, escolha a sua conta e *Permitir*.

O script:
- **cria as abas que faltam**: Calendário, Prazos das entregas, Conquistas, Atividades, Trocas, Progresso Academy, Config Academy, Arquivos de presença, Acessos (escondida) e Registro do robô;
- **acrescenta colunas no fim das abas existentes**:
  - ID, Origem e Lançado por, nas abas de lançamentos;
  - **Nome no Academy**, na aba Franqueados;
  - **Trilha**, na aba Disciplinas Academy, com lista suspensa das 4 jornadas;
- **apaga duas colunas que saíram**:
  - **Unidade (franquia)**, da aba Franqueados, porque a Cidade passa a ser a franquia;
  - **Passou na avaliação?**, da aba Aulas ao vivo;
- **carrega o calendário da turma de novembro** e os prazos das entregas, se as abas estiverem vazias;
- **não apaga nada e não mexe na aba IMPORTAÇÃO ACADEMY.**

## 3. Progresso no Academy: as 4 jornadas do franqueado
A aba **IMPORTAÇÃO ACADEMY** traz o percentual de cada curso **pelo nome da pessoa**, e não pelo e-mail. O que conta para a Jornada são as 4 jornadas do franqueado, já ligadas na aba **Config Academy**:

| Trilha | Coluna da importação | Etapa |
|---|---|---|
| 1. Implantação | `%_1_franq` | Implantação |
| 2. Inauguração | `%_2_franq` | Inauguração |
| 3. Primeiro Fundo | `%_3_franq` | Primeiro Fundo |
| 4. Ativação de Evento | `%_4_franq` | Ativação do Evento |

Se o nome da pessoa no Academy for diferente do nome completo cadastrado, escreva o nome do Academy na coluna **Nome no Academy** da aba **Franqueados**.

Todo dia o script copia os percentuais para **Progresso Academy**. Quando uma trilha chega a 100%, ele registra a conclusão em **Disciplinas Academy**, com a data do dia e o nome da trilha na coluna **Trilha**.

## 4. Listas de presença
1. Clique em **🗄️ Banco → 2. Informar a pasta das listas de presença** e cole o link da pasta.
2. Cada lista precisa estar como **Planilha Google**, com a **data da aula no nome do arquivo**, por exemplo `Lista de presença 2026-11-12` ou `Aula 12/11`. Também vale o nome com o código do Meet.
3. Quem aparece na lista conta como presente ao vivo. O script reconhece a pessoa pelo e-mail ou, se não houver e-mail, pelo nome.
4. Cada arquivo é lido uma vez só. Ele fica registrado em **Arquivos de presença**, junto com qualquer arquivo em que a aula não foi encontrada.

## 5. Atualização diária às 8h
- **🗄️ Banco → Atualizar agora** roda tudo na hora, para testar.
- **🗄️ Banco → Ativar atualização diária às 8h** deixa programado.
- O resultado de cada rodada fica na aba **Registro do robô**.

## 6. Login dos franqueados: senha própria da plataforma
O franqueado entra com o **e-mail cadastrado na aba Franqueados**. A senha **não** é a do Academy.

1. Clique em **🗄️ Banco → 3. Definir a senha inicial dos franqueados** e digite a senha do primeiro acesso, igual para todos (mínimo 8 caracteres). Envie essa senha aos franqueados.
2. No primeiro acesso, o franqueado entra com o e-mail e a senha inicial. A plataforma abre a tela **Crie sua senha**, e ele escolhe uma senha só dele, diferente da inicial.
3. Nenhuma senha fica legível: a planilha guarda só uma versão embaralhada (hash), na aba escondida **Acessos**.
4. **Esqueceu a senha?** Abra a ficha do franqueado no painel admin e clique em **🔑 Redefinir senha**, ou use **🗄️ Banco → 4. Redefinir a senha de um franqueado**. No acesso seguinte ele entra com a senha inicial e cria uma nova.
5. **"Lembrar de mim"** mantém o login por 30 dias. Sem essa opção, a sessão dura 12 horas.
6. Depois de 5 tentativas erradas, o usuário espera 15 minutos para tentar de novo.

## 7. Acesso de admin
O admin tem senha própria, separada da senha inicial dos franqueados.

Clique em **🗄️ Banco → 5. Criar ou trocar a senha de um admin**, informe `gestaodepessoas@vivaeventos.com.br` e a senha. A senha não aparece em lugar nenhum: a planilha guarda só uma versão embaralhada (hash) dela, na aba escondida **Acessos**.

## 8. Publicar o serviço da plataforma (liga a planilha à plataforma e ao painel admin)
1. No Apps Script, clique em **Implantar → Nova implantação → Tipo: App da Web**.
2. Preencha:
   - **Descrição:** Plataforma da Jornada
   - **Executar como:** Eu (a sua conta)
   - **Quem pode acessar:** Qualquer pessoa

   Quem não tiver login válido na plataforma não consegue nada: o script confere a sessão em cada pedido.
3. Clique em **Implantar** e copie o **URL do app da Web**, que termina em `/exec`. Mande esse endereço para a equipe do projeto ligar a plataforma.
4. Quando o script mudar, use **Implantar → Gerenciar implantações → Editar → Nova versão**. Assim o endereço continua o mesmo.

## 9. Por último: fechar o compartilhamento
Depois que tudo estiver funcionando, deixe a planilha como **Restrita**, compartilhada só com T&D e Expansão. A plataforma continua funcionando, porque o script roda com a sua conta.

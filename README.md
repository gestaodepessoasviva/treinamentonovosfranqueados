# Jornada de Novos Franqueados VIVA: gamificação da Capacitação de Novos Franqueados

Protótipo navegável da jornada gamificada do novo franqueado VIVA, em React + Vite.
Os dados são de exemplo; cores, níveis, pontos e benefícios são provisórios.

## Rodar localmente

Requer [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
npm install
npm run dev
```

Abra http://localhost:5173. No login, qualquer e-mail e senha entram.

## Estrutura

```
src/
  data.js          dados de exemplo (níveis, regras, benefícios, etapas do mapa…)
  state.jsx        estado global (contexto React) e ações
  App.jsx          troca de telas
  components/      Header + menu, Mapa, Toast, componentes de UI
  pages/           Login, Início, Jornada, Pontos, Benefícios, Conquistas,
                   Notificações, Guia, Perfil
  assets/          imagem do mapa da jornada
prototipo/         protótipo original em HTML (referência)
```

## Gerar versão de produção

```bash
npm run build     # gera a pasta dist/
npm run preview
```

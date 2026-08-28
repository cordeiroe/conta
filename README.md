# Conta

> **Quanto devo?** — App pessoal pra fechar a conta do mês com seu professor de padel.

Aplicativo PWA que registra aulas e jogos de padel no dia a dia, calcula o total mensal com extras, e gera um resumo pronto pra colar no WhatsApp do professor.

## Por que existe

A maioria dos jogadores de padel fecha a conta do mês com o professor via **troca de mensagens no WhatsApp** — dezenas de mensagens confirmando presença, marcando jogos extras (grips, bolas), até esquecer o que aconteceu em um dia. Conta resolve isso com um único toque por dia e um botão de "Copiar resumo" no fim do mês.

## Features

- **Marcação rápida** — toggle de "Tive aula" / "Tive jogo" com um toque, direto da tela inicial
- **Extras por dia** — registra compras avulsas (grips, bolas, etc) com label e valor
- **Preço customizado por entrada** — aulas avulsas com valor diferente do padrão
- **Edição retroativa** — toque em qualquer dia do mês pra adicionar/editar
- **Resumo mensal** — total a pagar, breakdown por categoria, lista itemizada
- **Export WhatsApp** — texto formatado pronto pra colar no chat do professor
- **PWA instalável** — adiciona à tela inicial do iPhone como app nativo
- **Lockdown por Cloudflare Access** — login com Google OAuth antes do app carregar

## Tech Stack

**Frontend**
- React 19 + Vite 8
- TypeScript
- Tailwind CSS v4
- React Router 7
- Zustand (com persist localStorage)
- date-fns
- vite-plugin-pwa (Workbox)

**Infraestrutura**
- Cloudflare Pages (hosting)
- Cloudflare Zero Trust / Access (lockdown + Google OAuth)
- GitHub Actions (CI/CD)

## Live

🔒 **https://conta.cordeiroe.dev** — protegido por Cloudflare Access (Google OAuth)

## Demo local

```bash
git clone https://github.com/cordeiroe/conta.git
cd conta
npm install
npm run dev
# Abre em http://localhost:5173
```

## Arquitetura

App **100% client-side** na V1. Dados ficam no `localStorage` do browser, isolados por origem. Não tem backend, banco de dados, ou chamadas externas. Push notifications e sync multi-device estão planejados pra V2/V3.

```
┌─────────────────────────────────────┐
│  Browser (PWA)                      │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  React UI   │←→│ Zustand store│  │
│  └─────────────┘  └──────┬───────┘  │
│                          ↓          │
│                   localStorage      │
└─────────────────────────────────────┘
            ↓ (HTTPS, só assets)
┌─────────────────────────────────────┐
│  Cloudflare Pages (CDN edge)        │
│  - Conta.cordeiroe.dev              │
│  - Service worker + offline shell   │
└─────────────────────────────────────┘
            ↓ (auth gate)
┌─────────────────────────────────────┐
│  Cloudflare Access                  │
│  - Google OAuth IDP                 │
│  - Email allowlist                  │
│  - Session 30 dias                  │
└─────────────────────────────────────┘
```

## Estrutura

```
src/
├── routes/
│   ├── Home.tsx           # Hoje (top) + Mês grid (scroll)
│   ├── Consolidated.tsx   # Resumo mensal + WhatsApp copy
│   └── Config.tsx         # Preços, moeda, horários
├── components/
│   ├── TodayCard.tsx      # Card "Hoje" com toggle rápido
│   ├── EntrySheet.tsx     # Modal de edição (hoje + retroativo)
│   ├── MonthGrid.tsx      # Calendário com indicadores
│   ├── BottomNav.tsx      # Navegação inferior
│   └── icons.tsx          # SVG icons inline
├── store/
│   └── useContaStore.ts   # Zustand + persist localStorage
├── lib/
│   ├── dates.ts           # Helpers de data
│   ├── totals.ts          # Cálculos de total
│   └── whatsapp.ts        # Formatação do resumo
└── types.ts               # TypeScript types
```

## Deploy

Push pra `main` dispara GH Actions:

```bash
git push origin main
```

Pipeline:
1. **Lint** (oxlint)
2. **Build** (`npm run build` → `dist/`)
3. **Deploy** (`wrangler pages deploy` → Cloudflare Pages)
4. **Live** em https://conta-f0c65.pages.dev + https://conta.cordeiroe.dev

Secrets necessários no GitHub:
- `CLOUDFLARE_API_TOKEN` — token com permissões Pages + DNS + Access

## Licença

MIT

## Autor

**Emerson Marques** ([@cordeiroe](https://github.com/cordeiroe))
- Dev full-stack (Node + React)
- Internacional
- Jogador de padel 🎾

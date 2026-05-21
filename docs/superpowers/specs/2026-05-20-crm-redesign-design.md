# Atomic CRM — Redesign Visual Abrangente

**Data:** 2026-05-20
**Status:** Aprovado
**Escopo:** Redesign completo de UI/UX — todas as telas desktop

---

## Contexto e motivação

O CRM atual usa uma barra de navegação horizontal cinza, cores completamente acromáticas (chroma zero), tipografia plana sem hierarquia, e cards com bordas brutas. O resultado é uma interface sem personalidade e difícil de usar. O objetivo é elevar a experiência ao nível dos melhores CRMs modernos (Twenty, Attio, Linear) sem perder a base React + shadcn/ui existente.

---

## Decisões de design

### Navegação

- **Antes:** barra horizontal no topo com tabs e `bg-secondary` cinza
- **Depois:** sidebar vertical icon-only fixa na esquerda (52px de largura)
- Fundo da sidebar: `#1e293b` (slate escuro)
- Logo da aplicação no topo (28×28px, fundo teal com ícone branco)
- Ícones Lucide para cada seção, 16×16px, `stroke: rgba(255,255,255,0.3)` inativos
- Item ativo: fundo `rgba(20,184,166,0.15)`, ícone `stroke: #14b8a6`
- Seções: Dashboard, Agenda, Leads, Contatos, Empresas, Deals, Propostas
- Rodapé da sidebar: ícone de Configurações + avatar do usuário (inicia dropdown do UserMenu)

### Sistema de cores

**Fundo e superfícies (light mode):**
```
--background:        oklch(0.99 0.003 180)   /* #f8fafc com tint teal */
--card:              oklch(1 0.002 180)       /* branco puro */
--sidebar:           oklch(0.19 0.025 240)   /* #1e293b slate */
--border:            oklch(0.91 0.005 180)   /* #e2e8f0 */
```

**Accent teal:**
```
--primary:           oklch(0.61 0.14 175)    /* #14b8a6 */
--primary-foreground: oklch(0.99 0.003 175)  /* branco */
--primary-muted:     oklch(0.94 0.06 175)    /* #ccfbf1 */
```

**Tipografia:**
```
--foreground:        oklch(0.11 0.015 240)   /* #0f172a */
--muted-foreground:  oklch(0.45 0.01 240)    /* #64748b */
--subtle:            oklch(0.62 0.008 240)   /* #94a3b8 */
```

**Dark mode:** sidebar ainda mais escura (`oklch(0.13 0.015 240)`), fundo `oklch(0.14 0 0)`, primary teal levemente mais claro para contraste adequado.

### Tipografia

- **Fonte:** DM Sans (substituindo Inter) — importada via `@fontsource-variable/dm-sans` ou Google Fonts
- **Hierarquia:**
  - Label de seção: `11px / weight 500 / color: #14b8a6` — identifica o contexto da página
  - Page title: `18–20px / weight 700 / color: #0f172a`
  - Card title: `15px / weight 600 / color: #0f172a`
  - Section label interno: `11px / weight 500 / color: #14b8a6`
  - Campo de dado: `12–13px / weight 400 / color: #475569`
  - Caption / timestamp: `10–11px / weight 400 / color: #94a3b8`
  - Field label (form): `10px / weight 600 / uppercase / letter-spacing 0.06em / color: #64748b`

### Cards e superfícies

- Fundo da página: `#f8fafc` (levemente off-white com tint teal)
- Cards brancos com shadow: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)`
- Border-radius dos cards: `10px`
- Separadores internos dos cards: `1px solid #f8fafc` (muito sutil)
- Sem border visível nos cards — apenas sombra
- Modais e dropdowns: shadow `0 4px 16px rgba(0,0,0,0.10)`

### Badges de status

```
Quente:      background #ccfbf1, color #0f766e
Morno:       background #fef9c3, color #854d0e
Frio:        background #f1f5f9, color #475569
Em proposta: background #ede9fe, color #6d28d9
Perdido:     background #fef2f2, color #b91c1c
Ganho:       background #dcfce7, color #15803d
```

### Botões

- Primary: `background #14b8a6, color white, border-radius 8px`
- Secondary: `background white, border 1px #e2e8f0, color #475569`
- Ghost: `background transparent, color #64748b`
- Destructive: `background #fef2f2, color #ef4444`
- Todos: `font-weight 600, font-size 12–13px, padding 7–8px 14–16px`

---

## Telas a redesenhar

### 1. Layout global (Layout.tsx + Header.tsx → Sidebar.tsx)

**Antes:** `<Header>` horizontal + `<main>` abaixo  
**Depois:** `flex h-screen` com `<Sidebar>` fixo esquerdo + `<main>` rolável direito

Estrutura:
```
<div class="flex h-screen overflow-hidden bg-background">
  <Sidebar />
  <main class="flex-1 overflow-y-auto">
    <div class="px-8 py-6 max-w-screen-xl mx-auto">
      {children}
    </div>
  </main>
  <Notification />
</div>
```

O `Header.tsx` atual é convertido em `Sidebar.tsx`. O `Layout.tsx` é simplificado.

### 2. Dashboard (Dashboard.tsx + widgets)

- Grid 3 colunas: `grid-cols-[200px_1fr_160px]` com `gap-4`
- Topbar por página: label de contexto (teal, 10px) + título + ações à direita
- Todos os widgets ganham `card-label` em teal como título de seção
- Métricas numéricas: valor em `font-weight 700`, label em `text-subtle 9px`
- Gráficos mantidos, apenas estilizados com as cores teal

### 3. Lista de Contatos (ContactList.tsx + ContactListContent.tsx)

- Layout: search + filtros + tabela em um único `card` com shadow
- Topbar: label "Pessoas" teal + título "Contatos N" + busca inline + botões
- Filtros ativos renderizados como chips removíveis (badge colorido + ×)
- Tabela: header com colunas em `uppercase 10px font-semibold text-subtle`
- Linhas: avatar colorido 32px, nome em `font-semibold`, empresa e status
- Linha selecionada: `bg-primary/5` (tint teal muito suave)
- Ações por linha: botões icon-only (email, telefone) visíveis no hover
- Paginação no rodapé do card: página ativa com `bg-primary text-white`

### 4. Detalhe de Contato (ContactShow.tsx)

Layout de 2 colunas dentro do `<main>`:

**Coluna esquerda (220px, bg branco, border-right):**
- Breadcrumb "← Contatos" no topo
- Avatar grande (56px) centralizado com iniciais coloridas
- Nome, cargo e empresa abaixo do avatar
- Badge de status
- Quatro ações rápidas icon-only (email, ligar, editar, mais)
- Divisor
- Campos de informação: cada um com field-label uppercase e valor abaixo
- Divisor
- Seção "Deals" com mini card por deal (nome, valor, estágio, barra de progresso)

**Coluna direita (flex-1, bg #f8fafc):**
- Tabs: Atividade | Tarefas (n) | Notas | Emails
- Tab ativa: `border-bottom 2px solid #14b8a6, color #14b8a6`
- Composer de nota: card com textarea + botões Cancelar/Salvar
- Feed de atividade: cards individuais por evento
  - Avatar/ícone do tipo de evento (nota: avatar do autor; deal: ícone roxo; ligação: ícone teal; email: ícone azul)
  - Nome + texto da atividade + timestamp

### 5. Tela de Empresa (CompanyShow.tsx)

Mesma estrutura do detalhe de contato, adaptada:
- Avatar quadrado (logo da empresa ou iniciais)
- Campos: nome, setor, website, telefone, endereço
- Seção "Contatos" com lista de pessoas vinculadas
- Seção "Deals" igual ao contato

### 6. Lista de Leads (LeadList.tsx + LeadRow)

Layout verificado contra o código de `LeadList.tsx` e `LeadShow.tsx`.

**Toolbar:** busca (alwaysOn) + dropdown status (alwaysOn) + dropdown temperatura + SortButton + CreateButton "Novo Lead"

**Tabela em card único** com colunas `[1.4fr_1fr_0.8fr_0.8fr]`:
- Col 1: nome completo em `font-semibold` + empresa ou email ou telefone em `text-muted-foreground`
- Col 2: interesse (texto truncado) + fonte em `text-muted-foreground`
- Col 3: `LeadStatusBadge` empilhado sobre `LeadTemperatureBadge` (dois badges separados)
- Col 4: `next_action_at` formatado, alinhado à direita

**Badges de status (LeadStatusBadge):**
```
novo:        badge secondary
contactado:  badge secondary
qualificado: badge secondary
convertido:  badge default (teal)
descartado:  badge secondary
```

**Badges de temperatura (LeadTemperatureBadge):**
```
frio:  badge outline + ícone
morno: badge outline + ícone
quente: badge teal filled + ícone
```

**LeadShow:** breadcrumb "← Leads" + card com nome + dois badges + botões Editar + "Converter em Contato"
- Grade 2 colunas de campos: Empresa, Fonte, Email (link teal), Telefone, Próxima ação, Motivo de descarte
- Divider + bloco de texto de Interesse

### 7. Agenda (AgendaList.tsx + AgendaItem.tsx)

Verificado contra `AgendaList.tsx`: **não é um calendário** — é uma lista inteligente de ações pendentes que agrega 4 tipos de entidade (tasks com `done_date null`, leads com status open, deals com stage open não arquivado, proposals com `status=sent`) em 4 seções de urgência.

**Layout:** `grid xl:grid-cols-2 gap-4` com 4 quadrantes:

| Seção | Estado | Ícone | Cor |
|---|---|---|---|
| Atrasados | `overdue` | Alerta vermelho | `#fef2f2` fundo do card |
| Hoje | `today` | Relógio teal | fundo neutro |
| Riscos | `missing-next-action` ou `stale` | Aviso laranja | `#fffbeb` fundo do card |
| Próximos | `upcoming` | Calendário | fundo neutro |

**Cada item (AgendaItem):** ícone do `kind` (task/lead/deal/proposal) + título + contexto (nome da empresa/contato) + data + link para o registro. Nenhum item tem ação inline — é tudo link para o detalhe.

**Estado vazio:** quando não há itens em uma seção, exibe mensagem "Nenhum item" dentro do card da seção (não oculta o card).

### 8. Negócios — Kanban (DealList.tsx + DealCard.tsx + DealColumn.tsx)

Verificado contra o código real. O DealShow abre como **Dialog/modal**, não como página separada.

**Toolbar:** FilterButton + ExportButton + CreateButton "Novo Negócio"

**Filtros:** busca (alwaysOn), empresa (autocomplete), categoria (select), tipo (select), fonte (busca), "Apenas meus" toggle (alwaysOn)

**Board horizontal** `flex gap-4`: colunas configuráveis via `dealStages` do ConfigurationContext.

**DealColumn:** header com nome do estágio + `totalAmount / weightedAmount` em `text-muted-foreground`. Droppable para drag-and-drop entre colunas.

**DealCard:**
- Linha 1: `CompanyName — DealName` em `font-semibold` + CompanyAvatar 20px
- Linha 2: valor compacto + categoria em `text-muted-foreground`
- Badges: `deal_type` (secondary), `probability%` (outline), `Pond. X` (outline), badges de risco:
  - `missing_next_action` → badge destructive `<CalendarClock> Sem próxima ação`
  - `stale` → badge outline `<AlertCircle> Inativo há Xd`
- Dragging: `rotate(1.5deg)` + `shadow-lg` + `opacity-90`

**DealShow (Dialog):**
- Header: CompanyAvatar 40px + nome + botões (Arquivar + Editar, ou Desarquivar + Deletar se arquivado)
- Alerta laranja "Arquivado" no topo quando `archived_at` preenchido
- Metadados em `flex-wrap gap-8`: data de fechamento (+ badge "Passado" se vencida), valor, valor ponderado, probabilidade, categoria, tipo, estágio, origem, motivo de perda
- Seção Contatos: chips clicáveis com avatar + nome
- Seção Descrição: texto livre
- DealProposalsPanel: mini-cards de propostas vinculadas + botão "Nova Proposta"
- Notes: feed de notas com composer

**Strip de arquivados:** colapsável ao final do board, sempre visível (mesmo oculto).

### 9. Propostas (ProposalList.tsx + ProposalShow.tsx)

Verificado contra `ProposalList.tsx`, `ProposalShow.tsx`, `ProposalActions.tsx`.

**Lista — Toolbar:** dropdown status (alwaysOn) + SortButton (created_at/updated_at/valid_until/total) + CreateButton "Nova Proposta"

**Tabela em card** com `divide-y`, colunas `[1.5fr_0.8fr_0.7fr_0.8fr]`:
- Col 1: título em `font-semibold` + número da proposta em `text-muted-foreground`
- Col 2: ProposalStatusBadge
- Col 3: `valid_until` formatado
- Col 4: total em moeda configurável, alinhado à direita

**Badges de status:**
```
draft:    secondary (cinza)
sent:     teal filled
accepted: verde
rejected: vermelho destructive
expired:  outline
```

**ProposalShow — layout `flex gap-8`:**
- Coluna esquerda (ações): botões Duplicar (`<Copy>`) + Exportar PDF (`<FileText>`) + status + resumo (número, validade, total em teal)
- Coluna direita: ProposalPreview — documento formatado com:
  - Header com borda teal 3px: título "Proposta Comercial", empresa, número, datas, destinatário
  - Tabela de itens: descrição + qty + preço unitário + desconto + total
  - Total final + condições comerciais
  - Print mode: apenas ProposalPreview + botão "Imprimir" (`window.print()`)

### 10. Formulários de criação (CreateSheet.tsx)

Padrão sheet lateral (slide-over), 340px de largura:
- Header: label de contexto teal + título "Novo X" + botão fechar
- Avatar picker no topo do formulário (quando aplicável)
- Campos com `field-label` uppercase + `field-input` com fundo `#f8fafc`
- Input focado: `border-color #14b8a6, box-shadow 0 0 0 3px rgba(20,184,166,0.12)`
- Autocomplete de empresa: dropdown com sombra md
- Seletor visual de status: 3 botões horizontais com estado selecionado teal
- Rodapé fixo: `border-top + Cancelar + Criar X` alinhados à direita

### 11. Estados vazios

Padrão para todos os estados vazios:
- Ícone centralizado em quadrado arredondado (`border-radius 20px`)
  - Teal-tinted (`bg: #ccfbf1`) para ações positivas (criar, adicionar)
  - Cinza (`bg: #f1f5f9`) para buscas sem resultado
- Título em `font-weight 700 / 14px / #0f172a`
- Descrição em `11px / #64748b / line-height 1.6`, máximo 2 linhas
- Botão de ação primária (teal)
- Link secundário quando aplicável (ex: "ou importar CSV")

---

## O que não muda

- **Layout mobile:** `MobileLayout.tsx`, `MobileHeader.tsx`, `MobileNavigation.tsx` — sem alteração
- **Lógica de dados:** nenhum provider, query ou tipo alterado
- **Estrutura de rotas:** sem mudanças
- **Componentes `src/components/ui/`:** apenas ajustes de tokens CSS, não reescrita

---

## Arquivos principais afetados

| Arquivo | Mudança |
|---|---|
| `src/index.css` | Sistema de cores completo (teal, DM Sans, sombras) |
| `src/components/atomic-crm/layout/Layout.tsx` | Estrutura flex com sidebar |
| `src/components/atomic-crm/layout/Header.tsx` | Convertido em Sidebar.tsx |
| `src/components/atomic-crm/layout/Sidebar.tsx` | Novo componente |
| `src/components/atomic-crm/layout/TopToolbar.tsx` | Ajuste para novo topbar por página |
| `src/components/atomic-crm/dashboard/Dashboard.tsx` | Grid 3 colunas, topbar |
| `src/components/atomic-crm/dashboard/HotContacts.tsx` | Card + label teal |
| `src/components/atomic-crm/dashboard/*.tsx` | Labels e tipografia em todos os widgets |
| `src/components/atomic-crm/contacts/ContactList.tsx` | Topbar + layout |
| `src/components/atomic-crm/contacts/ContactListContent.tsx` | Tabela redesenhada |
| `src/components/atomic-crm/contacts/ContactListFilter.tsx` | Filter chips |
| `src/components/atomic-crm/contacts/ContactShow.tsx` | Layout 2 colunas |
| `src/components/atomic-crm/contacts/ContactEmpty.tsx` | Estado vazio novo padrão |
| `src/components/atomic-crm/companies/CompanyShow.tsx` | Layout 2 colunas |
| `src/components/atomic-crm/leads/LeadList.tsx` | Topbar + colunas corretas |
| `src/components/atomic-crm/leads/LeadStatusBadge.tsx` | Novos tokens de cor para status e temperatura |
| `src/components/atomic-crm/leads/LeadShow.tsx` | Layout campo-grid + badges |
| `src/components/atomic-crm/agenda/AgendaList.tsx` | Grid 2×2 com 4 seções de urgência |
| `src/components/atomic-crm/agenda/AgendaItem.tsx` | Tipografia + ícones por kind |
| `src/components/atomic-crm/deals/DealCard.tsx` | Tipografia + badges + estado dragging |
| `src/components/atomic-crm/deals/DealColumn.tsx` | Header com totais, drop zone styling |
| `src/components/atomic-crm/deals/DealShow.tsx` | Metadados, seções, layout modal |
| `src/components/atomic-crm/proposals/ProposalList.tsx` | Tabela + badges de status |
| `src/components/atomic-crm/proposals/ProposalShow.tsx` | Layout 2 colunas, preview tipografado |
| `src/components/atomic-crm/proposals/ProposalStatusBadge.tsx` | Novos tokens de cor |
| `src/components/atomic-crm/misc/CreateSheet.tsx` | Sheet redesenhado |
| `src/components/atomic-crm/misc/AsideSection.tsx` | Label teal + tipografia |
| `src/components/atomic-crm/misc/Status.tsx` | Novos badges |
| `src/components/atomic-crm/misc/ListPlaceholder.tsx` | Novo padrão estado vazio |

---

## Fonte DM Sans

Instalar via npm: `npm install @fontsource-variable/dm-sans`

No `index.css`, substituir:
```css
@import "@fontsource-variable/inter";
/* por */
@import "@fontsource-variable/dm-sans";
```

E atualizar o token:
```css
--font-sans: "DM Sans Variable", ui-sans-serif, system-ui, sans-serif;
```

---

## Critérios de sucesso

- Sidebar icon-only no lugar da barra horizontal
- Accent teal visível em todo o app (labels, botão primário, item ativo, badges)
- DM Sans aplicado em toda a tipografia
- Hierarquia clara: cada tela tem label de contexto + título + conteúdo sem peso visual igual
- Cards com sombra suave, sem bordas brutas
- Estados vazios com ícone ilustrativo e ação clara
- Formulários com campos visuais e estado de foco teal
- Dark mode funcionando com as novas cores

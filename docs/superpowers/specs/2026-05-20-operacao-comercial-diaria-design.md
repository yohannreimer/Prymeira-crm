# Operacao Comercial Diaria - Design

Data: 2026-05-20
Projeto base: Atomic CRM
Status: aprovado em conversa

## Objetivo

Construir a segunda camada operacional do CRM Nivel 2: uma agenda comercial diaria, um dashboard comercial mais forte e automacoes simples de CRM.

A promessa desta fase e:

> Todo vendedor sabe o que fazer hoje; todo gestor sabe onde a operacao comercial esta travando.

## Escopo

Esta fase entrega tres blocos integrados:

1. Agenda Comercial
2. Dashboard Comercial Mais Forte
3. Automacoes Simples MVP

Ficam fora desta fase:

- propostas rapidas;
- automacao visual editavel;
- campanhas;
- inbox, WhatsApp e email marketing;
- cron/job de background para varreduras periodicas.

## Agenda Comercial

Criar uma nova area chamada `Agenda`, focada no trabalho diario do vendedor.

A agenda deve reunir:

- tarefas atrasadas;
- tarefas de hoje;
- proximas tarefas futuras;
- leads sem proxima acao;
- leads com proxima acao vencida;
- deals sem proxima acao;
- deals parados;
- deals com proxima acao vencida.

As tarefas deixam de ser ligadas apenas a contatos e passam a poder apontar para:

- `contact_id`;
- `lead_id`;
- `deal_id`.

Para manter compatibilidade com dados existentes, `contact_id` passa a ser opcional. A regra de produto e que uma tarefa deve ter pelo menos um vinculo comercial ou ser explicitamente avulsa. Na primeira versao, a UI sempre cria tarefas vinculadas quando existe contexto.

## Dashboard Comercial

O dashboard deve ser reorganizado para ficar mais comercial:

### Vendedor

- tarefas atrasadas;
- tarefas de hoje;
- leads pendentes;
- leads quentes;
- leads sem proxima acao;
- deals sem proxima acao;
- deals parados;
- follow-ups vencidos.

### Gestor

- leads por status;
- leads quentes;
- taxa de conversao lead -> deal;
- deals abertos;
- valor aberto;
- valor ponderado;
- deals parados por etapa;
- motivos de perda;
- ranking por vendedor.

Na primeira versao, as metricas podem ser calculadas no frontend com `useGetList` e utilitarios testados. Views SQL agregadas ficam para uma fase posterior se a performance pedir.

## Automacoes Simples MVP

As automacoes desta fase sao internas e baseadas em eventos do CRM, nao editaveis pelo usuario final ainda.

Eventos iniciais:

- lead criado;
- lead convertido;
- deal criado;
- deal atualizado para etapa `proposal-sent`;
- deal atualizado sem proxima acao.

Acoes iniciais:

- criar tarefa;
- criar nota simples quando fizer sentido;
- registrar execucao em `automation_runs`.

Regras MVP:

1. Lead criado sem `next_action_at` cria tarefa de primeiro contato para o responsavel.
2. Lead convertido marca o lead como convertido e registra execucao.
3. Deal criado sem `next_action_at` cria tarefa de follow-up.
4. Deal movido para `proposal-sent` cria follow-up em 2 dias.
5. Deal sem proxima acao aparece na agenda como risco, mesmo quando nao gerar tarefa.

## Dados

Alterar `tasks`:

- `contact_id` passa a aceitar `null`;
- adicionar `lead_id`;
- adicionar `deal_id`;
- adicionar `automation_run_id`;
- adicionar foreign keys para `leads`, `deals` e `automation_runs`.

Adicionar `automation_runs`:

- `id`;
- `created_at`;
- `rule_key`;
- `trigger_resource`;
- `trigger_record_id`;
- `action_resource`;
- `action_record_id`;
- `status`;
- `message`;
- `sales_id`.

## UX

Adicionar item de navegacao `Agenda`.

Na agenda, cada item deve ter:

- tipo visual: tarefa, lead ou deal;
- titulo;
- contexto;
- prazo;
- responsavel;
- link para abrir o registro;
- estado: atrasado, hoje, futuro, sem proxima acao, parado.

O dashboard deve evitar layout de landing page. Deve continuar denso e operacional, com cards pequenos e listas escaneaveis.

## Testes

Cobrir com testes unitarios:

- agrupamento da agenda por prioridade/data;
- calculo de metricas comerciais;
- regras de automacao;
- criacao de tarefas automaticas sem duplicar quando a regra ja rodou.

Cobrir com smoke manual/local:

- criar lead sem proxima acao cria tarefa;
- criar deal sem proxima acao cria tarefa;
- mover deal para Proposta enviada cria follow-up;
- abrir Agenda e ver itens;
- abrir Dashboard e ver metricas comerciais.

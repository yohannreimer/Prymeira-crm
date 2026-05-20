# Propostas Rapidas e Automacoes Configuraveis - Design

Data: 2026-05-20
Projeto base: Atomic CRM
Status: aprovado em conversa para virar spec

## Objetivo

Construir a terceira camada do CRM Nivel 2: um fluxo comercial que permite gerar propostas rapidamente a partir de um negocio e configurar automacoes comerciais simples sem precisar alterar codigo.

A promessa desta fase e:

> O vendedor consegue transformar um negocio em proposta em poucos minutos, e o admin consegue controlar as automacoes comerciais basicas do CRM.

## Escopo

Esta fase entrega dois blocos integrados:

1. Propostas Rapidas
2. Automacoes Configuraveis

Ficam fora desta fase:

- editor visual de workflow com blocos;
- campanhas;
- envio real por email ou WhatsApp;
- assinatura eletronica;
- editor avancado de PDF;
- regras com ramificacoes complexas de `se/senao`;
- automacoes de background com cron real.

## Propostas Rapidas

Criar um modulo de propostas ligado aos negocios.

### Fluxo principal

1. Usuario abre um negocio.
2. Clica em `Gerar proposta`.
3. O CRM abre uma tela de proposta ja preenchida com dados do negocio.
4. Usuario ajusta titulo, validade, escopo, itens, valores e observacoes.
5. Usuario salva como rascunho ou marca como enviada.
6. A proposta fica visivel no negocio e permanece acessivel para consulta posterior.
7. O dashboard e a agenda passam a considerar propostas abertas, vencidas e aceitas.

### Dados da proposta

Cada proposta deve ter:

- negocio vinculado;
- empresa vinculada;
- contato principal opcional;
- responsavel comercial;
- titulo;
- numero sequencial legivel;
- status;
- data de criacao;
- data de envio;
- validade;
- aceite;
- recusa;
- escopo;
- observacoes comerciais;
- subtotal;
- desconto;
- total;
- moeda.

Status iniciais:

- `draft`: rascunho;
- `sent`: enviada;
- `accepted`: aceita;
- `rejected`: recusada;
- `expired`: expirada.

### Itens da proposta

Cada proposta deve ter itens editaveis:

- descricao;
- quantidade;
- valor unitario;
- desconto opcional;
- total calculado;
- ordem.

O MVP nao precisa ter catalogo de produtos separado. Os itens podem ser digitados manualmente no inicio. A estrutura, porem, deve deixar caminho aberto para um catalogo depois.

### Visualizacao

A proposta deve ter uma tela de visualizacao com aparencia comercial e limpa, incluindo:

- cabecalho com nome da empresa emissora;
- dados do cliente;
- titulo da proposta;
- escopo;
- tabela de itens;
- total;
- validade;
- observacoes.

Na primeira versao, a proposta sera uma pagina HTML dentro do CRM. Exportar PDF fica fora do MVP desta fase e entra como evolucao posterior.

## Automacoes Configuraveis

Criar uma area `Automacoes` para admin/power user configurar regras comerciais pre-definidas.

Esta tela nao sera um workflow visual livre. Ela sera uma lista de regras prontas, com parametros editaveis.

### Tela de automacoes

A tela deve permitir:

- listar automacoes;
- ligar/desligar automacao;
- editar parametros permitidos;
- ver gatilho;
- ver condicao;
- ver acao;
- ver ultima execucao;
- abrir historico de execucoes.

### Regras iniciais

As regras iniciais devem cobrir:

1. Lead criado sem proxima acao cria tarefa de primeiro contato.
2. Negocio criado sem proxima acao cria tarefa de follow-up.
3. Negocio movido para `Proposta enviada` cria tarefa de follow-up.
4. Proposta marcada como enviada cria tarefa de follow-up em X dias.
5. Proposta vencida aparece na Agenda como risco.
6. Proposta aceita move o negocio para ganho ou cria tarefa de fechamento, conforme configuracao.

### Parametros editaveis

Cada regra pode expor somente parametros seguros:

- ativo/inativo;
- prazo da tarefa em dias;
- tipo da tarefa;
- texto padrao da tarefa;
- responsavel da tarefa:
  - mesmo responsavel do registro;
  - usuario especifico;
- acao ao aceitar proposta:
  - mover negocio para ganho;
  - criar tarefa de fechamento;
  - nao fazer nada.

### Historico

O historico deve usar `automation_runs`, expandindo a utilidade da tabela criada na fase anterior.

Cada execucao deve mostrar:

- regra executada;
- recurso que disparou;
- registro que disparou;
- acao criada;
- status;
- mensagem;
- data;
- responsavel.

## Modelo de Dados

Adicionar novas tabelas:

- `proposal_templates`;
- `proposals`;
- `proposal_items`;
- `automation_rules`;

Expandir ou reutilizar:

- `automation_runs`;
- `tasks`;
- `deals`;

### `proposal_templates`

Usada para templates simples de proposta. No MVP pode começar com poucos campos e um template padrao.

Campos:

- `id`;
- `name`;
- `description`;
- `default_scope`;
- `default_terms`;
- `active`;
- `created_at`;
- `updated_at`.

### `proposals`

Campos:

- `id`;
- `deal_id`;
- `company_id`;
- `contact_id`;
- `sales_id`;
- `template_id`;
- `number`;
- `title`;
- `status`;
- `scope`;
- `terms`;
- `currency`;
- `subtotal`;
- `discount_amount`;
- `total`;
- `valid_until`;
- `sent_at`;
- `accepted_at`;
- `rejected_at`;
- `created_at`;
- `updated_at`.

### `proposal_items`

Campos:

- `id`;
- `proposal_id`;
- `description`;
- `quantity`;
- `unit_price`;
- `discount_amount`;
- `total`;
- `index`;

### `automation_rules`

Campos:

- `id`;
- `rule_key`;
- `name`;
- `description`;
- `enabled`;
- `trigger_resource`;
- `trigger_event`;
- `condition_key`;
- `action_key`;
- `params`;
- `created_at`;
- `updated_at`.

`params` deve ser `jsonb`, mas validado no frontend por regra conhecida. O usuario nao edita JSON cru.

## Arquitetura

### Frontend

Criar novos modulos:

- `src/components/atomic-crm/proposals/`;
- `src/components/atomic-crm/automations/`.

O modulo de propostas deve seguir os padroes atuais de recursos do CRM:

- list;
- create;
- edit;
- show;
- componentes de formulario pequenos;
- utilitarios testados para calculo de totais e status.

O modulo de automacoes deve ter UI propria, com lista de regras e formulario de parametros. Ele pode usar recursos `automation_rules` e `automation_runs`.

### Backend / Supabase

Declarar schema em `supabase/schemas/01_tables.sql`, policies em `05_policies.sql` e grants em `06_grants.sql`.

Criar migracao manual para:

- tabelas de propostas;
- tabelas de regras;
- indices;
- RLS;
- grants;
- seeds iniciais das automacoes padrao.

### Providers

Atualizar Supabase e FakeRest para suportar:

- propostas;
- itens de proposta;
- templates;
- regras de automacao.

O motor de automacoes deve deixar de depender apenas de constantes internas e passar a consultar as regras ativas.

## Agenda e Dashboard

### Agenda

A Agenda deve passar a incluir:

- propostas vencidas;
- propostas enviadas aguardando follow-up;
- tarefas criadas por automacao de proposta.

### Dashboard

O dashboard deve adicionar:

- propostas abertas;
- valor em propostas abertas;
- propostas aceitas;
- taxa de aceite;
- propostas vencidas;
- valor vencido.

## UX

### Navegacao

Adicionar:

- `Propostas` no menu principal ou dentro de `Negocios`;
- `Automacoes` em Configuracoes ou menu admin.

Recomendacao inicial:

- `Propostas` aparece como area propria, mas tambem fica muito visivel dentro do detalhe do negocio.
- `Automacoes` fica dentro de Configuracoes para evitar que usuario comum mexa sem querer.

### Tom visual

Manter a interface densa, operacional e em pt-BR. Evitar tela de landing page. As telas devem ser boas para uso repetido:

- listas escaneaveis;
- status claros;
- botoes de acao diretos;
- preview de proposta limpo;
- historico facil de auditar.

## Testes

Cobrir com testes unitarios:

- calculo de totais da proposta;
- mudanca de status da proposta;
- proposta vencida;
- regras de automacao habilitadas/desabilitadas;
- parametros de automacao;
- agenda com propostas vencidas;
- metricas de propostas no dashboard.

Cobrir com smoke manual/local:

- criar proposta a partir de negocio;
- adicionar item e conferir total;
- marcar proposta como enviada;
- confirmar criacao de tarefa automatica;
- abrir automacoes e desligar uma regra;
- repetir evento e confirmar que a regra desligada nao executa;
- abrir Agenda e ver proposta vencida;
- abrir Dashboard e ver metricas de proposta.

## Decisoes

1. Automacoes serao configuraveis, mas baseadas em regras pre-definidas.
2. Propostas comecam como HTML dentro do CRM; PDF fica opcional para o MVP.
3. Catalogo de produtos fica fora desta fase, mas o modelo de itens deixa caminho aberto.
4. Automacoes de proposta entram desde o inicio porque justificam a tela de automacoes.
5. `automation_runs` continua sendo a fonte de auditoria das execucoes.

## Riscos

Risco: propostas virarem um editor de documento complexo.
Mitigacao: formulario estruturado e preview comercial, sem editor livre no MVP.

Risco: automacoes ficarem poderosas demais e dificeis de testar.
Mitigacao: regras conhecidas, parametros limitados e testes por regra.

Risco: tarefas duplicadas por automacao.
Mitigacao: manter protecao por `automation_runs` e `rule_key`.

Risco: regra de proposta vencida exigir cron.
Mitigacao: na primeira versao, a Agenda e o Dashboard calculam vencimento ao listar registros; cron fica para fase futura.

## Criterios de Aceite

A fase esta pronta quando:

- usuario consegue criar proposta a partir de um negocio;
- proposta possui itens, totais, status e validade;
- proposta aparece dentro do detalhe do negocio;
- usuario consegue marcar proposta como enviada, aceita, recusada ou expirada;
- automacao de proposta enviada cria follow-up conforme regra ativa;
- admin consegue ligar/desligar regras de automacao;
- admin consegue editar parametros permitidos;
- `automation_runs` mostra historico das execucoes;
- Agenda mostra propostas vencidas ou aguardando retorno;
- Dashboard mostra metricas basicas de propostas;
- Supabase e FakeRest suportam o fluxo;
- testes, typecheck, lint e build passam.

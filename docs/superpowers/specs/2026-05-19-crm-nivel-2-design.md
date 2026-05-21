# CRM Nivel 2 - Design de Produto

Data: 2026-05-19
Projeto base: Atomic CRM
Status: design aprovado em conversa, aguardando revisao final do usuario

## Objetivo

Construir, em cima do Atomic CRM, um CRM de vendas nivel 2: forte o suficiente para pequenas e medias empresas, sem tentar virar uma plataforma completa tipo HubSpot na primeira versao.

O produto deve ser uma maquina de vendas e funil. A promessa central e:

> Todo vendedor sabe o que fazer agora; todo gestor sabe onde a venda esta travando.

O CRM deve nascer com um jeito recomendado de operar, mas permitir customizacao. Ele deve atender tres modos de venda:

- venda consultiva B2B;
- venda rapida e de volume;
- venda recorrente por carteira, renovacao, upsell e cross-sell.

## Fora Do Escopo Inicial

Os itens abaixo ficam fora do inicio para evitar que o projeto vire uma plataforma de marketing grande demais:

- campanhas;
- email marketing;
- WhatsApp profundo;
- inbox compartilhada;
- sequencias automaticas complexas;
- construtor visual avancado de workflow;
- landing pages e formularios de marketing;
- testes A/B;
- marketplace de integracoes.

O produto pode preparar caminho tecnico para isso depois, mas a primeira visao deve focar em vendas, funil, follow-up, propostas e gestao comercial.

## Principios De Produto

1. O CRM nao deve ser so cadastro. Ele deve gerar acao comercial.
2. O vendedor precisa ter uma tela diaria clara.
3. O gestor precisa enxergar funil, forecast, gargalos e performance.
4. A empresa deve conseguir comecar com padroes prontos, mas editar etapas, origens, tipos de venda, regras e templates.
5. Comunicacao integrada e importante, mas entra depois do nucleo comercial.
6. Propostas devem ser rapidas de montar, nao um editor de documentos complexo.
7. Automacoes devem ser simples e internas no inicio: quando algo acontecer, executar uma acao de CRM.

## Nucleo Do Produto

### 1. Caixa De Leads

Uma entrada comercial separada do pipeline principal. Ela serve para qualificar leads antes de criar um deal.

Campos principais:

- nome;
- email;
- telefone;
- empresa;
- origem;
- interesse;
- temperatura;
- responsavel;
- status;
- SLA de primeiro contato;
- proxima acao;
- motivo de descarte.

Acoes principais:

- qualificar;
- converter em contato, empresa e deal;
- descartar com motivo;
- agendar follow-up;
- registrar nota.

### 2. Pipeline De Deals

Evolucao do pipeline atual do Atomic CRM. O Kanban continua sendo central, mas ganha inteligencia comercial.

Campos e comportamentos desejados:

- tipo de venda: rapida, consultiva ou recorrente;
- valor;
- valor ponderado por probabilidade;
- etapa;
- probabilidade;
- previsao de fechamento;
- origem;
- responsavel;
- tempo parado na etapa;
- proxima atividade;
- motivo de perda;
- propostas vinculadas;
- notas e tarefas vinculadas.

O pipeline deve permitir que vendedor e gestor identifiquem rapidamente:

- deals sem proxima acao;
- deals parados;
- propostas em aberto;
- oportunidades proximas do fechamento;
- gargalos por etapa.

### 3. Agenda Comercial

Uma experiencia central para o vendedor. Deve responder: "o que eu tenho que fazer hoje?"

Visoes principais:

- tarefas de hoje;
- tarefas atrasadas;
- leads sem primeiro contato;
- deals sem proxima acao;
- propostas aguardando retorno;
- follow-ups futuros.

Essa area pode evoluir a entidade atual `tasks`, mas precisa virar uma tela de trabalho diaria, nao apenas uma lista auxiliar.

### 4. Automacoes Simples Quando/Entao

Um construtor simples, nao visual, baseado em gatilhos e acoes.

Exemplos:

- quando um lead for criado, criar uma tarefa de primeiro contato;
- quando um deal mudar para "Proposta Enviada", criar follow-up em 2 dias;
- quando um deal ficar parado 3 dias, criar tarefa para o responsavel;
- quando uma proposta expirar, marcar deal como precisando de atencao.

Gatilhos iniciais:

- lead criado;
- lead convertido;
- lead descartado;
- deal criado;
- deal mudou de etapa;
- deal parado por um numero configuravel de dias, com padrao inicial de 3 dias;
- tarefa venceu;
- proposta criada;
- proposta enviada;
- proposta aceita;
- proposta recusada;
- proposta expirada.

Acoes iniciais:

- criar tarefa;
- atribuir responsavel;
- mudar status;
- mudar etapa;
- criar nota;
- marcar prioridade;
- criar lembrete interno.

O sistema deve registrar historico de execucao para diagnostico e confianca.

### 5. Propostas Rapidas

Um gerador rapido de propostas ligado aos deals. O objetivo e velocidade, padronizacao e rastreabilidade.

Entidades principais:

- catalogo de produtos/servicos;
- templates simples de proposta;
- propostas;
- itens da proposta.

Fluxo principal:

1. Vendedor abre um deal.
2. Cria proposta a partir de um template.
3. Adiciona itens do catalogo.
4. Ajusta quantidade, desconto, prazo e observacoes.
5. Gera PDF ou link.
6. Status da proposta fica visivel no deal.
7. O sistema cria follow-up ou proxima acao conforme regra.

Status iniciais:

- rascunho;
- enviada;
- aceita;
- recusada;
- expirada.

## Modulos Do Produto

### Leads

Modulo de entrada e qualificacao comercial. Deve evitar que leads crus poluam o pipeline.

### Deals E Pipeline

Modulo central de oportunidades. Deve ser forte para operacao diaria e para leitura gerencial.

### Atividades Comerciais

Modulo que unifica tarefas, follow-ups e proximos passos. Deve sustentar a rotina do vendedor.

### Automacoes

Modulo de regras simples quando/entao. Deve reduzir esquecimento e padronizar operacao comercial.

### Propostas

Modulo para catalogo, templates, propostas, itens, PDF/link e status.

### Dashboards De Vendas

Dois grupos:

- vendedor: tarefas, leads pendentes, deals prioritarios, propostas abertas;
- gestor: forecast, conversao, deals parados, ranking por vendedor, motivos de perda, propostas enviadas e aceitas.

### Configuracoes Comerciais

Configuracoes editaveis:

- pipelines;
- etapas;
- tipos de venda;
- origens de lead;
- motivos de perda;
- templates de proposta;
- catalogo;
- regras de automacao;
- permissoes basicas.

## Arquitetura E Dados

### Aproveitar Da Base Atual

O Atomic CRM ja tem entidades importantes:

- `contacts`: pessoas;
- `companies`: empresas;
- `deals`: oportunidades;
- `tasks`: atividades e follow-ups;
- `contact_notes` e `deal_notes`: historico;
- `sales`: vendedores/usuarios;
- `tags`: classificacao;
- `configuration`: configuracoes editaveis.

Essas entidades devem ser mantidas e evoluidas.

### Novas Entidades

Adicionar:

- `leads`;
- `lead_notes`;
- `catalog_items`;
- `proposal_templates`;
- `proposals`;
- `proposal_items`;
- `automation_rules`;
- `automation_runs`.

`lead_sources` pode nascer dentro de `configuration` para reduzir complexidade inicial, e virar tabela depois se houver necessidade.

### Evolucao De Deals

Adicionar ou derivar campos como:

- `deal_type`;
- `probability`;
- `lost_reason`;
- `source`;
- `next_action_at`;
- `last_activity_at`;
- `proposal_status` como dado derivado via view quando possivel.

### Views Recomendadas

Criar views para reduzir complexidade no frontend:

- `deals_summary`: deal + empresa + contatos + proposta aberta + ultima atividade + proxima tarefa;
- `leads_summary`: lead + responsavel + idade + SLA + proxima acao;
- `sales_dashboard_summary`: metricas por vendedor;
- `pipeline_summary`: valores por etapa, forecast e quantidade.

### Supabase E Backend

Manter a filosofia atual:

- Postgres como fonte de verdade;
- schemas declarativos em `supabase/schemas`;
- migrations geradas a partir dos schemas;
- views para agregacoes;
- RLS para seguranca;
- Edge Functions apenas quando necessario.

Geracao de proposta e automacoes provavelmente exigem backend em fases mais maduras:

- proposta pode comecar com geracao simples e storage;
- automacoes confiaveis devem ter execucao server-side;
- historico de automacao precisa ser persistido em `automation_runs`.

### FakeRest E Demo

Cada entidade relevante deve ter suporte no modo demo:

- dados fake de leads;
- dados fake de propostas;
- catalogo fake;
- regras de automacao fake;
- emulacao das views principais quando necessario.

Isso mantem o produto demonstravel sem Supabase real.

## Padroes Iniciais Recomendados

O produto deve vir pronto para uso com configuracoes iniciais, mesmo que tudo possa ser editado depois.

### Pipeline Consultivo Padrao

- Novo;
- Qualificado;
- Reuniao marcada;
- Proposta enviada;
- Negociacao;
- Ganho;
- Perdido.

### Pipeline Rapido Padrao

- Novo lead;
- Primeiro contato;
- Interessado;
- Proposta/condicao enviada;
- Fechado;
- Perdido.

### Pipeline Recorrente Padrao

- Cliente ativo;
- Oportunidade identificada;
- Proposta de renovacao/upsell;
- Em negociacao;
- Renovado/expandido;
- Perdido.

### Regras De Automacao Padrao

- Lead novo cria tarefa de primeiro contato para o responsavel no mesmo dia.
- Lead sem primeiro contato em 1 dia aparece como atrasado.
- Deal sem proxima acao aparece como risco.
- Deal parado por 3 dias cria tarefa de follow-up.
- Proposta enviada cria follow-up em 2 dias.
- Proposta vencida cria alerta interno para o responsavel.

## Fases De Entrega

### Fase 1: Fundacao Comercial

Objetivo: transformar a base atual em um CRM de vendas mais forte.

Entregas:

- evoluir deals/pipeline;
- adicionar tipo de venda, probabilidade, motivo de perda, origem e proxima acao;
- criar tela diaria do vendedor;
- melhorar tarefas e follow-ups;
- dashboards basicos para vendedor e gestor;
- ajustar configuracoes comerciais.

Resultado esperado: o produto deixa de ser cadastro + Kanban e vira uma rotina comercial utilizavel.

### Fase 2: Leads

Objetivo: criar a entrada comercial antes do pipeline.

Entregas:

- Caixa de Leads;
- qualificacao;
- SLA de primeiro contato;
- conversao lead -> contato/empresa/deal;
- descarte com motivo;
- dashboard de leads.

Resultado esperado: o produto atende venda rapida e volume sem sujar o pipeline.

### Fase 3: Propostas Rapidas

Objetivo: acelerar fechamento sem criar um produto complexo de documentos.

Entregas:

- catalogo de produtos/servicos;
- templates simples;
- propostas ligadas a deals;
- itens, desconto, prazo e observacoes;
- gerar PDF/link;
- status da proposta;
- follow-up automatico basico depois do envio.

Resultado esperado: vendedor monta proposta rapido e gestor enxerga dinheiro em aberto.

### Fase 4: Automacoes Quando/Entao

Objetivo: reduzir esquecimento e padronizar rotina.

Entregas:

- regras com gatilho, condicao e acao;
- gatilhos em leads, deals, tarefas e propostas;
- acoes internas de CRM;
- historico de execucao.

Resultado esperado: o CRM passa a apoiar o time de forma ativa, sem workflow visual avancado.

### Fase 5: Dashboards Comerciais Avancados

Objetivo: dar gestao comercial de verdade.

Entregas:

- forecast;
- conversao por etapa;
- tempo medio por etapa;
- ranking por vendedor;
- gargalos;
- motivos de perda;
- propostas abertas, aceitas e recusadas;
- leads por origem.

Resultado esperado: dono/gestor consegue tomar decisoes sem exportar planilhas.

## Ordem Recomendada Para Implementacao

1. Fase 1: Fundacao Comercial.
2. Fase 2: Leads.
3. Fase 3: Propostas Rapidas.
4. Fase 4: Automacoes Quando/Entao.
5. Fase 5: Dashboards Comerciais Avancados.

A comunicacao integrada deve ficar para uma etapa futura, depois que o nucleo de vendas estiver consistente.

## Criterios De Sucesso

O CRM nivel 2 sera considerado bem desenhado quando:

- vendedor conseguir abrir o sistema e saber as proximas acoes;
- gestor conseguir ver funil, forecast e gargalos;
- lead conseguir entrar, ser qualificado e virar deal sem retrabalho;
- deal sempre tiver proxima acao clara;
- proposta puder ser criada rapidamente a partir de catalogo e template;
- automacoes simples reduzirem follow-ups esquecidos;
- configuracoes permitirem adaptar o CRM sem reprogramar o produto;
- modo demo continuar funcionando para apresentacao e testes.

## Riscos E Decisoes

Risco: tentar fazer HubSpot cedo demais.
Decisao: deixar campanhas, inbox e workflow visual avancado fora do inicio.

Risco: criar entidades demais antes de validar uso.
Decisao: adicionar entidades novas apenas onde a base atual nao cobre o fluxo, como leads, propostas e automacoes.

Risco: propostas virarem editor de documento.
Decisao: limitar o inicio a catalogo, templates simples, itens, PDF/link e status.

Risco: automacoes ficarem pouco confiaveis se rodarem so no frontend.
Decisao: desenhar historico e execucao server-side como caminho para a fase de automacoes.

Risco: CRM ficar generico demais.
Decisao: entregar padroes prontos, mas editaveis.

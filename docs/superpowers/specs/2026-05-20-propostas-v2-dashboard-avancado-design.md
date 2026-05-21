# Propostas V2 e Dashboard Comercial Avancado - Design

Projeto base: Atomic CRM
Data: 2026-05-20
Status: aguardando revisao do usuario

## Objetivo

Evoluir o CRM Nivel 2 em duas frentes conectadas:

1. Transformar propostas em uma peca comercial apresentavel, reutilizavel e exportavel.
2. Transformar o dashboard em uma central de gestao comercial, com indicadores de conversao, previsao, metas e gargalos.

O objetivo pratico e fazer o CRM parecer menos uma base de dados e mais um sistema de operacao comercial: o vendedor monta uma proposta bonita, acompanha o ciclo dela, e o gestor enxerga onde a receita esta, onde trava e quem precisa de atencao.

## Escopo Da Fase

Esta fase sera dividida em duas entregas sequenciais:

1. **Fase 4A: Propostas V2**
2. **Fase 4B: Dashboard Comercial Avancado**

As duas podem ficar no mesmo roadmap, mas devem ser implementadas em ordem. Propostas V2 vem primeiro porque gera dados melhores para o dashboard.

## Fase 4A: Propostas V2

### Resultado Esperado

O vendedor deve conseguir abrir um negocio, gerar uma proposta com aparencia profissional, editar itens e condicoes, duplicar uma proposta antiga, exportar PDF e acompanhar o historico comercial da proposta dentro do negocio.

### Funcionalidades

#### 1. Templates De Proposta

Criar templates configuraveis para acelerar a montagem:

- nome do template;
- descricao interna;
- escopo padrao;
- condicoes comerciais padrao;
- itens padrao;
- ativo/inativo.

O primeiro uso sera simples: na tela de criar proposta, o usuario escolhe um template e o CRM preenche escopo, condicoes e itens. Nao sera um editor visual complexo.

#### 2. Duplicar Proposta

Adicionar acao para duplicar uma proposta existente:

- copia titulo, escopo, termos, moeda, desconto e itens;
- gera novo numero;
- status volta para `draft`;
- datas de envio, aceite e rejeicao sao limpas;
- mantem vinculo com o mesmo negocio e empresa por padrao.

Isso ajuda quando a empresa precisa mandar uma segunda versao com ajustes.

#### 3. Preview Comercial Melhorado

Melhorar a tela de visualizacao da proposta para parecer uma proposta enviada ao cliente:

- cabecalho com logo/nome da empresa emissora;
- dados do cliente;
- numero e validade;
- badge de status;
- secao de escopo;
- tabela de itens;
- resumo financeiro;
- condicoes comerciais;
- area final com aceite/assinatura simples em texto.

O preview continua dentro do CRM, mas deve ter layout limpo o suficiente para virar PDF.

#### 4. PDF / Impressao

Adicionar uma acao de exportacao:

- primeira versao usa layout imprimivel do navegador;
- botao `Exportar PDF` abre uma rota/tela de impressao ou dispara `window.print()`;
- CSS especifico para impressao remove menu, navegacao e botoes;
- o conteudo impresso deve preservar cabecalho, itens, totais e condicoes.

Geracao server-side de PDF fica fora desta fase. A prioridade e entregar algo testavel e util rapido.

#### 5. Campos Comerciais Extras

Adicionar campos que deixam a proposta mais real:

- observacoes internas;
- prazo de execucao/entrega;
- forma de pagamento;
- validade;
- imposto/ajuste percentual ou valor, se fizer sentido no modelo atual;
- desconto ja existente continua suportado.

Os campos devem ser simples e opcionais para nao travar empresas menores.

#### 6. Historico No Negocio

Dentro do detalhe do negocio, melhorar o bloco de propostas:

- listar propostas por status e data;
- destacar proposta ativa/enviada;
- mostrar valor total;
- mostrar vencimento;
- incluir acoes rapidas: ver, editar, duplicar, exportar.

O objetivo e o negocio contar a historia comercial sem o usuario precisar abrir a lista geral de propostas.

### Fora Do Escopo Da Fase 4A

- assinatura digital juridica;
- envio por e-mail/WhatsApp;
- pagamento online;
- editor visual livre de documentos;
- versionamento complexo com diff entre propostas.

## Fase 4B: Dashboard Comercial Avancado

### Resultado Esperado

O gestor deve abrir o dashboard e responder rapidamente:

- quanto temos aberto?
- quanto deve fechar?
- onde o funil esta travando?
- quem esta performando melhor?
- quais propostas e negocios exigem acao?
- por que estamos perdendo vendas?

### Funcionalidades

#### 1. Metas Por Vendedor

Criar uma estrutura simples para metas comerciais:

- vendedor;
- periodo mensal;
- meta de valor ganho;
- meta de negocios ganhos;
- opcionalmente meta de propostas enviadas.

No dashboard, mostrar realizado vs meta por vendedor.

#### 2. Previsao De Receita

Melhorar previsao comercial usando:

- negocios abertos;
- etapa do pipeline;
- probabilidade;
- data prevista de fechamento;
- propostas abertas e enviadas.

Primeira versao pode calcular no frontend com dados carregados, seguindo o padrao atual. Se o volume crescer, evolui para views no banco.

#### 3. Conversao Por Etapa

Mostrar indicadores de funil:

- leads criados;
- leads convertidos em negocio;
- negocios que chegaram em proposta;
- propostas aceitas;
- negocios ganhos.

Tambem mostrar conversao por etapa do pipeline quando houver dados suficientes.

#### 4. Tempo Medio No Pipeline

Calcular sinais operacionais:

- idade media dos negocios abertos;
- negocios parados ha muitos dias;
- tempo medio ate ganhar;
- tempo medio em proposta enviada, quando possivel.

Nesta fase, se nao houver historico de mudanca de etapa suficiente, o dashboard usa `last_activity_at`, `created_at`, `updated_at` e dados de proposta como aproximacao. Historico completo de etapa pode ficar para uma fase posterior.

#### 5. Ranking Comercial

Ranking por vendedor com:

- valor ganho;
- valor aberto;
- valor ponderado;
- propostas enviadas;
- propostas aceitas;
- tarefas vencidas ou pendentes, como sinal de disciplina comercial.

O ranking deve ser informativo, nao punitivo: mostrar contexto e evitar uma tela agressiva demais.

#### 6. Analise De Perdas

Usar motivos de perda ja configuraveis:

- quantidade de negocios perdidos por motivo;
- valor perdido por motivo;
- principais motivos no periodo.

Isso ajuda a decidir se o problema esta em preco, timing, concorrencia, fit ou follow-up.

#### 7. Visao Vendedor E Visao Gestor

O dashboard deve continuar util para vendedor e gestor:

- vendedor ve prioridades, sua meta, suas propostas e seus proximos fechamentos;
- gestor ve consolidado da equipe, ranking, funil e previsao.

Se o usuario atual nao for administrador, os dados devem tender para a visao individual.

### Fora Do Escopo Da Fase 4B

- BI customizavel drag-and-drop;
- dashboards salvos pelo usuario;
- metas complexas por produto/territorio;
- analise preditiva com IA;
- integracao com financeiro externo.

## Arquitetura

### Propostas

Continuar usando recursos normais do CRM:

- `proposals`;
- `proposal_items`;
- `proposal_templates`.

Para templates com itens padrao, o modelo pode seguir um destes caminhos:

1. adicionar `proposal_template_items`;
2. armazenar itens padrao em JSON no template.

Recomendacao: criar `proposal_template_items`, porque segue o modelo relacional atual de `proposal_items`, facilita reuso de validacoes e evita JSON dificil de editar.

### Dashboard

Criar utilitarios puros para metricas comerciais antes de criar UI:

- `calculateGoalProgress`;
- `calculateRevenueForecast`;
- `calculateFunnelConversion`;
- `calculatePipelineAging`;
- `calculateSellerRanking`;
- `calculateLossReasons`.

Esses utilitarios devem ter testes unitarios antes de entrar no dashboard. A UI apenas consome os resultados.

### Banco De Dados

Possiveis novas tabelas:

- `proposal_template_items`;
- `sales_goals`;

Possiveis novos campos em `proposals`:

- `internal_notes`;
- `delivery_time`;
- `payment_terms`;
- `tax_amount` ou `tax_rate`;
- `print_theme`, se for util depois.

Nao criar tabelas de historico de etapa ainda, a menos que a implementacao do dashboard mostre que isso e indispensavel.

## UX

### Proposta

O fluxo ideal:

1. Usuario abre um negocio.
2. Clica em `Gerar proposta`.
3. Escolhe template ou comeca em branco.
4. Ajusta itens, escopo, condicoes e validade.
5. Salva como rascunho.
6. Exporta PDF ou imprime.
7. Marca como enviada.
8. Automacao cria follow-up.
9. Depois marca como aceita, recusada ou expirada.

### Dashboard

O dashboard deve ser dividido em blocos escaneaveis:

1. Resumo executivo.
2. Previsao de receita.
3. Metas e ranking.
4. Funil e conversao.
5. Propostas e riscos.
6. Motivos de perda.
7. Agenda/prioridades.

Evitar uma tela de marketing ou hero visual. Deve parecer uma central de operacao: densa, organizada e clara.

## Permissoes

- Vendedores podem criar, editar e duplicar propostas.
- Administradores podem configurar templates e metas.
- Automacoes continuam editaveis apenas por admin.
- Dashboard de gestor deve respeitar acesso: admin ve equipe; vendedor ve seus dados.

## Testes E Verificacao

### Unitarios

Adicionar testes para:

- duplicacao de proposta;
- aplicacao de template;
- calculo de totais com imposto/desconto;
- metricas de metas;
- previsao de receita;
- conversao de funil;
- ranking de vendedores;
- motivos de perda.

### Integracao Manual / Smoke

Verificar no navegador:

- criar proposta a partir de template;
- duplicar proposta;
- exportar/imprimir PDF;
- marcar proposta como enviada;
- confirmar automacao de follow-up;
- abrir negocio e ver historico de propostas;
- abrir dashboard como admin;
- abrir dashboard como vendedor;
- confirmar textos em pt-BR.

## Riscos

1. **PDF ficar feio ou quebrado.**
   Mitigacao: usar uma tela imprimivel dedicada, com CSS de impressao e smoke visual.

2. **Dashboard ficar pesado.**
   Mitigacao: calcular primeiro com listas limitadas e utilitarios puros; se necessario, mover metricas para views no banco depois.

3. **Metas complicarem demais.**
   Mitigacao: comecar com meta mensal por vendedor, sem produtos/territorios.

4. **Proposta virar editor de documento.**
   Mitigacao: manter templates estruturados, nao bloco livre arrastavel.

## Criterio De Pronto

Esta fase esta pronta quando:

- usuario cria proposta a partir de template;
- usuario duplica proposta existente;
- proposta tem preview profissional;
- proposta pode ser impressa/exportada para PDF pelo navegador;
- detalhe do negocio mostra historico de propostas com acoes rapidas;
- dashboard mostra metas, previsao, funil, ranking, envelhecimento e perdas;
- visao de vendedor e admin fazem sentido;
- testes unitarios principais passam;
- typecheck, lint, build e smoke no navegador passam.

## Ordem Recomendada De Implementacao

1. Propostas V2: modelo de template e itens padrao.
2. Propostas V2: aplicar template e duplicar.
3. Propostas V2: preview imprimivel e exportacao.
4. Propostas V2: historico no negocio.
5. Dashboard: modelo de metas.
6. Dashboard: utilitarios de metricas.
7. Dashboard: componentes e layout.
8. Dashboard: permissoes, pt-BR e smoke final.


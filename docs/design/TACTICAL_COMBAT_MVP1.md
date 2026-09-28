
# Mundo Central — plano do micro-encounter tático

## Objetivo

Criar o primeiro **micro-encounter tático jogável** de Mundo Central sem transformar o projeto inteiro de uma vez.

O protótipo deve provar que o jogo consegue alternar entre:

1. exploração normal em RPG Maker MV;
2. um encounter fechado em grid;
3. retorno ao mapa de exploração preservando estado;
4. posteriormente, dois modos de resolução do mesmo encounter:
   - **Condução** — controle manual tático;
   - **Ressonância** — autochess preparado fora da batalha.

A arena inicial será pequena e situada nas **Pradarias de Veyru**, de preferência próxima ao Veio de Argila Viva, porque o terreno já tem significado diegético e permite testar lama, deslocamento e controle de área.

Este documento é deliberadamente incremental: **cada tarefa deve receber aceite antes da próxima começar**.

---

## Princípios que não devemos quebrar

### Um motor, dois modos

Condução e Ressonância devem compartilhar o mesmo grid, unidades, skills, estados, regras de terreno, resolução de dano, arena e condição de vitória.

Ressonância não deve virar um segundo jogo implementado em paralelo. Ela deve ser uma camada de decisão automática sobre o mesmo motor tático.

### Combate não é só dano

O protótipo deve privilegiar posicionamento, deslocamento, terreno, estados, interações entre skills e reações/combos simples.

Uma skill que apenas causa mais dano é aceitável como baseline, mas não deve ser a principal prova do sistema.

### Arena pequena e significativa

O primeiro encounter não precisa provar FFT inteiro.

Alvo inicial:

- arena entre 10x10 e 16x16;
- 4 personagens;
- 3 inimigos;
- 3 tipos de terreno;
- 6 a 8 skills no total;
- 2 condições;
- pelo menos 1 deslocamento forçado;
- 1 interação clara entre condição + skill;
- 1 condição simples de vitória.

### Sem lock-in prematuro

Não escrever sistemas grandes sobre um plugin antes de confirmar:

- compatibilidade real com RPG Maker MV 1.6.3;
- estabilidade no projeto;
- licença;
- capacidade de extensão;
- comportamento de save/load;
- possibilidade de integrar IA customizada depois.

---

# Milestones

## M0 — Spike técnico

Provar que existe uma base tática adequada ao projeto.

**Resultado:** um plugin candidato instalado em branch de trabalho, abrindo uma arena vazia e permitindo ao menos uma unidade mover-se em grid.

Nenhuma mecânica autoral grande deve ser implementada ainda.

## M1 — Micro-encounter em Condução

Construir uma batalha curta controlada manualmente.

**Resultado:** o jogador entra por Veyru, luta com quatro personagens, vence ou perde e retorna corretamente.

## M2 — Gramática de combate

Adicionar terreno, condições, deslocamento e primeiro combo.

**Resultado:** posicionamento passa a ser mecanicamente relevante.

## M3 — Ressonância / autochess

Executar a mesma arena automaticamente a partir de preparação prévia.

**Resultado:** um único confronto de autochess usando a mesma definição de unidades e skills da Condução.

## M4 — Ponto de Convergência

Introduzir o local diegético onde o jogador prepara batalhas.

**Resultado:** escolha de modo, preparação de mana, protocolos e suprimentos passam a existir fora do combate.

## M5 — Hardening para MVP1

Limpar arquitetura, documentar API e transformar o protótipo em fundação reutilizável.

---

# Backlog ordenado

## T00 — Documento e congelamento de escopo

**Prioridade:** P0  
**Status:** feito com este arquivo.

Não entram ainda:

- height/elevation completa;
- line of sight avançada;
- fog of war;
- cobertura complexa;
- dezenas de estados;
- summons;
- destruição de cenário;
- multiplayer;
- IA estratégica complexa;
- encounters procedurais;
- balanceamento final;
- UI final;
- animações finais.

### Aceite

Este documento representa corretamente a direção desejada.

---

## T01 — Auditoria e escolha do motor tático

**Prioridade:** P0  
**Dependências:** T00

Avaliar candidatos reais para MV, inicialmente:

- LeTBS;
- Synrec Tactical Battle System, se compatível e com licença adequada ao fluxo;
- SRPG Engine e alternativas open source relevantes.

### Verificar

- RPG Maker MV 1.6.3;
- dependências;
- licença e redistribuição no repositório;
- grid e movimentação;
- AoE;
- knockback/pull;
- terrain tags ou Regions;
- estados;
- turn order;
- hooks para IA;
- possibilidade de auto battle;
- battle events;
- retorno ao mapa;
- save/load;
- conflitos com plugins atuais;
- tamanho e qualidade do código;
- atividade/manutenção do projeto.

### Entrega

Registrar neste documento:

- candidato escolhido;
- versão/commit;
- por que foi escolhido;
- riscos;
- plano de rollback.

### Aceite

Escolhemos conscientemente uma fundação antes de instalá-la.

---

## T02 — Instalação mínima e isolamento

**Prioridade:** P0  
**Dependências:** T01

Instalar somente o necessário para inicializar o motor.

### Regras

- preservar os plugins atuais;
- registrar ordem de carregamento;
- não substituir sistemas do projeto silenciosamente;
- manter alterações de terceiros separadas das extensões de Mundo Central;
- preferir adaptadores MC_* em vez de editar diretamente código third-party.

### Arquivos esperados

Dependendo da escolha:

- plugin(s) de terceiros em js/plugins/;
- atualização de js/plugins.js;
- js/plugins/MC_TacticalBridge.js para integração própria;
- documentação da versão instalada.

### Teste

Abrir o jogo sem erros e entrar numa arena de teste vazia.

### Aceite

O projeto inicia normalmente e o motor tático está isolado.

---

## T03 — Contrato exploração → encounter → exploração

**Prioridade:** P0  
**Dependências:** T02

Criar uma API semântica própria, independentemente do plugin escolhido.

Exemplo conceitual de comando:

    MC_ENCOUNTER START VEYRU_CLAY_01

O bridge deve guardar:

- mapa de origem;
- posição;
- direção;
- encounter ID;
- resultado;
- flags necessárias.

Fluxo desejado:

    Veyru → Arena → Vitória → Veyru

Ao perder, definir comportamento explícito para o protótipo: retry, retorno a checkpoint ou game over provisório.

### Aceite

Entrar e sair do encounter não depende de IDs mágicos espalhados pelos eventos.

---

## T04 — Arena Veyru Clay 01

**Prioridade:** P0  
**Dependências:** T03

Criar a primeira arena de verdade.

### Composição sugerida

- aproximadamente 12x12;
- estrada atravessando o centro;
- área de Argila Viva;
- 2–3 rochas/obstáculos;
- pequena borda de vegetação;
- quatro posições iniciais da party;
- três posições inimigas.

### Terrenos iniciais

- **Pradaria** — neutro;
- **Argila Viva** — penaliza movimento e habilita interação de imobilização;
- **Rocha/terreno firme** — referência estável e obstáculo/cobertura simples se o motor permitir.

### Aceite

A arena é legível antes mesmo das regras avançadas.

---

## T05 — Condução mínima

**Prioridade:** P0  
**Dependências:** T04

Fazer os quatro personagens funcionarem manualmente.

### Primeira regra de turno

Para o protótipo:

- turno da party;
- personagens podem agir em ordem escolhida pelo jogador;
- turno inimigo.

Evitar iniciativa individual complexa neste estágio.

### Ação mínima por unidade

- mover;
- usar skill;
- encerrar ação.

### Aceite

É possível vencer uma batalha inteira controlando quatro unidades sem travas ou softlocks.

---

## T06 — Skills e gramática mínima

**Prioridade:** P0  
**Dependências:** T05

Implementar poucas habilidades que provem interação.

### Kit mínimo sugerido

1. **Ataque básico** — baseline.
2. **Fratura Etérica** — aplica EXPOSTO.
3. **Impulso Vetorial** — empurra alvo.
4. **Fixação** — aplica ANCORADO ou equivalente.
5. **Execução** — ganha benefício contra EXPOSTO ou alvo imobilizado.
6. **Skill de suporte** — proteção, marca ou reposicionamento.

### Primeiro combo obrigatório

    EXPOSTO → IMPULSO → ARGILA

O jogador deve perceber que usar as skills em combinação é melhor que apenas repetir o maior dano.

### Aceite

Existe pelo menos uma interação emergente que não é uma skill pré-scriptada de “combo”.

---

## T07 — Terreno e deslocamento

**Prioridade:** P0  
**Dependências:** T06

Formalizar metadata de tiles da arena.

Terrenos iniciais:

    GRASS
    LIVING_CLAY
    ROCK

Cada terreno deve poder futuramente definir:

- custo de movimento;
- tags;
- efeitos de entrada;
- efeitos de saída;
- efeitos de início/fim de turno;
- passabilidade;
- modificadores.

### MVP

Argila deve ter pelo menos um efeito real. Exemplo:

- entrar custa movimento adicional;
- alvo empurrado para Argila recebe PRESO por 1 turno.

### Aceite

Mover ou empurrar uma unidade para outro terreno altera a decisão tática.

---

## T08 — Três inimigos e IA mínima

**Prioridade:** P0  
**Dependências:** T07

Criar três inimigos simples, mas não idênticos.

### Sugestão

- **Batedor** — procura flancos/alvos frágeis;
- **Pesado** — aproxima e empurra;
- **Condutor Etérico** — aplica estado ou altera terreno/alcance.

A IA ainda pode ser pequena e determinística.

### Aceite

O jogador precisa reagir a mais de um tipo de comportamento.

---

## T09 — Vitória, derrota e persistência

**Prioridade:** P0  
**Dependências:** T08

Fechar o loop.

### Vitória

- batalha termina;
- resultado é armazenado;
- party retorna a Veyru;
- encounter pode ser marcado como concluído;
- recompensa simples funciona.

### Derrota

Comportamento explícito e testável.

### Save/load

Testar:

- antes do encounter;
- depois do encounter;
- se seguro, durante o encounter.

Se save no meio do combate for arriscado, ele pode ser desabilitado inicialmente e registrado como dívida técnica.

### Aceite

O micro-encounter pode ser jogado do início ao fim repetidamente.

---

# Segunda etapa — Ressonância

## T10 — Modelo de Protocolos

**Prioridade:** P1  
**Dependências:** M1/M2 estáveis

Criar uma camada de decisão que a IA possa consumir.

Exemplos:

    SE aliado HP < 35% → CURAR
    SE alvo EXPOSTO → priorizar IMPULSO
    SE push termina em terreno hostil → bônus de prioridade
    SE sem alvo em alcance → aproximar

Não criar editor visual complexo ainda.

O primeiro formato pode ser JSON/JS configurado por nós.

### Aceite

Uma unidade automática toma decisões previsíveis baseadas em protocolo.

---

## T11 — Mana de Preparação

**Prioridade:** P1  
**Dependências:** T10

Criar recurso gasto **antes** da batalha.

O encounter continua tendo um único confronto; não existe economia interna estilo loja do TFT.

### Primeiros usos

- protocolo adicional;
- ritual simples;
- consumível;
- bônus de formação.

### Aceite

Duas preparações diferentes produzem comportamento observavelmente diferente na mesma arena.

---

## T12 — Ressonância completa do micro-encounter

**Prioridade:** P1  
**Dependências:** T10, T11

Executar VEYRU_CLAY_01 sem comandos manuais.

Fluxo:

    Preparação → confirmar → batalha automática → resultado

### Aceite

O mesmo encounter pode ser concluído em Condução ou Ressonância sem duplicar skills, unidades ou terreno.

---

# Terceira etapa — Ponto de Convergência

## T13 — Primeiro Ponto de Convergência

**Prioridade:** P1  
**Dependências:** T12

Criar no mapa de Veyru um local seguro usado para preparação.

### Funções iniciais

- escolher Condução/Ressonância;
- organizar party;
- configurar protocolos;
- gastar mana de preparação;
- comprar/usar suprimentos básicos;
- descansar;
- executar um ritual simples.

Contato com NPCs e sistemas maiores podem entrar depois.

### Aceite

Não existe toggle arbitrário no menu durante a estrada; preparação acontece num lugar do mundo.

---

## T14 — Primeira camada narrativa do sistema

**Prioridade:** P1  
**Dependências:** T13

Explicar diegeticamente os dois modos sem tutorial expositivo longo.

Hipótese inicial:

- **Condução:** indivíduos agindo de forma deliberada;
- **Ressonância:** os quatro usam a ligação residual de Ordenadores para compartilhar microdecisões.

Não afirmar ainda que uma interpretação metafísica é definitivamente verdadeira.

### Aceite

O jogador entende por que existem dois modos dentro do universo.

---

# Hardening

## T15 — API autoral de combate

**Prioridade:** P1  
**Dependências:** protótipo aprovado

Concentrar extensões próprias em módulos como:

    MC_TacticalBridge.js
    MC_TacticalTerrain.js
    MC_TacticalTags.js
    MC_ResonanceAI.js
    MC_Convergence.js

Os nomes podem mudar após conhecermos a API real do motor escolhido.

### Regra

Código de Mundo Central deve depender de uma camada nossa sempre que razoável, reduzindo lock-in no plugin.

---

## T16 — Dados fora do código

**Prioridade:** P2

Quando a gramática estabilizar, mover definições autorais para arquivos de dados, por exemplo:

    data/MC_Encounters.json
    data/MC_TacticalSkills.json
    data/MC_Protocols.json
    data/MC_Terrains.json

Não fazer isso cedo demais: primeiro precisamos descobrir quais campos realmente existem.

---

## T17 — Checklist MVP1 de combate

**Prioridade:** P1

O combate está pronto para servir de base ao MVP1 quando:

- [ ] exploração continua funcional;
- [ ] um evento inicia encounter semanticamente;
- [ ] quatro personagens funcionam no grid;
- [ ] três inimigos têm comportamentos diferentes;
- [ ] terreno importa;
- [ ] knockback funciona;
- [ ] existem ao menos duas condições;
- [ ] existe um combo emergente;
- [ ] vitória retorna corretamente ao mapa;
- [ ] derrota tem comportamento definido;
- [ ] Condução funciona;
- [ ] Ressonância funciona na mesma arena;
- [ ] preparação de Ressonância ocorre fora da luta;
- [ ] Ponto de Convergência existe;
- [ ] save/load não corrompe estado;
- [ ] nenhuma dependência third-party foi modificada sem documentação;
- [ ] o encounter leva poucos minutos, não vinte.

---

# Ordem de execução e aceites

    T00  Documento
      ↓ aceite
    T01  Auditoria do plugin
      ↓ aceite
    T02  Instalação
      ↓ aceite
    T03  Contrato de encounter
      ↓ aceite
    T04  Arena
      ↓ aceite
    T05  Condução mínima
      ↓ aceite
    T06  Skills / primeiro combo
      ↓ aceite
    T07  Terreno
      ↓ aceite
    T08  Inimigos / IA
      ↓ aceite
    T09  Loop completo
      ↓ aceite — M1/M2
    T10  Protocolos
      ↓
    T11  Mana de preparação
      ↓
    T12  Ressonância
      ↓ aceite — M3
    T13  Ponto de Convergência
      ↓
    T14  Integração narrativa
      ↓ aceite — M4
    T15–T17 Hardening

Não avançar automaticamente de uma tarefa para a seguinte.

Cada etapa deve terminar com:

1. resumo do que mudou;
2. arquivos tocados;
3. commit(s);
4. como testar;
5. limitações conhecidas;
6. pedido de aceite.

---

# Primeiro encounter: definição provisória

**ID:** VEYRU_CLAY_01  
**Nome provisório:** Encontro no Veio  
**Região:** Pradarias de Veyru  
**Duração-alvo:** 3–6 minutos  
**Party:** quatro Ordenadores  
**Inimigos:** três  
**Mapa:** pequeno corredor de estrada parcialmente tomado por Argila Viva.

## O que este encounter precisa ensinar

Sem caixa de tutorial extensa, o jogador deve descobrir:

1. posição importa;
2. terreno importa;
3. empurrar pode ser melhor que causar dano;
4. estados preparam ações de outros personagens;
5. os quatro funcionam melhor como conjunto.

Na Ressonância, o mesmo encounter deve ensinar:

1. preparação substitui microcontrole;
2. protocolos importam;
3. a composição pode funcionar muito bem quando prevê o problema;
4. um plano ruim também pode falhar de maneira legível.

---

# Decisões ainda abertas

Estas decisões devem ser respondidas por prototipagem, não por discussão abstrata longa:

- plugin-base definitivo;
- tamanho ideal da arena;
- número exato de PA;
- quantidade de movimento;
- se reação entra já no primeiro encounter;
- se facing/direção importa;
- fórmula de dano;
- como mana de preparação é recuperada;
- quanto controle o jogador mantém durante Ressonância;
- possibilidade de interromper autochess;
- persistência de consumíveis;
- save no meio de encounter.

A filosofia é: **implementar a menor versão capaz de responder cada pergunta.**


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
**Status:** aceito em 2026-09-28.

T00 não instala plugins nem altera gameplay. Sua função é congelar o **menor experimento que consegue provar ou refutar a direção tática** antes de assumirmos dívida técnica.

### Escopo congelado do experimento

O primeiro slice de combate terá estas propriedades:

- **um único encounter autoral:** `VEYRU_CLAY_01`;
- **um único mapa de arena**, separado do mapa regional de Veyru;
- **quatro membros da party** controláveis;
- **três inimigos**;
- **grid ortogonal baseado nos tiles do MV**;
- **turnos por lado** como hipótese inicial: party age, depois inimigos;
- dentro do turno da party, **ordem livre entre os quatro personagens** se o motor escolhido permitir sem reescrita desproporcional;
- **movimento + skill + encerrar ação** como conjunto mínimo de comandos;
- **três famílias de terreno:** pradaria, Argila Viva e obstáculo/rocha;
- **duas condições de combate** no mínimo;
- **um efeito de deslocamento forçado**;
- **um combo emergente obrigatório:** preparar estado → deslocar → explorar terreno;
- vitória inicial por **derrotar os três inimigos**;
- entrada a partir de Veyru e retorno ao mesmo fluxo de exploração;
- duração pretendida de **3–6 minutos** quando o jogador já conhece as regras.

### Relação entre Condução e Ressonância

O protótipo será construído sobre a seguinte decisão arquitetural:

> **Existe um único sistema de combate e duas formas de decidir ações.**

**Condução** é a primeira interface a ser implementada e validada.  
**Ressonância** será implementada somente depois que o mesmo encounter estiver estável em Condução.

Ressonância deve reaproveitar:

- unidades;
- skills;
- estados;
- grid;
- terreno;
- targeting;
- dano;
- regras de vitória/derrota.

Ela poderá substituir a decisão manual por protocolos, scoring e preparação, mas não possuirá uma segunda implementação de combate.

### O que o primeiro encounter precisa provar

O experimento é aprovado mecanicamente se conseguirmos observar, numa batalha curta, que:

1. **posição muda decisões**;
2. **terreno muda decisões**;
3. uma ação utilitária pode ser melhor do que a skill de maior dano;
4. um personagem consegue **preparar uma oportunidade** que outro explora;
5. controlar quatro personagens não torna cada turno excessivamente lento;
6. a transição exploração → arena → exploração parece parte do mesmo jogo.

Se o combate só funcionar porque adicionamos muitas exceções específicas para `VEYRU_CLAY_01`, o experimento falhou arquiteturalmente mesmo que a luta funcione.

### O que explicitamente não será resolvido em T00–M2

Não entram ainda:

- height/elevation completa;
- line of sight avançada;
- fog of war;
- cobertura complexa;
- facing como subsistema obrigatório;
- dezenas de estados;
- summons;
- destruição de cenário;
- multiplayer;
- IA estratégica complexa;
- encounters procedurais;
- geração procedural de arenas;
- balanceamento final;
- UI final;
- animações finais;
- economia completa de Ressonância;
- loja ou reroll dentro da batalha;
- sistema completo de rituais;
- Ponto de Convergência definitivo;
- integração das 25 quests de Revin/Manum;
- escolha definitiva sobre save durante combate.

### Restrições técnicas congeladas

- O projeto-alvo continua sendo **RPG Maker MV 1.6.3**.
- Não converter o projeto para MZ para obter o sistema tático.
- Código third-party deve permanecer identificável e substituível.
- Integrações específicas de Mundo Central devem preferir uma camada `MC_*`.
- Não editar diretamente um plugin third-party para implementar feature autoral enquanto um adapter/hook for razoável.
- Não quebrar o fluxo atual de exploração, transferências, world map e soft gates.
- IDs de mapas, skills e eventos não devem se tornar API pública do nosso código quando pudermos usar chaves semânticas.
- A escolha do plugin em T01 precisa considerar desde o início a futura IA de Ressonância; não basta “ter grid”.

### Decisões deliberadamente abertas para prototipagem

T00 **não** congela estes números/regras:

- tamanho exato da arena dentro de 10x10–16x16;
- número de PA;
- distância de movimento;
- fórmula de dano;
- iniciativa final;
- reações no primeiro encounter;
- facing;
- cobertura;
- save durante batalha.

Essas decisões só serão congeladas quando tivermos evidência prática.

### Critério de saída de T00

T00 está aceito quando concordarmos que:

- este é o menor experimento útil;
- nada essencial ao conceito foi deixado de fora;
- nada que pertence a uma fase posterior foi puxado prematuramente para o protótipo.

Após o aceite, a única próxima tarefa autorizada é **T01 — auditoria e escolha do motor tático**.

---

## T01 — Auditoria e escolha do motor tático

**Prioridade:** P0  
**Dependências:** T00  
**Status:** aceito em 2026-09-28.

### Candidatos auditados

#### 1. SRPG Gear MV — escolhido para o spike

**Origem:** https://github.com/Ohisama-Craft/SRPG_GearMV  
**Release de referência:** 1.24Q (2025-02-28)  
**Commit pinado para o spike:** `a13a66d4e3b8dc1b772f30d45fc95e9f21e102fd`  
**Licença dos plugins:** MIT.

O SRPG Gear MV é uma evolução modular do SRPG Core para RPG Maker MV. O repositório contém, entre outros:

- `SRPG_core.js`;
- `SRPG_AIControl.js`;
- `SRPG_AoE.js`;
- `SRPG_AuraSkill.js`;
- `SRPG_BattlePrepare.js`;
- `SRPG_PositionEffects.js`;
- `SRPG_RangeControl.js`;
- `SRPG_TerrainEffectPlus.js`;
- plugins opcionais de UX, cursor, path preview, summons etc.

##### Por que combina com Mundo Central

**Terreno:** `SRPG_TerrainEffectPlus.js` aplica states por Terrain Tag, exatamente o tipo de primitiva que precisamos para Argila Viva, solo estável, névoa etc.

**Deslocamento:** o changelog atual do projeto documenta os helpers de `SRPG_PositionEffects`, inclusive operações como `a.push(b, distance, type)`. Portanto knockback/push já existe como extensão do ecossistema, em vez de precisarmos criar física de grid do zero.

**AoE e alcance:** o pacote possui módulos dedicados para AoE e controle de range.

**IA extensível:** `SRPG_AIControl.js` trabalha por pontuação de ações, alvos e posições. A documentação do próprio plugin permite fórmulas como `<aiTarget: ...>` e `<aiMove: ...>`, inclusive pontuação baseada em distância, facing, regiões e flags. Isso é especialmente promissor para Ressonância: nossos Protocolos podem futuramente alimentar ou envolver esse scoring em vez de substituir todo o motor de IA.

**Preparação pré-batalha:** `SRPG_BattlePrepare.js` já prevê uma fase de preparação e eventos `<type:prepare>`, explicitamente utilizáveis para abrir lojas ou outras ações. Não é ainda o nosso Ponto de Convergência, mas oferece uma primitiva muito próxima da economia fora da batalha que queremos para Ressonância.

**Arquitetura aberta:** os plugins são JavaScript aberto e MIT. Isso permite mantê-los pinados, auditáveis e versionados no repositório, enquanto nossas extensões ficam numa camada `MC_*`.

**Atualidade relativa:** a linha SRPG Gear MV chegou à versão 1.24Q em fevereiro de 2025 e teve atualizações significativas de terreno, push, AoE, preparação e correções durante 2024–2025. Não é um projeto com atualização semanal, mas é consideravelmente mais recente que LeTBS e o SRPG Core original.

##### Riscos

1. `SRPG_core.js` é grande e invasivo: aproximadamente 11,6 mil linhas. O sistema mexe profundamente em mapa, unidades, batalha e eventos.
2. O ecossistema é modular, mas vários addons dependem uns dos outros; a ordem de plugins terá de ser documentada e testada.
3. Parte da documentação histórica é japonesa, embora o projeto tenha adicionado ajuda em inglês aos plugins.
4. O comportamento padrão foi pensado para um SRPG tradicional; **turno por lado, ordem livre, Condução e Ressonância continuam sendo responsabilidade da nossa camada**.
5. Nosso `MC_Core` usa Region 1 como máscara de colisão global. O ecossistema SRPG também usa Regions/Terrain Tags para várias funções. Em T02/T03 teremos de separar namespaces ou tornar `MC.Regions.BLOCKED` contextual, para que um Region ID do mapa tático não seja tratado acidentalmente como parede de exploração.

##### Hipótese de integração

Não instalar o pacote inteiro de uma vez.

A pilha inicial deve começar pelo menor núcleo necessário para abrir uma batalha SRPG e, após o boot ser aprovado, acrescentar módulos individualmente:

1. base obrigatória: `SRPG_core.js` + `SRPG_AoE.js` + `SRPG_RangeControl.js`;
2. bridge nosso `MC_TacticalBridge.js`;
3. depois, conforme as tarefas pedirem:
   - `SRPG_AoE.js`;
   - `SRPG_PositionEffects.js`;
   - `SRPG_RangeControl.js`;
   - `SRPG_AIControl.js`;
   - `SRPG_AuraSkill.js` + `SRPG_TerrainEffectPlus.js`;
   - `SRPG_BattlePrepare.js` somente quando preparação fizer parte do slice.

Isso reduz a superfície de debugging.

---

#### 2. Synrec Tactical Battle System — melhor fallback funcional, não escolhido para o primeiro spike

**Origem:** https://synrec.itch.io/rpg-maker-mz-tactical-battle-system  
**Versão pública documentada:** 1.8.4 (2026-05-27), com página atualizada em setembro de 2026.  
**Preço atual observado:** US$ 25.

É o candidato pronto mais próximo da nossa feature list. A página oficial declara suporte MV/MZ e oferece:

- mapas híbridos RPG/SRPG;
- início de batalha por transferência para mapa;
- free/forced battler placement;
- Knockback, Suction, Swap e Teleport;
- AoE e padrões de ataque;
- contato por Terrain e Region;
- auto battler AI configurável;
- múltiplas condições de vitória/derrota;
- retorno ao mapa anterior ou mapa configurado;
- efeitos de Terrain Tag que alteram movimento, states, HP/MP e velocidade de turno.

##### Por que não é a primeira escolha

O problema não é capacidade; é **controle de dependência**.

O plugin é pago e o código não está publicamente auditável antes da aquisição. As páginas públicas do autor para plugins pagos normalmente impõem restrições de redistribuição/compilação. Como Mundo Central está hoje num repositório GitHub de desenvolvimento, não devemos presumir que podemos commitar o arquivo comprado ou redistribuí-lo.

Além disso, depender de uma biblioteca comercial que só um comprador pode baixar torna CI, colaboração, backup e onboarding mais delicados.

##### Quando usar

Se o SRPG Gear falhar no spike por incompatibilidade estrutural ou custo excessivo de adaptação, Synrec é o **fallback prioritário**. Nesse caso, antes de qualquer commit:

1. adquirir legitimamente o plugin;
2. ler os termos específicos incluídos no pacote;
3. decidir se o arquivo precisa ficar fora do repositório público;
4. testar o demo MV e a API de auto battler antes de integrar.

---

#### 3. LeTBS — tecnicamente interessante, mas legado

**Origem:** https://github.com/LecodeMV/leTBS  
**Documentação:** LeTBS 0.8  
**Último commit do repositório auditado:** `bead523e7fbad76a0296f7c957edfeb68bad32d9` (2018-05-30).  
**Licença:** termos próprios; permite uso comercial e não comercial em RPG Maker MV com crédito, permite edição, proíbe venda do plugin e pede contato em projeto comercial.

LeTBS ainda tem uma arquitetura conceitualmente excelente:

- grid;
- scopes e AoE customizáveis;
- sequences;
- projéteis;
- terrain/tile effects;
- marks e auras;
- summons;
- battle eventing;
- AI;
- addon `LeTBS_AutoBattle.js`;
- modo ativável/desativável, útil para um jogo híbrido.

Ele é provavelmente o candidato com a linguagem de skills mais próxima do que imaginamos.

##### Por que ficou atrás

- repositório sem atualização desde 2018;
- documentação principal atualizada pela última vez em 2019;
- depende de EasyStar e de um conjunto próprio de módulos/assets;
- licença menos simples que MIT;
- risco maior de incompatibilidade e manutenção local permanente.

Ele permanece como **fallback experimental**, não como fundação preferencial do MVP1.

---

#### 4. SRPG Core original — referência, não candidato principal

**Origem:** https://github.com/RyanBram/SRPGcore  
**Último commit auditado:** `d18176e4e22cd9312d72ebe6ee4f868d8fe25c3b` (2022-12-30).  
**Licença:** MIT.

O projeto tem justamente a filosofia de mudanças mínimas e extensibilidade, mas o SRPG Gear MV já agrega uma linha posterior de manutenção e vários módulos de que precisaríamos imediatamente. Portanto não existe vantagem clara em começar pelo core mais antigo.

---

### Matriz de decisão

| Critério | SRPG Gear MV | Synrec TBS | LeTBS | SRPG Core |
|---|---|---|---|---|
| MV nativo | Sim | Sim | Sim | Sim |
| Código auditável antes da instalação | **Sim** | Não | Sim | Sim |
| Licença simples para versionar | **MIT** | Comercial/restrita | Termos próprios | MIT |
| Atualidade | 2025 | **2026** | 2018/2019 | 2022 |
| AoE | Sim | Sim | Sim | Extensões |
| Push/pull | **Sim** | **Sim** | Possível via sequences | Extensões |
| Terreno | **Sim** | **Sim** | **Sim** | Extensões |
| IA configurável | **Sim, por scoring** | Sim | Sim | Básica/extensões |
| Preparação pré-batalha | **Sim** | Configurável | Não é foco | Extensão |
| Facilidade para Ressonância autoral | **Alta** | Potencialmente alta, mas caixa-preta | Média/alta | Média |
| Risco de lock-in | **Baixo/médio** | Alto | Médio | Baixo |
| Adequação ao repo atual | **Alta** | Baixa sem estratégia de licença | Média | Alta |

### Decisão proposta de T01

Usar **SRPG Gear MV 1.24Q**, pinado no commit:

`a13a66d4e3b8dc1b772f30d45fc95e9f21e102fd`

como fundação do spike M0.

A decisão não significa instalar todos os addons nem assumir que o sistema inteiro chegará ao MVP1. Significa apenas que ele será o primeiro motor submetido ao teste de T02.

### Plano de rollback

T02 deverá ser um commit isolado.

Se o projeto:

- não inicializar de forma limpa;
- quebrar exploração atual;
- exigir edição invasiva do core third-party apenas para abrir uma arena;
- ou mostrar conflito fundamental com o modelo híbrido,

o commit de T02 será revertido por inteiro e o projeto voltará ao estado pré-SRPG.

Nesse caso, o próximo spike será **Synrec TBS em ambiente de teste/licença apropriado**, sem introduzir silenciosamente um plugin proprietário no repositório.

### Compatibilidade a observar em T02

Os plugins próprios atuais têm superfície relativamente pequena:

- `MC_TextWrap`: risco baixo, pois atua em `Window_Message`;
- `MC_WorldMap`: risco baixo, pois cria uma scene própria e plugin command;
- `MC_Core`: **risco moderado**, pois altera `Game_Map.prototype.isPassable` e reserva Region 1.

Portanto o primeiro smoke test de T02 precisa incluir não apenas a arena tática, mas também:

1. abrir Taverna/Vila/Veyru normalmente;
2. verificar a colisão Region 1 no mapa regional;
3. abrir/fechar o world map;
4. confirmar transferências `MC_TRANSFER`;
5. somente então abrir a arena SRPG.

### Fontes da auditoria

- SRPG Gear MV: https://ohisamacraft.nyanta.jp/srpg_gear_mv.html
- SRPG Gear MV GitHub: https://github.com/Ohisama-Craft/SRPG_GearMV
- LeTBS GitHub: https://github.com/LecodeMV/leTBS
- LeTBS docs: https://lecodemv.github.io/leTBS/
- Synrec TBS: https://synrec.itch.io/rpg-maker-mz-tactical-battle-system
- SRPG Core: https://github.com/RyanBram/SRPGcore

### Critério de saída de T01

T01 é aceito quando concordarmos em usar **SRPG Gear MV** como primeiro candidato, mantendo Synrec como fallback e sem instalar nada até o aceite.


---

## T02 — Instalação mínima e isolamento

**Prioridade:** P0  
**Dependências:** T01  
**Status:** implementado; aguardando smoke test/aceite.

### Base instalada

Pin upstream: `a13a66d4e3b8dc1b772f30d45fc95e9f21e102fd`.

A instalação mínima real é:

- `SRPG_core.js`;
- `SRPG_AoE.js`;
- `SRPG_RangeControl.js`;
- `SRPG_PositionEffects.js`.

Os quatro foram copiados sem alterações. O core declara AoE e RangeControl como
dependências obrigatórias. O smoke test encontrou uma dependência funcional
adicional: o core 1.24Q chama `isForcedMovement()`/`setForcedMovement()`,
métodos definidos apenas por PositionEffects neste pin. Por isso ele passa a
fazer parte da base mínima de T02.

Assets obrigatórios:

- `img/characters/!srpg_set_type1.png`;
- `img/system/srpgPath.png`.

Proveniência: `docs/third_party/SRPG_GEAR_MV.md`.

### Isolamento

Criado `MC_TacticalBridge.js`. Neste estágio ele é somente harness de
desenvolvimento; T03 criará a API semântica definitiva.

Em playtest, **F6** entra no Map004 e F6 novamente encerra SRPG e retorna ao
ponto anterior. O atalho é inerte fora do modo de teste.

### Smoke map

Criado `Map004 — [DEV] Spike Tático T02`, contendo apenas piso passável,
um `<type:actor><id:1>` e um bootstrap de `SRPGBattle Start`.

Não há inimigo, vitória ou gameplay autoral por decisão de escopo.

### IDs reservados

- Switch 91: SRPG ativo;
- Variables 91–96: atores, inimigos, turno, active event, target event e distância.

### Configuração conservadora

- map battle sempre ativo;
- ataque duplo por AGI desligado;
- counter/reaction padrão desligado;
- Auto Battle padrão desabilitado/removido do menu;
- cursor: `!srpg_set_type1`.

São escolhas de smoke test, não balanceamento final.

### Smoke test para aceite

1. Pull da branch e abrir no RPG Maker MV 1.6.3.
2. Iniciar Playtest normalmente.
3. Confirmar Taverna/Vila/Veyru.
4. Em Veyru, confirmar que Region 1 continua bloqueando o fechamento do mapa.
5. Confirmar que world map e `MC_TRANSFER` continuam funcionando.
6. Pressionar **F6**.
7. Confirmar entrada em `[DEV] Spike Tático T02`.
8. Confirmar cursor SRPG e Haroldo selecionável.
9. Selecionar Haroldo e fazer pelo menos um movimento no grid.
10. Pressionar **F6** novamente.
11. Confirmar retorno ao mapa e posição de origem.

### Validações estáticas

- três plugins upstream compilam como JavaScript;
- `MC_TacticalBridge.js` e `plugins.js` compilam;
- Map004, MapInfos e System permanecem JSON válidos;
- plugin e assets usam o mesmo pin upstream.

### Correção após primeiro smoke test

O primeiro teste conseguiu inicializar e selecionar a unidade, mas ao executar
uma ação ocorreu:

    TypeError: event.isForcedMovement is not a function

A causa foi localizada no upstream: `SRPG_core.js` usa a API de movimento
forçado, mas o módulo que a define (`SRPG_PositionEffects.js`) era classificado
como recomendado. O módulo foi adicionado sem modificação e o bridge agora
verifica explicitamente essa API.

Os termos próprios do SRPG que caíam nos defaults japoneses também foram
configurados em português no `plugins.js`.

### Limitações conhecidas

- runtime corrigido precisa ser revalidado no RPG Maker local;
- Map004 não tem inimigo/vitória/derrota;
- contrato de encounter é T03;
- arena real é T04;
- Region 1 não é usado no smoke map; namespace tático de terreno será tratado
  após validar o motor.

### Critério de saída

T02 é aceito quando o smoke test passa sem regressão da exploração.

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

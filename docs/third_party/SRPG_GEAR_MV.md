# SRPG Gear MV — dependência do spike tático

## Versão pinada

- Projeto: SRPG Gear MV
- Upstream: https://github.com/Ohisama-Craft/SRPG_GearMV
- Release identificada no core: 1.24 + Q
- Commit pinado: `a13a66d4e3b8dc1b772f30d45fc95e9f21e102fd`
- Data do pin: 2025-02-28
- Licença dos plugins: MIT

## Arquivos copiados sem modificação

- `js/plugins/SRPG_core.js`
- `js/plugins/SRPG_AoE.js`
- `js/plugins/SRPG_RangeControl.js`
- `js/plugins/SRPG_PositionEffects.js`
- `img/characters/!srpg_set_type1.png`
- `img/system/srpgPath.png`

O próprio `SRPG_core.js` 1.24Q declara **SRPG_AoE** e
**SRPG_RangeControl** como plugins obrigatórios.

O primeiro smoke test revelou ainda uma dependência funcional não documentada:
`SRPG_core.js` chama `event.isForcedMovement()` e
`event.setForcedMovement(false)` ao concluir ações, mas esses métodos são
definidos por `SRPG_PositionEffects.js`, listado upstream apenas como
"recommended". Para este pin, PositionEffects é portanto tratado como
**dependência de facto** da base instalada.

Isso também é coerente com Mundo Central, pois PositionEffects será a primitiva
de push/pull/teleport usada mais tarde.

Não editar os plugins third-party para funcionalidades de Mundo Central.
Extensões autorais devem ficar em plugins `MC_*` sempre que possível.

## Harness T02

`MC_TacticalBridge.js` é temporário e existe somente para o smoke test.

No playtest do RPG Maker MV:

- **F6** fora do spike salva a posição atual e transfere para Map004;
- Map004 executa `SRPGBattle Start`;
- **F6** no spike executa `endSRPG()` e retorna ao ponto salvo.

Map004 não é `VEYRU_CLAY_01`.

## IDs reservados

- Switch 91: `MC_SRPG_ACTIVE`
- Variable 91: `MC_SRPG_EXIST_ACTORS`
- Variable 92: `MC_SRPG_EXIST_ENEMIES`
- Variable 93: `MC_SRPG_TURN`
- Variable 94: `MC_SRPG_ACTIVE_EVENT`
- Variable 95: `MC_SRPG_TARGET_EVENT`
- Variable 96: `MC_SRPG_DISTANCE`

## Rollback

T02 é entregue em um único commit. Reverter esse commit remove motor, assets,
mapa de smoke test, bridge e registros de plugin de uma vez.

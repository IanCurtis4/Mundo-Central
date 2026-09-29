//=============================================================================
// MC_TacticalBridge.js
//=============================================================================

/*:
 * @plugindesc v0.0.1 Ponte isolada do Mundo Central para o spike SRPG Gear.
 * @author Mundo Central
 *
 * @help
 * T02 — harness temporário de desenvolvimento.
 *
 * Em playtest do RPG Maker MV:
 *   F6 = entrar no mapa de smoke test tático.
 *   F6 novamente = encerrar SRPG e voltar ao ponto anterior.
 *
 * Este atalho NÃO é a API final de encounters. T03 substituirá o harness
 * por um contrato semântico.
 */

var Imported = Imported || {};
Imported.MC_TacticalBridge = true;

var MC = MC || {};

(function() {
    'use strict';

    var SPIKE_MAP_ID = 4;
    var SPIKE_X = 6;
    var SPIKE_Y = 10;
    var SPIKE_INPUT = 'mcTacticalSpike';

    MC.TacticalBridge = MC.TacticalBridge || {};
    MC.TacticalBridge.VERSION = '0.0.1';
    MC.TacticalBridge.SPIKE_MAP_ID = SPIKE_MAP_ID;

    // SRPG Gear 1.24Q does not publish Imported.* flags. Probe the three
    // capabilities supplied by core + its two required modules instead.
    MC.TacticalBridge.runtimeReady = function() {
        return !!(
            typeof Game_System !== 'undefined' &&
            typeof Game_System.prototype.startSRPG === 'function' &&
            typeof Game_System.prototype.endSRPG === 'function' &&
            typeof Game_Temp !== 'undefined' &&
            typeof Game_Temp.prototype.clearArea === 'function' &&
            typeof Game_Map !== 'undefined' &&
            typeof Game_Map.prototype.srpgHasLoS === 'function' &&
            typeof Game_Character !== 'undefined' &&
            typeof Game_Character.prototype.isForcedMovement === 'function' &&
            typeof Game_Character.prototype.setForcedMovement === 'function' &&
            typeof $gameSystem !== 'undefined' &&
            $gameSystem &&
            typeof $gameSystem.isSRPGMode === 'function'
        );
    };

    MC.TacticalBridge.enterSpike = function() {
        if (!this.runtimeReady()) {
            throw new Error('[MC_TacticalBridge] SRPG Gear mínimo não está carregado.');
        }
        if ($gameSystem.isSRPGMode()) return;

        $gameSystem._mcTacticalSpikeReturn = {
            mapId: $gameMap.mapId(),
            x: $gamePlayer.x,
            y: $gamePlayer.y,
            direction: $gamePlayer.direction()
        };

        $gamePlayer.reserveTransfer(SPIKE_MAP_ID, SPIKE_X, SPIKE_Y, 8, 0);
    };

    MC.TacticalBridge.exitSpike = function() {
        if (!this.runtimeReady()) return;

        if ($gameSystem.isSRPGMode()) {
            $gameSystem.endSRPG();
        }

        var back = $gameSystem._mcTacticalSpikeReturn;
        $gameSystem._mcTacticalSpikeReturn = null;

        if (back && back.mapId > 0) {
            $gamePlayer.reserveTransfer(
                back.mapId,
                back.x,
                back.y,
                back.direction || 2,
                0
            );
        }
    };

    Input.keyMapper[117] = SPIKE_INPUT; // F6

    var _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);

        if (!Utils.isOptionValid('test')) return;
        if (!Input.isTriggered(SPIKE_INPUT)) return;
        if (!$gameSystem || !$gameMap || !$gamePlayer) return;

        if ($gameMap.mapId() === SPIKE_MAP_ID ||
            (MC.TacticalBridge.runtimeReady() && $gameSystem.isSRPGMode())) {
            MC.TacticalBridge.exitSpike();
        } else {
            MC.TacticalBridge.enterSpike();
        }
    };
})();

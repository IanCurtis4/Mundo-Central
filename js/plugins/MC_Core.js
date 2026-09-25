//=============================================================================
// MC_Core.js
//=============================================================================

/*:
 * @plugindesc v0.1.0 Core do Mundo Central: IDs semânticos e helpers comuns.
 * @author Mundo Central
 *
 * @help
 * MC_Core centraliza referências que não devem ficar espalhadas como "números
 * mágicos" pelo projeto.
 *
 * Plugin Command:
 *   MC_TRANSFER MAP_KEY SPAWN_KEY [fade]
 *
 * Exemplo:
 *   MC_TRANSFER STARTING_VILLAGE SOUTH_GATE 0
 *
 * fade:
 *   0 = preto, 1 = branco, 2 = nenhum
 */

var Imported = Imported || {};
Imported.MC_Core = true;

var MC = MC || {};

(function() {
    'use strict';

    MC.VERSION = '0.1.0';

    MC.Maps = Object.freeze({
        STARTING_TAVERN: 1,
        STARTING_VILLAGE: 2,
        CENTRAL_REGION: 3
    });

    MC.Spawns = Object.freeze({
        STARTING_TAVERN: Object.freeze({
            WAKE_UP: Object.freeze({ x: 8, y: 9, direction: 2 })
        }),
        STARTING_VILLAGE: Object.freeze({
            TAVERN_DOOR: Object.freeze({ x: 19, y: 8, direction: 2 }),
            SOUTH_GATE: Object.freeze({ x: 22, y: 31, direction: 8 })
        }),
        CENTRAL_REGION: Object.freeze({
            STARTING_VILLAGE: Object.freeze({ x: 39, y: 34, direction: 8 })
        })
    });

    MC.mapId = function(mapKey) {
        var id = MC.Maps[String(mapKey || '').toUpperCase()];
        if (!id) {
            throw new Error('[MC_Core] Mapa desconhecido: ' + mapKey);
        }
        return id;
    };

    MC.spawn = function(mapKey, spawnKey) {
        var mapName = String(mapKey || '').toUpperCase();
        var spawnName = String(spawnKey || '').toUpperCase();
        var mapSpawns = MC.Spawns[mapName];

        if (!mapSpawns || !mapSpawns[spawnName]) {
            throw new Error(
                '[MC_Core] Spawn desconhecido: ' + mapName + '.' + spawnName
            );
        }

        return mapSpawns[spawnName];
    };

    MC.transfer = function(mapKey, spawnKey, fadeType) {
        var spawn = MC.spawn(mapKey, spawnKey);
        var mapId = MC.mapId(mapKey);
        var fade = fadeType == null ? 0 : Number(fadeType);

        $gamePlayer.reserveTransfer(
            mapId,
            spawn.x,
            spawn.y,
            spawn.direction || 2,
            isNaN(fade) ? 0 : fade
        );
    };

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toUpperCase() === 'MC_TRANSFER') {
            if (!args || args.length < 2) {
                throw new Error(
                    '[MC_Core] Uso: MC_TRANSFER MAP_KEY SPAWN_KEY [fade]'
                );
            }

            MC.transfer(args[0], args[1], args.length >= 3 ? args[2] : 0);
        }
    };
})();

//=============================================================================
// MC_WorldMap.js
//=============================================================================

/*:
 * @plugindesc v0.1.0 Mapa-múndi/fast travel do Mundo Central.
 * @author Mundo Central
 *
 * @help
 * Plugin Command:
 *   MC_WORLDMAP
 *
 * A primeira versão é propositalmente esquemática: ela prova a navegação e
 * o fast travel sem depender ainda da arte final do atlas.
 */

var Imported = Imported || {};
Imported.MC_WorldMap = true;

var MC = MC || {};

(function() {
    'use strict';

    MC.WorldMap = MC.WorldMap || {};

    MC.WorldMap.locations = [
        {
            key: 'STARTING_VILLAGE',
            name: 'Vila da Encruzilhada',
            region: 'Terras Centrais',
            description: 'Uma pequena vila entre Revin e Manum. Foi aqui que o grupo despertou.',
            enabled: true,
            mapKey: 'STARTING_VILLAGE',
            spawnKey: 'SOUTH_GATE'
        },
        {
            key: 'REVIN',
            name: 'Revin',
            region: 'Costa Ocidental',
            description: 'Centro cosmopolita de comércio, arquivos e eter-antropologia.',
            enabled: false
        },
        {
            key: 'MANUM',
            name: 'Manum',
            region: 'Terras Centrais',
            description: 'Polo de matemágica, metafísica e engenharia etérica.',
            enabled: false
        }
    ];

    function Scene_MCWorldMap() {
        this.initialize.apply(this, arguments);
    }

    Scene_MCWorldMap.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_MCWorldMap.prototype.constructor = Scene_MCWorldMap;

    Scene_MCWorldMap.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_MCWorldMap.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createTitleWindow();
        this.createCommandWindow();
        this.createInfoWindow();
    };

    Scene_MCWorldMap.prototype.createTitleWindow = function() {
        this._titleWindow = new Window_Base(0, 0, Graphics.boxWidth, 72);
        this._titleWindow.drawText('Mundo Central — Rotas Conhecidas', 0, 0,
            this._titleWindow.contentsWidth(), 'center');
        this.addWindow(this._titleWindow);
    };

    Scene_MCWorldMap.prototype.createCommandWindow = function() {
        var y = 72;
        var h = Graphics.boxHeight - y - 168;
        this._commandWindow = new Window_MCWorldMapCommand(0, y, 320, h);
        this._commandWindow.setHandler('location', this.onLocationOk.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this._commandWindow.setHelpWindow(null);
        this._commandWindow.setChangeHandler(this.refreshInfo.bind(this));
        this.addWindow(this._commandWindow);
    };

    Scene_MCWorldMap.prototype.createInfoWindow = function() {
        var x = 320;
        var y = 72;
        var w = Graphics.boxWidth - x;
        var h = Graphics.boxHeight - y;
        this._infoWindow = new Window_Base(x, y, w, h);
        this.addWindow(this._infoWindow);
        this.refreshInfo();
    };

    Scene_MCWorldMap.prototype.refreshInfo = function() {
        if (!this._infoWindow || !this._commandWindow) return;
        var loc = this._commandWindow.currentLocation();
        var win = this._infoWindow;
        win.contents.clear();

        win.drawText('ATLAS PROVISÓRIO', 0, 0, win.contentsWidth(), 'center');

        if (!loc) return;

        win.changeTextColor(win.systemColor());
        win.drawText(loc.name, 12, 54, win.contentsWidth() - 24);
        win.resetTextColor();
        win.drawText(loc.region, 12, 90, win.contentsWidth() - 24);

        win.drawTextEx(loc.description, 12, 142);

        var statusY = win.contentsHeight() - 72;
        win.changeTextColor(loc.enabled ? win.textColor(3) : win.textColor(7));
        win.drawText(
            loc.enabled ? 'ROTA DISPONÍVEL' : 'ROTA AINDA NÃO LIBERADA',
            12,
            statusY,
            win.contentsWidth() - 24,
            'center'
        );
        win.resetTextColor();
    };

    Scene_MCWorldMap.prototype.onLocationOk = function() {
        var loc = this._commandWindow.currentLocation();
        if (!loc || !loc.enabled) {
            SoundManager.playBuzzer();
            this._commandWindow.activate();
            return;
        }

        SoundManager.playOk();
        MC.transfer(loc.mapKey, loc.spawnKey, 0);
        SceneManager.goto(Scene_Map);
    };

    function Window_MCWorldMapCommand() {
        this.initialize.apply(this, arguments);
    }

    Window_MCWorldMapCommand.prototype = Object.create(Window_Command.prototype);
    Window_MCWorldMapCommand.prototype.constructor = Window_MCWorldMapCommand;

    Window_MCWorldMapCommand.prototype.initialize = function(x, y, width, height) {
        this._mcWidth = width;
        this._mcHeight = height;
        Window_Command.prototype.initialize.call(this, x, y);
        this.select(0);
        this.activate();
    };

    Window_MCWorldMapCommand.prototype.windowWidth = function() {
        return this._mcWidth || 320;
    };

    Window_MCWorldMapCommand.prototype.windowHeight = function() {
        return this._mcHeight || this.fittingHeight(6);
    };

    Window_MCWorldMapCommand.prototype.makeCommandList = function() {
        MC.WorldMap.locations.forEach(function(loc, index) {
            this.addCommand(
                loc.name,
                'location',
                true,
                index
            );
        }, this);
    };

    Window_MCWorldMapCommand.prototype.currentLocation = function() {
        var index = this.currentExt();
        return MC.WorldMap.locations[index == null ? 0 : index];
    };

    Window_MCWorldMapCommand.prototype.setChangeHandler = function(handler) {
        this._changeHandler = handler;
    };

    Window_MCWorldMapCommand.prototype.select = function(index) {
        Window_Command.prototype.select.call(this, index);
        if (this._changeHandler) this._changeHandler();
    };

    var _Window_MCWorldMapCommand_processCursorMove =
        Window_MCWorldMapCommand.prototype.processCursorMove;

    Window_MCWorldMapCommand.prototype.processCursorMove = function() {
        var oldIndex = this.index();
        _Window_MCWorldMapCommand_processCursorMove.call(this);
        if (oldIndex !== this.index() && this._changeHandler) {
            this._changeHandler();
        }
    };

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;

    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (String(command).toUpperCase() === 'MC_WORLDMAP') {
            SceneManager.push(Scene_MCWorldMap);
        }
    };

    MC.Scene_WorldMap = Scene_MCWorldMap;
})();

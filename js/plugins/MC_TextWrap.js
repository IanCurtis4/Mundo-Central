//=============================================================================
// MC_TextWrap.js
//=============================================================================

/*:
 * @plugindesc v0.1.0 Quebra automática de palavras nas mensagens do Mundo Central.
 * @author Mundo Central
 *
 * @help
 * O RPG Maker MV não quebra texto automaticamente. Este plugin mede cada palavra
 * usando a fonte ativa da Window_Message e insere quebras antes do texto ultrapassar
 * a área útil da caixa (incluindo a redução de largura causada por faces).
 *
 * Quebras manuais existentes são preservadas.
 */

var Imported = Imported || {};
Imported.MC_TextWrap = true;

(function() {
    'use strict';

    function visibleWidth(window, token) {
        // O slice atual usa texto simples. Removemos códigos de controle comuns
        // da medição para que cor/espera/etc. não sejam contados como caracteres.
        var plain = String(token)
            .replace(/\x1b[A-Z]+\[[^\]]*\]/gi, '')
            .replace(/\x1b[{}.$|!><^]/g, '');
        return window.textWidth(plain);
    }

    function wrapParagraph(window, paragraph, maxWidth) {
        if (!paragraph || /^\s*$/.test(paragraph)) return '';

        var words = paragraph.trim().split(/\s+/);
        var lines = [];
        var line = '';

        words.forEach(function(word) {
            var candidate = line ? line + ' ' + word : word;
            if (line && visibleWidth(window, candidate) > maxWidth) {
                lines.push(line);
                line = word;
            } else {
                line = candidate;
            }
        });

        if (line) lines.push(line);
        return lines.join('\n');
    }

    Window_Message.prototype.mcWrapText = function(text) {
        var maxWidth = this.contentsWidth() - this.newLineX() - 8;
        return String(text)
            .split('\n')
            .map(function(paragraph) {
                return wrapParagraph(this, paragraph, maxWidth);
            }, this)
            .join('\n');
    };

    var _Window_Message_startMessage = Window_Message.prototype.startMessage;

    Window_Message.prototype.startMessage = function() {
        var originalAllText = $gameMessage.allText;
        var self = this;

        // Mantém o fluxo original do MV e intercepta somente o texto retornado
        // durante startMessage.
        $gameMessage.allText = function() {
            return self.mcWrapText(originalAllText.call($gameMessage));
        };

        try {
            _Window_Message_startMessage.call(this);
        } finally {
            $gameMessage.allText = originalAllText;
        }
    };
})();

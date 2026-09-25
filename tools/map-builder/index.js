'use strict';

class MVMapBuilder {
    constructor({ width, height, tilesetId, displayName, baseTile }) {
        this.width = width;
        this.height = height;
        this.tilesetId = tilesetId;
        this.displayName = displayName || '';
        this.data = new Array(width * height * 6).fill(0);
        this.events = [null];

        if (baseTile != null) this.fillLayer(0, baseTile);
    }

    index(x, y, z) {
        return (z * this.height + y) * this.width + x;
    }

    set(x, y, z, tileId) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return this;
        this.data[this.index(x, y, z)] = tileId;
        return this;
    }

    fillLayer(z, tileId) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) this.set(x, y, z, tileId);
        }
        return this;
    }

    rect(x, y, width, height, z, tileId) {
        for (let yy = y; yy < y + height; yy++) {
            for (let xx = x; xx < x + width; xx++) this.set(xx, yy, z, tileId);
        }
        return this;
    }

    event(eventData) {
        this.events[eventData.id] = eventData;
        return this;
    }

    toJSON() {
        return {
            autoplayBgm: false,
            autoplayBgs: false,
            battleback1Name: '',
            battleback2Name: '',
            bgm: { name: '', pan: 0, pitch: 100, volume: 90 },
            bgs: { name: '', pan: 0, pitch: 100, volume: 90 },
            disableDashing: false,
            displayName: this.displayName,
            encounterList: [],
            encounterStep: 30,
            height: this.height,
            note: '',
            parallaxLoopX: false,
            parallaxLoopY: false,
            parallaxName: '',
            parallaxShow: true,
            parallaxSx: 0,
            parallaxSy: 0,
            scrollType: 0,
            specifyBattleback: false,
            tilesetId: this.tilesetId,
            width: this.width,
            data: this.data,
            events: this.events
        };
    }
}

const Tile = Object.freeze({
    // A5 uses direct sequential IDs from TILE_ID_A5 (1536).
    INSIDE_DARKNESS: 1536,
    INSIDE_WOOD_FLOOR: 1584,
    OUTSIDE_MEADOW: 1552,
    OUTSIDE_DIRT: 1553,

    // World A2 autotiles. One autotile kind occupies 48 tile IDs.
    WORLD_GRASS: 2816,
    WORLD_FOREST: 2816 + 4 * 48,
    WORLD_DIRT_ROAD: 2816 + 13 * 48
});

module.exports = { MVMapBuilder, Tile };

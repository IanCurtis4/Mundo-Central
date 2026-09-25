'use strict';

// Geometria dos autotiles do RPG Maker MV. Shape 0 é interior; os demais
// representam bordas/cantos conforme a vizinhança.
const FLOOR_SHAPES = {
  'solid|solid|solid|solid':0,'inner|solid|solid|solid':1,'solid|inner|solid|solid':2,
  'inner|inner|solid|solid':3,'solid|solid|solid|inner':4,'inner|solid|solid|inner':5,
  'solid|inner|solid|inner':6,'inner|inner|solid|inner':7,'solid|solid|inner|solid':8,
  'inner|solid|inner|solid':9,'solid|inner|inner|solid':10,'inner|inner|inner|solid':11,
  'solid|solid|inner|inner':12,'inner|solid|inner|inner':13,'solid|inner|inner|inner':14,
  'inner|inner|inner|inner':15,'vedge|solid|vedge|solid':16,'vedge|inner|vedge|solid':17,
  'vedge|solid|vedge|inner':18,'vedge|inner|vedge|inner':19,'hedge|hedge|solid|solid':20,
  'hedge|hedge|solid|inner':21,'hedge|hedge|inner|solid':22,'hedge|hedge|inner|inner':23,
  'solid|vedge|solid|vedge':24,'solid|vedge|inner|vedge':25,'inner|vedge|solid|vedge':26,
  'inner|vedge|inner|vedge':27,'solid|solid|hedge|hedge':28,'inner|solid|hedge|hedge':29,
  'solid|inner|hedge|hedge':30,'inner|inner|hedge|hedge':31,'vedge|vedge|vedge|vedge':32,
  'hedge|hedge|hedge|hedge':33,'outer|hedge|vedge|solid':34,'outer|hedge|vedge|inner':35,
  'hedge|outer|solid|vedge':36,'hedge|outer|inner|vedge':37,'solid|vedge|hedge|outer':38,
  'inner|vedge|hedge|outer':39,'vedge|solid|outer|hedge':40,'vedge|inner|outer|hedge':41,
  'outer|outer|vedge|vedge':42,'outer|hedge|outer|hedge':43,'vedge|vedge|outer|outer':44,
  'hedge|outer|hedge|outer':45,'outer|outer|outer|outer':47
};

const WALL_SHAPES = {
  'solid|solid|solid|solid':0,'vedge|solid|vedge|solid':1,'hedge|hedge|solid|solid':2,
  'outer|hedge|vedge|solid':3,'solid|vedge|solid|vedge':4,'vedge|vedge|vedge|vedge':5,
  'hedge|outer|solid|vedge':6,'outer|outer|vedge|vedge':7,'solid|solid|hedge|hedge':8,
  'vedge|solid|outer|hedge':9,'hedge|hedge|hedge|hedge':10,'outer|hedge|outer|hedge':11,
  'solid|vedge|hedge|outer':12,'vedge|vedge|outer|outer':13,'hedge|outer|hedge|outer':14,
  'outer|outer|outer|outer':15
};

function quarter(v, h, d) {
    if (v && h && d) return 'solid';
    if (v && h) return 'inner';
    if (v) return 'vedge';
    if (h) return 'hedge';
    return 'outer';
}

function floorShape(nb) {
    const nw = nb.nw && nb.n && nb.w;
    const ne = nb.ne && nb.n && nb.e;
    const sw = nb.sw && nb.s && nb.w;
    const se = nb.se && nb.s && nb.e;
    const sig = [
        quarter(nb.n, nb.w, nw),
        quarter(nb.n, nb.e, ne),
        quarter(nb.s, nb.w, sw),
        quarter(nb.s, nb.e, se)
    ].join('|');
    return FLOOR_SHAPES[sig] ?? 0;
}

function wallShape(nb) {
    const sig = [
        quarter(nb.n, nb.w, nb.n && nb.w),
        quarter(nb.n, nb.e, nb.n && nb.e),
        quarter(nb.s, nb.w, nb.s && nb.w),
        quarter(nb.s, nb.e, nb.s && nb.e)
    ].join('|');
    return WALL_SHAPES[sig] ?? 0;
}

class MVMapBuilder {
    constructor({ width, height, tilesetId, displayName, baseTile = 0 }) {
        this.width = width;
        this.height = height;
        this.tilesetId = tilesetId;
        this.displayName = displayName || '';
        this.data = new Array(width * height * 6).fill(0);
        this.events = [null];
        if (baseTile) this.fillLayer(0, baseTile);
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

    rect(x, y, width, height) {
        const cells = new Set();
        for (let yy = y; yy < y + height; yy++) {
            for (let xx = x; xx < x + width; xx++) cells.add(`${xx},${yy}`);
        }
        return cells;
    }

    ellipse(cx, cy, rx, ry, roughness = 0) {
        const cells = new Set();
        for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
            for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
                const nx = (x - cx) / rx;
                const ny = (y - cy) / ry;
                const jitter = roughness
                    ? ((((x * 17 + y * 31 + x * y * 3) % 11) - 5) / 50) * roughness
                    : 0;
                if (nx * nx + ny * ny <= 1 + jitter) cells.add(`${x},${y}`);
            }
        }
        return cells;
    }

    path(points, radius = 0) {
        const cells = new Set();
        for (let i = 0; i < points.length - 1; i++) {
            let [x, y] = points[i];
            const [tx, ty] = points[i + 1];

            while (x !== tx || y !== ty) {
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        if (Math.abs(dx) + Math.abs(dy) <= radius) {
                            cells.add(`${x + dx},${y + dy}`);
                        }
                    }
                }
                const dx = tx - x;
                const dy = ty - y;
                if (Math.abs(dx) >= Math.abs(dy)) x += Math.sign(dx);
                else y += Math.sign(dy);
            }
            cells.add(`${tx},${ty}`);
        }
        return cells;
    }

    paintAutotile(cells, baseTileId, z = 0, geometry = 'floor') {
        const makeId = shape => {
            const kind = Math.floor((baseTileId - 2048) / 48);
            return 2048 + kind * 48 + shape;
        };

        for (const cell of cells) {
            const [x, y] = cell.split(',').map(Number);
            const has = (dx, dy) => cells.has(`${x + dx},${y + dy}`);
            const nb = {
                n: has(0, -1), e: has(1, 0), s: has(0, 1), w: has(-1, 0),
                ne: has(1, -1), se: has(1, 1), sw: has(-1, 1), nw: has(-1, -1)
            };
            const shape = geometry === 'wall' ? wallShape(nb) : floorShape(nb);
            this.set(x, y, z, makeId(shape));
        }
        return this;
    }

    stamp(x, y, rows, z = 2) {
        rows.forEach((row, yy) => row.forEach((tileId, xx) => {
            if (tileId) this.set(x + xx, y + yy, z, tileId);
        }));
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
    INSIDE_WOOD_A: 2816,
    INSIDE_RUG_A: 2816 + 2 * 48,
    INSIDE_TABLE_A: 2816 + 7 * 48,

    OUTSIDE_MEADOW: 2816,
    OUTSIDE_ROAD_MEADOW: 2816 + 2 * 48,
    OUTSIDE_COBBLE_A: 2816 + 3 * 48,
    OUTSIDE_BUSH: 2816 + 4 * 48,

    WORLD_GRASS: 2816,
    WORLD_FOREST: 2816 + 4 * 48,
    WORLD_HILL_GRASS: 2816 + 6 * 48,
    WORLD_MOUNTAIN_DIRT: 2816 + 7 * 48,
    WORLD_DIRT_ROAD: 2816 + 13 * 48
});

module.exports = { MVMapBuilder, Tile };

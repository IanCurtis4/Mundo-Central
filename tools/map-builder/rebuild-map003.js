'use strict';

const fs = require('fs');
const path = require('path');
const { MVMapBuilder, Tile } = require('./index');

const MAP_PATH = path.resolve(__dirname, '../../data/Map003.json');
const BLOCKED_REGION = 1;

function key(x, y) { return `${x},${y}`; }

function union(...sets) {
    const out = new Set();
    sets.forEach(set => set.forEach(value => out.add(value)));
    return out;
}

function subtract(source, excluded) {
    const out = new Set();
    source.forEach(value => {
        if (!excluded.has(value)) out.add(value);
    });
    return out;
}

function ellipse(cx, cy, rx, ry) {
    const cells = new Set();
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
        for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
            const nx = (x - cx) / rx;
            const ny = (y - cy) / ry;
            if (nx * nx + ny * ny <= 1) cells.add(key(x, y));
        }
    }
    return cells;
}

function rect(x, y, width, height) {
    const cells = new Set();
    for (let yy = y; yy < y + height; yy++) {
        for (let xx = x; xx < x + width; xx++) cells.add(key(xx, yy));
    }
    return cells;
}

function pathCells(points) {
    const cells = new Set();
    for (let i = 0; i < points.length - 1; i++) {
        let [x, y] = points[i];
        const [tx, ty] = points[i + 1];
        while (x !== tx || y !== ty) {
            cells.add(key(x, y));
            const dx = tx - x;
            const dy = ty - y;
            if (Math.abs(dx) >= Math.abs(dy)) x += Math.sign(dx);
            else y += Math.sign(dy);
        }
        cells.add(key(tx, ty));
    }
    return cells;
}

function clearRect(map, x, y, width, height, z) {
    for (let yy = y; yy < y + height; yy++) {
        for (let xx = x; xx < x + width; xx++) map.set(xx, yy, z, 0);
    }
}

function loadMap() {
    const raw = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const map = new MVMapBuilder({
        width: raw.width,
        height: raw.height,
        tilesetId: raw.tilesetId,
        displayName: 'Pradarias de Veyru'
    });
    map.data = raw.data.slice();
    map.events = raw.events;
    return map;
}

function normalizeWorldLayers(map) {
    // World_A2 geography must sit above a grass underpaint; otherwise its
    // transparent edge pixels reveal empty white background in the editor/game.
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const l0 = map.data[map.index(x, y, 0)];
            const l1 = map.data[map.index(x, y, 1)];
            const l2 = map.data[map.index(x, y, 2)];
            const l3 = map.data[map.index(x, y, 3)];

            map.set(x, y, 0, Tile.WORLD_GRASS);
            map.set(x, y, 1, l0 === Tile.WORLD_GRASS ? 0 : l0);
            map.set(x, y, 2, l1 || 0);
            map.set(x, y, 3, l3 || l2 || 0);
            map.setRegion(x, y, 0);
        }
    }
}

function buildRethGate(map) {
    clearRect(map, 0, 26, 18, 17, 2);

    const upper = rect(0, 0, 15, 32);
    const lower = rect(0, 37, 15, map.height - 37);
    const feather = union(ellipse(15, 16, 5, 16), ellipse(15, 49, 5, 12));
    const island = ellipse(9, 34, 3, 2);

    const north = pathCells([[16,34],[14,34],[13,32],[11,31],[8,31],[6,32],[5,34]]);
    const south = pathCells([[16,34],[14,34],[13,36],[11,37],[8,37],[6,36],[5,34]]);
    const tail = pathCells([[5,34],[0,34]]);
    const road = union(north, south, tail);

    const shoulder = new Set(road);
    road.forEach(value => {
        const [x, y] = value.split(',').map(Number);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => shoulder.add(key(x+dx,y+dy)));
    });

    const trees = subtract(union(upper, lower, feather, island), shoulder);
    map.paintWorldTerrain(trees, Tile.WORLD_FOREST);
    map.paintWorldRoad(road);
    map.paintRegion(trees, BLOCKED_REGION);

    map.events[2].x = 4;
    map.events[2].y = 34;
}

function buildClayGate(map) {
    clearRect(map, 63, 17, 17, 13, 2);

    const upper = rect(72, 0, 8, 20);
    const lower = rect(72, 27, 8, map.height - 27);
    const feather = union(ellipse(71, 10, 4, 10), ellipse(71, 43, 4, 17));
    const mud = union(ellipse(75, 23, 5, 4), rect(72, 21, 8, 5));

    const approach = pathCells([[63,28],[65,27],[67,26],[68,25],[69,24],[70,23],[71,23]]);
    const swallowed = pathCells([[71,23],[74,23],[77,23],[79,23]]);
    const road = union(approach, swallowed);

    const trees = subtract(union(upper, lower, feather), union(mud, road));
    map.paintWorldTerrain(trees, Tile.WORLD_FOREST);
    map.paintWorldTerrain(mud, Tile.WORLD_DIRT_FIELD_B);
    map.paintWorldRoad(road);
    map.paintRegion(trees, BLOCKED_REGION);

    const blockedMud = new Set([...mud].filter(value => Number(value.split(',')[0]) >= 72));
    map.paintRegion(blockedMud, BLOCKED_REGION);

    map.events[3].x = 71;
    map.events[3].y = 23;
}

const map = loadMap();
normalizeWorldLayers(map);
buildRethGate(map);
buildClayGate(map);
fs.writeFileSync(MAP_PATH, JSON.stringify(map.toJSON()));
console.log('Map003 rebuilt: underpaint + Reth loop + Living Clay choke.');

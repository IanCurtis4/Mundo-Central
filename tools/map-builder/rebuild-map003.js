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

function expandCells(source, radius) {
    const out = new Set();
    source.forEach(value => {
        const [x, y] = value.split(',').map(Number);
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= radius * radius) {
                    out.add(key(x + dx, y + dy));
                }
            }
        }
    });
    return out;
}

function intersect(source, mask) {
    const out = new Set();
    source.forEach(value => {
        if (mask.has(value)) out.add(value);
    });
    return out;
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
    //
    // Detect the legacy layout before shifting layers so this script is safe
    // to run again on an already-normalized Map003.
    let legacyLayout = false;
    for (let y = 0; y < map.height && !legacyLayout; y++) {
        for (let x = 0; x < map.width; x++) {
            const l0 = map.data[map.index(x, y, 0)];
            if (l0 && l0 !== Tile.WORLD_GRASS) {
                legacyLayout = true;
                break;
            }
        }
    }

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            if (legacyLayout) {
                const l0 = map.data[map.index(x, y, 0)];
                const l1 = map.data[map.index(x, y, 1)];
                const l2 = map.data[map.index(x, y, 2)];
                const l3 = map.data[map.index(x, y, 3)];

                map.set(x, y, 0, Tile.WORLD_GRASS);
                map.set(x, y, 1, l0 === Tile.WORLD_GRASS ? 0 : l0);
                map.set(x, y, 2, l1 || 0);
                map.set(x, y, 3, l3 || l2 || 0);
            } else {
                map.set(x, y, 0, Tile.WORLD_GRASS);
            }

            // A Grassland A autotile on layer 1 is always stale underpaint from
            // the legacy map. Layer 0 already supplies the full grass base.
            const overlay = map.data[map.index(x, y, 1)];
            if (overlay >= Tile.WORLD_GRASS && overlay < Tile.WORLD_GRASS + 48) {
                map.set(x, y, 1, 0);
            }

            // Region collision masks are regenerated below from the visible
            // setpieces, so stale masks never accumulate between rebuilds.
            map.setRegion(x, y, 0);
        }
    }
}

function buildRethGate(map) {
    clearRect(map, 0, 26, 18, 17, 1);
    clearRect(map, 0, 26, 18, 17, 2);

    const upper = rect(0, 0, 15, 32);
    const lower = rect(0, 37, 15, map.height - 37);
    const feather = union(ellipse(15, 16, 5, 16), ellipse(15, 49, 5, 12));
    const island = ellipse(9, 34, 3, 2);

    const north = pathCells([[16,34],[14,34],[13,32],[11,31],[8,31],[6,32],[5,34]]);
    const south = pathCells([[16,34],[14,34],[13,36],[11,37],[8,37],[6,36],[5,34]]);
    const tail = pathCells([[5,34],[0,34]]);
    // Join the generated loop to the pre-existing Veyru road. Without this
    // explicit connector, the two independently-painted paths miss by one tile.
    const connector = pathCells([[16,34],[18,34],[18,33]]);
    const road = union(north, south, tail, connector);

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
    clearRect(map, 63, 17, 17, 13, 1);
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

function closeEmptyExploration(map) {
    // Regional maps should not invite the player into large grass rectangles
    // with nothing to find. Keep broad prairie around roads/POIs and turn the
    // rest into readable, physically blocked geography.
    const road = new Set();
    const mud = new Set();

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const l1 = map.data[map.index(x, y, 1)];
            const l2 = map.data[map.index(x, y, 2)];
            if (l2 >= Tile.WORLD_DIRT_ROAD && l2 < Tile.WORLD_DIRT_ROAD + 48) {
                road.add(key(x, y));
            }
            if (l1 >= Tile.WORLD_DIRT_FIELD_B &&
                l1 < Tile.WORLD_DIRT_FIELD_B + 48) {
                mud.add(key(x, y));
            }
        }
    }

    // Small widening at important junctions makes roads feel deliberately
    // composed instead of uniformly one tile wide.
    const aprons = union(
        ellipse(39, 32, 2.5, 2),
        ellipse(29, 17, 2.2, 1.8),
        ellipse(59, 44, 2.2, 1.8)
    );
    aprons.forEach(value => road.add(value));

    // Repaint all road autotiles as one connected set.
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const l2 = map.data[map.index(x, y, 2)];
            if (l2 >= Tile.WORLD_DIRT_ROAD &&
                l2 < Tile.WORLD_DIRT_ROAD + 48) {
                map.set(x, y, 2, 0);
            }
        }
    }
    map.paintWorldRoad(road);

    let playable = expandCells(road, 4);
    [
        ellipse(39, 32, 8, 7),
        ellipse(29, 17, 5, 4),
        ellipse(59, 44, 6, 5),
        ellipse(71, 23, 4, 4),
        ellipse(4, 34, 2.5, 2.5)
    ].forEach(area => { playable = union(playable, area); });
    playable = union(playable, expandCells(mud, 1));

    const all = new Set();
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) all.add(key(x, y));
    }

    let curtain = subtract(all, playable);
    curtain = subtract(curtain, mud);

    // Remove previous blocker terrain before rebuilding a single coherent set.
    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
            const l1 = map.data[map.index(x, y, 1)];
            const kind = l1 >= 2048 ? Math.floor((l1 - 2048) / 48) : -1;
            if (kind === 20 || kind === 22 || kind === 23) map.set(x, y, 1, 0);
            if (map.data[map.index(x, y, 5)] === BLOCKED_REGION) {
                map.setRegion(x, y, 0);
            }
        }
    }

    const mountainMask = union(
        ellipse(61, 7, 6, 4),
        ellipse(65, 9, 5, 4),
        ellipse(61, 12, 7, 4)
    );
    const hillMask = union(
        ellipse(54, 10, 19, 8),
        ellipse(63, 47, 15, 10),
        ellipse(48, 55, 19, 7),
        ellipse(67, 34, 9, 9),
        ellipse(41, 7, 10, 5)
    );

    const mountains = intersect(curtain, mountainMask);
    let hills = subtract(intersect(curtain, hillMask), mountains);
    let forests = subtract(curtain, union(mountains, hills));

    const extraHill = intersect(forests, union(
        ellipse(20, 52, 8, 7),
        ellipse(22, 6, 8, 5),
        ellipse(74, 51, 5, 8)
    ));
    forests = subtract(forests, extraHill);
    hills = union(hills, extraHill);

    map.paintWorldTerrain(forests, Tile.WORLD_FOREST);
    map.paintWorldTerrain(hills, Tile.WORLD_HILL_GRASS);
    map.paintWorldTerrain(mountains, Tile.WORLD_MOUNTAIN_DIRT);

    map.paintRegion(forests, BLOCKED_REGION);
    map.paintRegion(hills, BLOCKED_REGION);
    map.paintRegion(mountains, BLOCKED_REGION);

    // The clay field remains traversable only up to its interaction choke.
    mud.forEach(value => {
        const [x, y] = value.split(',').map(Number);
        if (x >= 72) map.setRegion(x, y, BLOCKED_REGION);
    });

    // Roads and events always win over the collision curtain.
    road.forEach(value => {
        const [x, y] = value.split(',').map(Number);
        map.setRegion(x, y, 0);
    });
    map.events.filter(Boolean).forEach(event => {
        map.setRegion(event.x, event.y, 0);
    });
}

const map = loadMap();
normalizeWorldLayers(map);
buildRethGate(map);
buildClayGate(map);
closeEmptyExploration(map);
fs.writeFileSync(MAP_PATH, JSON.stringify(map.toJSON()));
console.log('Map003 rebuilt: underpaint + soft gates + purposeful exploration corridors.');

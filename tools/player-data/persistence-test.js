/**
 * Player data must survive a new page load and a seasonal art change.
 * Run: node tools/player-data/persistence-test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "../..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function storage() {
  const bag = new Map();
  const removed = [];
  return {
    removed,
    bag,
    localStorage: {
      getItem(key) { return bag.has(key) ? bag.get(key) : null; },
      setItem(key, value) { bag.set(key, String(value)); },
      removeItem(key) { removed.push(key); bag.delete(key); }
    }
  };
}

function load(context, rel) {
  vm.runInContext(read(rel), context, { filename: rel });
}

function snapshot(bag) {
  return JSON.stringify(Array.from(bag.entries()).sort());
}

const seed = {
  "turbo.locationCollection.v1": JSON.stringify({
    version: 1,
    migrated: true,
    railway: { jr_east_niigata: { at: "2026-01-01T00:00:00.000Z", pointId: "jr_east_niigata", distanceM: 12, accuracyM: 8 } },
    airport: { fukuoka_airport_domestic: { at: "2026-01-02T00:00:00.000Z", pointId: "fukuoka_airport_domestic", distanceM: 20, accuracyM: 10 } },
    scenic: { coast: { at: "2026-01-03T00:00:00.000Z", pointId: "coast", distanceM: 5, accuracyM: 5 } }
  }),
  "turbo.railwayMosaic.v1": JSON.stringify({
    version: 1,
    orders: { "5": [2, 0, 4, 1, 3] },
    scenes: {
      "5": {
        image: "/media/puzzles/assigned-winter.jpg",
        imageWidth: 1600,
        imageHeight: 900,
        wallpaper: "/media/puzzles/assigned-wallpaper.jpg",
        wallpaperWidth: 1080,
        wallpaperHeight: 1920
      }
    }
  }),
  "turbo.finalReveal.v1": JSON.stringify({ seen: { "5": "/media/puzzles/assigned-reveal.jpg" } }),
  "turbo.pendingCelebrations.v1": JSON.stringify({
    version: 1,
    items: [{ id: "railway-5", image: "/media/puzzles/assigned-winter.jpg", wallpaper: "/media/puzzles/assigned-wallpaper.jpg", viewed: false }]
  }),
  "turbo.playerInventory.v1": JSON.stringify({ characters: ["turbo"], assets: ["shell"] }),
  "tas.playScene.v1": JSON.stringify({ scene: { name: "My picture", layers: [{ id: "a" }] } })
};

const box = storage();
Object.keys(seed).forEach((key) => box.bag.set(key, seed[key]));
const before = snapshot(box.bag);

const context = vm.createContext({
  window: {},
  console,
  localStorage: box.localStorage,
  Date,
  Math,
  JSON
});
context.global = context.window;
context.window.localStorage = box.localStorage;

load(context, "site/map/js/i18n.js");
load(context, "site/map/js/config/puzzle.js");
context.window.TURBO_PUZZLE_ACTIVE = {
  version: 2,
  image: "/media/puzzles/seasonal-new.jpg",
  imageWidth: 1600,
  imageHeight: 900,
  levels: {
    "5": {
      image: "/media/puzzles/seasonal-new.jpg",
      imageWidth: 1600,
      imageHeight: 900,
      wallpaper: "/media/puzzles/seasonal-wallpaper.jpg"
    }
  }
};
load(context, "site/map/js/collection.js");
load(context, "site/map/js/railway-mosaic.js");
load(context, "site/map/js/puzzle-reward.js");

const collection = context.window.TURBO_COLLECTION;
const mosaic = context.window.TURBO_RAILWAY_MOSAIC;
const reward = context.window.TURBO_PUZZLE_REWARD;
if (collection.list("railway").length !== 1) throw new Error("railway visit was not read");
if (collection.list("airport").length !== 1) throw new Error("airport visit was not read");
if (!mosaic.pictureFor(5).wallpaper.includes("assigned-wallpaper")) throw new Error("assigned wallpaper was replaced");
const again = mosaic.assign(5);
if (again.image !== "/media/puzzles/assigned-winter.jpg") throw new Error("seasonal art replaced an assigned puzzle");
if (snapshot(box.bag) !== before) {
  const after = JSON.parse(box.localStorage.getItem("turbo.railwayMosaic.v1"));
  const prior = JSON.parse(seed["turbo.railwayMosaic.v1"]);
  if (after.scenes["5"].image !== prior.scenes["5"].image) throw new Error("scene image changed on load");
}
if (box.removed.length) throw new Error("a script removed player data on load: " + box.removed.join(","));
if (box.localStorage.getItem("turbo.playerInventory.v1") !== seed["turbo.playerInventory.v1"]) {
  throw new Error("inventory changed");
}
if (box.localStorage.getItem("tas.playScene.v1") !== seed["tas.playScene.v1"]) {
  throw new Error("creative scene changed");
}
if (box.localStorage.getItem("turbo.pendingCelebrations.v1") !== seed["turbo.pendingCelebrations.v1"]) {
  throw new Error("pending celebration changed");
}

load(context, "site/map/js/collection.js");
load(context, "site/map/js/railway-mosaic.js");
if (context.window.TURBO_COLLECTION.list("railway")[0].id !== "jr_east_niigata") {
  throw new Error("a second load lost the visited station");
}
if (box.removed.length) throw new Error("a second load removed player data");

context.window.TURBO_COLLECTION.clearAll();
if (box.removed.indexOf("turbo.locationCollection.v1") === -1) throw new Error("explicit clear did not remove the collection");
if (box.localStorage.getItem("turbo.railwayMosaic.v1") == null) throw new Error("explicit collection clear removed puzzle art");
if (box.localStorage.getItem("turbo.playerInventory.v1") == null) throw new Error("explicit collection clear removed inventory");

const screen = read("site/map/js/collection-screen.js");
if (!screen.includes('location.search.indexOf("test=1")')) {
  throw new Error("test reset is no longer limited to test=1");
}
if (!screen.includes("TURBO_COLLECTION.clearAll")) {
  throw new Error("test reset no longer uses the collection clear");
}

console.log("player data persistence: ok");

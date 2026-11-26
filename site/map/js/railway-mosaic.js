/**
 * Railway mosaic. Tile order is shuffled once per level and kept in
 * localStorage key turbo.railwayMosaic.v1. How many tiles are open
 * still comes only from TURBO_RAILWAY_PUZZLE (unique stations).
 * assign(size, key) stores the picture and optional wallpaper on the first
 * piece of that board. The first 5, 10, 25, and 50 keep keys "5", "10",
 * "25", and "50". A later 50-piece board passes its own key, such as
 * "50:2". An existing scene is never replaced.
 * This module never reads or writes turbo.locationCollection.v1.
 */
(function (global) {
  "use strict";

  var KEY = "turbo.railwayMosaic.v1";
  var ORIGINAL_SCENE = {
    image: "/media/scenes/christmas_in_the_village.webp",
    imageWidth: 1600,
    imageHeight: 900
  };

  function withReveal(scene, source) {
    if (source && source.revealImage) {
      scene.revealImage = source.revealImage;
      scene.revealImageWidth = source.revealImageWidth || scene.imageWidth;
      scene.revealImageHeight = source.revealImageHeight || scene.imageHeight;
    }
    if (source && source.wallpaper) {
      scene.wallpaper = source.wallpaper;
      scene.wallpaperWidth = source.wallpaperWidth || 1080;
      scene.wallpaperHeight = source.wallpaperHeight || 1920;
    }
    if (source && source.celebration) scene.celebration = source.celebration;
    if (source && source.merchantSponsored) scene.merchantSponsored = true;
    if (source && source.merchantWebsite) scene.merchantWebsite = source.merchantWebsite;
    return scene;
  }

  function currentScene() {
    var active = global.TURBO_PUZZLE_ACTIVE;
    if (active && active.image) {
      return withReveal({
        image: active.image,
        imageWidth: active.imageWidth || 1600,
        imageHeight: active.imageHeight || 900
      }, active);
    }
    var picture = config();
    return withReveal({
      image: picture.image || ORIGINAL_SCENE.image,
      imageWidth: picture.imageWidth || 1600,
      imageHeight: picture.imageHeight || 900
    }, picture);
  }

  function sceneFor(size) {
    var active = global.TURBO_PUZZLE_ACTIVE || {};
    var level = active.levels && active.levels[String(size)];
    if (level && level.image) {
      return withReveal({
        image: level.image,
        imageWidth: level.imageWidth || 1600,
        imageHeight: level.imageHeight || 900
      }, level);
    }
    return currentScene();
  }

  function scenes(data) {
    if (!data.scenes || typeof data.scenes !== "object") data.scenes = {};
    return data.scenes;
  }

  function config() {
    return global.TURBO_PUZZLE_CONFIG || {};
  }

  function layout(size) {
    var grids = config().mosaic || {};
    var grid = grids[size] || grids[String(size)];
    if (!grid) return null;
    return { cols: grid.cols, rows: grid.rows, size: grid.cols * grid.rows };
  }

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "");
      if (!data || typeof data !== "object") return { version: 1, orders: {} };
      data.orders = data.orders || {};
      data.version = 1;
      return data;
    } catch (error) {
      return { version: 1, orders: {} };
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function permutation(size) {
    var order = [];
    var i;
    for (i = 0; i < size; i += 1) order.push(i);
    for (i = size - 1; i > 0; i -= 1) {
      var swap = Math.floor(Math.random() * (i + 1));
      var hold = order[i];
      order[i] = order[swap];
      order[swap] = hold;
    }
    return order;
  }

  function valid(order, size) {
    if (!order || order.length !== size) return false;
    var seen = {};
    var i;
    for (i = 0; i < order.length; i += 1) {
      var n = order[i];
      if (typeof n !== "number" || n < 0 || n >= size || seen[n]) return false;
      seen[n] = true;
    }
    return true;
  }

  function storeKey(size, key) {
    return key ? String(key) : String(size);
  }

  function orderFor(size, key) {
    var grid = layout(size);
    if (!grid || grid.size !== size) return [];
    var data = read();
    var savedKey = storeKey(size, key);
    if (valid(data.orders[savedKey], size)) return data.orders[savedKey].slice();
    data.orders[savedKey] = permutation(size);
    write(data);
    return data.orders[savedKey].slice();
  }

  function assign(size, key) {
    var grid = layout(size);
    if (!grid) return null;
    var data = read();
    var savedKey = storeKey(size, key);
    var saved = scenes(data)[savedKey];
    if (saved && saved.image) return saved;
    scenes(data)[savedKey] = sceneFor(size);
    write(data);
    return scenes(data)[savedKey];
  }

  function pictureFor(size, key) {
    var grid = layout(size);
    if (!grid) return null;
    var saved = scenes(read())[storeKey(size, key)];
    if (saved && saved.image) return saved;
    return null;
  }

  function revealedTiles(size, count, key) {
    var order = orderFor(size, key);
    var n = count;
    if (n < 0) n = 0;
    if (n > order.length) n = order.length;
    var open = {};
    var i;
    for (i = 0; i < n; i += 1) open[order[i]] = true;
    return { order: order, open: open, count: n };
  }

  global.TURBO_RAILWAY_MOSAIC = {
    key: KEY,
    layout: layout,
    orderFor: orderFor,
    assign: assign,
    pictureFor: pictureFor,
    revealedTiles: revealedTiles
  };
})(window);

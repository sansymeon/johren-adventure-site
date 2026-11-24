/**
 * Railway mosaic. Tile order is shuffled once per level and kept in
 * localStorage key turbo.railwayMosaic.v1. How many tiles are open
 * still comes only from TURBO_RAILWAY_PUZZLE (unique stations).
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

  function orderFor(size) {
    var grid = layout(size);
    if (!grid || grid.size !== size) return [];
    var data = read();
    var key = String(size);
    if (valid(data.orders[key], size)) return data.orders[key].slice();
    data.orders[key] = permutation(size);
    if (!scenes(data)[key]) scenes(data)[key] = sceneFor(size);
    write(data);
    return data.orders[key].slice();
  }

  function pictureFor(size) {
    var grid = layout(size);
    if (!grid) return null;
    var data = read();
    var key = String(size);
    var saved = scenes(data)[key];
    if (saved && saved.image) return saved;
    if (valid(data.orders[key], size)) {
      scenes(data)[key] = {
        image: ORIGINAL_SCENE.image,
        imageWidth: ORIGINAL_SCENE.imageWidth,
        imageHeight: ORIGINAL_SCENE.imageHeight
      };
      write(data);
      return scenes(data)[key];
    }
    return null;
  }

  function revealedTiles(size, count) {
    var order = orderFor(size);
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
    pictureFor: pictureFor,
    revealedTiles: revealedTiles
  };
})(window);

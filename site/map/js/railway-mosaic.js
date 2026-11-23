/**
 * Railway mosaic. Tile order is shuffled once per level and kept in
 * localStorage key turbo.railwayMosaic.v1. How many tiles are open
 * still comes only from TURBO_RAILWAY_PUZZLE (unique stations).
 * This module never reads or writes turbo.locationCollection.v1.
 */
(function (global) {
  "use strict";

  var KEY = "turbo.railwayMosaic.v1";

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
    write(data);
    return data.orders[key].slice();
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
    revealedTiles: revealedTiles
  };
})(window);

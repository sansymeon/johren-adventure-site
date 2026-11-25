/**
 * Lifetime location collection. One record per place id, per device, for
 * public categories (railway, airport, scenic, cultural, sabah). Merchant
 * places may record repeatable visits when the check-in target says so.
 *
 * Older daily GPS tests live in localStorage key turbo.gpsCheckin.v1.
 * The first time this module runs, those successful records are copied
 * into the railway list and kept. The old key is left in place.
 *
 * Clear turbo.locationCollection.v1 to start again. See README-COLLECTIONS.md.
 */
(function (global) {
  "use strict";

  var KEY = "turbo.locationCollection.v1";
  var LEGACY_KEY = "turbo.gpsCheckin.v1";

  function empty() {
    return { version: 1, migrated: false, railway: {}, airport: {} };
  }

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "");
      if (!data || typeof data !== "object") return empty();
      data.railway = data.railway || {};
      data.airport = data.airport || {};
      data.version = 1;
      return data;
    } catch (error) {
      return empty();
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function migrate(data) {
    if (data.migrated) return data;
    var legacy = {};
    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "{}") || {};
    } catch (error) {
      legacy = {};
    }
    Object.keys(legacy).forEach(function (id) {
      var row = legacy[id];
      if (!row || data.railway[id]) return;
      data.railway[id] = {
        at: row.at || new Date().toISOString(),
        pointId: id,
        distanceM: row.distanceM,
        accuracyM: row.accuracyM,
        migratedFrom: LEGACY_KEY
      };
    });
    data.migrated = true;
    write(data);
    return data;
  }

  function store() {
    return migrate(read());
  }

  function owns(category, placeId) {
    var data = store();
    return !!(data[category] && data[category][placeId]);
  }

  function record(category, placeId, detail) {
    var data = store();
    var repeatable = !!(detail && detail.repeatable);
    if (!data[category]) data[category] = {};
    var existing = data[category][placeId];
    if (existing && !repeatable) return existing;
    data[category][placeId] = {
      at: new Date().toISOString(),
      pointId: detail.pointId,
      distanceM: detail.distanceM,
      accuracyM: detail.accuracyM,
      visitCount: (existing && existing.visitCount ? existing.visitCount : 0) + 1
    };
    write(data);
    return data[category][placeId];
  }

  function list(category) {
    var data = store();
    var bag = data[category] || {};
    return Object.keys(bag).map(function (id) {
      return { id: id, detail: bag[id] };
    });
  }

  function clearAll() {
    localStorage.removeItem(KEY);
  }

  global.TURBO_COLLECTION = {
    key: KEY,
    legacyKey: LEGACY_KEY,
    owns: owns,
    record: record,
    list: list,
    clearAll: clearAll
  };
})(window);

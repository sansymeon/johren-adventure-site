/**
 * Apply local admin edits on top of the shipped map files.
 * A disabled place is hidden. Its id stays in the override file.
 * This does not read or write player collections.
 */
(function (global) {
  "use strict";

  var pack = global.TURBO_PLACE_OVERRIDES || { places: {} };
  var places = pack.places || {};

  function countryOf(row) {
    return row && row.country === "malaysia" ? "malaysia" : "japan";
  }

  function apply(bag, country) {
    if (!bag || !bag.pins) return;
    var index = {};
    var i;
    for (i = 0; i < bag.pins.length; i += 1) {
      var id = bag.pins[i] && bag.pins[i].id;
      if (id && index[id] == null) index[id] = i;
    }
    Object.keys(places).forEach(function (id) {
      var row = places[id];
      if (!row || countryOf(row) !== country) return;
      if (row.disabled) {
        if (index[id] != null) {
          bag.pins.splice(index[id], 1);
          index = {};
          for (i = 0; i < bag.pins.length; i += 1) {
            var kept = bag.pins[i] && bag.pins[i].id;
            if (kept && index[kept] == null) index[kept] = i;
          }
        }
        return;
      }
      var next = {
        id: id,
        name: row.name || id,
        nameEn: row.nameEn || "",
        area: row.area || "",
        line: row.line || "",
        type: row.type || "other",
        lat: row.lat,
        lng: row.lng,
        description: row.description || "",
        descriptionEn: row.descriptionEn || "",
        website: row.website || "",
        image: row.image || "",
        serviceTier: row.serviceTier || "",
        radiusMeters: row.radiusMeters
      };
      if (index[id] != null) {
        var prior = bag.pins[index[id]];
        Object.keys(next).forEach(function (key) {
          if (next[key] !== "" && next[key] != null) prior[key] = next[key];
        });
      } else if (typeof next.lat === "number" && typeof next.lng === "number") {
        bag.pins.push(next);
      }
    });
  }

  apply(global.MAP_DATA, "japan");
  apply(global.SABAH_MAP_DATA, "malaysia");
})(window);

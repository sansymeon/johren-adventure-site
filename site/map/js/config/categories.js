/**
 * Public discovery categories and related GPS / puzzle rules.
 *
 * Add a new public category by appending one object to `public`.
 * Keep `id` stable: it is the TURBO_COLLECTION bag name, so existing
 * visits stay attached to that category.
 *
 * Merchants are listed under `other` and stay outside the four public
 * discovery puzzles. Sabah prototype places are also `other`.
 *
 * Pin types map a map-data `type` onto a category. New pins with an
 * existing type need no code change beyond the map file.
 */
(function (global) {
  "use strict";

  var PUBLIC = [
    {
      id: "railway",
      filterKey: "railway",
      publicDiscovery: true,
      puzzle: true,
      oneTime: true,
      repeatable: false,
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      pinTypes: ["station"],
      labelKey: "filterRailway",
      ownedKey: "stationOwned",
      successKey: "stationSuccess",
      sheetKey: "stationSheet",
      headingKey: "railwayHeading",
      progressKey: "railwayProgress",
      doneKey: "railwayDone",
      emptyKey: "railwayEmpty"
    },
    {
      id: "airport",
      filterKey: "airport",
      publicDiscovery: true,
      puzzle: true,
      oneTime: true,
      repeatable: false,
      radiusMeters: 250,
      maxAccuracyMeters: 150,
      pinTypes: ["airport"],
      labelKey: "filterAirport",
      ownedKey: "airportOwned",
      successKey: "airportSuccess",
      sheetKey: "airportSheet",
      headingKey: "airportHeading",
      progressKey: "airportProgress",
      doneKey: "airportDone",
      emptyKey: "airportEmpty"
    },
    {
      id: "cultural",
      filterKey: "cultural",
      publicDiscovery: true,
      puzzle: true,
      oneTime: true,
      repeatable: false,
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      pinTypes: [
        "church",
        "shrine",
        "temple",
        "museum",
        "castle",
        "castle_ruins",
        "historic",
        "mosque"
      ],
      labelKey: "filterCultural",
      ownedKey: "culturalOwned",
      successKey: "culturalSuccess",
      sheetKey: "culturalSheet",
      headingKey: "culturalHeading",
      progressKey: "culturalProgress",
      doneKey: "culturalDone",
      emptyKey: "culturalEmpty"
    },
    {
      id: "scenic",
      filterKey: "scenic",
      publicDiscovery: true,
      puzzle: true,
      oneTime: true,
      repeatable: false,
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      pinTypes: [
        "beach",
        "waterfall",
        "forest",
        "mountain",
        "viewpoint",
        "nature",
        "landmark"
      ],
      labelKey: "filterScenic",
      ownedKey: "scenicOwned",
      successKey: "scenicSuccess",
      sheetKey: "scenicSheet",
      headingKey: "scenicHeading",
      progressKey: "scenicProgress",
      doneKey: "scenicDone",
      emptyKey: "scenicEmpty"
    }
  ];

  var OTHER = [
    {
      id: "merchant",
      filterKey: "merchant",
      publicDiscovery: false,
      puzzle: false,
      oneTime: false,
      repeatable: true,
      radiusMeters: 80,
      maxAccuracyMeters: 150,
      pinTypes: ["merchant"],
      labelKey: "filterMerchant",
      ownedKey: "merchantOwned",
      successKey: "merchantSuccess",
      sheetKey: "merchantSheet",
      headingKey: "merchantHeading",
      progressKey: "merchantProgress",
      doneKey: "merchantDone",
      emptyKey: "merchantEmpty"
    },
    {
      id: "sabah",
      filterKey: "place",
      publicDiscovery: false,
      puzzle: false,
      oneTime: true,
      repeatable: false,
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      pinTypes: ["coffee", "restaurant", "supermarket", "market"],
      source: "sabah",
      labelKey: "filterPlace",
      ownedKey: "sabahOwned",
      successKey: "sabahSuccess",
      sheetKey: "sabahSheet",
      headingKey: "sabahHeading",
      progressKey: "sabahProgress",
      doneKey: "sabahDone",
      emptyKey: "sabahEmpty"
    }
  ];

  function all() {
    return PUBLIC.concat(OTHER);
  }

  function byId(id) {
    var list = all();
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function publicPuzzleIds() {
    return PUBLIC.filter(function (cat) { return cat.puzzle; }).map(function (cat) {
      return cat.id;
    });
  }

  function levels() {
    var list = global.TURBO_PUZZLE_CONFIG && global.TURBO_PUZZLE_CONFIG.levels;
    return list && list.length ? list.slice() : [5, 10, 25, 50];
  }

  function categoryForPin(pin, source) {
    var type = String((pin && (pin.type || pin.pinType)) || "").toLowerCase().trim();
    var list = all();
    var i;
    var j;
    if (source === "sabah") {
      var sabah = byId("sabah");
      if (sabah) return sabah.id;
    }
    if (pin && pin.merchant === true) return "merchant";
    for (i = 0; i < list.length; i += 1) {
      if (list[i].source && list[i].source !== source) continue;
      for (j = 0; j < list[i].pinTypes.length; j += 1) {
        if (list[i].pinTypes[j] === type) return list[i].id;
      }
    }
    return "cultural";
  }

  function filterForType(normType) {
    var list = all();
    var i;
    var j;
    for (i = 0; i < list.length; i += 1) {
      for (j = 0; j < list[i].pinTypes.length; j += 1) {
        if (list[i].pinTypes[j] === normType) return list[i].filterKey;
      }
    }
    return "cultural";
  }

  function mapFilters() {
    return PUBLIC.map(function (cat) {
      return { key: cat.filterKey, labelKey: cat.labelKey };
    }).concat([
      { key: "place", labelKey: "filterPlace" },
      { key: "merchant", labelKey: "filterMerchant" }
    ]);
  }

  global.TURBO_DISCOVERY_CATEGORIES = {
    public: PUBLIC,
    other: OTHER,
    all: all,
    byId: byId,
    publicPuzzleIds: publicPuzzleIds,
    levels: levels,
    categoryForPin: categoryForPin,
    filterForType: filterForType,
    mapFilters: mapFilters
  };
})(window);

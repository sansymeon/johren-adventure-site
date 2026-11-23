/**
 * Category → map pin artwork for the discovery map.
 * Paths only. discovery-map.js builds the Leaflet icons from this map.
 *
 * Masters live in japanese.jp/turbo_adventure/pins/ and are not modified.
 * Web copies are 128×128 lossless WebP under /img/map/turbo/.
 *
 * Railway stations keep /img/map/station.webp.
 * Airports keep the airplane divIcon (no image file).
 * Cultural spots use the official green Turbo pin.
 * Scenic & Nature uses the official blue Turbo pin.
 * Participating merchants use the official gold Turbo pin. Gold is not a paid
 * tier. No merchant pins are placed by this file.
 */
(function (global) {
  "use strict";

  var SIZE = 26;

  var CATEGORIES = {
    railway: {
      kind: "image",
      retainCurrent: true,
      url: "/img/map/station.webp",
      size: SIZE
    },
    airport: {
      kind: "div",
      retainCurrent: true,
      className: "airport-marker",
      html: "<span>✈</span>",
      size: 28
    },
    cultural: {
      kind: "image",
      url: "/img/map/turbo/turbo_green_pin.webp",
      size: SIZE
    },
    scenic: {
      kind: "image",
      url: "/img/map/turbo/turbo_blue_pin.webp",
      size: SIZE
    },
    merchant: {
      kind: "image",
      url: "/img/map/turbo/turbo_gold_pin.webp",
      size: SIZE
    }
  };

  global.TURBO_PINS = {
    size: SIZE,
    categories: CATEGORIES
  };
})(window);

/**
 * Traditional interlocking-style five-piece plan for a future
 * character or merchant puzzle. Centre region last.
 * Not used by GPS check-in or the railway mosaic.
 */
(function (global) {
  "use strict";

  var REGIONS = [
    { index: 0, role: "top" },
    { index: 1, role: "top" },
    { index: 2, role: "core" },
    { index: 3, role: "bottom" },
    { index: 4, role: "bottom" }
  ];
  var CENTRE = 2;
  var REVEAL = [0, 1, 3, 4, 2];

  function pieces(count) {
    var n = count;
    if (n < 0) n = 0;
    if (n > REVEAL.length) n = REVEAL.length;
    return REGIONS.map(function (region) {
      var order = REVEAL.indexOf(region.index);
      return {
        index: region.index,
        role: region.index === CENTRE ? "core" : region.role,
        centre: region.index === CENTRE,
        revealed: order < n
      };
    });
  }

  global.TURBO_JIGSAW = {
    regions: REGIONS,
    centreIndex: CENTRE,
    pieces: pieces
  };
})(window);

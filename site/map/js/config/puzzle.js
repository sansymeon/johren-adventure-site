/**
 * Shared public-discovery puzzle sizes and the railway first-level picture.
 * Category rules live in config/categories.js. Levels here apply to all four
 * public discovery puzzles: railway, airport, cultural, scenic.
 */
(function (global) {
  "use strict";
  global.TURBO_PUZZLE_CONFIG = {
    levels: [5, 10, 25, 50],
    /**
     * Complete village scene for every railway level.
     * Path is from the site root. The GPS check-in code does not read this.
     * Mosaic grids are rectangular tiles, not jigsaw pieces.
     */
    image: "/media/scenes/christmas_in_the_village.webp",
    imageWidth: 1600,
    imageHeight: 900,
    temporary: false,
    mosaic: {
      5: { cols: 5, rows: 1 },
      10: { cols: 5, rows: 2 },
      25: { cols: 5, rows: 5 },
      50: { cols: 10, rows: 5 }
    }
  };
})(window);

/** Railway puzzle sizes and the first-level picture. Edit this file to swap art. */
(function (global) {
  "use strict";
  global.TURBO_PUZZLE_CONFIG = {
    levels: [5, 10, 25, 50],
    /**
     * Display copy already on the site. Portrait of Turbo, not a dedicated
     * puzzle illustration. Replace image (and temporary: false) when art exists.
     * Path is from the site root. The GPS check-in code does not read this.
     */
    /**
     * Same temporary portrait for every railway level until a scene exists.
     * Mosaic grids are rectangular tiles, not jigsaw pieces.
     */
    image: "/media/turbo/turbo-confident-hero.webp",
    temporary: true,
    mosaic: {
      5: { cols: 5, rows: 1 },
      10: { cols: 5, rows: 2 },
      25: { cols: 5, rows: 5 },
      50: { cols: 10, rows: 5 }
    }
  };
})(window);

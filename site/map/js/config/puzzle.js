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
    firstLevel: {
      id: "railway-5",
      pieces: 5,
      image: "/media/turbo/turbo-confident-hero.webp",
      temporary: true
    }
  };
})(window);

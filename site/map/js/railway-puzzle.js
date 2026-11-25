/**
 * Independent puzzle ladders for each public discovery category.
 * Piece count is unique places collected in that category.
 * A place already collected never awards another piece.
 *
 * Levels default to 5 → 10 → 25 → 50 from TURBO_PUZZLE_CONFIG /
 * TURBO_DISCOVERY_CATEGORIES. Progress is derived from TURBO_COLLECTION.
 *
 * TURBO_RAILWAY_PUZZLE remains for existing callers and equals
 * progressFor("railway").
 */
(function (global) {
  "use strict";

  function levels() {
    if (global.TURBO_DISCOVERY_CATEGORIES && TURBO_DISCOVERY_CATEGORIES.levels) {
      return TURBO_DISCOVERY_CATEGORIES.levels();
    }
    var list = global.TURBO_PUZZLE_CONFIG && global.TURBO_PUZZLE_CONFIG.levels;
    return list && list.length ? list.slice() : [5, 10, 25, 50];
  }

  function progressFor(category) {
    var count = global.TURBO_COLLECTION.list(category || "railway").length;
    var ladder = levels();
    var left = count;
    var i;
    for (i = 0; i < ladder.length; i += 1) {
      if (left < ladder[i]) {
        return {
          category: category || "railway",
          level: ladder[i],
          pieces: left,
          needed: ladder[i],
          finished: false,
          collected: count
        };
      }
      left -= ladder[i];
    }
    var top = ladder[ladder.length - 1];
    return {
      category: category || "railway",
      level: top,
      pieces: top,
      needed: top,
      finished: true,
      collected: count,
      surplus: left
    };
  }

  function progress() {
    return progressFor("railway");
  }

  function completedSizes(count) {
    var ladder = levels();
    var left = count;
    var done = [];
    var i;
    for (i = 0; i < ladder.length; i += 1) {
      if (left < ladder[i]) break;
      done.push(ladder[i]);
      left -= ladder[i];
    }
    return done;
  }

  function publicPuzzleIds() {
    if (global.TURBO_DISCOVERY_CATEGORIES) {
      return TURBO_DISCOVERY_CATEGORIES.publicPuzzleIds();
    }
    return ["railway", "airport", "cultural", "scenic"];
  }

  global.TURBO_CATEGORY_PUZZLE = {
    progressFor: progressFor,
    levels: levels,
    completedSizes: completedSizes,
    publicPuzzleIds: publicPuzzleIds
  };

  global.TURBO_RAILWAY_PUZZLE = {
    progress: progress,
    progressFor: progressFor,
    levels: levels,
    completedSizes: completedSizes
  };
})(window);

/**
 * Category puzzle ladder. Piece count is the number of unique places
 * collected in that category since the previous level was completed.
 * A place already in the collection never awards another piece.
 *
 * Progress is derived from TURBO_COLLECTION, so it survives refresh.
 * Railway keeps TURBO_RAILWAY_PUZZLE for existing callers. Cultural and
 * scenic use progressFor with the same level sizes.
 */
(function (global) {
  "use strict";

  function levels() {
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

  global.TURBO_CATEGORY_PUZZLE = {
    progressFor: progressFor,
    levels: levels,
    completedSizes: completedSizes
  };

  global.TURBO_RAILWAY_PUZZLE = {
    progress: progress,
    progressFor: progressFor,
    levels: levels,
    completedSizes: completedSizes
  };
})(window);

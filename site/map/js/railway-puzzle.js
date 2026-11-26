/**
 * Independent puzzle ladders for each public discovery category.
 * Piece count is unique places collected in that category.
 * A place already collected never awards another piece.
 *
 * Levels are 5 → 10 → 25 → 50, then 50 again indefinitely.
 * The first board of each size keeps the storage key "5", "10", "25",
 * or "50" so existing mosaic art still matches. Later 50-piece boards
 * use "50:2", "50:3", and so on. Each of those is a separate record.
 * A new 50-piece board starts at zero. Earlier places stay collected.
 *
 * TURBO_RAILWAY_PUZZLE remains for existing callers and equals
 * progressFor("railway").
 */
(function (global) {
  "use strict";

  function levels() {
    if (global.TURBO_DISCOVERY_CATEGORIES && global.TURBO_DISCOVERY_CATEGORIES.levels) {
      return global.TURBO_DISCOVERY_CATEGORIES.levels();
    }
    var list = global.TURBO_PUZZLE_CONFIG && global.TURBO_PUZZLE_CONFIG.levels;
    return list && list.length ? list.slice() : [5, 10, 25, 50];
  }

  function boardKey(size, round) {
    if (round <= 1) return String(size);
    return String(size) + ":" + round;
  }

  function walk(count) {
    var ladder = levels();
    var repeat = ladder[ladder.length - 1];
    var left = count;
    var done = [];
    var i;
    for (i = 0; i < ladder.length; i += 1) {
      var size = ladder[i];
      if (left < size) {
        return {
          done: done,
          current: { size: size, key: boardKey(size, 1), pieces: left, round: 1 }
        };
      }
      done.push({ size: size, key: boardKey(size, 1), round: 1 });
      left -= size;
    }
    var round = 1;
    while (left >= repeat) {
      round += 1;
      done.push({ size: repeat, key: boardKey(repeat, round), pieces: repeat, round: round });
      left -= repeat;
    }
    round += 1;
    return {
      done: done,
      current: { size: repeat, key: boardKey(repeat, round), pieces: left, round: round }
    };
  }

  function progressFor(category) {
    var count = global.TURBO_COLLECTION.list(category || "railway").length;
    var state = walk(count);
    var current = state.current;
    return {
      category: category || "railway",
      level: current.size,
      pieces: current.pieces,
      needed: current.size,
      finished: false,
      collected: count,
      key: current.key,
      round: current.round
    };
  }

  function progress() {
    return progressFor("railway");
  }

  function completedSizes(count) {
    return walk(count).done;
  }

  function publicPuzzleIds() {
    if (global.TURBO_DISCOVERY_CATEGORIES) {
      return global.TURBO_DISCOVERY_CATEGORIES.publicPuzzleIds();
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

/**
 * Railway puzzle ladder. Piece count is the number of railway stations
 * collected since the previous level was completed. Airports are ignored.
 * A station already in the collection never awards another piece.
 *
 * Progress is derived from TURBO_COLLECTION, so it survives refresh.
 */
(function (global) {
  "use strict";

  function levels() {
    var list = global.TURBO_PUZZLE_CONFIG && global.TURBO_PUZZLE_CONFIG.levels;
    return list && list.length ? list.slice() : [5, 10, 25, 50];
  }

  function progress() {
    var count = global.TURBO_COLLECTION.list("railway").length;
    var ladder = levels();
    var left = count;
    var i;
    for (i = 0; i < ladder.length; i += 1) {
      if (left < ladder[i]) {
        return {
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
      level: top,
      pieces: top,
      needed: top,
      finished: true,
      collected: count,
      surplus: left
    };
  }

  /**
   * Five-piece layout from the Studio merchant sim: two top corners,
   * a centre band, two bottom corners. Reveal order is fixed so a given
   * piece count always uncovers the same regions. The centre is last.
   * Region index 2 is the centre. This does not store progress.
   */
  var FIVE_REVEAL = [0, 1, 3, 4, 2];

  function fivePieces(pieceCount) {
    var n = pieceCount;
    if (n < 0) n = 0;
    if (n > FIVE_REVEAL.length) n = FIVE_REVEAL.length;
    return FIVE_REVEAL.map(function (index, order) {
      return {
        index: index,
        order: order,
        centre: index === 2,
        revealed: order < n
      };
    });
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

  global.TURBO_RAILWAY_PUZZLE = {
    progress: progress,
    levels: levels,
    fivePieces: fivePieces,
    completedSizes: completedSizes
  };
})(window);

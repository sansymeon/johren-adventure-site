/**
 * Static illustration of the live railway mosaic grids.
 * Grids match site/map/js/config/puzzle.js. This file does not read
 * or write player collections.
 */
(function () {
  var grids = {
    5: { cols: 5, rows: 1, open: 3, ja: "5ピース", en: "5 pieces" },
    10: { cols: 5, rows: 2, open: 6, ja: "10ピース", en: "10 pieces" },
    25: { cols: 5, rows: 5, open: 12, ja: "25ピース", en: "25 pieces" },
    50: { cols: 10, rows: 5, open: 20, ja: "50ピース", en: "50 pieces" }
  };
  var order = [5, 10, 25, 50];
  var en = (document.documentElement.lang || "ja").toLowerCase() === "en";
  document.querySelectorAll("[data-puzzle-demo]").forEach(function (root) {
    var image = root.getAttribute("data-image");
    order.forEach(function (size) {
      var grid = grids[size];
      var step = document.createElement("div");
      step.className = "puzzle-step";
      var title = document.createElement("h3");
      title.textContent = (en ? grid.en : grid.ja) + " · " + grid.open + "/" + (grid.cols * grid.rows);
      var board = document.createElement("div");
      board.className = "board";
      board.style.backgroundImage = "url(" + image + ")";
      board.style.gridTemplateColumns = "repeat(" + grid.cols + ",1fr)";
      board.style.gridTemplateRows = "repeat(" + grid.rows + ",1fr)";
      var i;
      for (i = 0; i < grid.cols * grid.rows; i += 1) {
        var cell = document.createElement("span");
        if (i < grid.open) cell.className = "open";
        board.appendChild(cell);
      }
      step.appendChild(title);
      step.appendChild(board);
      root.appendChild(step);
    });
    var done = document.createElement("div");
    done.className = "puzzle-step";
    done.innerHTML = "<h3>" + (en ? "Completed picture in the collection" : "完成した絵はコレクションに残ります") + "</h3>";
    var full = document.createElement("div");
    full.className = "puzzle-done";
    full.style.backgroundImage = "url(" + image + ")";
    done.appendChild(full);
    root.appendChild(done);
  });
})();
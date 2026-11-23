/**
 * Collection screen. The five-piece railway picture follows
 * TURBO_RAILWAY_PUZZLE, which counts unique stations. No second score.
 */
(function (global) {
  "use strict";

  var root = null;

  var FIVE_BOXES = [
    { index: 0, left: "0%", top: "0%", width: "50%", height: "34%" },
    { index: 1, left: "50%", top: "0%", width: "50%", height: "34%" },
    { index: 2, left: "0%", top: "34%", width: "100%", height: "33%" },
    { index: 3, left: "0%", top: "67%", width: "50%", height: "33%" },
    { index: 4, left: "50%", top: "67%", width: "50%", height: "33%" }
  ];

  function t(key, vars) {
    return global.TURBO_I18N.t(key, vars);
  }

  function placeName(category, id, detail) {
    var found = global.TURBO_LOCATIONS.findPoint(detail.pointId || id);
    if (found && found.placeName) {
      return global.TURBO_I18N.lang() === "en" && found.placeNameEn
        ? found.placeNameEn
        : (found.placeName || found.name);
    }
    var pin = global.TURBO_DISCOVERY_MAP && global.TURBO_DISCOVERY_MAP.geo
      ? global.TURBO_DISCOVERY_MAP.geo.byId.get(id)
      : null;
    if (!pin) return id;
    if (global.TURBO_I18N.lang() === "en" && pin.nameEn) return pin.nameEn;
    return pin.name;
  }

  function firstArt() {
    var config = global.TURBO_PUZZLE_CONFIG && global.TURBO_PUZZLE_CONFIG.firstLevel;
    if (!config || !config.image) return null;
    return config;
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function fiveBoard(pieceCount, complete) {
    var art = firstArt();
    if (!art) return "";
    var pieces = global.TURBO_RAILWAY_PUZZLE.fivePieces(complete ? 5 : pieceCount);
    var byIndex = {};
    pieces.forEach(function (piece) { byIndex[piece.index] = piece; });
    var masks = FIVE_BOXES.map(function (box) {
      var piece = byIndex[box.index];
      var hidden = !(piece && piece.revealed);
      return '<span class="puzzle-mask' + (hidden ? " is-hidden" : "") + (piece && piece.centre ? " is-centre" : "") +
        '" data-piece="' + box.index + '" style="left:' + box.left + ";top:" + box.top +
        ";width:" + box.width + ";height:" + box.height + '"></span>';
    }).join("");
    return '<div class="puzzle-board" data-complete="' + (complete ? "1" : "0") + '">' +
      '<img alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(art.image) + '" width="420" height="525">' +
      masks + "</div>";
  }

  function cells(progress) {
    var html = "";
    var i;
    var cols = progress.needed > 10 ? 10 : 5;
    for (i = 0; i < progress.needed; i += 1) {
      var on = i < progress.pieces;
      html += '<span class="puzzle-cell' + (on ? " is-on" : "") + '"></span>';
    }
    return '<div class="puzzle-grid" data-count="' + progress.needed + '" style="--puzzle-cols:' + cols + '">' + html + "</div>";
  }

  function celebrate(frame) {
    if (!frame || frame.getAttribute("data-celebrated") === "1") return;
    var burst = document.createElement("div");
    burst.className = "puzzle-confetti";
    burst.setAttribute("aria-hidden", "true");
    var colors = ["#c83b32", "#e7c27a", "#f3eee4", "#0e7884", "#fffaf4"];
    var i;
    for (i = 0; i < 24; i += 1) {
      var bit = document.createElement("i");
      bit.style.left = (8 + (i * 17) % 84) + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = ((i % 6) * 0.04) + "s";
      burst.appendChild(bit);
    }
    frame.setAttribute("data-celebrated", "1");
    frame.appendChild(burst);
    window.setTimeout(function () {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 1700);
  }

  function names(category) {
    var rows = global.TURBO_COLLECTION.list(category);
    if (!rows.length) {
      return "<p>" + t(category === "airport" ? "airportEmpty" : "railwayEmpty") + "</p>";
    }
    return "<ul>" + rows.map(function (row) {
      return "<li>" + placeName(category, row.id, row.detail) + "</li>";
    }).join("") + "</ul>";
  }

  function paint() {
    var progress = global.TURBO_RAILWAY_PUZZLE.progress();
    var airports = global.TURBO_COLLECTION.list("airport").length;
    var stations = global.TURBO_COLLECTION.list("railway").length;
    var done = global.TURBO_RAILWAY_PUZZLE.completedSizes(stations);
    var onFive = !progress.finished && progress.needed === 5;
    var art = firstArt();
    var completedHtml = "";
    if (done.indexOf(5) !== -1 && art) {
      completedHtml =
        "<h2>" + t("completedHeading") + "</h2>" +
        '<div class="puzzle-complete" data-completed-level="5">' + fiveBoard(5, true) + "</div>";
    }
    var currentHtml = onFive
      ? fiveBoard(progress.pieces, false)
      : (progress.finished ? "" : "<p class=\"collection-note\">" + t("laterLevelNote") + "</p>" + cells(progress));
    root.querySelector("[data-collection-body]").innerHTML =
      "<h2>" + t("railwayHeading") + "</h2>" +
      '<p data-railway-progress>' + (progress.finished
        ? t("railwayDone")
        : t("railwayProgress", { pieces: progress.pieces, need: progress.needed })) +
      "</p>" +
      "<p>" + t("stationsCollected", { n: stations }) + "</p>" +
      currentHtml +
      (art && art.temporary ? "<p class=\"collection-note\">" + t("placeholderNote") + "</p>" : "") +
      completedHtml +
      names("railway") +
      "<h2>" + t("airportHeading") + "</h2>" +
      "<p>" + t("airportProgress", { count: airports }) + "</p>" +
      names("airport");
    if (done.indexOf(5) !== -1) {
      celebrate(root.querySelector(".puzzle-complete"));
    }
  }

  function show() {
    if (!root) return;
    paint();
    root.hidden = false;
    document.body.classList.add("overlay-open");
  }

  function hide() {
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove("overlay-open");
  }

  function sync() {
    if (location.hash === "#collection") show();
    else hide();
  }

  function open() {
    if (location.hash !== "#collection") {
      history.pushState({ turbo: "collection" }, "", "?map=turbo#collection");
    }
    show();
  }

  function close() {
    if (history.state && history.state.turbo === "collection") {
      history.back();
      return;
    }
    if (location.hash === "#collection") {
      history.replaceState({ turbo: "map" }, "", "?map=turbo");
    }
    hide();
  }

  function init() {
    var bar = document.querySelector(".bottom-bar");
    if (!bar || document.getElementById("collection-view")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn-theatre";
    button.id = "btn-collection";
    button.textContent = t("collectionButton");
    bar.insertBefore(button, bar.firstChild);

    root = document.createElement("section");
    root.id = "collection-view";
    root.className = "overlay-view collection-view";
    root.hidden = true;
    root.innerHTML =
      '<header class="overlay-header"><button type="button" class="btn btn-back" data-collection-close>' +
      t("collectionClose") + '</button><h2 class="overlay-title">' + t("collectionTitle") + "</h2></header>" +
      '<div class="collection-body" data-collection-body></div>' +
      '<p class="collection-reset"><button type="button" class="btn btn-ghost" data-collection-reset>' +
      t("resetTest") + "</button></p>";
    document.getElementById("map-app").appendChild(root);

    button.addEventListener("click", open);
    root.querySelector("[data-collection-close]").addEventListener("click", close);
    document.addEventListener("turbo-route", sync);
    sync();
    root.querySelector("[data-collection-reset]").addEventListener("click", function () {
      global.TURBO_COLLECTION.clearAll();
      paint();
      var status = document.getElementById("gps-checkin-status");
      if (status) {
        status.hidden = false;
        status.textContent = t("resetDone");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.TURBO_COLLECTION_SCREEN = { open: open, paint: paint };
})(window);

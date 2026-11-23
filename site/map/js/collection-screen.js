/**
 * Collection screen. Railway pictures are mosaics. How many tiles are
 * open is TURBO_RAILWAY_PUZZLE.progress().pieces. Tile choice is the
 * saved mosaic order. There is no second piece counter.
 */
(function (global) {
  "use strict";

  var root = null;

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

  function art() {
    var config = global.TURBO_PUZZLE_CONFIG;
    if (!config || !config.image) return null;
    return config;
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function mosaic(size, openCount) {
    var picture = art();
    var grid = global.TURBO_RAILWAY_MOSAIC.layout(size);
    if (!picture || !grid) return "";
    var state = global.TURBO_RAILWAY_MOSAIC.revealedTiles(size, openCount);
    var tiles = "";
    var i;
    for (i = 0; i < grid.size; i += 1) {
      var hidden = !state.open[i];
      tiles += '<span class="mosaic-tile' + (hidden ? " is-hidden" : "") + '" data-tile="' + i + '"></span>';
    }
    return '<div class="mosaic" data-level="' + size + '" data-open="' + state.count + '" style="--cols:' +
      grid.cols + ";--rows:" + grid.rows + '">' +
      '<img alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(picture.image) + '" width="420" height="525">' +
      '<div class="mosaic-tiles">' + tiles + "</div></div>";
  }

  function fullImage(size) {
    var picture = art();
    if (!picture) return "";
    return '<div class="puzzle-complete" data-completed-level="' + size + '">' +
      '<img alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(picture.image) + '" width="420" height="525">' +
      "</div>";
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
    var picture = art();
    var completedHtml = "";
    if (done.length && picture) {
      completedHtml = "<h2>" + t("completedHeading") + "</h2>" +
        done.map(function (size) { return fullImage(size); }).join("");
    }
    var currentHtml = progress.finished ? "" : mosaic(progress.needed, progress.pieces);
    root.querySelector("[data-collection-body]").innerHTML =
      "<h2>" + t("railwayHeading") + "</h2>" +
      '<p data-railway-progress>' + (progress.finished
        ? t("railwayDone")
        : t("railwayProgress", { pieces: progress.pieces, need: progress.needed })) +
      "</p>" +
      "<p>" + t("stationsCollected", { n: stations }) + "</p>" +
      currentHtml +
      (picture && picture.temporary ? "<p class=\"collection-note\">" + t("placeholderNote") + "</p>" : "") +
      completedHtml +
      names("railway") +
      "<h2>" + t("airportHeading") + "</h2>" +
      "<p>" + t("airportProgress", { count: airports }) + "</p>" +
      names("airport");
    if (done.length) celebrate(root.querySelector(".puzzle-complete"));
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

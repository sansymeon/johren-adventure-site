/**
 * Collection screen. Railway pictures are mosaics. How many tiles are
 * open is TURBO_RAILWAY_PUZZLE.progress().pieces. Tile choice is the
 * saved mosaic order. There is no second piece counter.
 */
(function (global) {
  "use strict";

  var root = null;
  var REVEAL_KEY = "turbo.finalReveal.v1";

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

  function art(size) {
    var locked = global.TURBO_RAILWAY_MOSAIC && global.TURBO_RAILWAY_MOSAIC.pictureFor
      ? global.TURBO_RAILWAY_MOSAIC.pictureFor(size)
      : null;
    if (locked && locked.image) return locked;
    var active = global.TURBO_PUZZLE_ACTIVE;
    if (active && active.image) return active;
    var config = global.TURBO_PUZZLE_CONFIG;
    if (!config || !config.image) return null;
    return config;
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function frameVars(picture) {
    var w = picture.imageWidth || 1600;
    var h = picture.imageHeight || 900;
    return "--scene-w:" + w + ";--scene-h:" + h + ";";
  }

  function coverSvg(picture, grid, state) {
    var w = picture.imageWidth || 1600;
    var h = picture.imageHeight || 900;
    var holes = "";
    var i;
    for (i = 0; i < grid.size; i += 1) {
      if (!state.open[i]) continue;
      var col = i % grid.cols;
      var row = Math.floor(i / grid.cols);
      var x = (col * w / grid.cols).toFixed(3);
      var y = (row * h / grid.rows).toFixed(3);
      var tw = (w / grid.cols).toFixed(3);
      var th = (h / grid.rows).toFixed(3);
      holes += '<rect x="' + x + '" y="' + y + '" width="' + tw + '" height="' + th + '" fill="black"/>';
    }
    var sleepers = "";
    for (i = 0; i < 18; i += 1) {
      var sx = 40 + i * 90;
      sleepers += '<line x1="' + sx + '" y1="' + (h * 0.78) + '" x2="' + (sx + 36) + '" y2="' + (h * 0.86) + '"/>';
    }
    return '<svg class="mosaic-cover" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" font-family="Hiragino Sans, Noto Sans JP, Segoe UI, sans-serif">' +
      "<defs><mask id=\"turbo-cover-mask\"><rect width=\"" + w + '" height="' + h + '" fill="white"/>' +
      holes + "</mask></defs>" +
      '<g mask="url(#turbo-cover-mask)">' +
      '<rect width="' + w + '" height="' + h + '" fill="#123e3a"/>' +
      '<g fill="none" stroke="#d7efe8" stroke-width="3" opacity="0.28">' +
      '<path d="M0 ' + (h * 0.8) + " H" + w + '"/>' +
      '<path d="M0 ' + (h * 0.84) + " H" + w + '"/>' +
      sleepers + "</g>" +
      '<text x="50%" y="44%" text-anchor="middle" fill="#f4fbf8" font-size="86" font-weight="800" letter-spacing="6">TURBO ADVENTURES</text>' +
      '<text x="50%" y="56%" text-anchor="middle" fill="#f0d78c" font-size="52" font-weight="700" letter-spacing="1">Discover Your World</text>' +
      "</g></svg>";
  }

  function mosaic(size, openCount) {
    var picture = art(size);
    var grid = global.TURBO_RAILWAY_MOSAIC.layout(size);
    if (!picture || !grid) return "";
    var state = global.TURBO_RAILWAY_MOSAIC.revealedTiles(size, openCount);
    var tiles = "";
    var i;
    for (i = 0; i < grid.size; i += 1) {
      var hidden = !state.open[i];
      tiles += '<span class="mosaic-tile' + (hidden ? " is-hidden" : " is-open") + '" data-tile="' + i + '"></span>';
    }
    return '<div class="mosaic" data-level="' + size + '" data-open="' + state.count + '" style="' +
      frameVars(picture) + "--cols:" + grid.cols + ";--rows:" + grid.rows + '">' +
      '<img class="mosaic-scene" alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(picture.image) + '" width="' +
      (picture.imageWidth || 1600) + '" height="' + (picture.imageHeight || 900) + '">' +
      '<div class="mosaic-tiles">' + tiles + "</div>" +
      coverSvg(picture, grid, state) +
      "</div>";
  }

  function revealStore() {
    try {
      var data = JSON.parse(localStorage.getItem(REVEAL_KEY) || "");
      if (!data || typeof data.seen !== "object") return { version: 1, seen: {} };
      return data;
    } catch (error) {
      return { version: 1, seen: {} };
    }
  }

  function savedReveal(base) {
    var row = revealStore().seen[base];
    return row && row.image ? row : null;
  }

  function rememberReveal(base, image, width, height) {
    var data = revealStore();
    data.seen[base] = {
      image: image,
      imageWidth: width || 1600,
      imageHeight: height || 900
    };
    localStorage.setItem(REVEAL_KEY, JSON.stringify(data));
  }

  function offeredReveal(picture) {
    if (!picture) return null;
    var active = global.TURBO_PUZZLE_ACTIVE || {};
    if (active.image && picture.image === active.image) {
      if (!active.revealImage) return null;
      return {
        image: active.revealImage,
        imageWidth: active.revealImageWidth || picture.imageWidth || 1600,
        imageHeight: active.revealImageHeight || picture.imageHeight || 900
      };
    }
    if (!picture.revealImage) return null;
    return {
      image: picture.revealImage,
      imageWidth: picture.revealImageWidth || picture.imageWidth || 1600,
      imageHeight: picture.revealImageHeight || picture.imageHeight || 900
    };
  }

  function fullImage(size) {
    var picture = art(size);
    if (!picture) return "";
    var shown = picture;
    var button = "";
    if (size === 5) {
      var saved = savedReveal(picture.image);
      var offer = offeredReveal(picture);
      if (saved) shown = saved;
      else if (offer) {
        button = '<button type="button" class="reveal-final" data-reveal-final data-base="' +
          escapeAttr(picture.image) + '" data-reveal="' + escapeAttr(offer.image) +
          '" data-width="' + offer.imageWidth + '" data-height="' + offer.imageHeight + '">' +
          t("revealFinal") + "</button>";
      }
    }
    return '<div class="puzzle-finished">' +
      '<div class="puzzle-complete" data-completed-level="' + size + '" style="' + frameVars(shown) + '">' +
      '<img alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(shown.image) + '" width="' +
      (shown.imageWidth || 1600) + '" height="' + (shown.imageHeight || 900) + '">' +
      "</div>" + button + "</div>";
  }

  function celebrate(frame, size) {
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
    var cheer = document.createElement("p");
    cheer.className = "mosaic-cheer";
    cheer.textContent = t("mosaicCheer");
    var victory = null;
    if (size > 5) {
      victory = document.createElement("img");
      victory.className = "mosaic-victory";
      victory.alt = "";
      victory.src = "/media/turbo/poses/turbo_confident_transparent.webp";
    }
    frame.setAttribute("data-celebrated", "1");
    frame.appendChild(burst);
    if (victory) frame.appendChild(victory);
    frame.appendChild(cheer);
    window.setTimeout(function () {
      [burst, cheer, victory].forEach(function (node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
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
    var picture = art(progress.needed);
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
    var justFinished = done.length && (progress.finished || progress.pieces === 0);
    if (justFinished) {
      var finishedSize = done[done.length - 1];
      var finishedArt = art(finishedSize);
      var alreadySeen = finishedSize === 5 && finishedArt && savedReveal(finishedArt.image);
      if (!alreadySeen) {
        celebrate(root.querySelector('.puzzle-complete[data-completed-level="' + finishedSize + '"]'), finishedSize);
      }
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
    var mapApp = document.getElementById("map-app");
    if (!mapApp || document.getElementById("collection-view")) return;

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
    mapApp.appendChild(root);

    root.querySelector("[data-collection-close]").addEventListener("click", close);
    root.addEventListener("click", function (event) {
      var button = event.target.closest("[data-reveal-final]");
      if (!button || !root.contains(button)) return;
      rememberReveal(
        button.getAttribute("data-base"),
        button.getAttribute("data-reveal"),
        Number(button.getAttribute("data-width")),
        Number(button.getAttribute("data-height"))
      );
      paint();
    });
    document.addEventListener("turbo-route", sync);
    sync();
    root.querySelector("[data-collection-reset]").addEventListener("click", function () {
      global.TURBO_COLLECTION.clearAll();
      localStorage.removeItem(REVEAL_KEY);
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

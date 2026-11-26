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

  function art(size, key) {
    var locked = global.TURBO_RAILWAY_MOSAIC && global.TURBO_RAILWAY_MOSAIC.pictureFor
      ? global.TURBO_RAILWAY_MOSAIC.pictureFor(size, key)
      : null;
    if (locked && locked.image) return locked;
    var active = global.TURBO_PUZZLE_ACTIVE;
    var level = active && active.levels && active.levels[String(size)];
    if (level && level.image) return level;
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

  function mosaic(size, openCount, key) {
    var picture = art(size, key);
    var grid = global.TURBO_RAILWAY_MOSAIC.layout(size);
    if (!picture || !grid) return "";
    var state = global.TURBO_RAILWAY_MOSAIC.revealedTiles(size, openCount, key);
    var tiles = "";
    var i;
    for (i = 0; i < grid.size; i += 1) {
      var hidden = !state.open[i];
      tiles += '<span class="mosaic-tile' + (hidden ? " is-hidden" : " is-open") + '" data-tile="' + i + '"></span>';
    }
    return '<div class="mosaic" data-level="' + size + '" data-board="' + escapeAttr(key || size) + '" data-open="' + state.count + '" style="' +
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

  function savedReveal(size, picture) {
    var seen = revealStore().seen;
    var row = seen[String(size)];
    if (row && row.image) return row;
    row = picture && seen[picture.image];
    return row && row.image ? row : null;
  }

  function rememberReveal(size, image, width, height) {
    var data = revealStore();
    data.seen[String(size)] = {
      image: image,
      imageWidth: width || 1600,
      imageHeight: height || 900
    };
    localStorage.setItem(REVEAL_KEY, JSON.stringify(data));
  }

  function offeredReveal(picture) {
    if (!picture) return null;
    if (picture.revealImage) {
      return {
        image: picture.revealImage,
        imageWidth: picture.revealImageWidth || picture.imageWidth || 1600,
        imageHeight: picture.revealImageHeight || picture.imageHeight || 900
      };
    }
    var active = global.TURBO_PUZZLE_ACTIVE || {};
    if (active.levels) return null;
    if (active.image && picture.image === active.image) {
      if (!active.revealImage) return null;
      return {
        image: active.revealImage,
        imageWidth: active.revealImageWidth || picture.imageWidth || 1600,
        imageHeight: active.revealImageHeight || picture.imageHeight || 900
      };
    }
    return null;
  }

  function fullImage(size, key) {
    var picture = art(size, key);
    if (!picture) return "";
    var shown = picture;
    var button = "";
    if (size) {
      var saved = savedReveal(key || size, picture);
      var offer = offeredReveal(picture);
      if (saved) shown = saved;
      else if (offer) {
        button = '<button type="button" class="reveal-final" data-reveal-final data-level="' +
        escapeAttr(key || size) + '" data-base="' + escapeAttr(picture.image) + '" data-reveal="' + escapeAttr(offer.image) +
          '" data-width="' + offer.imageWidth + '" data-height="' + offer.imageHeight + '">' +
          t("revealFinal") + "</button>";
      }
    }
    return '<div class="puzzle-finished">' +
      '<div class="puzzle-complete" data-completed-level="' + escapeAttr(key || size) + '" style="' + frameVars(shown) + '">' +
      '<button type="button" class="puzzle-zoom" data-zoom="' + escapeAttr(shown.image) + '">' +
      '<img alt="' + escapeAttr(t("puzzleAlt")) + '" src="' + escapeAttr(shown.image) + '" width="' +
      (shown.imageWidth || 1600) + '" height="' + (shown.imageHeight || 900) + '"></button>' +
      "</div>" + button +
      '<button type="button" class="btn btn-ghost" data-save-image="' + escapeAttr(shown.image) + '">' +
      t("saveImage") + "</button>" +
      '<button type="button" class="btn btn-ghost" data-share-image="' + escapeAttr(shown.image) + '">' +
      t("shareImage") + "</button></div>";
  }

  function noteCompletion(beforeCount, afterCount, category) {
    var cat = category || "railway";
    var reward = global.TURBO_PUZZLE_REWARD;
    var mosaicApi = global.TURBO_RAILWAY_MOSAIC;
    var puzzle = global.TURBO_CATEGORY_PUZZLE || global.TURBO_RAILWAY_PUZZLE;
    if (!reward || !puzzle) return;
    // Railway keeps the mosaic celebration. Other categories advance puzzle
    // counts in the collection; their own mosaic art can plug in later.
    if (cat !== "railway" || !mosaicApi) return;
    var before = puzzle.completedSizes(beforeCount);
    var after = puzzle.completedSizes(afterCount);
    var seen = {};
    before.forEach(function (record) {
      seen[record.key || String(record.size || record)] = true;
    });
    after.forEach(function (record) {
      var size = record.size || record;
      var key = record.key || String(size);
      if (seen[key]) return;
      if (!mosaicApi.pictureFor(size, key)) mosaicApi.assign(size, key);
      var picture = mosaicApi.pictureFor(size, key);
      if (!picture) return;
      reward.enqueue({
        id: "railway-" + key,
        category: "railway",
        image: picture.image,
        wallpaper: picture.wallpaper || "",
        fireworks: picture.celebration === "fireworks" || picture.merchantSponsored === true,
        merchantWebsite: picture.merchantWebsite || ""
      });
    });
    if (root && !root.hidden) reward.present();
  }

  function names(category, emptyKey) {
    var rows = global.TURBO_COLLECTION.list(category);
    if (!rows.length) {
      return "<p>" + t(emptyKey || "railwayEmpty") + "</p>";
    }
    return "<ul>" + rows.map(function (row) {
      return "<li>" + placeName(category, row.id, row.detail) + "</li>";
    }).join("") + "</ul>";
  }

  function categoryProgressLine(cat) {
    var puzzle = global.TURBO_CATEGORY_PUZZLE || global.TURBO_RAILWAY_PUZZLE;
    var progress = puzzle.progressFor(cat.id);
    var count = global.TURBO_COLLECTION.list(cat.id).length;
    return "<h2>" + t(cat.headingKey) + "</h2>" +
      "<p>" + (progress.finished
        ? t(cat.doneKey)
        : t(cat.progressKey, { pieces: progress.pieces, need: progress.needed, count: count })) +
      "</p>" +
      names(cat.id, cat.emptyKey);
  }

  function publicCategories() {
    if (global.TURBO_DISCOVERY_CATEGORIES) {
      return TURBO_DISCOVERY_CATEGORIES.public.filter(function (cat) {
        return cat.puzzle;
      });
    }
    return [
      { id: "railway", headingKey: "railwayHeading", progressKey: "railwayProgress", doneKey: "railwayDone", emptyKey: "railwayEmpty" },
      { id: "airport", headingKey: "airportHeading", progressKey: "airportProgress", doneKey: "airportDone", emptyKey: "airportEmpty" },
      { id: "cultural", headingKey: "culturalHeading", progressKey: "culturalProgress", doneKey: "culturalDone", emptyKey: "culturalEmpty" },
      { id: "scenic", headingKey: "scenicHeading", progressKey: "scenicProgress", doneKey: "scenicDone", emptyKey: "scenicEmpty" }
    ];
  }

  function paint() {
    var progress = global.TURBO_RAILWAY_PUZZLE.progress();
    var stations = global.TURBO_COLLECTION.list("railway").length;
    var done = global.TURBO_RAILWAY_PUZZLE.completedSizes(stations);
    var picture = art(progress.needed, progress.key);
    var completedHtml = done.map(function (record) {
      return fullImage(record.size || record, record.key);
    }).join("");
    if (completedHtml) completedHtml = "<h2>" + t("completedHeading") + "</h2>" + completedHtml;
    var roundNote = progress.round > 1
      ? "<p>" + t("puzzleRound", { round: progress.round, need: progress.needed }) + "</p>"
      : "";
    var currentHtml = mosaic(progress.needed, progress.pieces, progress.key);
    var categories = publicCategories();
    var railwayCat = categories[0];
    var otherHtml = categories.slice(1).map(categoryProgressLine).join("");
    root.querySelector("[data-collection-body]").innerHTML =
      "<h2>" + t(railwayCat.headingKey) + "</h2>" +
      '<p data-railway-progress>' +
        t(railwayCat.progressKey, { pieces: progress.pieces, need: progress.needed, count: stations }) +
      "</p>" +
      roundNote +
      "<p>" + t("stationsCollected", { n: stations }) + "</p>" +
      currentHtml +
      (picture && picture.temporary ? "<p class=\"collection-note\">" + t("placeholderNote") + "</p>" : "") +
      completedHtml +
      names("railway", railwayCat.emptyKey) +
      otherHtml;
  }

  function show() {
    if (!root) return;
    paint();
    root.hidden = false;
    document.body.classList.add("overlay-open");
    if (global.TURBO_PUZZLE_REWARD) global.TURBO_PUZZLE_REWARD.present();
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
      '<p class="collection-slogan">' + t("slogan") + "</p>" +
      '<p class="collection-note">' + t("deviceNote") + "</p>" +
      '<div class="collection-body" data-collection-body></div>' +
      (location.search.indexOf("test=1") >= 0
        ? '<p class="collection-reset"><button type="button" class="btn btn-ghost" data-collection-reset>' +
          t("resetTest") + "</button></p>"
        : "");
    mapApp.appendChild(root);
    if (global.TURBO_PUZZLE_REWARD) global.TURBO_PUZZLE_REWARD.mount();
    var viewer = document.createElement("section");
    viewer.id = "image-view";
    viewer.className = "image-view";
    viewer.hidden = true;
    document.body.appendChild(viewer);

    root.querySelector("[data-collection-close]").addEventListener("click", close);
    root.addEventListener("click", function (event) {
      var zoom = event.target.closest("[data-zoom]");
      if (zoom && root.contains(zoom)) {
        var viewer = document.getElementById("image-view");
        viewer.hidden = false;
        viewer.innerHTML = '<button type="button" data-close-view>' + t("backCollection") +
          '</button><img alt="" src="' + escapeAttr(zoom.getAttribute("data-zoom")) + '">';
        viewer.querySelector("[data-close-view]").addEventListener("click", function () {
          viewer.hidden = true;
        });
        return;
      }
      var saveImage = event.target.closest("[data-save-image]");
      if (saveImage && root.contains(saveImage)) {
        if (global.TURBO_PUZZLE_REWARD) {
          global.TURBO_PUZZLE_REWARD.save(saveImage.getAttribute("data-save-image"), "turbo-puzzle.jpg");
        }
        return;
      }
      var share = event.target.closest("[data-share-image]");
      if (share && root.contains(share)) {
        if (global.TURBO_PUZZLE_REWARD) {
          global.TURBO_PUZZLE_REWARD.share(share.getAttribute("data-share-image"), "turbo-puzzle.jpg");
        }
        return;
      }
      var button = event.target.closest("[data-reveal-final]");
      if (!button || !root.contains(button)) return;
      rememberReveal(
        button.getAttribute("data-level"),
        button.getAttribute("data-reveal"),
        Number(button.getAttribute("data-width")),
        Number(button.getAttribute("data-height"))
      );
      paint();
    });
    document.addEventListener("turbo-route", sync);
    sync();
    var reset = root.querySelector("[data-collection-reset]");
    if (reset) reset.addEventListener("click", function () {
      global.TURBO_COLLECTION.clearAll();
      localStorage.removeItem(REVEAL_KEY);
      if (global.TURBO_PUZZLE_REWARD) localStorage.removeItem(global.TURBO_PUZZLE_REWARD.key);
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

  global.TURBO_COLLECTION_SCREEN = { open: open, paint: paint, noteCompletion: noteCompletion };
})(window);

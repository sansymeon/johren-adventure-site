(function (global) {
  "use strict";
  var DEMO_KEY = "turbo.demoMerchantRewards.v1";
  var cataloguePromise = null;
  var shownList = [];
  var finaleList = [];
  var showPageCast = [];
  var actList = [];
  var theme = null;
  var THEME = "/audio/Turbo_Adventures_Curtain.mp3";
  var SOUND_KEY = "turbo.theatreSound.v1";
  var copy = {
    ja: { title: "マイコレクション", progress: "集めた仲間たち", missing: "？", back: "← コレクションに戻る", shop: "もらったお店", close: "アルバムに戻る", fresh: "NEW!", theatre: "マイ・ターボ劇場", solo: "ひとり舞台", act: "幕ごとの出演者", finale: "🎭 全員集合！", page: "第", actWord: "幕", photo: "記念撮影", save: "絵を保存", share: "絵をシェア", show: "🎭 開演！", stop: "停止", prev: "前のページ", next: "次のページ" },
    en: { title: "My Collection", progress: "Collected characters", missing: "?", back: "← Back to the collection", shop: "Collected at", close: "Back to the album", fresh: "NEW!", theatre: "My Turbo Theatre", solo: "Solo", act: "Cast by Act", finale: "🎭 Grand Finale!", page: "Act ", actWord: "", photo: "Cast Photograph", save: "Save Picture", share: "Share Picture", show: "🎭 Let the Show Begin!", stop: "Stop", prev: "Previous page", next: "Next page" }
  };

  function lang() {
    return (document.documentElement.lang || "ja").toLowerCase() === "en" ? "en" : "ja";
  }
  function words() { return copy[lang()]; }
  function esc(value) {
    return String(value || "").replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch];
    });
  }
  function catalogue() {
    if (!cataloguePromise) {
      cataloguePromise = fetch("/data/stickers/catalogue.json", { cache: "no-store" }).then(function (response) {
        return response.json();
      });
    }
    return cataloguePromise;
  }
  function demoOwned() {
    var data;
    try { data = JSON.parse(localStorage.getItem(DEMO_KEY) || ""); } catch (error) { data = null; }
    var visits = data && data.visits ? data.visits : {};
    var owned = {};
    Object.keys(visits).forEach(function (id) {
      var visit = visits[id];
      if (!visit || !visit.character || owned[visit.character]) return;
      owned[visit.character] = {
        id: visit.character,
        file: visit.file || "",
        name: visit.name || {},
        shop: visit.shop || null
      };
    });
    return owned;
  }
  function sampleOwned(list) {
    var owned = {};
    list.forEach(function (item) {
      if (item.file) owned[item.id] = { id: item.id, file: item.file, name: item, shop: null };
    });
    return owned;
  }
  function ensureStyle() {
    if (document.getElementById("sticker-album-style")) return;
    var link = document.createElement("link");
    link.id = "sticker-album-style";
    link.rel = "stylesheet";
    if (document.querySelector("link[href*='stickers.css']")) return;
    link.href = "/css/stickers.css?v=20261128h2";
    document.head.appendChild(link);
  }
  function confetti(host) {
    var burst = document.createElement("div");
    burst.className = "sticker-confetti";
    var i;
    for (i = 0; i < 24; i += 1) {
      var bit = document.createElement("i");
      bit.style.left = (8 + (i * 37) % 84) + "%";
      bit.style.background = ["#f0c14b", "#0e7884", "#fff", "#e25b4a"][i % 4];
      bit.style.animationDelay = (i % 8) * 0.04 + "s";
      burst.appendChild(bit);
    }
    host.appendChild(burst);
    setTimeout(function () { burst.remove(); }, 1600);
  }
  function card(item, owned, highlight, pageCast) {
    var text = words();
    var got = owned[item.id];
    var name = got ? (got.name[lang()] || got.name.ja || item[lang()] || item.ja || "") : "";
    var file = got ? (got.file || item.file || "") : "";
    var fresh = got && highlight === item.id;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "sticker-card" + (got ? " is-owned" : " is-empty") + (fresh ? " is-new" : "");
    button.disabled = !got;
    var portrait = got ? (got.portrait || item.portrait || "") : "";
    if (got && !portrait) portrait = got.file || item.file || "";
    button.innerHTML = "<span class=\"frame\">" +
      (portrait ? "<img alt=\"\" src=\"" + esc(portrait) + "\" loading=\"lazy\">" : "<span class=\"mystery\">?</span>") +
      "</span><span class=\"no\">No. " + esc(item.number) + "</span>" +
      "<span class=\"who\">" + esc(got ? name : "") + "</span>" +
      (fresh ? "<span class=\"fresh\">" + text.fresh + "</span>" : "");
    if (got) button.onclick = function () { theatre(item, pageCast, owned, "solo"); };
    return button;
  }
  function shuffle(list) {
    var copy = list.slice();
    var index = copy.length;
    while (index > 1) {
      var pick = Math.floor(Math.random() * index);
      index -= 1;
      var swap = copy[index];
      copy[index] = copy[pick];
      copy[pick] = swap;
    }
    return copy;
  }
  function finalePlaces(cast) {
    var slots = [
      { left: 24, bottom: 2 }, { left: 50, bottom: 4 }, { left: 76, bottom: 2 },
      { left: 36, bottom: 22 }, { left: 64, bottom: 20 },
      { left: 22, bottom: 14 }, { left: 78, bottom: 14 },
      { left: 50, bottom: 30 }, { left: 32, bottom: 8 },
      { left: 68, bottom: 8 }, { left: 42, bottom: 16 }, { left: 58, bottom: 16 }
    ];
    var height = cast.length <= 3 ? 44 : cast.length <= 6 ? 36 : 30;
    var chosen = shuffle(slots).slice(0, cast.length);
    return shuffle(cast).map(function (row, index) {
      return { row: row, left: chosen[index].left, bottom: chosen[index].bottom, height: height, z: index + 1, star: false };
    });
  }
  function places(cast, starId, finale) {
    if (finale) return finalePlaces(cast);
    var others = cast.filter(function (row) { return row.item.id !== starId; });
    var star = cast.filter(function (row) { return row.item.id === starId; })[0] || cast[0];
    var laid = [];
    if (star) laid.push({ row: star, left: 50, bottom: 2, height: 88, z: 30, star: true });
    others.forEach(function (row, index) {
      if (!finale) {
        var side = index % 2 === 0 ? -1 : 1;
        var rank = Math.floor(index / 2);
        laid.push({ row: row, left: 50 + side * (16 + rank * 12), bottom: 2 + (rank % 2) * 10, height: 40 - rank * 2, z: 10 + index, star: false });
        return;
      }
      var crowd = others.length;
      laid.push({
        row: row,
        left: 6 + ((index * 17) % 88),
        bottom: (index * 13) % 28,
        height: Math.max(22, 48 - Math.floor(crowd / 2)),
        z: index + 1,
        star: false
      });
    });
    return laid;
  }
  function loadShare() {
    if (global.TURBO_IMAGE_SHARE) return Promise.resolve(global.TURBO_IMAGE_SHARE);
    return new Promise(function (resolve) {
      var script = document.createElement("script");
      script.src = "/map/js/image-share.js";
      script.onload = function () { resolve(global.TURBO_IMAGE_SHARE); };
      document.body.appendChild(script);
    });
  }
  function loadPicture(src) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { resolve(null); };
      image.src = src;
    });
  }
  function exportStage(cast, starId, mode) {
    var text = words();
    var width = 1200;
    var height = 750;
    return loadPicture("/map/media/cast/stage.webp").then(function (stage) {
      return Promise.all(cast.map(function (row) { return loadPicture(row.file); })).then(function (pictures) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        context.fillStyle = "#1a0c14";
        context.fillRect(0, 0, width, height);
        if (stage) context.drawImage(stage, 0, 80, width, height - 80);
        context.fillStyle = "#7a1028";
        context.fillRect(0, 0, width, 64);
        context.fillStyle = "#f0c14b";
        context.fillRect(0, 64, width, 8);
        context.font = "700 36px Georgia, serif";
        context.fillText(text.theatre, 36, 44);
        context.font = "600 22px Georgia, serif";
        context.fillText(mode === "finale" ? text.finale : text.act, 36, 110);
        var laid = places(cast, starId, mode === "finale");
        laid.forEach(function (spot) {
          var image = pictures[cast.indexOf(spot.row)];
          if (!image) return;
          var h = height * (spot.height / 100);
          var w = h * (image.naturalWidth / image.naturalHeight);
          var x = width * (spot.left / 100) - w / 2;
          var y = height - h - height * (spot.bottom / 100);
          context.drawImage(image, x, y, w, h);
        });
        return new Promise(function (resolve) { canvas.toBlob(resolve, "image/jpeg", 0.9); });
      });
    });
  }
  function stopTheme() {
    if (!theme) return;
    theme.pause();
    theme.currentTime = 0;
  }
  function soundOn() {
    try { return localStorage.getItem(SOUND_KEY) === "on"; } catch (error) { return false; }
  }
  function setSound(on) {
    try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch (error) {}
  }
  function playTheme() {
    if (!soundOn()) return null;
    if (!theme) {
      theme = new Audio(THEME);
      theme.preload = "none";
      theme.loop = false;
    }
    theme.pause();
    theme.currentTime = 0;
    return theme.play();
  }
  function theatre(item, pageCast, owned, mode) {
    stopTheme();
    setSound(false);
    var text = words();
    var cast = pageCast.map(function (row) { return row.id; })
      .map(function (id) {
        var source = pageCast.filter(function (row) { return row.id === id; })[0];
        var got = owned[id];
        if (!got || !got.file) return null;
        return { item: source || { id: id, number: (got.name && got.name.number) || "" }, file: got.file, name: got.name, shop: got.shop };
      })
      .filter(function (row) { return row; });
    if (mode === "solo") {
      cast = cast.filter(function (row) { return item && row.item.id === item.id; });
    }
    var modeLabel = mode === "solo" ? text.solo : mode === "finale" ? text.finale : text.act;
    var layer = document.getElementById("sticker-detail") || document.createElement("section");
    layer.id = "sticker-detail";
    var name = (item && (owned[item.id].name[lang()] || owned[item.id].name.ja)) || "";
    var shop = item && owned[item.id].shop ? (owned[item.id].shop[lang()] || owned[item.id].shop.ja || "") : "";
    layer.innerHTML = "<button type=\"button\" class=\"theatre-return\" data-back>" + text.back + "</button>" +
      "<article class=\"playbill theatre\">" +
      "<h3>" + esc(mode === "finale" ? text.finale : name) + "</h3>" +
      "<div class=\"stage is-waiting\"><i class=\"wing left\" aria-hidden=\"true\"></i><i class=\"wing right\" aria-hidden=\"true\"></i></div>" +
      "<p class=\"theatre-actions\"><button type=\"button\" class=\"show-begin\" data-show>" + text.show + "</button> <button type=\"button\" class=\"show-stop\" data-stop>" + text.stop + "</button> <button type=\"button\" class=\"show-sound\" data-sound aria-pressed=\"" + (soundOn() ? "true" : "false") + "\" aria-label=\"" + (lang() === "en" ? "Sound" : "音声") + "\">" + (soundOn() ? "🔊" : "🔇") + "</button></p></article>";
    var stage = layer.querySelector(".stage");
    places(cast, item ? item.id : "", mode === "finale").forEach(function (spot) {
      var figure = document.createElement("img");
      figure.alt = "";
      figure.src = spot.row.file;
      figure.style.left = spot.left + "%";
      figure.style.bottom = spot.bottom + "%";
      figure.style.height = spot.height + "%";
      figure.style.zIndex = String(spot.z);
      figure.className = spot.star ? "star" : "cast-member";
      stage.appendChild(figure);
    });
    var stageBox = layer.querySelector(".stage");
    layer.querySelector("[data-show]").onclick = function () {
      stageBox.classList.remove("is-waiting");
      stageBox.classList.remove("is-playing");
      void stageBox.offsetWidth;
      stageBox.classList.add("is-playing");
      var started = playTheme();
      if (started && started.catch) started.catch(function () {});
    };
    layer.querySelector("[data-stop]").onclick = function () { stopTheme(); };
    layer.querySelector("[data-sound]").onclick = function () {
      var next = !soundOn();
      setSound(next);
      this.setAttribute("aria-pressed", next ? "true" : "false");
      this.textContent = next ? "🔊" : "🔇";
      if (!next) stopTheme();
      else if (stageBox.classList.contains("is-playing")) {
        var started = playTheme();
        if (started && started.catch) started.catch(function () {});
      }
    };
    layer.querySelector("[data-back]").onclick = function () { stopTheme(); layer.remove(); };
    document.body.appendChild(layer);
  }
  function paint(host, list, owned, options) {
    var text = words();
    var count = Object.keys(owned).length;
    host.classList.add("sticker-album");
    if (options.source === "demo" && !Object.keys(owned).length) {
      host.innerHTML = "";
      return;
    }
    shownList = list;
    var pageSize = 12;
    var page = options.page || 0;
    var pages = Math.max(1, Math.ceil(list.length / pageSize));
    if (page >= pages) page = pages - 1;
    var slice = list.slice(page * pageSize, page * pageSize + pageSize);
    if (options.source === "show") showPageCast = slice;
    var first = slice[0] ? slice[0].number : "";
    var last = slice.length ? slice[slice.length - 1].number : "";
    var pageLabel = text.page + (page + 1) + text.actWord + " · No. " + first + "–" + last;
    var heading = options.heading === "" ? "" : "<h2>" + esc(options.heading || text.title) + "</h2>";
    host.innerHTML = heading + "<p class=\"sticker-progress\">" + text.progress + " " +
      count + " / " + (options.total || list.length) + "</p><div class=\"progress\" aria-hidden=\"true\"><i style=\"width:" +
      Math.round(count / Math.max(options.total || list.length, 1) * 100) + "%\"></i></div>" +
      (options.total ? "" : "<p class=\"act-label\">" + esc(pageLabel) + "</p>") +
      (count && options.source !== "show" ? "<p><button type=\"button\" class=\"finale-open\">" + text.finale + "</button></p>" : "") +
      "<div class=\"sticker-grid\"></div>" +
      (pages > 1 ? "<p class=\"act-pager\"><button type=\"button\" data-prev" + (page === 0 ? " disabled" : "") + ">" + text.prev + "</button><span>" + (page + 1) + " / " + pages + "</span><button type=\"button\" data-next" + (page === pages - 1 ? " disabled" : "") + ">" + text.next + "</button></p>" : "");
    var grid = host.querySelector(".sticker-grid");
    slice.forEach(function (item) { grid.appendChild(card(item, owned, options.highlight, slice)); });
    var finale = host.querySelector(".finale-open");
    if (finale) {
      finale.onclick = function () {
        var firstOwned = slice.filter(function (item) { return owned[item.id]; })[0];
        if (firstOwned) theatre(firstOwned, slice, owned, "finale");
      };
    }
    var prev = host.querySelector("[data-prev]");
    var next = host.querySelector("[data-next]");
    if (prev) prev.onclick = function () { options.page = page - 1; paint(host, list, owned, options); };
    if (next) next.onclick = function () { options.page = page + 1; paint(host, list, owned, options); };
    if (options.celebrate) confetti(host);
    if (options.highlight) {
      var marked = host.querySelector(".is-new");
      if (marked) marked.scrollIntoView({ block: "center" });
    }
  }
  function registry() {
    return fetch("/data/stickers/registry.json", { cache: "no-store" }).then(function (response) {
      return response.json();
    });
  }
  function showOwned(list) {
    var owned = {};
    list.forEach(function (item) {
      if (!item.collected || !item.file) return;
      owned[item.id] = { id: item.id, file: item.file, portrait: item.portrait || "", name: item, shop: null };
    });
    return owned;
  }
  function presentationPage(list) {
    var chosen = ["captain_seagull_standing_seagull", "madame_lola_flamingo_moviestar", "miyabi_the_kimono_fox", "ruby_redbreast_singer", "signor_barkarotti_tenor", "sir_felix_furrington_pianist", "turbo"];
    var byId = {};
    list.forEach(function (item) { byId[item.id] = item; });
    var empties = list.filter(function (item) { return chosen.indexOf(item.id) === -1; }).slice(0, 5);
    var pattern = [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0];
    var filled = 0;
    var blank = 0;
    return pattern.map(function (slot) {
      var item = slot ? byId[chosen[filled++]] : empties[blank++];
      var copy = Object.assign({}, item);
      copy.collected = !!slot;
      return copy;
    });
  }
  function render(host, options) {
    options = options || {};
    ensureStyle();
    var book = options.source === "show" || options.source === "player" ? registry() : catalogue();
    return book.then(function (data) {
      var list = data.characters || [];
      if (options.source === "player") {
        var ids = inventoryIds();
        options.total = list.length;
        list = list.map(function (item) {
          var copy = Object.assign({}, item);
          copy.collected = ids.indexOf(item.id) !== -1;
          return copy;
        });
      }
      if (options.source === "show") {
        options.total = list.length;
        list = presentationPage(list);
        finaleList = list.filter(function (item) { return item.collected && item.file; });
      }
      var owned = options.source === "sample" ? sampleOwned(list.slice(0, 8))
        : options.source === "show" || options.source === "player" ? showOwned(list)
        : options.source === "demo" ? demoOwned() : {};
      paint(host, list, owned, options);
      return { list: list, owned: owned };
    });
  }
  function inventoryIds() {
    try {
      var data = JSON.parse(localStorage.getItem("turbo.playerInventory.v1") || "");
      return data && data.ids ? data.ids.slice() : [];
    } catch (error) {
      return [];
    }
  }
  function openShow(mode) {
    ensureStyle();
    var page = showPageCast;
    var owned = showOwned(page);
    var first = page.filter(function (item) { return owned[item.id]; })[0];
    if (first) theatre(first, page, owned, mode || "finale");
    return Promise.resolve();
  }
  function open(options) {
    var layer = document.getElementById("sticker-album-view") || document.createElement("section");
    layer.id = "sticker-album-view";
    layer.innerHTML = "<div class=\"sticker-album-sheet\"><p><button type=\"button\" class=\"sticker-close\">" +
      words().close + "</button></p><div data-sheet></div></div>";
    layer.querySelector(".sticker-close").onclick = function () { layer.remove(); };
    document.body.appendChild(layer);
    return render(layer.querySelector("[data-sheet]"), options);
  }
  global.TURBO_STICKER_ALBUM = { render: render, open: open, openShow: openShow };
})(window);

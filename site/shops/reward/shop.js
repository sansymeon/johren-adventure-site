(function () {
  "use strict";
  var KEY = "turbo.demoMerchantRewards.v1";
  var lang = (document.documentElement.lang || "ja").toLowerCase() === "en" ? "en" : "ja";
  var root = document.getElementById("shop");
  var params = new URLSearchParams(location.search);
  var parts = location.pathname.split("/").filter(Boolean);
  var slug = parts[parts.length - 1] || params.get("m") || "";
  var legacy = { "bistro-a": "demo-a", "bistro-b": "demo-b", "bistro-c": "demo-c" };
  if (legacy[slug]) slug = legacy[slug];
  var text = lang === "en" ? {
    demo: "Demo Shop",
    closed: "This shop is not receiving guests at the moment.",
    missing: "This shop could not be found.",
    hours: "Opening hours",
    take: "Receive the shop sticker",
    again: "Watch the celebration again",
    kept: "This sticker is already in your collection.",
    collection: "Open my collection",
    puzzle: "Shop puzzle",
    piece: "Piece",
    done: "The shop puzzle is complete.",
    fireworks: "Watch the fireworks again",
    calendar: "This month’s calendar",
    close: "Continue"
  } : {
    demo: "デモ店舗",
    closed: "ただいまご案内を休んでいます。",
    missing: "お店が見つかりません。",
    hours: "営業時間",
    take: "店のステッカーを受け取る",
    again: "受け取りの演出をもう一度見る",
    kept: "このステッカーは、すでにコレクションに入っています。",
    collection: "コレクションを開く",
    puzzle: "お店のパズル",
    piece: "ピース",
    done: "お店のパズルが完成しました。",
    fireworks: "花火の演出をもう一度見る",
    calendar: "今月のカレンダー",
    close: "つづける"
  };

  function t(bag) { return (bag && (bag[lang] || bag.ja)) || ""; }
  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "");
      if (!data || typeof data !== "object") return { version: 1, visits: {} };
      data.visits = data.visits || {};
      return data;
    } catch (error) {
      return { version: 1, visits: {} };
    }
  }
  function write(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
  function collectionHref() {
    return lang === "en" ? "/map/index-en.html?map=turbo#collection" : "/map/?map=turbo#collection";
  }

  fetch("/data/merchants/merchants.json", { cache: "no-store" })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      var shop = null;
      Object.keys(data.merchants || {}).forEach(function (key) {
        var row = data.merchants[key];
        if (row.id === slug || row.alias === slug) shop = row;
      });
      var book = read();
      if (shop && shop.legacyId && book.visits[shop.legacyId] && !book.visits[shop.id]) {
        book.visits[shop.id] = book.visits[shop.legacyId];
        write(book);
      }
      paint(data, shop);
    })
    .catch(function () { root.textContent = text.missing; });

  function paint(data, shop) {
    if (!shop) { root.textContent = text.missing; return; }
    document.title = t(shop.name);
    if (!shop.enabled) { root.innerHTML = "<p class=\"demo-label\">" + text.demo + "</p><h1>" + t(shop.name) + "</h1><p>" + text.closed + "</p>"; return; }
    var visit = read().visits[shop.id] || {};
    var html = "<p class=\"demo-label\">" + text.demo + "</p>";
    html += "<img class=\"photo\" src=\"" + shop.photo + "\" alt=\"\">";
    html += "<h1>" + t(shop.name) + "</h1>";
    html += "<p class=\"welcome\">" + t(shop.welcome) + "</p>";
    html += "<p>" + t(shop.about) + "</p>";
    html += "<p>" + t(shop.address) + "</p>";
    html += "<p><strong>" + text.hours + "</strong><br>" + t(shop.hours) + "</p>";
    html += "<button type=\"button\" id=\"take\">" + (visit.character ? text.again : text.take) + "</button>";
    if (visit.character) html += "<p>" + text.kept + "</p>";
    html += "<a class=\"action\" href=\"" + collectionHref() + "\">" + text.collection + "</a>";
    if (shop.puzzle) {
      var pieces = Math.min(5, visit.pieces || 0);
      html += "<section class=\"card\"><h2>" + text.puzzle + "</h2><p>" + text.piece + " " + pieces + " / 5</p>";
      html += "<div class=\"board\"><img class=\"wide\" src=\"" + shop.puzzle + "\" alt=\"\">";
      for (var i = pieces; i < 5; i += 1) html += "<span style=\"left:" + (i * 20) + "%;width:20%\"></span>";
      html += "</div>";
      if (pieces >= 5) html += "<p>" + text.done + "</p><button type=\"button\" class=\"ghost\" id=\"fireworks\">" + text.fireworks + "</button>";
      html += "</section>";
    }
    if (shop.calendar) html += "<section class=\"card\"><h2>" + text.calendar + "</h2><img class=\"wide\" src=\"" + shop.calendar + "\" alt=\"\"></section>";
    if (shop.website) html += "<a class=\"action\" href=\"" + shop.website + "\">" + shop.website.replace(/^https:\/\//, "") + "</a>";
    root.innerHTML = html;
    root.querySelector("#take").onclick = function () { grant(data, shop, !!visit.character); };
    var fireworks = root.querySelector("#fireworks");
    if (fireworks) fireworks.onclick = function () { openAlbum(read().visits[shop.id].character, false); };
  }

  function grant(data, shop, replay) {
    var book = read();
    var visit = book.visits[shop.id] || { pieces: 0 };
    if (!replay) {
      if (!visit.character) {
        var picked = shop.plan === "free"
          ? data.characters[Math.floor(Math.random() * data.characters.length)]
          : data.characters.filter(function (item) { return item.id === shop.character; })[0];
        if (!picked) return;
        visit.character = picked.id;
        visit.file = picked.file;
        visit.name = picked;
        visit.shop = shop.name;
        visit.demo = true;
      }
      if (shop.puzzle && visit.pieces < 5) visit.pieces = (visit.pieces || 0) + 1;
      book.visits[shop.id] = visit;
      write(book);
    } else {
      visit = book.visits[shop.id];
    }
    paint(data, shop);
    openAlbum(visit.character, !replay);
  }

  function openAlbum(characterId, fresh) {
    function show() {
      window.TURBO_STICKER_ALBUM.open({
        source: "demo",
        highlight: fresh ? characterId : "",
        celebrate: fresh
      });
    }
    if (window.TURBO_STICKER_ALBUM) show();
    else {
      var script = document.createElement("script");
      script.src = "/js/sticker-album.js";
      script.onload = show;
      document.body.appendChild(script);
    }
  }

})();

/**
 * Shared puzzle reward flow for every discovery category.
 * Railway is the only caller today. Cultural, scenic, and merchant
 * puzzles should call these functions rather than keep their own copy.
 *
 * Pending celebrations live in turbo.pendingCelebrations.v1.
 * This file does not read or write turbo.locationCollection.v1.
 * The caller supplies the picture and wallpaper already assigned to
 * that player. This module does not look up the current seasonal art.
 */
(function (global) {
  "use strict";

  var KEY = "turbo.pendingCelebrations.v1";
  var celebration = null;

  function t(key) {
    return global.TURBO_I18N.t(key);
  }

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(KEY) || "");
      if (!data || !Array.isArray(data.items)) return { version: 1, items: [] };
      return data;
    } catch (error) {
      return { version: 1, items: [] };
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function mount() {
    if (celebration) return;
    celebration = document.createElement("section");
    celebration.className = "celebration";
    celebration.hidden = true;
    document.body.appendChild(celebration);
    var wallpaper = document.createElement("section");
    wallpaper.id = "wallpaper-view";
    wallpaper.className = "wallpaper-view";
    wallpaper.hidden = true;
    document.body.appendChild(wallpaper);
  }

  function websiteHref(value) {
    var site = String(value || "").trim();
    if (!site) return "";
    if (!/^https?:\/\//i.test(site)) site = "https://" + site;
    return site;
  }

  function fileFrom(url, name) {
    return fetch(url).then(function (response) { return response.blob(); }).then(function (blob) {
      return new File([blob], name, { type: blob.type || "image/jpeg" });
    });
  }

  function share(url, name) {
    var message = t("shareMessage");
    fileFrom(url, name).then(function (file) {
      var payload = { text: message, files: [file] };
      if (navigator.canShare && navigator.canShare(payload)) return navigator.share(payload);
      if (navigator.share) return navigator.share({ text: message, url: "https://johrenadventure.com" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = name;
      link.click();
    }).catch(function () {
      var link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
    });
  }

  function burst(host, fireworks) {
    var layer = document.createElement("div");
    layer.className = fireworks ? "puzzle-confetti puzzle-fireworks" : "puzzle-confetti";
    layer.setAttribute("aria-hidden", "true");
    var colors = fireworks
      ? ["#ffd76a", "#ff5a7a", "#fff", "#7ad7ff"]
      : ["#c83b32", "#e7c27a", "#f3eee4", "#0e7884", "#fffaf4"];
    var i;
    for (i = 0; i < 28; i += 1) {
      var bit = document.createElement("i");
      bit.style.left = (4 + (i * 13) % 92) + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = ((i % 8) * 0.05) + "s";
      layer.appendChild(bit);
    }
    host.appendChild(layer);
  }

  function showWallpaper(item) {
    var view = document.getElementById("wallpaper-view");
    if (!view || !item.wallpaper) return;
    view.hidden = false;
    view.innerHTML =
      '<img alt="" src="' + escapeAttr(item.wallpaper) + '">' +
      '<div class="celebration-actions">' +
      '<button type="button" data-save>' + t("saveWallpaper") + "</button>" +
      '<button type="button" data-share>' + t("share") + "</button>" +
      '<button type="button" data-back>' + t("backCollection") + "</button></div>";
    view.querySelector("[data-save]").addEventListener("click", function () {
      share(item.wallpaper, "turbo-wallpaper.jpg");
    });
    view.querySelector("[data-share]").addEventListener("click", function () {
      share(item.wallpaper, "turbo-wallpaper.jpg");
    });
    view.querySelector("[data-back]").addEventListener("click", function () {
      view.hidden = true;
    });
  }

  function nextItem() {
    var data = read();
    var i;
    for (i = 0; i < data.items.length; i += 1) {
      if (!data.items[i].viewed) return data.items[i];
    }
    return null;
  }

  function present() {
    mount();
    var item = nextItem();
    if (!item) return;
    var href = websiteHref(item.merchantWebsite);
    celebration.hidden = false;
    celebration.innerHTML =
      "<h2>" + t("puzzleComplete") + "</h2>" +
      "<p>" + t("slogan") + "</p>" +
      '<img alt="" src="' + escapeAttr(item.image) + '">' +
      '<div class="celebration-actions">' +
      (item.wallpaper ? '<button type="button" data-wall>' + t("viewWallpaper") + "</button>" : "") +
      '<button type="button" data-share>' + t("share") + "</button>" +
      (href ? '<a href="' + escapeAttr(href) + '" target="_blank" rel="noopener noreferrer">' +
        escapeAttr(item.merchantWebsite) + "</a>" : "") +
      '<button type="button" data-done>' + t("backCollection") + "</button></div>";
    burst(celebration, item.fireworks);
    celebration.querySelector("[data-share]").addEventListener("click", function () {
      share(item.image, "turbo-puzzle.jpg");
    });
    var wall = celebration.querySelector("[data-wall]");
    if (wall) wall.addEventListener("click", function () { showWallpaper(item); });
    celebration.querySelector("[data-done]").addEventListener("click", function () {
      var data = read();
      data.items.forEach(function (row) { if (row.id === item.id) row.viewed = true; });
      write(data);
      celebration.hidden = true;
      present();
    });
  }

  function enqueue(item) {
    if (!item || !item.id || !item.image) return;
    var data = read();
    var exists = data.items.some(function (row) { return row.id === item.id; });
    if (exists) return;
    data.items.push({
      id: item.id,
      category: item.category || "",
      image: item.image,
      wallpaper: item.wallpaper || "",
      fireworks: item.fireworks === true,
      merchantWebsite: item.merchantWebsite || "",
      viewed: false
    });
    write(data);
  }

  global.TURBO_PUZZLE_REWARD = {
    key: KEY,
    mount: mount,
    share: share,
    present: present,
    enqueue: enqueue
  };
})(window);

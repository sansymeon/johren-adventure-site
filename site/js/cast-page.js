(function () {
  "use strict";

  var root = document.getElementById("cast-list");
  if (!root) return;
  var lang = (document.documentElement.lang || "ja").toLowerCase() === "en" ? "en" : "ja";

  function text(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.ja || "";
  }

  fetch("/data/cast/cast.json", { cache: "no-store" })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      root.innerHTML = (data.groups || []).map(function (group) {
        var title = text(group.title);
        return '<article class="cast-group">' +
          '<img src="' + group.image + '" alt="' + title.replace(/"/g, "&quot;") + '" width="' + (group.width || 1672) + '" height="' + (group.height || 941) + '">' +
          "<h2>" + title + "</h2>" +
          "<p>" + text(group.text) + "</p>" +
          "</article>";
      }).join("");
    })
    .catch(function () {
      root.textContent = lang === "en" ? "The cast page could not be loaded." : "キャラクター紹介を読み込めませんでした。";
    });
})();

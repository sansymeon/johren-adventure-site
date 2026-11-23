/**
 * Home, Map, Collection, and Create.
 * Paths are from the site root, so they work on localhost and on johrenadventure.com.
 * Japanese is the default. English pages set lang="en".
 */
(function (global) {
  "use strict";

  function english() {
    return (document.documentElement.lang || "ja").toLowerCase() === "en";
  }

  function urls() {
    var map = english() ? "/map/index-en.html" : "/map/";
    return {
      home: english() ? "/en/" : "/",
      map: map + "?map=turbo",
      collection: map + "?map=turbo#collection",
      create: english() ? "/create/index-en.html" : "/create/"
    };
  }

  function items() {
    var en = english();
    var link = urls();
    return [
      { id: "home", href: link.home, label: en ? "Home" : "ホーム" },
      { id: "map", href: link.map, label: en ? "Map" : "マップ" },
      { id: "collection", href: link.collection, label: en ? "Collection" : "コレクション" },
      { id: "create", href: link.create, label: en ? "Create" : "つくる" }
    ];
  }

  function currentId() {
    var path = location.pathname;
    if (location.hash === "#collection") return "collection";
    if (path.indexOf("/create") === 0) return "create";
    if (path.indexOf("/map") === 0) return "map";
    return "home";
  }

  function languageUrls() {
    var path = location.pathname;
    var tail = location.search + location.hash;
    if (path.indexOf("/map") === 0) {
      return { ja: "/map/" + tail, en: "/map/index-en.html" + tail };
    }
    if (path.indexOf("/create") === 0) {
      return { ja: "/create/", en: "/create/index-en.html" };
    }
    return { ja: "/", en: "/en/" };
  }

  function inject() {
    if (document.querySelector(".turbo-nav")) return;
    var style = document.createElement("style");
    style.textContent =
      ".turbo-chrome{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;box-sizing:border-box;width:100%;margin:0;padding:calc(8px + env(safe-area-inset-top)) 8px 8px;background:rgba(255,249,237,.94)}" +
      ".turbo-nav{position:relative;display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:8px;width:100%;max-width:720px;min-width:0;margin:0}" +
      ".turbo-nav a{flex:0 1 auto;min-width:0;box-sizing:border-box;background:#fff;color:#173043;border-radius:999px;padding:8px 12px;font-size:14px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:nowrap}" +
      ".turbo-nav a[aria-current=page]{background:#0e7884;color:#fff}" +
      ".turbo-lang{display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:6px;margin:0}" +
      ".turbo-lang a{display:inline-flex;align-items:center;justify-content:center;min-height:36px;box-sizing:border-box;background:#fff;color:#173043;border:1px solid #cbdfe1;border-radius:999px;padding:6px 11px;font-size:13px;font-weight:800;line-height:1;text-decoration:none}" +
      ".turbo-lang a[lang=en]{font-size:1.05rem;padding:6px 10px}" +
      ".turbo-lang a[aria-current=true]{background:#0e7884;color:#fff;border-color:#0e7884}" +
      "@media (max-width:520px){.turbo-nav{gap:3px}.turbo-nav a{flex:1 1 0;padding:6px 3px;font-size:11px}}" +
      "@media (max-width:400px){.turbo-chrome{padding-left:6px;padding-right:6px}.turbo-nav{gap:2px}.turbo-nav a{padding:6px 2px;font-size:11px}}" +
      "@media (min-width:768px){.turbo-chrome{flex-direction:row;justify-content:center;gap:14px;padding-left:16px;padding-right:16px}}";
    document.head.appendChild(style);
    var chrome = document.createElement("header");
    chrome.className = "turbo-chrome";
    var nav = document.createElement("nav");
    nav.className = "turbo-nav";
    nav.setAttribute("aria-label", english() ? "Turbo Adventures" : "ターボ・アドベンチャーズ");
    var here = currentId();
    items().forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.id === here) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
    var langs = languageUrls();
    var langNav = document.createElement("nav");
    langNav.className = "turbo-lang";
    langNav.setAttribute("aria-label", "Language");
    var ja = document.createElement("a");
    ja.href = langs.ja;
    ja.lang = "ja";
    ja.textContent = "日本語";
    if (!english()) ja.setAttribute("aria-current", "true");
    var enLink = document.createElement("a");
    enLink.href = langs.en;
    enLink.lang = "en";
    enLink.setAttribute("aria-label", "English");
    var flag = document.createElement("span");
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = "🇬🇧";
    enLink.appendChild(flag);
    if (english()) enLink.setAttribute("aria-current", "true");
    langNav.appendChild(ja);
    langNav.appendChild(enLink);
    chrome.appendChild(nav);
    chrome.appendChild(langNav);
    document.body.insertBefore(chrome, document.body.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  global.TURBO_NAV = { urls: urls };
})(window);

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

  function ensureIcons() {
    var head = document.head;
    if (!head || head.querySelector("link[rel='apple-touch-icon']")) return;
    var en = english();
    function link(rel, href, extra) {
      var el = document.createElement("link");
      el.rel = rel;
      el.href = href;
      if (extra) Object.keys(extra).forEach(function (key) { el.setAttribute(key, extra[key]); });
      head.appendChild(el);
    }
    link("icon", "/favicon.ico", { sizes: "32x32" });
    link("icon", "/media/icons/favicon-32.png", { type: "image/png", sizes: "32x32" });
    link("apple-touch-icon", "/media/icons/apple-touch-icon.png", { sizes: "180x180" });
    link("manifest", en ? "/en/manifest.webmanifest" : "/manifest.webmanifest");
    if (!head.querySelector("meta[name='theme-color']")) {
      var theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.content = "#0e7884";
      head.appendChild(theme);
    }
    if (!head.querySelector("meta[name='apple-mobile-web-app-title']")) {
      var title = document.createElement("meta");
      title.name = "apple-mobile-web-app-title";
      title.content = en ? "Turbo" : "ターボ";
      head.appendChild(title);
    }
  }

  function urls() {
    var map = english() ? "/map/index-en.html" : "/map/";
    return {
      home: english() ? "/en/" : "/",
      cast: english() ? "/en/cast/" : "/cast/",
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
      { id: "cast", href: link.cast, label: en ? "Cast" : "キャスト" },
      { id: "map", href: link.map, label: en ? "Map" : "マップ" },
      { id: "collection", href: link.collection, label: en ? "Collection" : "コレクション" },
      { id: "create", href: link.create, label: en ? "Create" : "つくる" },
      { id: "shop", href: en ? "/en/shops/demo/" : "/shops/demo/", label: en ? "Shop Demo" : "店舗デモ", shop: true }
    ];
  }

  function currentId() {
    var path = location.pathname;
    if (location.hash === "#collection") return "collection";
    if (path.indexOf("/collection-demo") !== -1 || path.indexOf("/shops/demo-") !== -1 || /\/shops\/TS-\d{6}/.test(path)) return "";
    if (path.indexOf("/shops/demo") !== -1 || path.indexOf("/en/shops/demo") !== -1) return "shop";
    if (path.indexOf("/create") === 0) return "create";
    if (path.indexOf("/map") === 0) return "map";
    if (path.indexOf("/cast") === 0 || path.indexOf("/en/cast") === 0) return "cast";
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
    if (path.indexOf("/cast") === 0 || path.indexOf("/en/cast") === 0) {
      return { ja: "/cast/", en: "/en/cast/" };
    }
    var spot = path.match(/\/(?:en\/)?shops\/(demo-[abc]|TS-\d{6})\/?$/);
    if (spot) return { ja: "/shops/" + spot[1] + "/", en: "/en/shops/" + spot[1] + "/" };
    var pairs = [
      ["/shops/demo/", "/en/shops/demo/"],
      ["/collection-demo/", "/en/collection-demo/"],
      ["/about/", "/en/about/"],
      ["/operator/", "/en/operator/"],
      ["/guide/", "/en/guide/"],
      ["/shops/", "/en/shops/"],
      ["/terms/", "/en/terms/"],
      ["/privacy/", "/en/privacy/"]
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (path.indexOf(pairs[i][0]) === 0 || path.indexOf(pairs[i][1]) === 0) {
        return { ja: pairs[i][0] + location.search, en: pairs[i][1] + location.search };
      }
    }
    return { ja: "/", en: "/en/" };
  }

  function footerLinks() {
    var en = english();
    return [
      { href: en ? "/en/about/" : "/about/", label: en ? "About" : "このサービスについて" },
      { href: en ? "/en/operator/" : "/operator/", label: en ? "Business Information" : "運営者情報" },
      { href: en ? "/en/shops/" : "/shops/", label: en ? "For shops" : "お店の皆様へ" },
      { href: en ? "/en/terms/" : "/terms/", label: en ? "Terms" : "利用規約" },
      { href: en ? "/en/privacy/" : "/privacy/", label: en ? "Privacy" : "プライバシー" }
    ];
  }

  function onMap() {
    return location.pathname.indexOf("/map") === 0;
  }

  function inject() {
    ensureIcons();
    if (document.querySelector(".turbo-nav")) return;
    var mapPage = onMap();
    var style = document.createElement("style");
    style.textContent =
      ".turbo-chrome{position:relative;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:8px;box-sizing:border-box;width:100%;margin:0;padding:calc(8px + env(safe-area-inset-top)) 10px 8px;background:rgba(255,249,237,.96)}" +
      ".turbo-top{display:contents}" +
      ".turbo-brand{flex:1;min-width:0;margin:0;font-size:13px;font-weight:800;letter-spacing:.04em;line-height:1.2}" +
      ".turbo-nav{position:relative;display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:8px;width:100%;max-width:980px;min-width:0;margin:0}" +
      ".turbo-nav a{flex:0 1 auto;min-width:0;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;background:#fff;color:#173043;border-radius:999px;padding:8px 12px;font-size:14px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:nowrap}" +
      ".turbo-nav a[aria-current=page]{background:#0e7884;color:#fff}" +
      ".turbo-nav a.turbo-shop{box-shadow:inset 0 0 0 2px #c6a15a}" +
      ".turbo-nav a.turbo-shop[aria-current=page]{background:#8a6a22;color:#fff;box-shadow:none}" +
      ".turbo-lang{display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:6px;margin:0}" +
      ".turbo-lang a{display:inline-flex;align-items:center;justify-content:center;min-height:36px;box-sizing:border-box;background:#fff;color:#173043;border:1px solid #cbdfe1;border-radius:999px;padding:6px 11px;font-size:13px;font-weight:800;line-height:1;text-decoration:none}" +
      ".turbo-lang a[lang=en]{font-size:1.05rem;padding:6px 10px}" +
      ".turbo-lang a[aria-current=true]{background:#0e7884;color:#fff;border-color:#0e7884}" +
      ".turbo-legal{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 12px;width:100%;max-width:980px;margin:0;padding:0 8px 2px;font-size:12px;line-height:1.4}" +
      ".turbo-legal a,.turbo-legal button{color:#087a79;font-weight:700;text-decoration:none;background:transparent;border:0;font:inherit;font-size:12px;font-weight:700;cursor:pointer}" +
      ".turbo-menu-btn{display:none;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:4px 10px;border:1px solid #cbdfe1;border-radius:999px;background:#fff;color:#173043;font-size:18px;line-height:1;cursor:pointer}" +
      "@media (max-width:700px){.turbo-top{display:flex;width:100%}.turbo-menu-btn{display:inline-flex}.turbo-nav,.turbo-legal{display:none;flex-basis:100%}.turbo-chrome.is-open .turbo-nav,.turbo-chrome.is-open .turbo-legal{display:flex}.turbo-nav{flex-wrap:wrap;gap:6px}.turbo-nav a{flex:1 1 calc(33.333% - 6px);min-height:44px;padding:8px 6px;font-size:13px}.turbo-legal{justify-content:flex-start;padding:4px 2px 0}.turbo-lang a{min-height:44px}}" +
      "@media (min-width:701px){.turbo-brand,.turbo-menu-btn{display:none}.turbo-chrome{flex-direction:row;justify-content:center;gap:14px;padding-left:16px;padding-right:16px}.turbo-nav{flex-wrap:wrap;width:auto}.turbo-nav a{flex:0 1 auto;min-height:40px}.turbo-legal{flex-basis:100%}}" +
      ".turbo-chrome-map .turbo-nav a{padding:5px 8px;font-size:13px}" +
      "@media (min-width:701px){.turbo-chrome-map{flex-wrap:wrap;padding-top:calc(4px + env(safe-area-inset-top));padding-bottom:4px}.turbo-chrome-map .turbo-nav{flex-wrap:nowrap;width:auto}}";
    document.head.appendChild(style);
    var chrome = document.createElement("header");
    chrome.className = "turbo-chrome";
    var top = document.createElement("div");
    top.className = "turbo-top";
    var brand = document.createElement("p");
    brand.className = "turbo-brand";
    brand.textContent = "TURBO ADVENTURES";
    var menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "turbo-menu-btn";
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", english() ? "Menu" : "メニュー");
    menuBtn.textContent = "☰";
    var nav = document.createElement("nav");
    nav.className = "turbo-nav";
    nav.setAttribute("aria-label", english() ? "Turbo Adventures" : "ターボ・アドベンチャーズ");
    var here = currentId();
    items().forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.shop) a.className = "turbo-shop";
      if (item.id === here) a.setAttribute("aria-current", "page");
      a.addEventListener("click", function () { setOpen(false); });
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
    var legal = document.createElement("nav");
    legal.className = "turbo-legal";
    legal.setAttribute("aria-label", english() ? "Site information" : "サイト情報");
    footerLinks().forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      a.addEventListener("click", function () { setOpen(false); });
      legal.appendChild(a);
    });
    function setOpen(open) {
      chrome.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "✕" : "☰";
    }
    function markCurrent() {
      var id = currentId();
      nav.querySelectorAll("a").forEach(function (link, index) {
        var item = items()[index];
        if (item && item.id === id) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }
    menuBtn.addEventListener("click", function () { setOpen(!chrome.classList.contains("is-open")); });
    window.addEventListener("hashchange", markCurrent);
    window.addEventListener("popstate", markCurrent);
    top.appendChild(brand);
    top.appendChild(langNav);
    top.appendChild(menuBtn);
    chrome.appendChild(top);
    chrome.appendChild(nav);
    if (mapPage) {
      chrome.classList.add("turbo-chrome-map");
      var opening = document.createElement("button");
      opening.type = "button";
      opening.textContent = english() ? "Opening" : "オープニングへ";
      opening.addEventListener("click", function () {
        setOpen(false);
        var theatre = document.getElementById("btn-theatre");
        if (theatre) theatre.click();
      });
      legal.appendChild(opening);
    }
    chrome.appendChild(legal);
    document.body.insertBefore(chrome, document.body.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  global.TURBO_NAV = { urls: urls };
})(window);

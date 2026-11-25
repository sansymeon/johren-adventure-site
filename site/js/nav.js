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
      { id: "create", href: link.create, label: en ? "Create" : "つくる" }
    ];
  }

  function currentId() {
    var path = location.pathname;
    if (location.hash === "#collection") return "collection";
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
    var pairs = [
      ["/shops/demo/", "/en/shops/demo/"],
      ["/about/", "/en/about/"],
      ["/guide/", "/en/guide/"],
      ["/shops/", "/en/shops/"],
      ["/terms/", "/en/terms/"],
      ["/privacy/", "/en/privacy/"]
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (path.indexOf(pairs[i][0]) === 0 || path.indexOf(pairs[i][1]) === 0) {
        return { ja: pairs[i][0], en: pairs[i][1] };
      }
    }
    return { ja: "/", en: "/en/" };
  }

  function footerLinks() {
    var en = english();
    return [
      { href: en ? "/en/about/" : "/about/", label: en ? "About" : "このサービスについて" },
      { href: en ? "/en/about/#operator" : "/about/#operator", label: en ? "Operator" : "運営者情報" },
      { href: en ? "/en/shops/" : "/shops/", label: en ? "For shops" : "お店の皆様へ" },
      { href: en ? "/en/terms/" : "/terms/", label: en ? "Terms" : "利用規約" },
      { href: en ? "/en/privacy/" : "/privacy/", label: en ? "Privacy" : "プライバシー" }
    ];
  }

  function onMap() {
    return location.pathname.indexOf("/map") === 0;
  }

  function inject() {
    if (document.querySelector(".turbo-nav")) return;
    var mapPage = onMap();
    var style = document.createElement("style");
    style.textContent =
      ".turbo-chrome{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;box-sizing:border-box;width:100%;margin:0;padding:calc(8px + env(safe-area-inset-top)) 8px 8px;background:rgba(255,249,237,.94)}" +
      ".turbo-nav{position:relative;display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:8px;width:100%;max-width:860px;min-width:0;margin:0}" +
      ".turbo-nav a{flex:0 1 auto;min-width:0;box-sizing:border-box;background:#fff;color:#173043;border-radius:999px;padding:8px 12px;font-size:14px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;white-space:nowrap}" +
      ".turbo-nav a[aria-current=page]{background:#0e7884;color:#fff}" +
      ".turbo-lang{display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;gap:6px;margin:0}" +
      ".turbo-lang a{display:inline-flex;align-items:center;justify-content:center;min-height:36px;box-sizing:border-box;background:#fff;color:#173043;border:1px solid #cbdfe1;border-radius:999px;padding:6px 11px;font-size:13px;font-weight:800;line-height:1;text-decoration:none}" +
      ".turbo-lang a[lang=en]{font-size:1.05rem;padding:6px 10px}" +
      ".turbo-lang a[aria-current=true]{background:#0e7884;color:#fff;border-color:#0e7884}" +
      "@media (max-width:520px){.turbo-nav{gap:3px}.turbo-nav a{flex:1 1 0;padding:6px 3px;font-size:11px}}" +
      "@media (max-width:400px){.turbo-chrome{padding-left:6px;padding-right:6px}.turbo-nav{gap:2px}.turbo-nav a{padding:6px 2px;font-size:11px}}" +
      ".turbo-legal{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 12px;width:100%;max-width:860px;margin:0;padding:0 8px 2px;font-size:12px;line-height:1.4}" +
      ".turbo-legal a{color:#087a79;font-weight:700;text-decoration:none}" +
      "@media (min-width:768px){.turbo-chrome{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:14px;padding-left:16px;padding-right:16px}.turbo-legal{flex-basis:100%}}" +
      ".turbo-chrome-map{flex-direction:row;flex-wrap:nowrap;justify-content:center;align-items:center;gap:4px;padding:calc(4px + env(safe-area-inset-top)) 6px 4px}" +
      ".turbo-chrome-map .turbo-nav{gap:3px;max-width:none}" +
      ".turbo-chrome-map .turbo-nav a{padding:5px 7px;font-size:12px;min-height:32px;display:inline-flex;align-items:center;justify-content:center}" +
      ".turbo-chrome-map .turbo-lang{gap:3px}" +
      ".turbo-chrome-map .turbo-lang a{min-height:32px;padding:4px 7px;font-size:12px}" +
      ".turbo-chrome-map .turbo-lang a[lang=en]{font-size:1rem;padding:4px 7px}" +
      ".turbo-menu-btn{display:inline-flex;align-items:center;justify-content:center;min-width:36px;min-height:32px;padding:4px 8px;border:1px solid #cbdfe1;border-radius:999px;background:#fff;color:#173043;font-size:16px;line-height:1;cursor:pointer}" +
      ".turbo-menu{position:absolute;top:100%;right:6px;z-index:30;display:flex;flex-direction:column;gap:2px;min-width:220px;max-width:calc(100vw - 16px);margin:0;padding:8px;background:#fff9ed;border:1px solid #cbdfe1;border-radius:14px;box-shadow:0 10px 28px rgba(23,48,67,.16)}" +
      ".turbo-menu a,.turbo-menu button{display:block;width:100%;box-sizing:border-box;margin:0;padding:10px 12px;border:0;border-radius:10px;background:transparent;color:#173043;font:inherit;font-size:14px;font-weight:700;line-height:1.3;text-align:left;text-decoration:none;cursor:pointer}" +
      ".turbo-menu a:hover,.turbo-menu button:hover{background:#fff}" +
      "@media (max-width:520px){.turbo-chrome-map .turbo-nav a{flex:1 1 0;padding:5px 2px;font-size:11px}}";
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
    var legal = document.createElement("nav");
    legal.className = "turbo-legal";
    legal.setAttribute("aria-label", english() ? "Site information" : "サイト情報");
    footerLinks().forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      legal.appendChild(a);
    });
    chrome.appendChild(nav);
    chrome.appendChild(langNav);
    if (mapPage) {
      chrome.classList.add("turbo-chrome-map");
      var menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.className = "turbo-menu-btn";
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-controls", "turbo-menu");
      menuBtn.setAttribute("aria-label", english() ? "More" : "その他");
      menuBtn.textContent = "☰";
      var menu = document.createElement("nav");
      menu.className = "turbo-menu";
      menu.id = "turbo-menu";
      menu.hidden = true;
      menu.setAttribute("aria-label", english() ? "More" : "その他");
      footerLinks().forEach(function (item) {
        var a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        menu.appendChild(a);
      });
      var opening = document.createElement("button");
      opening.type = "button";
      opening.textContent = english() ? "Opening" : "オープニングへ";
      opening.addEventListener("click", function () {
        menu.hidden = true;
        menuBtn.setAttribute("aria-expanded", "false");
        var theatre = document.getElementById("btn-theatre");
        if (theatre) theatre.click();
      });
      menu.appendChild(opening);
      menuBtn.addEventListener("click", function () {
        menu.hidden = !menu.hidden;
        menuBtn.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
      });
      chrome.appendChild(menuBtn);
      chrome.appendChild(menu);
    } else {
      chrome.appendChild(legal);
    }
    document.body.insertBefore(chrome, document.body.firstChild);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();

  global.TURBO_NAV = { urls: urls };
})(window);

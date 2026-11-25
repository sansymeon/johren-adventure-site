/**
 * Renders TURBO_MERCHANT_DEMO with TURBO_MERCHANT_TIERS.
 * Switching tiers does not leave the page. Nothing here takes payment
 * or transfers a QR code.
 */
(function () {
  "use strict";
  var merchant = window.TURBO_MERCHANT_DEMO;
  var tiers = window.TURBO_MERCHANT_TIERS;
  var lang = (document.documentElement.lang || "ja").toLowerCase() === "en" ? "en" : "ja";
  var root = document.getElementById("merchant-showcase");
  if (!merchant || !tiers || !root) return;

  function t(bag) {
    return bag[lang] || bag.ja;
  }

  function copy() {
    return lang === "en" ? {
      demo: "Demo page",
      preparing: "In preparation",
      hours: "Opening hours",
      map: "Map and directions",
      line: "LINEでお問い合わせ",
      website: "Official Website",
      websiteNote: "A link to the shop’s own website. Not domain registration or hosting.",
      qrTitle: "オリジナルQRコードポスター",
      qrBody: "A cheerful illustrated QR poster for the counter or a table.",
      collectTitle: "月替わりのコレクション",
      collectBody: "Guests can collect a character as a memento of their visit. The shop chooses which character to feature.",
      calendarTitle: "月替わりオリジナルカレンダー",
      calendarBody: "A calendar each month, combining a new illustration with a QR code. Use it in the shop, and as a reason for guests to come back.",
      puzzleTitle: "お店オリジナル応援パズル",
      puzzleBody: "An original five-piece puzzle for the shop. This Bistro Turbo example uses the Itoshima café illustration.",
      recruiting: "参加店舗募集中！一定数の参加店舗が集まり次第、サービスを開始する予定です。",
      reference: "The illustrated pieces are temporary design references. Frega branding and the QR destinations will be replaced before public release.",
      list: "List this shop on the Turbo map for free",
      own: "Make this QR code belong to my shop",
      future: "This shows the intended postcard workflow. QR ownership, payment, and subscriptions are not active.",
    } : {
      demo: "デモページ",
      preparing: "準備中",
      hours: "営業時間",
      map: "地図と行き方",
      line: "LINEでお問い合わせ",
      website: "公式ウェブサイト",
      websiteNote: "お店がすでにお持ちのウェブサイトへのリンクです。ドメインの取得や、ホームページの制作サービスではありません。",
      qrTitle: "オリジナルQRコードポスター",
      qrBody: "店頭やテーブルに設置できる、楽しいイラスト入りのQRコードポスターです。",
      collectTitle: "月替わりのコレクション",
      collectBody: "ご来店の記念に、キャラクターを集めて楽しめます。掲載するキャラクターはお店で選べます。",
      calendarTitle: "月替わりオリジナルカレンダー",
      calendarBody: "毎月新しいイラストとQRコードを組み合わせたカレンダーをご用意します。店頭でのご案内や、お客様の再来店のきっかけづくりにご活用いただけます。",
      puzzleTitle: "お店オリジナル応援パズル",
      puzzleBody: "お店の魅力を伝えるオリジナルの5ピースパズルです。ビストロ・ターボの見本は、糸島のカフェのイラストです。",
      recruiting: "参加店舗募集中！一定数の参加店舗が集まり次第、サービスを開始する予定です。",
      reference: "掲載中のイラストは、デザインの仮の見本です。公開前に、フレガの表示とQRのリンク先を差し替えます。",
      list: "ターボマップに無料掲載する",
      own: "このQRコードを自分のお店のものにする",
      future: "これは、これから用意するお店向けはがきの流れの見本です。QRの引き継ぎ、支払い、定期購入はまだ動きません。",
    };
  }

  var text = copy();
  var current = tiers[0].id;

  function tierById(id) {
    for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) return tiers[i];
    return tiers[0];
  }

  function block(title, body) {
    return "<section class=\"card\"><h2>" + title + "</h2>" + body + "</section>";
  }

  function paint() {
    var tier = tierById(current);
    var f = tier.features;
    var look = f.puzzle ? "card distinctive" : (f.enhanced ? "card enhanced" : "card");
    var html = "";
    html += "<p><span class=\"badge\">" + text.demo + "</span></p>";
    html += "<div class=\"selector\" role=\"group\" aria-label=\"" + text.demo + "\">";
    tiers.forEach(function (item) {
      var pressed = item.id === tier.id;
      html += "<button type=\"button\" data-tier=\"" + item.id + "\" aria-pressed=\"" + pressed + "\">" + t(item.label);
      if (item.preparing) html += "<br><small>" + text.preparing + "</small>";
      html += "</button>";
    });
    html += "</div>";
    html += "<article class=\"" + look + "\">";
    if (f.restaurant) html += "<img class=\"wide\" src=\"" + merchant.artwork.restaurant + "\" alt=\"\">";
    html += "<p class=\"eyebrow\">" + t(merchant.category) + "</p>";
    html += "<h1>" + t(merchant.name) + "</h1>";
    if (f.enhanced) html += "<p>" + t(merchant.introEnhanced) + "</p>";
    else if (f.intro) html += "<p>" + t(merchant.intro) + "</p>";
    html += "<p>" + t(merchant.address) + "</p>";
    if (f.hours) html += "<p><strong>" + text.hours + "</strong><br>" + t(merchant.hours) + "</p>";
    html += "</article>";
    if (f.map || f.line || (f.website && merchant.website)) {
      html += "<div class=\"contact-row\">";
      if (f.map) html += "<a class=\"map-btn\" href=\"" + merchant.mapUrl + "\">" + text.map + "</a>";
      if (f.line) html += "<a class=\"line-btn\" href=\"" + merchant.lineUrl + "\">LINEでお問い合わせ</a>";
      if (f.website && merchant.website) html += "<span class=\"site-btn\" role=\"group\" aria-label=\"" + text.website + "\"><span>" + text.website + "</span><span>" + merchant.website + "</span></span>";
      html += "</div>";
      if (f.website && merchant.website) html += "<p class=\"hint\">" + text.websiteNote + "</p>";
    }
    if (f.qrPoster) html += block(text.qrTitle, "<p>" + text.qrBody + "</p><img class=\"compact\" src=\"" + merchant.artwork.qrPoster + "\" alt=\"\">");
    if (f.collectible) html += block(text.collectTitle, "<p>" + text.collectBody + "</p><img class=\"compact\" src=\"" + merchant.artwork.collectible + "\" alt=\"\">");
    if (f.calendar) html += block(text.calendarTitle, "<p>" + text.calendarBody + "</p><img class=\"compact\" src=\"" + merchant.artwork.calendar + "\" alt=\"\">");
    if (f.puzzle) html += block(text.puzzleTitle, "<p>" + text.puzzleBody + "</p><p class=\"soon\">" + text.recruiting + "</p><img class=\"natural\" src=\"" + merchant.artwork.puzzle + "\" alt=\"\"><p><a href=\"" + (lang === "en" ? "/en/guide/#puzzle" : "/guide/#puzzle") + "\">" + (lang === "en" ? "See how the 5, 10, 25 and 50 piece levels work" : "5・10・25・50ピースの進み方を見る") + "</a></p>");
    if (f.qrPoster) html += "<p class=\"note\">" + text.reference + "</p>";
    html += "<div class=\"actions\">";
    html += "<button type=\"button\" class=\"primary\" id=\"demo-list\">" + text.list + "</button>";
    html += "<button type=\"button\" class=\"secondary\" id=\"demo-own\">" + text.own + "</button>";
    html += "</div>";
    html += "<p class=\"note\" id=\"demo-result\" hidden></p>";
    html += "<p class=\"soon\">" + text.future + "</p>";
    root.innerHTML = html;
    root.querySelectorAll("[data-tier]").forEach(function (button) {
      button.addEventListener("click", function () {
        current = button.getAttribute("data-tier");
        paint();
      });
    });
    root.querySelector("#demo-list").addEventListener("click", function () {
      var node = root.querySelector("#demo-result");
      node.hidden = false;
      node.textContent = text.preparing + " — " + text.list;
    });
    root.querySelector("#demo-own").addEventListener("click", function () {
      var node = root.querySelector("#demo-result");
      node.hidden = false;
      node.textContent = text.preparing + " — " + text.own;
    });
  }

  paint();
})();

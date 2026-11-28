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
      recruiting: "Shops are invited to join. The paid extras are planned to begin once enough shops are taking part.",
      storyTitle: "Visit a shop and collect a digital sticker!",
      storyBody: "Turbo Adventures is a collection game about exploring the city and gathering characters and pictures.",
      storyVisit: "Visit a participating shop and scan its QR code to receive a digital sticker as a memento of your visit.",
      stepVisit: "Visit the shop",
      stepScan: "Scan the QR",
      stepSticker: "Receive a sticker",
      storyClose: "Guests leave with a memento, and a reason to come back.",
      storyEasy: "No app to install. No account to create.",
      offer: "Early shops only · introductory price",
      guaranteeTitle: "Early shops · 12-month price guarantee",
      guarantee: "From the day a paid service starts, an early shop keeps the introductory price for 12 months.",
      noLock: "No minimum term and no cancellation fee.",
      noCharge: "There is no charge until the paid service begins.",
      later: "Any later price change will be announced in advance.",
      choose: "Free participating shops receive a randomly assigned character. A subscribing shop can choose its character.",
      fictional: "Bistro Turbo is a fictional demonstration shop.",
      nowTitle: "Available now",
      nowItems: ["Printed shop postcards", "A unique QR code on each card", "A destination for each QR code"],
      showTitle: "What this page demonstrates",
      showItems: ["How Free, Standard and Premium listings can look", "The visit-and-collect experience for guests"],
      laterTitle: "Paid services in preparation",
      laterItems: ["Monthly plans", "Choosing a character", "A custom poster, calendar, sponsored puzzle and completion celebration"],
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
      storyTitle: "お店を訪れて、デジタルステッカーを集めよう！",
      storyBody: "ターボ・アドベンチャーズは、街を探検しながらキャラクターや絵を集める、体験型コレクションゲームです。",
      storyVisit: "参加店舗を訪れ、お店のQRコードを読み取ることで、来店記念のデジタルステッカーを獲得できます。",
      stepVisit: "お店を訪問",
      stepScan: "QRを読み取る",
      stepSticker: "ステッカー獲得",
      storyClose: "お客様に、来店の記念と、また訪れたくなる楽しみを提供します。",
      storyEasy: "アプリのインストール・会員登録不要",
      offer: "先行参加店舗限定・お試し価格",
      guaranteeTitle: "先行参加店舗限定・12か月間の価格保証",
      guarantee: "先行参加店舗は、有料サービスのご利用開始から12か月間、お試し価格でご利用いただけます。",
      noLock: "最低契約期間・解約金なし。",
      noCharge: "有料サービスの提供開始までは、料金は発生しません。",
      later: "その後の価格変更は、事前にお知らせします。",
      choose: "無料の参加店にはキャラクターがランダムに割り当てられます。有料プランでは、お店でキャラクターを選べます。",
      fictional: "ビストロ・ターボは、架空の見本店です。",
      nowTitle: "いまご用意できていること",
      nowItems: ["実物の店舗はがき", "一枚ずつ異なるQRコード", "QRコードごとのリンク先"],
      showTitle: "このページでご覧いただくこと",
      showItems: ["無料・スタンダード・プレミアムの掲載イメージ", "来店してステッカーを集める体験のご説明"],
      laterTitle: "準備中の有料サービス",
      laterItems: ["月額のご利用", "キャラクターの選択", "オリジナルポスター、カレンダー、応援パズル、完成時のお祝い演出"],
    };
  }

  var text = copy();
  var current = tiers[0].id;
  var cardMatch = (location.search || "").match(/[?&]card=(TA-\d{6})\b/);
  if (cardMatch) {
    try { sessionStorage.setItem("turbo.merchantCard", cardMatch[1]); } catch (error) { /* private mode */ }
  }
  var card = cardMatch ? cardMatch[1] : "";
  if (!card) {
    try { card = sessionStorage.getItem("turbo.merchantCard") || ""; } catch (error) { card = ""; }
  }
  if (!/^TA-\d{6}$/.test(card)) card = "";
  window.TURBO_MERCHANT_CARD = card;

  function tierById(id) {
    for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) return tiers[i];
    return tiers[0];
  }

  function stickerStrip(language) {
    var people = [
      ["turbo_confident_transparent.webp", "/media/turbo/poses/", "001", "ターボ", "Turbo"],
      ["captain_seagull_flying.webp", "/media/heroes/transparent/", "002", "キャプテン・シーガル", "Captain Seagull"],
      ["nibbles_dragon.webp", "/media/heroes/transparent/", "003", "ニブルズ", "Nibbles"],
      ["madame_lola_flamingo_moviestar.webp", "/media/heroes/transparent/", "004", "ローラ", "Lola"],
      ["sargeant_hooves_royalguard.webp", "/media/heroes/transparent/", "005", "フーズ軍曹", "Sergeant Hooves"],
      ["dame_henrietta_cluckington_chicken.webp", "/media/heroes/transparent/", "006", "アンリエッタ", "Henrietta"],
      ["bubbles_babydragon.webp", "/media/heroes/transparent/", "007", "バブルス", "Bubbles"],
      ["sir_humphrey_proboscis.webp", "/media/heroes/transparent/", "008", "ハンフリー", "Humphrey"]
    ];
    var html = "<section class=\"sticker-showcase\"><h2>" + (language === "en" ? "Look who you can collect!" : "こんなキャラクターが集められるよ！") + "</h2>";
    html += "<p>" + (language === "en" ? "Digital sticker rewards for a shop visit. They belong in the album, not on the page as decoration." : "来店のごほうびになるデジタルステッカーです。ページの飾りではなく、コレクション帳に入ります。") + "</p><ul class=\"sticker-row\">";
    people.forEach(function (person) {
      html += "<li><img src=\"" + person[1] + person[0] + "\" alt=\"\"><span>No. " + person[2] + "<br>" + (language === "en" ? person[4] : person[3]) + "</span></li>";
    });
    return html + "</ul></section>";
  }

  function block(title, body) {
    return "<section class=\"card\"><h2>" + title + "</h2>" + body + "</section>";
  }

  function paint() {
    var tier = tierById(current);
    var f = tier.features;
    var look = f.puzzle ? "card distinctive" : (f.enhanced ? "card enhanced" : "card");
    var html = "";
    html += "<p><span class=\"badge\">" + text.fictional + "</span></p>";
    html += "<section class=\"story\"><h2>" + text.storyTitle + "</h2><p>" + text.storyBody + "</p><p>" + text.storyVisit + "</p>";
    html += "<ol class=\"steps\"><li>" + text.stepVisit + "</li><li>" + text.stepScan + "</li><li>" + text.stepSticker + "</li></ol>";
    html += "<p>" + text.storyClose + "</p><p class=\"easy\">" + text.storyEasy + "</p></section>";
    html += stickerStrip(lang);
    html += "<p class=\"offer\">" + text.offer + "</p>";
    html += "<div class=\"selector\" role=\"group\" aria-label=\"" + text.demo + "\">";
    tiers.forEach(function (item) {
      var pressed = item.id === tier.id;
      html += "<button type=\"button\" data-tier=\"" + item.id + "\" aria-pressed=\"" + pressed + "\"><strong>" + t(item.label) + "</strong><br>" + t(item.price);
      if (item.preparing) html += "<br><small>" + text.preparing + "</small>";
      html += "</button>";
    });
    html += "</div>";
    html += "<div class=\"plans\">";
    tiers.forEach(function (item) {
      html += "<section class=\"plan" + (item.id === tier.id ? " is-on" : "") + "\"><h2>" + t(item.label) + "</h2><p class=\"price\">" + t(item.price) + "</p><ul>";
      t(item.points).forEach(function (point) { html += "<li>" + point + "</li>"; });
      html += "</ul></section>";
    });
    html += "</div><p class=\"choose\">" + text.choose + "</p>";
    html += "<section class=\"guarantee\"><h2>" + text.guaranteeTitle + "</h2><p>" + text.guarantee + "</p><p>" + text.noLock + "</p><p>" + text.noCharge + "</p><p>" + text.later + "</p></section>";
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
    if (card) html += "<p class=\"status\">" + (lang === "en" ? "Postcard " : "はがき ") + card + "</p>";
    html += "<section class=\"status\"><h2>" + text.nowTitle + "</h2><ul>";
    text.nowItems.forEach(function (item) { html += "<li>" + item + "</li>"; });
    html += "</ul><h2>" + text.showTitle + "</h2><ul>";
    text.showItems.forEach(function (item) { html += "<li>" + item + "</li>"; });
    html += "</ul><h2>" + text.laterTitle + "</h2><ul>";
    text.laterItems.forEach(function (item) { html += "<li>" + item + "</li>"; });
    html += "</ul><p>" + text.noCharge + "</p></section>";
    root.innerHTML = html;
    root.querySelectorAll("[data-tier]").forEach(function (button) {
      button.addEventListener("click", function () {
        current = button.getAttribute("data-tier");
        paint();
      });
    });
  }

  paint();
})();

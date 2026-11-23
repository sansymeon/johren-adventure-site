/**
 * Static prefecture slug → region map for the discovery map.
 * Does not rewrite MAP_DATA. Outlier area slugs alias onto a canonical prefecture.
 */
(function (global) {
  "use strict";

  var REGIONS = [
    { id: "hokkaido", ja: "北海道", en: "Hokkaido" },
    { id: "tohoku", ja: "東北", en: "Tohoku" },
    { id: "kanto", ja: "関東", en: "Kanto" },
    { id: "chubu", ja: "中部", en: "Chubu" },
    { id: "kansai", ja: "関西", en: "Kansai" },
    { id: "chugoku", ja: "中国", en: "Chugoku" },
    { id: "shikoku", ja: "四国", en: "Shikoku" },
    { id: "kyushu", ja: "九州", en: "Kyushu" },
    { id: "okinawa", ja: "沖縄", en: "Okinawa" }
  ];

  function pref(region, ja, en) {
    return { region: region, ja: ja, en: en };
  }

  var PREFECTURES = {
    hokkaido: pref("hokkaido", "北海道", "Hokkaido"),
    aomori: pref("tohoku", "青森", "Aomori"),
    iwate: pref("tohoku", "岩手", "Iwate"),
    miyagi: pref("tohoku", "宮城", "Miyagi"),
    akita: pref("tohoku", "秋田", "Akita"),
    yamagata: pref("tohoku", "山形", "Yamagata"),
    fukushima: pref("tohoku", "福島", "Fukushima"),
    ibaraki: pref("kanto", "茨城", "Ibaraki"),
    tochigi: pref("kanto", "栃木", "Tochigi"),
    gunma: pref("kanto", "群馬", "Gunma"),
    saitama: pref("kanto", "埼玉", "Saitama"),
    chiba: pref("kanto", "千葉", "Chiba"),
    tokyo: pref("kanto", "東京", "Tokyo"),
    kanagawa: pref("kanto", "神奈川", "Kanagawa"),
    niigata: pref("chubu", "新潟", "Niigata"),
    toyama: pref("chubu", "富山", "Toyama"),
    ishikawa: pref("chubu", "石川", "Ishikawa"),
    fukui: pref("chubu", "福井", "Fukui"),
    yamanashi: pref("chubu", "山梨", "Yamanashi"),
    nagano: pref("chubu", "長野", "Nagano"),
    gifu: pref("chubu", "岐阜", "Gifu"),
    shizuoka: pref("chubu", "静岡", "Shizuoka"),
    aichi: pref("chubu", "愛知", "Aichi"),
    mie: pref("kansai", "三重", "Mie"),
    shiga: pref("kansai", "滋賀", "Shiga"),
    kyoto: pref("kansai", "京都", "Kyoto"),
    osaka: pref("kansai", "大阪", "Osaka"),
    hyogo: pref("kansai", "兵庫", "Hyogo"),
    nara: pref("kansai", "奈良", "Nara"),
    wakayama: pref("kansai", "和歌山", "Wakayama"),
    tottori: pref("chugoku", "鳥取", "Tottori"),
    shimane: pref("chugoku", "島根", "Shimane"),
    okayama: pref("chugoku", "岡山", "Okayama"),
    hiroshima: pref("chugoku", "広島", "Hiroshima"),
    yamaguchi: pref("chugoku", "山口", "Yamaguchi"),
    tokushima: pref("shikoku", "徳島", "Tokushima"),
    kagawa: pref("shikoku", "香川", "Kagawa"),
    ehime: pref("shikoku", "愛媛", "Ehime"),
    kochi: pref("shikoku", "高知", "Kochi"),
    fukuoka: pref("kyushu", "福岡", "Fukuoka"),
    saga: pref("kyushu", "佐賀", "Saga"),
    nagasaki: pref("kyushu", "長崎", "Nagasaki"),
    kumamoto: pref("kyushu", "熊本", "Kumamoto"),
    oita: pref("kyushu", "大分", "Oita"),
    miyazaki: pref("kyushu", "宮崎", "Miyazaki"),
    kagoshima: pref("kyushu", "鹿児島", "Kagoshima"),
    okinawa: pref("okinawa", "沖縄", "Okinawa"),
    itoshima: { region: "kyushu", aliasOf: "fukuoka", ja: "糸島", en: "Itoshima" },
    kobe: { region: "kansai", aliasOf: "hyogo", ja: "神戸", en: "Kobe" },
    nagoya: { region: "chubu", aliasOf: "aichi", ja: "名古屋", en: "Nagoya" },
    tokuyama: { region: "chugoku", aliasOf: "yamaguchi", ja: "徳山", en: "Tokuyama" }
  };

  function lang() {
    return window.TURBO_I18N && TURBO_I18N.lang() === "en" ? "en" : "ja";
  }

  function label(entry) {
    if (!entry) return "";
    return lang() === "en" ? entry.en : entry.ja;
  }

  function canonical(slug) {
    var entry = PREFECTURES[slug];
    if (!entry) return slug || "";
    return entry.aliasOf || slug;
  }

  function regionOf(slug) {
    var entry = PREFECTURES[slug];
    return entry ? entry.region : "";
  }

  function inRegion(slug, regionId) {
    return !!regionId && regionOf(slug) === regionId;
  }

  function matchesPrefecture(slug, prefectureId) {
    if (!prefectureId) return true;
    return canonical(slug) === prefectureId;
  }

  function prefecturesIn(regionId) {
    return Object.keys(PREFECTURES).filter(function (slug) {
      var entry = PREFECTURES[slug];
      return entry.region === regionId && !entry.aliasOf;
    });
  }

  global.TURBO_REGIONS = {
    REGIONS: REGIONS,
    PREFECTURES: PREFECTURES,
    label: label,
    canonical: canonical,
    regionOf: regionOf,
    inRegion: inRegion,
    matchesPrefecture: matchesPrefecture,
    prefecturesIn: prefecturesIn
  };
})(window);

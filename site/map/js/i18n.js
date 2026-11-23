/**
 * Japanese is the default for every visitor. The English page sets lang="en".
 * Browser language is not consulted.
 */
(function (global) {
  "use strict";

  var STRINGS = {
    ja: {
      gpsButton: "GPSでチェックイン",
      gpsWorking: "位置を確認しています…",
      gpsMeasuring: "位置を測定しています…",
      gpsBest: "いま一番よい精度: {n}",
      gpsBestWait: "精度はまだ出ていません",
      gpsRetry: "再試行",
      gpsDenied: "位置情報の利用が許可されていません。ブラウザの設定で許可してから、もう一度お試しください。",
      gpsTimeout: "位置情報の取得が時間内に終わりませんでした。もう一度お試しください。",
      gpsFail: "位置情報を取得できませんでした。電波のよい場所で、もう一度お試しください。",
      gpsUnsupported: "このブラウザは位置情報に対応していません。",
      gpsInsecure: "位置情報を使うには、HTTPSで開く必要があります。",
      gpsUncertain: "位置の精度が足りません（誤差およそ{n}）。空が開けた場所で、もう一度お試しください。",
      gpsFar: "およそ{n}離れています。もう少し近づいてから、もう一度お試しください。",
      stationOwned: "この駅はチェックイン済みです！",
      airportOwned: "この空港はチェックイン済みです！",
      stationSuccess: "{name}にチェックインしました。鉄道パズル {pieces}/{need}（{level}ピース）。",
      airportSuccess: "{name}にチェックインしました。空港コレクション {count}。",
      puzzleFinished: "{name}にチェックインしました。鉄道パズルはいちばん上まで完成しています。",
      diagStation: "駅名",
      diagDistance: "距離",
      diagAccuracy: "精度",
      diagRadius: "許可範囲",
      diagResult: "結果",
      diagCollected: "取得済み",
      diagYes: "はい",
      diagNo: "いいえ",
      resultOk: "成功",
      resultFar: "範囲外",
      resultUncertain: "精度不足",
      resultOwned: "チェックイン済み",
      filterRailway: "鉄道駅",
      filterAirport: "空港",
      filterCultural: "文化スポット",
      filterScenic: "絶景・自然",
      filterTurbo: "ターボスポット",
      statusExplore: "地図の地点 {n}",
      statusTurbo: "発見スポット {n}",
      collectionButton: "コレクション",
      collectionTitle: "コレクション",
      collectionClose: "マップに戻る",
      railwayHeading: "鉄道パズル",
      railwayProgress: "{pieces} / {need}",
      stationsCollected: "集めた駅 {n}",
      railwayDone: "50ピースパズルが完成しました。",
      railwayEmpty: "まだ駅はありません。",
      airportHeading: "空港",
      airportProgress: "{count} か所",
      airportEmpty: "まだ空港はありません。",
      placeholderNote: "この絵は仮のターボです。パズル用の絵に差し替えます。",
      completedHeading: "完成した鉄道パズル",
      laterLevelNote: "この段階の絵はまだありません。進み具合だけ表示しています。",
      puzzleAlt: "鉄道パズル（5ピース）",
      resetTest: "テストデータを消す",
      resetDone: "この端末のコレクションを消しました。",
      airportSheet: "旅客ターミナルでのチェックインです。鉄道の駅とは別のコレクションです。",
      stationLine: "路線: {line}",
      stageTemp: "仮のステージ"
    },
    en: {
      gpsButton: "GPS check-in",
      gpsWorking: "Checking your location…",
      gpsMeasuring: "Measuring your location…",
      gpsBest: "Best accuracy so far: {n}",
      gpsBestWait: "Accuracy is not available yet",
      gpsRetry: "Try again",
      gpsDenied: "Location is not allowed. Permit it in the browser settings, then try again.",
      gpsTimeout: "Location took too long. Please try again.",
      gpsFail: "Location could not be read. Try again with a clearer sky.",
      gpsUnsupported: "This browser cannot read location.",
      gpsInsecure: "Location needs this page to be opened over HTTPS.",
      gpsUncertain: "The location is too uncertain (about {n}). Try again in a more open place.",
      gpsFar: "You are about {n} away. Come a little closer and try again.",
      stationOwned: "この駅はチェックイン済みです！",
      airportOwned: "This airport is already checked in.",
      stationSuccess: "Checked in at {name}. Railway puzzle {pieces}/{need} ({level} pieces).",
      airportSuccess: "Checked in at {name}. Airports collected: {count}.",
      puzzleFinished: "Checked in at {name}. The railway puzzle ladder is complete.",
      diagStation: "Station",
      diagDistance: "Distance",
      diagAccuracy: "Accuracy",
      diagRadius: "Allowed radius",
      diagResult: "Result",
      diagCollected: "Already collected",
      diagYes: "Yes",
      diagNo: "No",
      resultOk: "Successful",
      resultFar: "Outside range",
      resultUncertain: "Insufficient accuracy",
      resultOwned: "Already checked in",
      filterRailway: "Railway Stations",
      filterAirport: "Airports",
      filterCultural: "Cultural Spots",
      filterScenic: "Scenic & Nature",
      filterTurbo: "Turbo Spots",
      statusExplore: "{n} mapped locations",
      statusTurbo: "{n} adventures",
      collectionButton: "Collection",
      collectionTitle: "Collection",
      collectionClose: "Back to map",
      railwayHeading: "Railway puzzle",
      railwayProgress: "{pieces} / {need}",
      stationsCollected: "Stations collected {n}",
      railwayDone: "The 50-piece puzzle is complete.",
      railwayEmpty: "No stations yet.",
      airportHeading: "Airports",
      airportProgress: "{count} collected",
      airportEmpty: "No airports yet.",
      placeholderNote: "This picture is a temporary Turbo portrait. A puzzle illustration will replace it.",
      completedHeading: "Completed railway puzzles",
      laterLevelNote: "This level does not have its own picture yet. Only the count is shown.",
      puzzleAlt: "Railway puzzle (5 pieces)",
      resetTest: "Clear test data",
      resetDone: "Collection data on this device was cleared.",
      airportSheet: "Check in at the passenger terminal. This is separate from railway stations.",
      stationLine: "Line: {line}",
      stageTemp: "Temporary stage"
    }
  };

  function lang() {
    var code = (document.documentElement.lang || "ja").toLowerCase();
    return STRINGS[code] ? code : "ja";
  }

  function t(key, vars) {
    var text = (STRINGS[lang()] && STRINGS[lang()][key]) || STRINGS.ja[key] || key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (_, name) {
      return vars[name] == null ? "" : String(vars[name]);
    });
  }

  global.TURBO_I18N = { t: t, lang: lang };
})(window);

/**
 * Showcase tiers. Prices are proposed introductory amounts for display only.
 * Feature flags decide what the template shows. Pictures stay in merchant.js.
 */
window.TURBO_MERCHANT_TIERS = [
  {
    id: "free",
    label: { ja: "無料掲載", en: "Free" },
    price: { ja: "0円", en: "¥0" },
    points: {
      ja: ["ゴールドの店舗マップピン", "基本的な店舗情報", "店舗の写真", "ランダムに割り当てられるコレクションキャラクター"],
      en: ["Gold merchant map pin", "Basic shop information", "Shop photograph", "A randomly assigned collectible character"]
    },
    features: {
      intro: true,
      hours: true,
      map: true,
      line: true,
      restaurant: true
    }
  },
  {
    id: "standard",
    preparing: true,
    label: { ja: "スタンダード", en: "Standard" },
    price: { ja: "月額500円（税込）", en: "¥500 per month, tax included" },
    points: {
      ja: ["無料掲載の内容", "紹介ページの充実", "コレクションキャラクターをお店で選択"],
      en: ["Everything in Free", "A fuller shop introduction", "The shop chooses its collectible character"]
    },
    features: {
      intro: true,
      enhanced: true,
      hours: true,
      map: true,
      line: true,
      restaurant: true,
      collectible: true
    }
  },
  {
    id: "premium",
    preparing: true,
    label: { ja: "プレミアム", en: "Premium" },
    price: { ja: "月額1,000円（税込）", en: "¥1,000 per month, tax included" },
    points: {
      ja: ["スタンダードの内容", "オリジナルQRポスター", "ターボ・アドベンチャーズの絵を使った月間カレンダー", "5ピースの応援パズル", "パズル完成時の花火のお祝い", "お店自身のウェブサイトへのリンク"],
      en: ["Everything in Standard", "A custom QR poster", "A monthly calendar using Turbo Adventures artwork", "A sponsored five-piece puzzle", "A fireworks celebration when the puzzle is completed", "A link to the shop’s own website"]
    },
    features: {
      intro: true,
      enhanced: true,
      hours: true,
      map: true,
      line: true,
      restaurant: true,
      website: true,
      qrPoster: true,
      collectible: true,
      calendar: true,
      puzzle: true
    }
  }
];

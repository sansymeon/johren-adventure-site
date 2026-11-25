/**
 * Showcase tiers. Prices are not shown. Payments and subscriptions are not active.
 * Feature flags decide what the template shows. Pictures stay in merchant.js.
 */
window.TURBO_MERCHANT_TIERS = [
  {
    id: "free",
    label: { ja: "無料掲載", en: "Free listing" },
    features: {
      intro: true,
      hours: true,
      map: true,
      line: true
    }
  },
  {
    id: "standard",
    preparing: true,
    label: { ja: "スタンダード", en: "Standard" },
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

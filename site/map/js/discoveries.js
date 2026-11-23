/**
 * Turbo Adventures — Discovery layer (prototype only)
 *
 * mapped location  ≠  discovery location  ≠  merchant
 *
 * Stage images:
 *   - Absolute paths under ./media/stages/ (prototype only)
 *   - itoshima_cafe.png is a symlink to existing Turbo artwork (not a copy of the catalogue)
 *   - Placeholders are labelled and must not be treated as destination photographs
 *
 * Future collectible compatibility (not persisted yet):
 *   player_id, character_id, collectible_instance_id,
 *   background ownership, qr_location_id
 */
(function (global) {
  "use strict";

  const STAGE_ITOSHIIMA = "./media/stages/placeholder-stage.svg";
  const STAGE_PLACEHOLDER = "./media/stages/placeholder-stage.svg";

  const REGIONS = {
    fukuoka: {
      id: "fukuoka",
      label: "Fukuoka",
      labelJa: "福岡",
      unlocked: true
    },
    itoshima: {
      id: "itoshima",
      label: "Itoshima",
      labelJa: "糸島",
      unlocked: true
    },
    furuyu: {
      id: "furuyu",
      label: "Furuyu",
      labelJa: "古湯",
      unlocked: false,
      note: "Rural pilot candidate — inactive until mapped location + approved artwork exist."
    }
  };

  /**
   * Demonstration discoveries. Coordinates always resolve from MAP_DATA at runtime.
   */
  const DISCOVERIES = [
    {
      qr_location_id: "turbo_disc_maebaru",
      mapped_location_id: "chikuhi_chikuzen_maebaru",
      region_id: "itoshima",
      active: true,
      stage_image: STAGE_ITOSHIIMA,
      stage_image_kind: "turbo_artwork",
      stage_title: "Itoshima Café Stage",
      stage_description:
        "A warm café terrace overlooking Itoshima. Preview the scenic stage awaiting travellers who visit Chikuzen-Maebaru.",
      background_reward_id: "bg_itoshima_cafe",
      character_reward_id: null,
      welcome_title: "Welcome to Chikuzen-Maebaru!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_itoshima_hub",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_hatae",
      mapped_location_id: "chikuhi_hatae",
      region_id: "itoshima",
      active: true,
      stage_image: STAGE_ITOSHIIMA,
      stage_image_kind: "turbo_artwork",
      stage_title: "Itoshima Scenic Stage",
      stage_description:
        "Hatae sits on the Chikuhi Line into Itoshima. This preview uses shared Itoshima scenic artwork — not a photograph of the station.",
      background_reward_id: "bg_itoshima_cafe",
      character_reward_id: null,
      welcome_title: "Welcome to Hatae!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_itoshima_east",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_kafuri",
      mapped_location_id: "chikuhi_kafuri",
      region_id: "itoshima",
      active: true,
      stage_image: STAGE_ITOSHIIMA,
      stage_image_kind: "turbo_artwork",
      stage_title: "Itoshima Scenic Stage",
      stage_description:
        "Kafuri is a quieter stop along the coast. Preview the Itoshima scenic stage travellers can unlock after visiting.",
      background_reward_id: "bg_itoshima_cafe",
      character_reward_id: null,
      welcome_title: "Welcome to Kafuri!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_itoshima_west",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_itoshima_high",
      mapped_location_id: "chikuhi_itoshimakoko_mae",
      region_id: "itoshima",
      active: true,
      stage_image: STAGE_ITOSHIIMA,
      stage_image_kind: "turbo_artwork",
      stage_title: "Itoshima Scenic Stage",
      stage_description:
        "Itoshimakoko-mae is a local stop near the high school. The stage preview uses Turbo Itoshima artwork for this demonstration.",
      background_reward_id: "bg_itoshima_cafe",
      character_reward_id: null,
      welcome_title: "Welcome to Itoshimakoko-mae!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_itoshima_school",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_meinohama",
      mapped_location_id: "chikuhi_meinohama",
      region_id: "fukuoka",
      active: true,
      stage_image: STAGE_PLACEHOLDER,
      stage_image_kind: "placeholder",
      stage_title: "Meinohama Stage — Coming Soon",
      stage_description:
        "Meinohama is the gateway between Fukuoka and Itoshima. A dedicated scenic stage will be added; this preview is a temporary placeholder.",
      background_reward_id: null,
      character_reward_id: null,
      welcome_title: "Welcome to Meinohama!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_fukuoka_gateway",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_hakata",
      mapped_location_id: "airport_hakata",
      region_id: "fukuoka",
      active: true,
      stage_image: STAGE_PLACEHOLDER,
      stage_image_kind: "placeholder",
      stage_title: "Hakata Stage — Coming Soon",
      stage_description:
        "Hakata is Fukuoka’s main hub. Destination artwork for this discovery is not ready yet — placeholder only.",
      background_reward_id: null,
      character_reward_id: null,
      welcome_title: "Welcome to Hakata!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_hakata_hub",
      merchant_id: null
    },
    {
      qr_location_id: "turbo_disc_tenjin",
      mapped_location_id: "airport_tenjin",
      region_id: "fukuoka",
      active: true,
      stage_image: STAGE_PLACEHOLDER,
      stage_image_kind: "placeholder",
      stage_title: "Tenjin Stage — Coming Soon",
      stage_description:
        "Tenjin is the heart of downtown Fukuoka. Scenic stage artwork will arrive later; this card uses a labelled placeholder.",
      background_reward_id: null,
      character_reward_id: null,
      welcome_title: "Welcome to Tenjin!",
      welcome_message: "You've discovered a new destination!",
      adventure_ref: "demo_tenjin",
      merchant_id: null
    }
  ];

  global.TURBO_DISCOVERY = {
    regions: REGIONS,
    discoveries: DISCOVERIES,
    activeDiscoveries() {
      return DISCOVERIES.filter((d) => d.active === true);
    },
    byQrId(id) {
      return DISCOVERIES.find((d) => d.qr_location_id === id) || null;
    }
  };
})(window);

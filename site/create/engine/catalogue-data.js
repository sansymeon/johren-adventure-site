/* Turbo Adventures Studio — local catalogue.
   Paths are relative to TAS.assetRoot. Original files are never renamed or rewritten.
   Publisher ownership and royalty metadata are stored on assets. Image files stay put.
   access values mean royalty status, not membership entitlement:
   free = royalty-free, premium = royalty-bearing, unclassified = undecided,
   private = authorized publishers only. Approved public catalogue art stays usable in the Studio for all publishers. */
(function () {
  const DEFAULT_PUBLISHER_ID = "sansymeon";

  const TAS = {
    assetRoot: "../turbo_adventure/",
    product: "Turbo Adventures Studio",
    brand: "Turbo Adventures",
    tagline: "Discover. Collect. Explore.",
    publisher: "SanSymeon Productions",
    formats: {
      portrait: { id: "portrait", label: "Portrait", width: 1080, height: 1920 },
      landscape: { id: "landscape", label: "Landscape", width: 1600, height: 900 }
    },
    exportJpegQuality: 0.9,
    accessLevels: ["unclassified", "free", "premium", "private"],
    accessLabels: {
      free: "Royalty-Free",
      premium: "Royalty-Bearing",
      unclassified: "Unclassified",
      private: "Private"
    },
    visibilityLevels: ["studio", "public", "private"],
    assetTypes: ["character", "background", "completed_scene"],
    publishers: [
      {
        id: DEFAULT_PUBLISHER_ID,
        name: "SanSymeon Productions",
        slug: "sansymeon",
        page: "publishers/sansymeon/",
        description: "Official Turbo Adventures publisher. Characters, photographs, and finished scenes for the Studio.",
        visibilityDefault: "studio",
        accessDefault: "unclassified"
      }
    ],
    backgroundCategories: [
      { id: "landmark", label: "Famous landmarks" },
      { id: "attraction", label: "Tourist attractions" },
      { id: "shop", label: "Shops and restaurants" },
      { id: "hotel", label: "Hotels" },
      { id: "museum", label: "Museums" },
      { id: "nature", label: "Natural scenery" },
      { id: "publisher", label: "Publisher-submitted photographs" }
    ],
    npcVariationPlan: [
      "Standing",
      "Walking",
      "Sitting",
      "Waving",
      "Shopping",
      "Taking photographs",
      "Looking surprised",
      "Business attire",
      "Casual clothing"
    ],
    artworkAliases: {
      dragon_greeting: "nibbles_dragon",
      dragon_soaring: "nibbles_dragon_soaring",
      captain_crumble: null,
      duchess_dazzle: null
    },
    characters: [],
    backgrounds: [],
    completedScenes: [],
    inventory: null
  };

  function catalogueMeta(assetType, extra) {
    const meta = {
      publisherId: DEFAULT_PUBLISHER_ID,
      assetType: assetType,
      access: "unclassified",
      visibility: "studio",
      approval: "approved"
    };
    const overrides = extra || {};
    Object.keys(overrides).forEach(function (key) {
      if (overrides[key] != null && overrides[key] !== "") meta[key] = overrides[key];
    });
    return meta;
  }

  function art(entry) {
    return Object.assign({
      alpha: true,
      extra: false,
      placeable: true,
      kind: "pose",
      status: "available"
    }, catalogueMeta("character"), entry);
  }

  function pose(id, label, file, width, height, extra) {
    return art(Object.assign({
      id: id,
      label: label,
      description: label,
      name: label,
      file: file,
      width: width,
      height: height
    }, extra || {}));
  }

  function record(spec) {
    const meta = catalogueMeta("character", {
      publisherId: spec.publisherId,
      access: spec.access,
      visibility: spec.visibility,
      approval: spec.approval
    });
    return Object.assign({
      id: spec.id,
      category: spec.category,
      name: spec.name,
      number: spec.number || "",
      description: spec.description,
      personality: spec.personality || "",
      creator: "SanSymeon Productions",
      license: spec.license,
      filesNote: spec.filesNote || "",
      referenceArtworkId: spec.referenceArtworkId,
      collectible: spec.category !== "npc",
      role: spec.role || (spec.category === "npc" ? "supporting" : "mascot"),
      ageGroup: spec.ageGroup || "",
      artworks: spec.artworks
    }, meta);
  }

  const mascotLicense = "Official character. SanSymeon Productions. The Scene Editor places these approved files and does not redraw them.";
  const childLicense = "Original child character. SanSymeon Productions. Individual approved views may be placed in scenes.";

  TAS.characters = [
    record({
      id: "turbo",
      category: "turbo",
      name: "Turbo",
      number: "32",
      description: "Flagship mascot. Adventurous turtle racer. His No. 32 identity stays on the official artwork.",
      personality: "Bold, cheerful, and always ready for the next lap.",
      license: mascotLicense,
      referenceArtworkId: "turbo_standing",
      artworks: [
        pose("turbo_standing", "Standing", "turbo/turbo_standing_transparent.png", 1122, 1402, { access: "free", description: "Standard pose, arms crossed." }),
        pose("turbo_running", "Running", "turbo/turbo_running_transparent.png", 1536, 1024, { access: "free" }),
        pose("turbo_running_2", "Running, alternate", "turbo/turbo_running_2_transparent.png", 1419, 1108, { access: "free", extra: true }),
        pose("turbo_trophy", "Trophy", "turbo/turbo_trophy_transparent.png", 1305, 1206, { access: "free", description: "Victory pose." }),
        pose("turbo_beach", "Beach", "turbo/turbo_beach_transparent.png", 1536, 1024, { access: "free", kind: "costume" }),
        pose("turbo_halloween", "Halloween", "turbo/turbo_halloween_transparent.png", 1295, 1215, { access: "free", kind: "costume" }),
        pose("turbo_christmas", "Christmas", "turbo/turbo_christmas.png", 1308, 1202, { access: "free", kind: "costume" }),
        pose("turbo_astronaut", "Astronaut", "turbo/turbo_astronaut_transparent.png", 1305, 1205, { access: "free", kind: "costume" }),
        pose("turbo_pirate", "Pirate", "turbo/turbo_pirate_transparent.png", 1305, 1205, { access: "free", kind: "costume" }),
        pose("turbo_tourist", "Tourist", "turbo/turbo_tourist_transparent.png", 1254, 1254, { access: "free", kind: "costume" }),
        pose("turbo_sherlock", "Detective", "turbo/turbo_sherlock_transparent.png", 1186, 1327, { access: "free", kind: "costume" }),
        pose("turbo_royal", "Royal", "turbo/turbo_royal_transparent.png", 1306, 1205, { access: "free", kind: "costume" }),
        pose("turbo_selfie", "Selfie", "turbo/turbo_selfie.png", 1254, 1254, { access: "free", alpha: true, description: "Selfie stick." }),
        pose("turbo_knight", "Knight", "turbo/turbo_knight.png", 1306, 1205, { access: "free", kind: "costume" }),
        pose("turbo_shopping", "Shopping", "turbo/turbo_shopper.png", 1306, 1205, { access: "free", kind: "costume", description: "Shopping bags. Stored as turbo_shopper.png." }),
        pose("turbo_confident", "Confident", "turbo/turbo_confident_transparent.png", 1122, 1402, { access: "free", extra: true }),
        pose("turbo_yukata_selfie", "Yukata selfie", "turbo/turbo_yukata_selfie_transparent.png", 1312, 1199, { kind: "costume", extra: true }),
        pose("turbo_christmas_selfie", "Christmas selfie", "turbo/turbo_chrismas_selfie.png", 1254, 1254, { access: "free", kind: "costume", description: "Christmas selfie. Stored as turbo_chrismas_selfie.png." }),
        pose("turbo_sherlock_selfie", "Detective selfie", "turbo/turbo_sherlock_selfie.png", 1254, 1254, { access: "free", kind: "costume" }),
        pose("turbo_sumo", "Sumo", "turbo/turbo_sumo.png", 1086, 1448, { access: "free", kind: "costume" }),
        pose("turbo_judo", "Judo", "turbo/turbo_judo.png", 1086, 1448, { access: "free", kind: "costume" }),
        pose("turbo_hakama", "Hakama", "turbo/turbo_hakama.png", 941, 1672, { kind: "costume" }),
        pose("turbo_hakama_hotspring", "Hakama, hot spring", "turbo/turbo_hakama_hotspring.png", 941, 1672, { kind: "costume" })
      ]
    }),
    record({
      id: "nibbles",
      category: "featured",
      name: "Nibbles the Dragon",
      description: "Playful green-blue dragon.",
      personality: "Friendly and energetic.",
      license: mascotLicense,
      filesNote: "",
      referenceArtworkId: "nibbles_dragon",
      artworks: [
        pose("nibbles_dragon", "Standing", "heroes/nibbles_dragon.png", 1306, 1205),
        pose("nibbles_dragon_soaring", "Soaring", "heroes/nibbles_dragon_soaring.png", 1254, 1254)
      ]
    }),
    record({
      id: "bubbles",
      category: "featured",
      name: "Bubbles",
      description: "Blue baby dragon. First collectible character for Turbo Adventures players.",
      personality: "Curious, gentle, and ready for adventure.",
      license: mascotLicense,
      filesNote: "Stored as heroes/bubbles.png.",
      referenceArtworkId: "bubbles",
      access: "free",
      artworks: [
        pose("bubbles", "Standing", "heroes/bubbles.png", 1201, 1310, { access: "free" })
      ]
    }),
    record({
      id: "captain-seagull",
      category: "featured",
      name: "Captain Seagull",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "captain_seagull_flying",
      artworks: [
        pose("captain_seagull_flying", "Flying", "heroes/captain_seagull_flying.png", 1774, 887),
        pose("captain_seagull_streamers", "Streamers", "heroes/captain_seagull_streamers.png", 1920, 819)
      ]
    }),
    record({
      id: "colonel-blunderbuss",
      category: "featured",
      name: "Colonel Blunderbuss",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "colonel_blunderbuss",
      artworks: [pose("colonel_blunderbuss", "Reference", "heroes/colonel_blunderbuss.png", 1254, 1254)]
    }),
    record({
      id: "crabby",
      category: "featured",
      name: "Crabby",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "crabby",
      artworks: [pose("crabby", "Reference", "heroes/crabby.png", 1536, 1024)]
    }),
    record({
      id: "dame-henrietta",
      category: "featured",
      name: "Dame Henrietta Cluckington",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "dame_henrietta_cluckington",
      artworks: [pose("dame_henrietta_cluckington", "Reference", "heroes/dame_henrietta_cluckington.png?v=20261102", 1160, 1355)]
    }),
    record({
      id: "emperor-penguin",
      category: "featured",
      name: "Emperor Penguin",
      description: "Flamboyant royal penguin.",
      personality: "Every arrival is a procession.",
      license: mascotLicense,
      referenceArtworkId: "emperor_penguin",
      artworks: [pose("emperor_penguin", "Court", "heroes/emperor_penguin.png", 1306, 1205)]
    }),
    record({
      id: "lady-petunia",
      category: "featured",
      name: "Lady Petunia Flutterby",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "lady_petunia_flutterby",
      artworks: [pose("lady_petunia_flutterby", "Reference", "heroes/lady_petunia_flutterby.png", 1306, 1205)]
    }),
    record({
      id: "madame-lola",
      category: "featured",
      name: "Madame Lola Flamingo",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "madame_lola_flamingo",
      artworks: [pose("madame_lola_flamingo", "Reference", "heroes/madame_lola_flamingo.png", 1060, 1484)]
    }),
    record({
      id: "mademoiselle-fifi",
      category: "featured",
      name: "Mademoiselle Fifi LaPlume",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "mademoiselle_fifi_laplume",
      artworks: [pose("mademoiselle_fifi_laplume", "Reference", "heroes/mademoiselle_fifi_laplume.png", 1199, 1312)]
    }),
    record({
      id: "octavius",
      category: "featured",
      name: "Octavius",
      description: "Featured mascot.",
      license: mascotLicense,
      filesNote: "",
      referenceArtworkId: "octavious",
      artworks: [pose("octavious", "Reference", "heroes/octavious.png", 1536, 1024)]
    }),
    record({
      id: "percival-quill",
      category: "featured",
      name: "Percival Quill",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "percival_quill",
      artworks: [pose("percival_quill", "Reference", "heroes/percival_quill.png", 1306, 1205)]
    }),
    record({
      id: "professor-puddles",
      category: "featured",
      name: "Professor Puddles",
      description: "Brilliant but forgetful owl.",
      personality: "Eager to explain everything, then misplace the map.",
      license: mascotLicense,
      referenceArtworkId: "professor_puddles",
      artworks: [pose("professor_puddles", "Lecturing", "heroes/professor_puddles.png", 512, 512)]
    }),
    record({
      id: "sergeant-hooves",
      category: "featured",
      name: "Sergeant Hooves",
      description: "Featured mascot.",
      license: mascotLicense,
      filesNote: "",
      referenceArtworkId: "sargeant_hooves",
      artworks: [pose("sargeant_hooves", "Reference", "heroes/sargeant_hooves.png", 1133, 1388)]
    }),
    record({
      id: "sharky",
      category: "featured",
      name: "Sharky",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "sharky",
      artworks: [pose("sharky", "Reference", "heroes/sharky.png", 1536, 1024)]
    }),
    record({
      id: "sir-reginald",
      category: "featured",
      name: "Sir Reginald Walrus",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "sir_reginald_walrus",
      artworks: [pose("sir_reginald_walrus", "Reference", "heroes/sir_reginald_walrus.png", 1122, 1402)]
    }),
    record({
      id: "sir-snooze",
      category: "featured",
      name: "Sir Snooze",
      description: "Sleepy, unexpectedly wise bear.",
      personality: "Half asleep, and still the one who knows the answer.",
      license: mascotLicense,
      referenceArtworkId: "sir_snooze",
      artworks: [pose("sir_snooze", "At rest", "heroes/sir_snooze.png", 1306, 1205)]
    }),
    record({
      id: "borneo-bruno",
      category: "featured",
      name: "Borneo Bruno",
      description: "Featured mascot.",
      license: mascotLicense,
      filesNote: "Stored as borneo_bruno.webp.",
      referenceArtworkId: "borneo_bruno",
      artworks: [pose("borneo_bruno", "Reference", "heroes/borneo_bruno.webp", 512, 512)]
    }),
    record({
      id: "captain-squawkbeard",
      category: "featured",
      name: "Captain Squawkbeard",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "captain_squawkbeard",
      artworks: [pose("captain_squawkbeard", "Reference", "heroes/captain_squawkbeard.png", 1086, 1448)]
    }),
    record({
      id: "hamish-mcwool",
      category: "featured",
      name: "Hamish McWool",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "hamish_mcwool",
      artworks: [pose("hamish_mcwool", "Reference", "heroes/hamish_mcwool.png", 1199, 1312)]
    }),
    record({
      id: "kiwi-charlie",
      category: "featured",
      name: "Kiwi Charlie",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "kiwi_charlie",
      artworks: [pose("kiwi_charlie", "Reference", "heroes/kiwi_charlie.png", 1199, 1312)]
    }),
    record({
      id: "monty-mcpuck",
      category: "featured",
      name: "Monty McPuck",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "monty_mcpuck",
      artworks: [pose("monty_mcpuck", "Reference", "heroes/monty_mcpuck.png", 1199, 1312)]
    }),
    record({
      id: "sir-humphrey-proboscis",
      category: "featured",
      name: "Sir Humphrey Proboscis",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "sir_humphrey_proboscis",
      artworks: [pose("sir_humphrey_proboscis", "Reference", "heroes/sir_humphrey_proboscis.png", 941, 1671)]
    }),
    child("jamie", "Jamie", [
      pose("jamie_front", "Front", "npc/jamie_front.png", 1024, 1536),
      pose("jamie_side", "Side", "npc/jamie_side.png", 1024, 1536),
      pose("jamie_back", "Back", "npc/jamie_back.png", 1024, 1536)
    ]),
    child("jordan", "Jordan", [
      pose("jordan_side", "Side", "npc/jordan_side.png", 1024, 1536),
      pose("jordon_right_side", "Right side", "npc/jordon_right_side.png", 1024, 1536, { description: "The file is spelled jordon_right_side.png." }),
      pose("jordan_back", "Back", "npc/jordan_back.png", 1024, 1536)
    ], "No front view is on disk."),
    child("rick", "Rick", [
      pose("rick_front", "Front", "npc/rick_front.png", 1024, 1536),
      pose("rick_side", "Walking", "npc/rick_side.png", 1199, 1312),
      pose("rick_hands_raised", "Hands raised", "npc/rick_hands_raised.png", 1199, 1312)
    ]),
    child("elena", "Elena", [
      pose("elena_front", "Front", "npc/elena_front.png", 1024, 1536),
      pose("elena_side", "Side", "npc/elena_side.png", 1024, 1536),
      pose("elena_back", "Back", "npc/elena_back.png", 1024, 1536)
    ]),
    child("mana", "Mana", [
      pose("mana_front", "Front", "npc/mana_front.png", 1024, 1536),
      pose("mana_side", "Side", "npc/mana_side.png", 1024, 1536),
      pose("mana_back", "Back", "npc/mana_back.png", 1024, 1536)
    ]),
    child("margarite", "Margarite", [
      pose("margarite_front", "Front", "npc/margarite_front.png", 1024, 1536),
      pose("margarite_left_side", "Left side", "npc/margarite_left_side.png", 1024, 1536),
      pose("margarite_right_side", "Right side", "npc/margarite_right_side.png", 1024, 1536),
      pose("margarite_back", "Back", "npc/margarite_back.png", 1024, 1536)
    ])
  ];

  // Royalty policy: free = royalty-free, premium = royalty-bearing.
  // Does not gate Studio placement. Membership tiers control credits later, not catalogue use.
  TAS.characters.forEach(function (character) {
    if (character.category === "featured") {
      character.access = "premium";
      character.artworks.forEach(function (artwork) {
        artwork.access = "premium";
      });
      return;
    }
    if (character.category === "npc") {
      character.access = "free";
      character.artworks.forEach(function (artwork) {
        artwork.access = "free";
      });
    }
  });

  // Public catalogue lists only placeable individual views. Production reference
  // sheets live in catalogue-production.js (admin-only load) and stay on disk.
  function child(id, name, views, filesNote) {
    const reference = views[0];
    return record({
      id: id,
      category: "npc",
      name: name,
      description: "Child supporting character. The mascots are the stars. Children populate a scene as visitors, friends, or customers.",
      license: childLicense,
      filesNote: filesNote || "",
      referenceArtworkId: reference.id,
      ageGroup: "child",
      role: "supporting",
      artworks: views
    });
  }

  TAS.ratioLabel = function (width, height) {
    const ratio = width / height;
    if (Math.abs(ratio - 9 / 16) < 0.02) return "9:16";
    if (Math.abs(ratio - 16 / 9) < 0.02) return "16:9";
    if (Math.abs(ratio - 3 / 4) < 0.02) return "3:4";
    return width + "×" + height;
  };

  function background(id, name, file, width, height, shape, category, extra) {
    const label = TAS.ratioLabel(width, height);
    const native = (shape === "portrait" && label === "9:16") || (shape !== "portrait" && label === "16:9");
    return Object.assign({
      id: id,
      name: name,
      category: category,
      description: native
        ? (shape === "portrait"
          ? "9:16 photograph for a portrait scene."
          : "16:9 photograph. Move and zoom it inside the portrait frame. The file is not cropped.")
        : label + " photograph. Move and zoom it inside the portrait frame. The file is not cropped.",
      shape: shape,
      creator: "SanSymeon Productions",
      license: "Publisher photograph for Turbo Adventures scenes. Kept separate from character artwork.",
      file: file,
      width: width,
      height: height,
      status: "available"
    }, catalogueMeta("background"), extra || {});
  }

  function completedScene(id, name, file, width, height, extra) {
    // galleryKind + merchantAuthorized are independent of editorial approval.
    // Merchant Puzzle Gallery requires explicit merchantAuthorized === true.
    // Public galleries load previewFile (≈360×640). Originals stay in completed_scenes/
    // and are not linked from public UI; local serve blocks direct original URLs.
    const stem = String(file || "").replace(/^completed_scenes\//, "").replace(/\.[^.]+$/, "");
    return Object.assign({
      id: id,
      name: name,
      file: file,
      previewFile: stem ? ("completed_scenes_previews/" + stem + ".jpg") : null,
      previewWidth: 360,
      previewHeight: 640,
      width: width,
      height: height,
      creator: "SanSymeon Productions",
      status: "available",
      galleryKind: "showcase",
      merchantAuthorized: false,
      publicDownload: false,
      license: "Showcase demonstration only. For viewing and inspiration. Not licensed for reuse, republication, download, or merchant sponsorship without explicit authorization."
    }, catalogueMeta("completed_scene"), extra || {});
  }

  TAS.backgrounds = [
    background("bg_afternoon_tea", "Afternoon Tea", "backgrounds/afternoon_tea_mobile.png", 941, 1672, "portrait", "shop", { access: "premium" }),
    background("bg_blackpool", "Blackpool", "backgrounds/blackpool_mobile.png", 941, 1672, "portrait", "nature", { access: "free" }),
    background("bg_boxing_stage", "Boxing / Martial Arts Stage", "backgrounds/boxing_stage_mobile.png", 941, 1672, "portrait", "attraction", { access: "free" }),
    background("bg_buckingham", "Buckingham Palace", "backgrounds/buckingham_mobile.png", 941, 1672, "portrait", "landmark", { access: "free" }),
    background("bg_cotswolds", "Cotswolds Village", "backgrounds/cottswolds_mobile.png", 941, 1672, "portrait", "nature"),
    background("bg_london", "London — Big Ben", "backgrounds/london_mobile.png", 941, 1672, "portrait", "landmark", { access: "premium" }),
    background("bg_ship", "Ship at Sea", "backgrounds/ship_at_sea_mobile.png", 941, 1672, "portrait", "nature", { access: "free" }),
    background("bg_performance_stage", "Performance Stage", "backgrounds/stage_mobile.png", 941, 1672, "portrait", "attraction", { access: "free" }),
    background("bg_windsor", "Windsor Castle", "backgrounds/windsor_mobile.png", 941, 1672, "portrait", "landmark"),
    background("bg_itoshima_cafe", "Itoshima Cafe", "backgrounds/itoshima_cafe.png", 941, 1672, "portrait", "shop"),
    background("bg_cotswolds_hotel", "Cotswolds Hotel", "backgrounds/cottswolds_hotel.png", 941, 1672, "portrait", "hotel"),
    background("bg_trafalgar", "Trafalgar", "backgrounds/trafalgar.png", 941, 1672, "portrait", "landmark", { access: "free" }),
    background("bg_taj_mahal", "Taj Mahal", "backgrounds/taj_mahal.png", 941, 1672, "portrait", "landmark", { access: "free" }),
    background("bg_new_zealand", "New Zealand Village", "backgrounds/new_zealand_village.png", 941, 1672, "portrait", "nature", { access: "free" }),
    background("bg_palace_monument", "Palace Monument", "backgrounds/palace_monument.png", 941, 1672, "portrait", "landmark", { access: "free" }),
    background("bg_jungle_stage", "Jungle Stage", "backgrounds/jungle_stage_mobile.png", 941, 1672, "portrait", "attraction"),
    background("bg_mt_fuji", "Mt. Fuji", "backgrounds/mt_fuji_mobile.png", 941, 1672, "portrait", "nature"),
    background("bg_buckingham_palace", "Buckingham Palace", "backgrounds/landscapes/buckingham.png", 1672, 941, "landscape", "landmark"),
    background("bg_windsor_castle", "Windsor Castle", "backgrounds/landscapes/windsor.png", 1672, 941, "landscape", "landmark"),
    background("bg_blackpool_beach", "Blackpool", "backgrounds/landscapes/blackpool.png", 1672, 941, "landscape", "nature"),
    background("bg_afternoon_tea_wide", "Afternoon Tea", "backgrounds/landscapes/afternoon_tea.png", 1672, 941, "landscape", "shop", { access: "premium" }),
    background("bg_boxing_stage_wide", "Boxing / Martial Arts Stage", "backgrounds/landscapes/boxing_stage.png", 1672, 941, "landscape", "attraction", { access: "free" }),
    background("bg_cotswolds_wide", "Cotswolds Village", "backgrounds/landscapes/cottswolds.png", 1672, 941, "landscape", "nature"),
    background("bg_london_wide", "London — Big Ben", "backgrounds/landscapes/london.png", 1672, 941, "landscape", "landmark", { access: "premium" }),
    background("bg_ship_wide", "Ship at Sea", "backgrounds/landscapes/ship_at_sea.png", 1672, 941, "landscape", "nature", { access: "free" }),
    background("bg_performance_stage_wide", "Performance Stage", "backgrounds/landscapes/stage.png", 1672, 941, "landscape", "attraction", { access: "free" }),
    background("bg_trafalgar_wide", "Trafalgar", "backgrounds/landscapes/trafalgar.png", 1672, 941, "landscape", "landmark", { access: "free" }),
    background("bg_taj_mahal_wide", "Taj Mahal", "backgrounds/landscapes/taj_mahal.png", 1672, 941, "landscape", "landmark", { access: "free" }),
    background("bg_new_zealand_wide", "New Zealand Village", "backgrounds/landscapes/new_zealand_village.png", 1672, 941, "landscape", "nature", { access: "free" }),
    background("bg_palace_monument_wide", "Palace Monument", "backgrounds/landscapes/palace_monument.png", 1672, 941, "landscape", "landmark", { access: "free" }),
    background("bg_jungle_stage_wide", "Jungle Stage", "backgrounds/landscapes/jungle_stage.png", 1671, 941, "landscape", "attraction"),
    background("bg_itoshima_cafe_wide", "Itoshima Cafe", "backgrounds/landscapes/itoshima_cafe.png", 1672, 941, "landscape", "shop"),
    background("bg_cotswolds_hotel_wide", "Cotswolds Hotel", "backgrounds/landscapes/cottswolds_hotel.png", 1672, 941, "landscape", "hotel"),
    background("bg_mt_fuji_wide", "Mt. Fuji", "backgrounds/landscapes/mt_fuji.png", 1671, 941, "landscape", "nature")
  ];

  TAS.completedScenes = [
    completedScene("full_turbo_champion", "Turbo Champion", "completed_scenes/turbo_champion.png", 941, 1672),
    completedScene("full_turbo_confident", "Turbo Confident", "completed_scenes/turbo_confident.png", 941, 1672),
    completedScene("full_turbo_race", "Turbo Race", "completed_scenes/turbo_race.png", 941, 1672),
    completedScene("full_turbo_yufuin", "Turbo Yufuin", "completed_scenes/turbo_yufuin.png", 941, 1672),
    completedScene("full_turbo_christmas", "Turbo Christmas", "completed_scenes/turbo_christmas.png", 941, 1672),
    completedScene("full_buckingham_airshow", "Buckingham Airshow", "completed_scenes/buckingham_airshow.png", 941, 1672),
    completedScene("full_blackpool_beach", "Blackpool Beach", "completed_scenes/blackpool_beach.png", 1080, 1920),
    completedScene("full_blackpool_christmas", "Blackpool Christmas", "completed_scenes/blackpool_christmas.png", 941, 1672),
    completedScene("full_blackpool_sandcastle", "Blackpool Sandcastle", "completed_scenes/blackpool_sandcastle.png", 1080, 1920),
    completedScene("full_fifi_turbo", "Fifi & Turbo", "completed_scenes/fifi_turbo.png", 1080, 1920),
    completedScene("full_henrieta_afternoon_tea", "Henrietta Afternoon Tea", "completed_scenes/henrieta_afternoon_tea.png", 1080, 1920, {
      galleryKind: "merchant_puzzle",
      merchantAuthorized: true,
      license: "Authorized for commercial merchant sponsorship of this scene only. Not freely downloadable. Stored as henrieta_afternoon_tea.png."
    }),
    completedScene("full_turbo_cottswolds", "Turbo Cotswolds", "completed_scenes/turbo_cottswolds.png", 1080, 1920, {
      galleryKind: "merchant_puzzle",
      merchantAuthorized: true,
      license: "Authorized for commercial merchant sponsorship of this scene only. Not freely downloadable. Stored as turbo_cottswolds.png."
    })
  ];

  TAS.inventory = {
    scanned: "2026-11-02",
    folder: "turbo_adventure/",
    notes: [
      "Captain Crumble was removed. The file heroes/captain_crumble.png was a duplicate and is no longer in the collection.",
      "Duchess Dazzle is not in the current heroes folder.",
      "Turbo has 23 illustrations in turbo/. turbo_shopping uses turbo_shopper.png. The Christmas selfie is stored as turbo_chrismas_selfie.png.",
      "turbo_selfie.png is a transparent cutout.",
      "Jordan has side, right side, and back views. There is no front file. The right-side file is spelled jordon_right_side.png.",
      "Sergeant Hooves is stored as sargeant_hooves.png. Octavius is stored as octavious.png. Cotswolds Village is stored as cottswolds_mobile.png.",
      "New heroes: Borneo Bruno (borneo_bruno.webp), Captain Squawkbeard, Hamish McWool, Kiwi Charlie, Monty McPuck, Sir Humphrey Proboscis. Captain Seagull also has captain_seagull_streamers.png.",
      "NPC production reference sheets are kept on disk for internal use and are not listed in the public catalogue. Admin Centre can load them via catalogue-production.js.",
      "Portrait backgrounds are 941×1672. Cotswolds Hotel is stored as cottswolds_hotel.png. Landscape alternates live in backgrounds/landscapes/. Newer paired places include Jungle Stage and Mt. Fuji (mt_fuji_mobile.png / landscapes/mt_fuji.png).",
      "Showcase and Merchant galleries display ≈360×640 JPEG previews from completed_scenes_previews/. Originals remain in completed_scenes/ and are blocked from public URL access on the local Studio server. Full commercial delivery needs private storage and signed, scene-scoped authorization later.",
      "Catalogue Phase 1: official assets belong to publisher sansymeon (SanSymeon Productions). Access means royalty status (royalty-free / royalty-bearing / unclassified / private), not membership entitlement. Visibility is separate. Public publisher pages list only visibility public.",
      "Royalty-Free backgrounds: bg_blackpool, bg_boxing_stage, bg_buckingham (9:16 only), bg_ship, bg_performance_stage, bg_trafalgar, bg_taj_mahal, bg_new_zealand, bg_palace_monument. Royalty-Bearing backgrounds: bg_london, bg_afternoon_tea (Afternoon Tea). Other backgrounds remain unclassified for now, including Itoshima Cafe, Cotswolds Hotel, Jungle Stage, and Mt. Fuji.",
      "Turbo is royalty-free except reserved yukata / hot spring costumes left unclassified: turbo_yukata_selfie, turbo_hakama, turbo_hakama_hotspring. Sumo and Judo are royalty-free. Named Heroes are royalty-bearing. Standard NPC children are royalty-free. Approved public catalogue art remains usable in the Studio for all publishers."
    ]
  };

  TAS.adventureUrl = function (file) {
    if (window.TURBO_CREATOR_ASSET_BASE) return window.TURBO_CREATOR_ASSET_BASE + file;
    var path = location.pathname || "";
    var marker = "/turbo-adventures-studio";
    var index = path.indexOf(marker);
    if (index === -1) return "turbo_adventure/" + file;
    var after = path.slice(index + marker.length).replace(/^\//, "");
    var segments = after.split("/").filter(Boolean);
    if (segments.length && /\.[a-z0-9]+$/i.test(segments[segments.length - 1])) segments.pop();
    var up = segments.length + 1;
    return new Array(up + 1).join("../") + "turbo_adventure/" + file;
  };

  TAS.fileUrl = function (file) {
    return TAS.adventureUrl(file);
  };

  // Lightweight Choose Assets previews. Masters stay at fileUrl(); thumbs are built by
  // scripts/build_catalogue_thumbs.py into turbo_adventure/catalogue_thumbs/.
  TAS.thumbUrl = function (file) {
    var clean = String(file == null ? "" : file).split("?")[0];
    var thumb = clean.replace(/\.[^.\/]+$/, "") + ".webp";
    return TAS.adventureUrl("catalogue_thumbs/" + thumb);
  };

  TAS.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  TAS.defaultHeight = function (artwork, format) {
    const ratio = artwork.width / artwork.height;
    const portrait = format !== "landscape";
    if (portrait) {
      if (ratio > 1.35) return 28;
      if (ratio > 1.05) return 34;
      return 40;
    }
    if (ratio > 1.35) return 38;
    if (ratio > 1.05) return 46;
    return 54;
  };

  // Same placement the Studio uses when a drawing is added to a scene.
  TAS.newLayer = function (scene, artwork) {
    const count = (scene.layers || []).length;
    const portrait = !scene.format || scene.format !== "landscape";
    return {
      id: TAS.uid(),
      artworkId: artwork.id,
      x: TAS.clamp(50 + ((count % 3) - 1) * 16, -20, 120),
      y: portrait ? 74 : 62,
      heightPct: TAS.defaultHeight(artwork, scene.format),
      flip: false,
      rotation: 0,
      shadow: true
    };
  };

  TAS.exportSize = function (format) {
    if (format === "landscape") return TAS.formats.landscape;
    return TAS.formats.portrait;
  };

  // Completed / gallery scenes must be portrait for public publishing selections.
  TAS.isPortraitPublishableScene = function (scene) {
    if (!scene) return false;
    const width = Number(scene.width) || 0;
    const height = Number(scene.height) || 0;
    if (width > 0 && height > 0 && width > height) return false;
    if (scene.shape === "landscape") return false;
    const label = width && height ? TAS.ratioLabel(width, height) : "";
    if (label === "16:9") return false;
    return true;
  };

  TAS.backgroundFrame = function (frameW, frameH, imgW, imgH, scale, focusX, focusY) {
    const safeScale = scale > 0 ? scale : 1;
    const cover = Math.max(frameW / imgW, frameH / imgH);
    let drawW = imgW * cover * safeScale;
    let drawH = imgH * cover * safeScale;
    if (drawW < frameW || drawH < frameH) {
      const bump = Math.max(frameW / drawW, frameH / drawH);
      drawW *= bump;
      drawH *= bump;
    }
    let x = frameW * 0.5 - ((focusX == null ? 50 : focusX) / 100) * drawW;
    let y = frameH * 0.5 - ((focusY == null ? 50 : focusY) / 100) * drawH;
    const minX = frameW - drawW;
    const minY = frameH - drawH;
    if (x > 0) x = 0;
    if (y > 0) y = 0;
    if (x < minX) x = minX;
    if (y < minY) y = minY;
    return { x: x, y: y, drawW: drawW, drawH: drawH };
  };

  TAS.backgroundBox = function (layout) {
    const x = Math.floor(layout.x);
    const y = Math.floor(layout.y);
    return {
      x: x,
      y: y,
      drawW: Math.ceil(layout.x + layout.drawW) - x,
      drawH: Math.ceil(layout.y + layout.drawH) - y
    };
  };

  TAS.clamp = function (value, min, max) {
    const number = Number(value);
    if (Number.isNaN(number)) return min;
    return Math.min(max, Math.max(min, number));
  };

  TAS.uid = function () {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  };

  TAS.findCharacter = function (id) {
    return TAS.characters.find(function (character) {
      return character.id === id;
    }) || null;
  };

  TAS.resolveArtworkId = function (id) {
    if (Object.prototype.hasOwnProperty.call(TAS.artworkAliases, id)) return TAS.artworkAliases[id];
    return id;
  };

  TAS.findArtwork = function (id) {
    const resolved = TAS.resolveArtworkId(id);
    if (!resolved) return null;
    for (let i = 0; i < TAS.characters.length; i += 1) {
      const found = TAS.characters[i].artworks.find(function (artwork) {
        return artwork.id === resolved;
      });
      if (found) return { character: TAS.characters[i], artwork: found };
    }
    return null;
  };

  TAS.findBackground = function (id) {
    return TAS.backgrounds.find(function (background) {
      return background.id === id;
    }) || null;
  };

  TAS.findCompletedScene = function (id) {
    return TAS.galleryScenes().find(function (scene) {
      return scene.id === id;
    }) || null;
  };

  // Display title for a catalogue scene ID. Submission metadata is authoritative.
  TAS.displayNameForSceneId = function (id) {
    const scene = TAS.findCompletedScene(id);
    return scene && scene.name ? scene.name : "";
  };

  TAS.CATALOGUE_CHANNEL = "tas-catalogue";

  TAS.announceCatalogueChanged = function () {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        new BroadcastChannel(TAS.CATALOGUE_CHANNEL).postMessage({
          type: "catalogue-updated",
          at: Date.now()
        });
      }
    } catch (error) {
      // BroadcastChannel unavailable.
    }
    try {
      window.dispatchEvent(new CustomEvent("tas:catalogue-updated"));
    } catch (error) {
      // CustomEvent unavailable.
    }
  };

  var catalogueWatchStarted = false;
  TAS.ensureCatalogueWatch = function () {
    if (catalogueWatchStarted) return;
    catalogueWatchStarted = true;
    function reloadFromServer() {
      return Promise.all([
        TAS.loadPublishedSubmissionScenes(),
        TAS.loadCompletedSceneOverrides ? TAS.loadCompletedSceneOverrides() : Promise.resolve([])
      ]).then(function () {
        try {
          window.dispatchEvent(new CustomEvent("tas:catalogue-updated"));
        } catch (error) {
          // ignore
        }
        return TAS.publishedSubmissionScenes;
      });
    }
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(TAS.CATALOGUE_CHANNEL);
        channel.onmessage = function (event) {
          if (event && event.data && event.data.type === "catalogue-updated") {
            reloadFromServer();
          }
        };
      }
    } catch (error) {
      // ignore
    }
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") reloadFromServer();
    });
  };

  // Merchant Puzzle Gallery requires explicit rights-holder authorization.
  // Editorial catalogue approval alone is not enough.
  // Scenes may list in both galleries when galleries.showcase and galleries.merchantPuzzle are set.
  TAS.isMerchantPuzzleListed = function (scene) {
    if (!scene) return false;
    if (scene.approval && scene.approval !== "approved") return false;
    if (scene.visibility === "private") return false;
    if (scene.galleries && typeof scene.galleries.merchantPuzzle === "boolean") {
      return scene.galleries.merchantPuzzle === true && scene.merchantAuthorized === true;
    }
    return scene.merchantAuthorized === true;
  };

  TAS.isShowcaseListed = function (scene) {
    if (!scene) return false;
    if (scene.approval && scene.approval !== "approved") return false;
    if (scene.visibility === "private") return false;
    if (scene.galleries && typeof scene.galleries.showcase === "boolean") {
      return scene.galleries.showcase === true;
    }
    // Legacy static completed scenes: showcase unless merchant-only.
    if (scene.galleryKind === "merchant_puzzle" && scene.merchantAuthorized === true) {
      return false;
    }
    return true;
  };

  TAS.sceneImageUrl = function (scene) {
    if (!scene) return "";
    if (scene.imageUrl) return scene.imageUrl;
    if (scene.file) return TAS.fileUrl(scene.file);
    return "";
  };

  // Public gallery / puzzle selector URL: optimized preview only (not the original).
  TAS.scenePreviewUrl = function (scene) {
    if (!scene) return "";
    if (scene.imagePreviewUrl) return scene.imagePreviewUrl;
    if (scene.previewFile) return TAS.fileUrl(scene.previewFile);
    // Submission catalogue records may only expose the preview imageUrl.
    if (scene.source === "submission" && scene.imageUrl) return scene.imageUrl;
    return TAS.sceneImageUrl(scene);
  };

  // Published submissions appear in public galleries via metadata only — no image file copies.
  // Puzzle Merchant Mode and Merchant Puzzle Gallery both read isMerchantPuzzleListed(galleryScenes()).
  TAS.publishedSubmissionScenes = TAS.publishedSubmissionScenes || [];
  TAS.galleryScenes = function () {
    return (TAS.completedScenes || []).concat(TAS.publishedSubmissionScenes || []);
  };

  // Internal/dev only (?puzzleTest=1): static demonstration completed_scenes.
  TAS.puzzleTestScenes = function () {
    return (TAS.completedScenes || []).filter(function (scene) {
      return !TAS.isPortraitPublishableScene || TAS.isPortraitPublishableScene(scene);
    });
  };

  // Admin Puzzle Builder: same records as Merchant Puzzle Gallery — commercially authorized.
  TAS.puzzleMerchantScenes = function () {
    return TAS.galleryScenes().filter(function (scene) {
      if (!TAS.isMerchantPuzzleListed(scene)) return false;
      return !TAS.isPortraitPublishableScene || TAS.isPortraitPublishableScene(scene);
    });
  };

  TAS.loadPublishedSubmissionScenes = function () {
    var path = location.pathname || "";
    var base = path.indexOf("/turbo-adventures-studio") !== -1
      ? "/turbo-adventures-studio/api/catalogue/scenes"
      : "/api/catalogue/scenes";
    return fetch(base, { credentials: "same-origin", cache: "no-store" })
      .then(function (response) {
        if (!response.ok) return { ok: false, scenes: [] };
        return response.json().catch(function () { return { ok: false, scenes: [] }; });
      })
      .then(function (body) {
        // Server metadata is the source of display titles for published submissions.
        TAS.publishedSubmissionScenes = (body && body.ok && Array.isArray(body.scenes)) ? body.scenes : [];
        return TAS.publishedSubmissionScenes;
      })
      .catch(function () {
        TAS.publishedSubmissionScenes = [];
        return TAS.publishedSubmissionScenes;
      });
  };

  TAS.completedSceneOverrides = TAS.completedSceneOverrides || {};
  TAS.adminAuthenticated = false;

  TAS.apiBase = function (kind) {
    var path = location.pathname || "";
    var studio = path.indexOf("/turbo-adventures-studio") !== -1;
    if (kind === "admin") return studio ? "/turbo-adventures-studio/api/admin" : "/api/admin";
    return studio ? "/turbo-adventures-studio/api/catalogue" : "/api/catalogue";
  };

  TAS.checkAdminSession = function () {
    return fetch(TAS.apiBase("admin") + "/session", { credentials: "same-origin", cache: "no-store" })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          TAS.adminAuthenticated = !!(response.ok && body && body.authenticated);
          return TAS.adminAuthenticated;
        });
      })
      .catch(function () {
        TAS.adminAuthenticated = false;
        return false;
      });
  };

  TAS.applyCompletedSceneOverrides = function (overrides) {
    var map = {};
    (overrides || []).forEach(function (item) {
      if (item && item.id) map[item.id] = item;
    });
    TAS.completedSceneOverrides = map;
    (TAS.completedScenes || []).forEach(function (scene) {
      if (!scene._baseName) scene._baseName = scene.name;
      // false is a real catalogue default. A truthiness check would copy an
      // override back into the base and resurrect a Merchant Gallery listing.
      if (!Object.prototype.hasOwnProperty.call(scene, "_baseMerchantAuthorized")) {
        scene._baseMerchantAuthorized = !!scene.merchantAuthorized;
      }
      if (!scene._baseGalleryKind) scene._baseGalleryKind = scene.galleryKind || "showcase";
      var over = map[scene.id];
      if (!over) {
        scene.name = scene._baseName;
        scene.merchantAuthorized = scene._baseMerchantAuthorized;
        scene.galleryKind = scene._baseGalleryKind;
        delete scene.galleries;
        delete scene.royalty;
        delete scene.royaltyBearingCount;
        return;
      }
      if (over.displayTitle) scene.name = over.displayTitle;
      else scene.name = scene._baseName;
      scene.merchantAuthorized = !!over.merchantAuthorized;
      scene.galleries = {
        showcase: over.showcase !== false,
        merchantPuzzle: !!over.merchantPuzzle
      };
      scene.galleryKind = over.merchantPuzzle && over.showcase === false
        ? "merchant_puzzle"
        : (over.merchantPuzzle ? "showcase" : "showcase");
      scene.license = over.merchantAuthorized
        ? "Authorized for commercial merchant sponsorship of this scene only. Not freely downloadable."
        : "Showcase demonstration only. For viewing and inspiration. Not licensed for reuse, republication, download, or merchant sponsorship without explicit authorization.";
      if (over.royalty) {
        scene.royalty = TAS.normalizeRoyaltyRecord(over.royalty);
        scene.royaltyBearingCount = scene.royalty.bearingCount;
      } else {
        delete scene.royalty;
        delete scene.royaltyBearingCount;
      }
    });
  };

  TAS.loadCompletedSceneOverrides = function () {
    return fetch(TAS.apiBase("catalogue") + "/completed-overrides", {
      credentials: "same-origin",
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) return { ok: false, overrides: [] };
        return response.json().catch(function () { return { ok: false, overrides: [] }; });
      })
      .then(function (body) {
        var overrides = (body && body.ok && Array.isArray(body.overrides)) ? body.overrides : [];
        TAS.applyCompletedSceneOverrides(overrides);
        return overrides;
      })
      .catch(function () {
        TAS.applyCompletedSceneOverrides([]);
        return [];
      });
  };

  TAS.isSansymeonOwnedScene = function (scene) {
    if (!scene) return false;
    if (scene.source === "submission") return false;
    if (scene.submissionId) return false;
    return (scene.publisherId || DEFAULT_PUBLISHER_ID) === DEFAULT_PUBLISHER_ID
      && String(scene.id || "").indexOf("full_") === 0;
  };

  TAS.setMerchantPlacement = function (payload) {
    return fetch(TAS.apiBase("admin") + "/scenes/merchant-placement", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        return { ok: !!(response.ok && body && body.ok), status: response.status, body: body };
      });
    });
  };

  // Public galleries never offer download. Publisher-created scene export stays in the editor.
  TAS.allowsPublicGalleryDownload = function (scene) {
    return false;
  };

  TAS.findPublisher = function (id) {
    return TAS.publishers.find(function (publisher) {
      return publisher.id === id || publisher.slug === id;
    }) || null;
  };

  TAS.accessLabel = function (access) {
    return TAS.accessLabels[access] || TAS.accessLabels.unclassified;
  };

  TAS.ROYALTY_POOL_NOTE = "One sponsored image generates one royalty pool shared among eligible creators. The number of royalty-bearing components does not increase the pool.";

  TAS.royaltyCategoryLabel = function (kind, character) {
    if (kind === "background") return "Background";
    if (kind === "character") {
      if (character && character.category === "npc") return "Child";
      if (character && character.category === "turbo") return "Hero";
      if (character && character.category === "featured") return "Hero";
      return "Character";
    }
    return "Asset";
  };

  function royaltyCreator(asset) {
    const publisherId = (asset && asset.publisherId) || DEFAULT_PUBLISHER_ID;
    const publisher = TAS.findPublisher(publisherId);
    return {
      creatorId: publisherId,
      creatorName: (asset && asset.creator) || (publisher && publisher.name) || "SanSymeon Productions"
    };
  }

  function royaltyComponent(entry) {
    const access = entry.access || "unclassified";
    return {
      contributionId: entry.contributionId,
      assetId: entry.assetId || null,
      characterId: entry.characterId || null,
      name: entry.name,
      category: entry.category,
      access: access,
      statusLabel: TAS.accessLabel(access),
      creatorId: entry.creatorId || DEFAULT_PUBLISHER_ID,
      creatorName: entry.creatorName || "SanSymeon Productions"
    };
  }

  // Dedupes by character (or background) so multiple poses count as one contribution.
  TAS.buildRoyaltyBreakdown = function (scene) {
    const byKey = {};
    const order = [];

    function add(entry) {
      if (!entry || !entry.contributionId) return;
      if (byKey[entry.contributionId]) return;
      byKey[entry.contributionId] = royaltyComponent(entry);
      order.push(entry.contributionId);
    }

    if (scene && scene.background && scene.background.source === "catalogue" && scene.background.assetId) {
      const background = TAS.findBackground(scene.background.assetId);
      if (background) {
        const creator = royaltyCreator(background);
        add({
          contributionId: "background:" + background.id,
          assetId: background.id,
          name: background.name,
          category: TAS.royaltyCategoryLabel("background"),
          access: background.access || "unclassified",
          creatorId: creator.creatorId,
          creatorName: creator.creatorName
        });
      }
    }

    (scene && scene.layers ? scene.layers : []).forEach(function (layer) {
      const found = layer && layer.artworkId ? TAS.findArtwork(layer.artworkId) : null;
      if (!found) return;
      const character = found.character;
      const artwork = found.artwork;
      const access = artwork.access || character.access || "unclassified";
      const creator = royaltyCreator(character);
      add({
        contributionId: "character:" + character.id,
        assetId: artwork.id,
        characterId: character.id,
        name: character.name,
        category: TAS.royaltyCategoryLabel("character", character),
        access: access,
        creatorId: creator.creatorId,
        creatorName: creator.creatorName
      });
    });

    const components = order.map(function (key) { return byKey[key]; });
    const bearing = components.filter(function (item) { return item.access === "premium"; });
    return {
      version: 1,
      source: "composed",
      verified: true,
      bearingCount: bearing.length,
      poolNote: TAS.ROYALTY_POOL_NOTE,
      components: components
    };
  };

  TAS.normalizeRoyaltyRecord = function (raw, options) {
    const opts = options || {};
    const seen = {};
    const components = [];
    const list = raw && Array.isArray(raw.components) ? raw.components : [];
    list.forEach(function (item) {
      if (!item || typeof item !== "object") return;
      const contributionId = String(item.contributionId || "").slice(0, 120);
      if (!contributionId || seen[contributionId]) return;
      seen[contributionId] = true;
      const access = ["free", "premium", "unclassified", "private"].indexOf(item.access) !== -1
        ? item.access
        : "unclassified";
      components.push(royaltyComponent({
        contributionId: contributionId,
        assetId: item.assetId ? String(item.assetId).slice(0, 80) : null,
        characterId: item.characterId ? String(item.characterId).slice(0, 80) : null,
        name: String(item.name || contributionId).slice(0, 80),
        category: String(item.category || "Asset").slice(0, 40),
        access: access,
        creatorId: String(item.creatorId || DEFAULT_PUBLISHER_ID).slice(0, 80),
        creatorName: String(item.creatorName || "Unknown").slice(0, 80)
      }));
    });
    const bearingCount = components.filter(function (item) { return item.access === "premium"; }).length;
    return {
      version: 1,
      source: opts.source || (raw && raw.source) || "composed",
      verified: opts.verified != null ? !!opts.verified : !!(raw && raw.verified),
      bearingCount: bearingCount,
      poolNote: TAS.ROYALTY_POOL_NOTE,
      components: components
    };
  };

  TAS.royaltyBadgeLabel = function (count) {
    const n = Number(count) || 0;
    if (n <= 0) return "";
    return n === 1 ? "1 Royalty Component" : (n + " Royalty Components");
  };

  TAS.royaltyBreakdownHtml = function (royalty) {
    const record = TAS.normalizeRoyaltyRecord(royalty || { components: [] });
    const rows = record.components.length
      ? record.components.map(function (item) {
        return "<tr>"
          + "<td>" + TAS.esc(item.name) + "</td>"
          + "<td>" + TAS.esc(item.category) + "</td>"
          + "<td>" + TAS.esc(item.statusLabel) + "</td>"
          + "<td>" + TAS.esc(item.creatorName) + "</td>"
          + "</tr>";
      }).join("")
      : "<tr><td colspan=\"4\">No catalogue assets identified yet.</td></tr>";
    return ''
      + '<div class="royalty-breakdown">'
      + "<h3>Royalty Breakdown</h3>"
      + '<p class="note">' + TAS.esc(record.poolNote) + "</p>"
      + '<p class="royalty-count"><strong>' + record.bearingCount + "</strong> distinct royalty-bearing "
      + (record.bearingCount === 1 ? "component" : "components")
      + (record.verified ? " · verified" : " · unverified")
      + (record.source === "manual" ? " · manual" : "")
      + "</p>"
      + '<table class="royalty-table"><thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Rights holder</th></tr></thead>'
      + "<tbody>" + rows + "</tbody></table></div>";
  };

  // Manual royalty selector: royalty-bearing backgrounds and heroes (not Turbo / NPC children).
  TAS.premiumRoyaltyCandidates = function () {
    const items = [];
    (TAS.backgrounds || []).forEach(function (background) {
      if (background.access !== "premium") return;
      const creator = royaltyCreator(background);
      items.push(royaltyComponent({
        contributionId: "background:" + background.id,
        assetId: background.id,
        name: background.name,
        category: "Background",
        access: "premium",
        creatorId: creator.creatorId,
        creatorName: creator.creatorName
      }));
    });
    (TAS.characters || []).forEach(function (character) {
      if (character.id === "turbo" || character.category === "npc") return;
      if (character.access !== "premium" && character.category !== "featured") return;
      const creator = royaltyCreator(character);
      const artwork = character.artworks && character.artworks[0];
      items.push(royaltyComponent({
        contributionId: "character:" + character.id,
        assetId: artwork ? artwork.id : character.id,
        characterId: character.id,
        name: character.name,
        category: TAS.royaltyCategoryLabel("character", character),
        access: "premium",
        creatorId: creator.creatorId,
        creatorName: creator.creatorName
      }));
    });
    items.sort(function (a, b) {
      const cat = String(a.category).localeCompare(String(b.category));
      if (cat) return cat;
      return String(a.name).localeCompare(String(b.name));
    });
    return items;
  };

  TAS.royaltySelectorTableHtml = function (selectedMap, options) {
    const opts = options || {};
    const selected = selectedMap || {};
    const candidates = TAS.premiumRoyaltyCandidates();
    const nameAttr = opts.nameAttr || "data-royalty-id";
    if (!candidates.length) {
      return '<p class="note">No royalty-bearing backgrounds or heroes are registered in the catalogue.</p>';
    }
    const rows = candidates.map(function (item) {
      const checked = selected[item.contributionId] ? " checked" : "";
      return "<tr>"
        + '<td><label class="royalty-pick"><input type="checkbox" ' + nameAttr + '="' + TAS.esc(item.contributionId) + '"'
        + checked + "> <span>" + TAS.esc(item.name) + "</span></label></td>"
        + "<td>" + TAS.esc(item.category) + "</td>"
        + "<td>" + TAS.esc(item.creatorName) + "</td>"
        + "<td>" + TAS.esc(item.statusLabel) + "</td>"
        + "</tr>";
    }).join("");
    return ''
      + '<div class="royalty-selector">'
      + "<h4>Royalty Components</h4>"
      + '<p class="note">Select royalty-bearing backgrounds and heroes. Turbo Turtle and standard NPC children stay royalty-free and are excluded from the pool share list. One sponsored image still equals one shared royalty pool.</p>'
      + '<table class="royalty-table royalty-selector-table"><thead><tr>'
      + "<th>Asset</th><th>Category</th><th>Creator</th><th>Status</th>"
      + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  };

  TAS.catalogueAsset = function (id) {
    const artwork = TAS.findArtwork(id);
    if (artwork) {
      return {
        id: artwork.artwork.id,
        name: artwork.artwork.name || artwork.artwork.label,
        publisherId: artwork.artwork.publisherId || artwork.character.publisherId || DEFAULT_PUBLISHER_ID,
        assetType: "character",
        access: artwork.artwork.access || "unclassified",
        visibility: artwork.artwork.visibility || "studio",
        approval: artwork.artwork.approval || artwork.character.approval || "approved",
        file: artwork.artwork.file,
        width: artwork.artwork.width,
        height: artwork.artwork.height,
        characterId: artwork.character.id,
        characterName: artwork.character.name,
        placeable: artwork.artwork.placeable !== false
      };
    }
    const background = TAS.findBackground(id);
    if (background) {
      return {
        id: background.id,
        name: background.name,
        publisherId: background.publisherId || DEFAULT_PUBLISHER_ID,
        assetType: "background",
        access: background.access || "unclassified",
        visibility: background.visibility || "studio",
        approval: background.approval || "approved",
        file: background.file,
        width: background.width,
        height: background.height
      };
    }
    const scene = TAS.findCompletedScene(id);
    if (scene) {
      return {
        id: scene.id,
        name: scene.name,
        publisherId: scene.publisherId || DEFAULT_PUBLISHER_ID,
        assetType: "completed_scene",
        access: scene.access || "unclassified",
        visibility: scene.visibility || "studio",
        approval: scene.approval || "approved",
        galleryKind: scene.galleryKind || "showcase",
        merchantAuthorized: scene.merchantAuthorized === true,
        publicDownload: false,
        file: scene.file,
        width: scene.width,
        height: scene.height
      };
    }
    return null;
  };

  TAS.isPubliclyListable = function (asset) {
    if (!asset) return false;
    if (asset.approval !== "approved") return false;
    if (asset.visibility !== "public") return false;
    if (asset.access === "private") return false;
    if (asset.visibility === "private") return false;
    if (asset.placeable === false) return false;
    return true;
  };

  TAS.assetsByAccess = function (access) {
    const wanted = String(access || "");
    const items = [];
    TAS.characters.forEach(function (character) {
      character.artworks.forEach(function (artwork) {
        const asset = TAS.catalogueAsset(artwork.id);
        if (asset && asset.access === wanted) items.push(asset);
      });
    });
    TAS.backgrounds.forEach(function (background) {
      const asset = TAS.catalogueAsset(background.id);
      if (asset && asset.access === wanted) items.push(asset);
    });
    TAS.completedScenes.forEach(function (scene) {
      const asset = TAS.catalogueAsset(scene.id);
      if (asset && asset.access === wanted) items.push(asset);
    });
    return items;
  };

  TAS.publicPublisherAssets = function (publisherId) {
    const publisher = TAS.findPublisher(publisherId) || TAS.findPublisher(DEFAULT_PUBLISHER_ID);
    if (!publisher) return [];
    const items = [];
    TAS.characters.forEach(function (character) {
      character.artworks.forEach(function (artwork) {
        const asset = TAS.catalogueAsset(artwork.id);
        if (!asset || asset.publisherId !== publisher.id) return;
        if (TAS.isPubliclyListable(asset)) items.push(asset);
      });
    });
    TAS.backgrounds.forEach(function (background) {
      const asset = TAS.catalogueAsset(background.id);
      if (!asset || asset.publisherId !== publisher.id) return;
      if (TAS.isPubliclyListable(asset)) items.push(asset);
    });
    TAS.completedScenes.forEach(function (scene) {
      const asset = TAS.catalogueAsset(scene.id);
      if (!asset || asset.publisherId !== publisher.id) return;
      if (TAS.isPubliclyListable(asset)) items.push(asset);
    });
    return items;
  };

  TAS.categoryLabel = function (id) {
    const match = TAS.backgroundCategories.find(function (category) {
      return category.id === id;
    });
    return match ? match.label : id;
  };

  window.TAS = TAS;
})();

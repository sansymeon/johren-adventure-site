/* Turbo Adventures Studio — local catalogue.
   Paths are relative to TAS.assetRoot. Original files are never renamed or rewritten. */
(function () {
  const TAS = {
    assetRoot: "/masters/",
    product: "Turbo Adventures Studio",
    brand: "Turbo Adventures",
    tagline: "Discover. Collect. Explore.",
    publisher: "SanSymeon Productions",
    formats: {
      portrait: { id: "portrait", label: "Portrait", width: 1080, height: 1920 },
      landscape: { id: "landscape", label: "Landscape", width: 1920, height: 1080 }
    },
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

  function art(entry) {
    return Object.assign({
      alpha: true,
      extra: false,
      placeable: true,
      kind: "pose",
      status: "available"
    }, entry);
  }

  function pose(id, label, file, width, height, extra) {
    return art(Object.assign({
      id: id,
      label: label,
      description: label,
      file: file,
      width: width,
      height: height
    }, extra || {}));
  }

  function record(spec) {
    return {
      id: spec.id,
      category: spec.category,
      name: spec.name,
      number: spec.number || "",
      description: spec.description,
      personality: spec.personality || "",
      creator: "SanSymeon Productions",
      approval: "approved",
      license: spec.license,
      filesNote: spec.filesNote || "",
      referenceArtworkId: spec.referenceArtworkId,
      collectible: spec.category !== "npc",
      role: spec.role || (spec.category === "npc" ? "supporting" : "mascot"),
      ageGroup: spec.ageGroup || "",
      artworks: spec.artworks
    };
  }

  const mascotLicense = "Official character. SanSymeon Productions. The Scene Editor places these approved files and does not redraw them.";
  const childLicense = "Original child character. SanSymeon Productions. Individual views may be placed. Reference sheets are not scene layers.";

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
        pose("turbo_standing", "Standing", "turbo/turbo_standing_transparent.png", 1122, 1402, { description: "Standard pose, arms crossed." }),
        pose("turbo_running", "Running", "turbo/turbo_running_transparent.png", 1536, 1024),
        pose("turbo_running_2", "Running, alternate", "turbo/turbo_running_2_transparent.png", 1419, 1108, { extra: true }),
        pose("turbo_trophy", "Trophy", "turbo/turbo_trophy_transparent.png", 1305, 1206, { description: "Victory pose." }),
        pose("turbo_beach", "Beach", "turbo/turbo_beach_transparent.png", 1536, 1024, { kind: "costume" }),
        pose("turbo_halloween", "Halloween", "turbo/turbo_halloween_transparent.png", 1295, 1215, { kind: "costume" }),
        pose("turbo_christmas", "Christmas", "turbo/turbo_christmas.png", 1308, 1202, { kind: "costume" }),
        pose("turbo_astronaut", "Astronaut", "turbo/turbo_astronaut_transparent.png", 1305, 1205, { kind: "costume" }),
        pose("turbo_pirate", "Pirate", "turbo/turbo_pirate_transparent.png", 1305, 1205, { kind: "costume" }),
        pose("turbo_tourist", "Tourist", "turbo/turbo_tourist_transparent.png", 1254, 1254, { kind: "costume" }),
        pose("turbo_sherlock", "Detective", "turbo/turbo_sherlock_transparent.png", 1186, 1327, { kind: "costume" }),
        pose("turbo_royal", "Royal", "turbo/turbo_royal_transparent.png", 1306, 1205, { kind: "costume" }),
        pose("turbo_selfie", "Selfie", "turbo/turbo_selfie.png", 1254, 1254, { alpha: false, description: "Selfie stick. The file has a baked checkerboard. The studio hides that matte for display and does not change the file." }),
        pose("turbo_knight", "Knight", "turbo/turbo_knight.png", 1306, 1205, { kind: "costume" }),
        pose("turbo_shopping", "Shopping", "turbo/turbo_shopper.png", 1306, 1205, { kind: "costume", description: "Shopping bags. Stored as turbo_shopper.png." }),
        pose("turbo_confident", "Confident", "turbo/turbo_confident_transparent.png", 1122, 1402, { extra: true }),
        pose("turbo_yukata_selfie", "Yukata selfie", "turbo/turbo_yukata_selfie_transparent.png", 1312, 1199, { kind: "costume", extra: true }),
        pose("turbo_christmas_selfie", "Christmas selfie", "turbo/turbo_chrismas_selfie.png", 1254, 1254, { kind: "costume", description: "Christmas selfie. Stored as turbo_chrismas_selfie.png." }),
        pose("turbo_sherlock_selfie", "Detective selfie", "turbo/turbo_sherlock_selfie.png", 1254, 1254, { kind: "costume" }),
        pose("turbo_sumo", "Sumo", "turbo/turbo_sumo.png", 1086, 1448, { kind: "costume" }),
        pose("turbo_judo", "Judo", "turbo/turbo_judo.png", 1086, 1448, { kind: "costume" }),
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
        pose("nibbles_dragon", "Standing", "heroes/international_heroes/transparent_backgrounds/nibbles_dragon.png", 1306, 1205),
        pose("nibbles_dragon_soaring", "Soaring", "heroes/international_heroes/transparent_backgrounds/nibbles_dragon_soaring.png", 1254, 1254)
      ]
    }),
    record({
      id: "captain-seagull",
      category: "featured",
      name: "Captain Seagull",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "captain_seagull_flying",
      artworks: [pose("captain_seagull_flying", "Flying", "heroes/international_heroes/transparent_backgrounds/captain_seagull_flying.png", 1774, 887)]
    }),
    record({
      id: "colonel-blunderbuss",
      category: "featured",
      name: "Colonel Blunderbuss",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "colonel_blunderbuss",
      artworks: [pose("colonel_blunderbuss", "Reference", "heroes/international_heroes/transparent_backgrounds/colonel_blunderbuss_military.png", 1254, 1254)]
    }),
    record({
      id: "crabby",
      category: "featured",
      name: "Crabby",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "crabby",
      artworks: [pose("crabby", "Reference", "heroes/international_heroes/transparent_backgrounds/admiral_cornelius_crabbington.png", 1536, 1024)]
    }),
    record({
      id: "dame-henrietta",
      category: "featured",
      name: "Dame Henrietta Cluckington",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "dame_henrietta_cluckington",
      artworks: [pose("dame_henrietta_cluckington", "Reference", "heroes/international_heroes/transparent_backgrounds/dame_henrietta_cluckington_chicken.png?v=20261102", 1160, 1355)]
    }),
    record({
      id: "emperor-penguin",
      category: "featured",
      name: "Emperor Penguin",
      description: "Flamboyant royal penguin.",
      personality: "Every arrival is a procession.",
      license: mascotLicense,
      referenceArtworkId: "emperor_penguin",
      artworks: [pose("emperor_penguin", "Court", "heroes/international_heroes/transparent_backgrounds/emperor_reginald_waddlebottom_III.png", 1306, 1205)]
    }),
    record({
      id: "lady-petunia",
      category: "featured",
      name: "Lady Petunia Flutterby",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "lady_petunia_flutterby",
      artworks: [pose("lady_petunia_flutterby", "Reference", "heroes/international_heroes/transparent_backgrounds/lady_petunia_flutterby_lady.png", 1306, 1205)]
    }),
    record({
      id: "madame-lola",
      category: "featured",
      name: "Madame Lola Flamingo",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "madame_lola_flamingo",
      artworks: [pose("madame_lola_flamingo", "Reference", "heroes/international_heroes/transparent_backgrounds/madame_lola_flamingo_moviestar.png", 1060, 1484)]
    }),
    record({
      id: "mademoiselle-fifi",
      category: "featured",
      name: "Mademoiselle Fifi LaPlume",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "mademoiselle_fifi_laplume",
      artworks: [pose("mademoiselle_fifi_laplume", "Reference", "heroes/international_heroes/transparent_backgrounds/mademoiselle_fifi_laplume_cancan.png", 1199, 1312)]
    }),
    record({
      id: "octavius",
      category: "featured",
      name: "Octavius",
      description: "Featured mascot.",
      license: mascotLicense,
      filesNote: "",
      referenceArtworkId: "octavious",
      artworks: [pose("octavious", "Reference", "heroes/international_heroes/transparent_backgrounds/octavious_octopus.png", 1536, 1024)]
    }),
    record({
      id: "percival-quill",
      category: "featured",
      name: "Percival Quill",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "percival_quill",
      artworks: [pose("percival_quill", "Reference", "heroes/international_heroes/transparent_backgrounds/percival_quill_owl.png", 1306, 1205)]
    }),
    record({
      id: "professor-puddles",
      category: "featured",
      name: "Professor Puddles",
      description: "Brilliant but forgetful owl.",
      personality: "Eager to explain everything, then misplace the map.",
      license: mascotLicense,
      referenceArtworkId: "professor_puddles",
      artworks: [pose("professor_puddles", "Lecturing", "heroes/international_heroes/transparent_backgrounds/professor_puddles_owl.png", 512, 512)]
    }),
    record({
      id: "sergeant-hooves",
      category: "featured",
      name: "Sergeant Hooves",
      description: "Featured mascot.",
      license: mascotLicense,
      filesNote: "",
      referenceArtworkId: "sargeant_hooves",
      artworks: [pose("sargeant_hooves", "Reference", "heroes/international_heroes/transparent_backgrounds/sargeant_hooves_royalguard.png", 1133, 1388)]
    }),
    record({
      id: "sharky",
      category: "featured",
      name: "Sharky",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "sharky",
      artworks: [pose("sharky", "Reference", "heroes/international_heroes/transparent_backgrounds/sharky_hawaiianshark.png", 1536, 1024)]
    }),
    record({
      id: "sir-reginald",
      category: "featured",
      name: "Sir Reginald Walrus",
      description: "Featured mascot.",
      license: mascotLicense,
      referenceArtworkId: "sir_reginald_walrus",
      artworks: [pose("sir_reginald_walrus", "Reference", "heroes/international_heroes/transparent_backgrounds/sir_reginald_walrus.png", 1122, 1402)]
    }),
    record({
      id: "sir-snooze",
      category: "featured",
      name: "Sir Snooze",
      description: "Sleepy, unexpectedly wise bear.",
      personality: "Half asleep, and still the one who knows the answer.",
      license: mascotLicense,
      referenceArtworkId: "sir_snooze",
      artworks: [pose("sir_snooze", "At rest", "heroes/international_heroes/transparent_backgrounds/sir_snooze_sleepy.png", 1306, 1205)]
    }),
    child("jamie", "Jamie", [
      pose("jamie_front", "Front", "npc/jamie_front.png", 1024, 1536),
      pose("jamie_side", "Side", "npc/jamie_side.png", 1024, 1536),
      pose("jamie_back", "Back", "npc/jamie_back.png", 1024, 1536)
    ], "npc/composites/jamie.png", 1672, 941),
    child("jordan", "Jordan", [
      pose("jordan_side", "Side", "npc/jordan_side.png", 1024, 1536),
      pose("jordon_right_side", "Right side", "npc/jordon_right_side.png", 1024, 1536, { description: "The file is spelled jordon_right_side.png." }),
      pose("jordan_back", "Back", "npc/jordan_back.png", 1024, 1536)
    ], "npc/composites/jordan.png", 1774, 887, "No front view is on disk."),
    child("rick", "Rick", [
      pose("rick_front", "Front", "npc/rick_front.png", 1024, 1536),
      pose("rick_side", "Walking", "npc/rick_side.png", 1199, 1312),
      pose("rick_hands_raised", "Hands raised", "npc/rick_hands_raised.png", 1199, 1312)
    ], "npc/composites/rick.png", 1860, 846),
    child("elena", "Elena", [
      pose("elena_front", "Front", "npc/elena_front.png", 1024, 1536),
      pose("elena_side", "Side", "npc/elena_side.png", 1024, 1536),
      pose("elena_back", "Back", "npc/elena_back.png", 1024, 1536)
    ], "npc/composites/elena.png", 1448, 1086),
    child("mana", "Mana", [
      pose("mana_front", "Front", "npc/mana_front.png", 1024, 1536),
      pose("mana_side", "Side", "npc/mana_side.png", 1024, 1536),
      pose("mana_back", "Back", "npc/mana_back.png", 1024, 1536)
    ], "npc/composites/mana.png", 1448, 1086),
    child("margarite", "Margarite", [
      pose("margarite_front", "Front", "npc/margarite_front.png", 1024, 1536),
      pose("margarite_left_side", "Left side", "npc/margarite_left_side.png", 1024, 1536),
      pose("margarite_right_side", "Right side", "npc/margarite_right_side.png", 1024, 1536),
      pose("margarite_back", "Back", "npc/margarite_back.png", 1024, 1536)
    ], "npc/composites/margarite.png", 1672, 941),
    record({
      id: "hokuma-bear",
      category: "featured",
      name: "Hokuma",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "hokuma_bear",
      artworks: [pose("hokuma_bear", "Reference", "characters/transparent/hokuma_bear.png", 1141, 1379)]
    }),
    record({
      id: "hokuto-fishowl",
      category: "featured",
      name: "Hokuto",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "hokuto_fishowl",
      artworks: [pose("hokuto_fishowl", "Reference", "characters/transparent/hokuto_fishowl.png", 1156, 1361)]
    }),
    record({
      id: "koharu-chan-shrinegirl",
      category: "featured",
      name: "Koharu",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "koharu_chan_shrinegirl",
      artworks: [pose("koharu_chan_shrinegirl", "Reference", "characters/transparent/koharu_chan_shrinegirl.png", 1199, 1312)]
    }),
    record({
      id: "kumagoro",
      category: "featured",
      name: "Kumagoro",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "kumagoro",
      artworks: [pose("kumagoro", "Reference", "characters/transparent/kumagoro.png", 1199, 1312)]
    }),
    record({
      id: "kumagoro-hokkaidobear",
      category: "featured",
      name: "Kumagoro, Hokkaido",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "kumagoro_hokkaidobear",
      artworks: [pose("kumagoro_hokkaidobear", "Reference", "characters/transparent/kumagoro_hokkaidobear.png", 1199, 1312)]
    }),
    record({
      id: "lord-saruyoshi-monkeyshogun",
      category: "featured",
      name: "Lord Saruyoshi",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "lord_saruyoshi_monkeyshogun",
      artworks: [pose("lord_saruyoshi_monkeyshogun", "Reference", "characters/transparent/lord_saruyoshi_monkeyshogun.png", 941, 1672)]
    }),
    record({
      id: "lord-shika-of-nara-shikadeer",
      category: "featured",
      name: "Lord Shika of Nara",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "lord_shika_of_nara_shikadeer",
      artworks: [pose("lord_shika_of_nara_shikadeer", "Reference", "characters/transparent/lord_shika_of_nara_shikadeer.png", 1105, 1423)]
    }),
    record({
      id: "lord-toramasa-shogun",
      category: "featured",
      name: "Lord Toramasa",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "lord_toramasa_shogun",
      artworks: [pose("lord_toramasa_shogun", "Reference", "characters/transparent/lord_toramasa_shogun.png", 1201, 1310)]
    }),
    record({
      id: "matsukichi-festivalshiba",
      category: "featured",
      name: "Matsukichi",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "matsukichi_festivalshiba",
      artworks: [pose("matsukichi_festivalshiba", "Reference", "characters/transparent/matsukichi_festivalshiba.png", 1199, 1312)]
    }),
    record({
      id: "miyabi-the-kimono-fox",
      category: "featured",
      name: "Miyabi",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "miyabi_the_kimono_fox",
      artworks: [pose("miyabi_the_kimono_fox", "Reference", "characters/transparent/miyabi_the_kimono_fox.png", 941, 1672)]
    }),
    record({
      id: "nishiki-carp",
      category: "featured",
      name: "Nishiki",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "nishiki_carp",
      artworks: [pose("nishiki_carp", "Reference", "characters/transparent/nishiki_carp.png", 1086, 1448)]
    }),
    record({
      id: "nyanja-the-ninja-cat",
      category: "featured",
      name: "Nyanja",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "nyanja_the_ninja_cat",
      artworks: [pose("nyanja_the_ninja_cat", "Reference", "characters/transparent/nyanja_the_ninja_cat.png", 1199, 1312)]
    }),
    record({
      id: "samurai-inosuke",
      category: "featured",
      name: "Samurai Inosuke",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "samurai_inosuke",
      artworks: [pose("samurai_inosuke", "Reference", "characters/transparent/samurai_inosuke.png", 1199, 1312)]
    }),
    record({
      id: "shibata-bucho",
      category: "featured",
      name: "Shibata Bucho",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "shibata_bucho",
      artworks: [pose("shibata_bucho", "Reference", "characters/transparent/shibata_bucho.png", 1147, 1371)]
    }),
    record({
      id: "sumo-tanuki",
      category: "featured",
      name: "Sumo Tanuki",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "sumo_tanuki",
      artworks: [pose("sumo_tanuki", "Reference", "characters/transparent/sumo_tanuki.png", 1199, 1312)]
    }),
    record({
      id: "sushimaru",
      category: "featured",
      name: "Sushimaru",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "sushimaru",
      artworks: [pose("sushimaru", "Reference", "characters/transparent/sushimaru.png", 1199, 1312)]
    }),
    record({
      id: "suzumaru-shrinedeer",
      category: "featured",
      name: "Suzumaru",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "suzumaru_shrinedeer",
      artworks: [pose("suzumaru_shrinedeer", "Reference", "characters/transparent/suzumaru_shrinedeer.png", 1105, 1423)]
    }),
    record({
      id: "tobimaru-flyingfox",
      category: "featured",
      name: "Tobimaru",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "tobimaru_flyingfox",
      artworks: [pose("tobimaru_flyingfox", "Reference", "characters/transparent/tobimaru_flyingfox.png", 1217, 1292)]
    }),
    record({
      id: "yamabo-yamaboshi",
      category: "featured",
      name: "Yamabo",
      description: "Japanese animal hero.",
      license: mascotLicense,
      referenceArtworkId: "yamabo_yamaboshi",
      artworks: [pose("yamabo_yamaboshi", "Reference", "characters/transparent/yamabo_yamaboshi.png", 941, 1672)]
    })
  ];

  function child(id, name, views, sheet, sheetWidth, sheetHeight, filesNote) {
    const reference = views[0];
    views.push(pose(id + "_sheet", "Reference sheet", sheet, sheetWidth, sheetHeight, {
      placeable: false,
      kind: "reference",
      alpha: false,
      description: "Character reference sheet. Not used as a single character layer."
    }));
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

  function background(id, name, file, width, height, shape, category) {
    const label = TAS.ratioLabel(width, height);
    const native = (shape === "portrait" && label === "9:16") || (shape !== "portrait" && label === "16:9");
    return {
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
      approval: "approved",
      license: "Publisher photograph for Turbo Adventures scenes. Kept separate from character artwork.",
      file: file,
      width: width,
      height: height,
      status: "available"
    };
  }

  TAS.backgrounds = [
    background("bg_afternoon_tea", "Afternoon Tea Shop", "backgrounds/afternoon_tea_mobile.png", 941, 1672, "portrait", "shop"),
    background("bg_blackpool", "Blackpool", "backgrounds/blackpool_mobile.png", 941, 1672, "portrait", "nature"),
    background("bg_boxing_stage", "Boxing / Martial Arts Stage", "backgrounds/boxing_stage_mobile.png", 941, 1672, "portrait", "attraction"),
    background("bg_buckingham", "Buckingham Palace", "backgrounds/buckingham_mobile.png", 941, 1672, "portrait", "landmark"),
    background("bg_cotswolds", "Cotswolds Village", "backgrounds/cottswolds_mobile.png", 941, 1672, "portrait", "nature"),
    background("bg_london", "London — Big Ben", "backgrounds/london_mobile.png", 941, 1672, "portrait", "landmark"),
    background("bg_ship", "Ship at Sea", "backgrounds/ship_at_sea_mobile.png", 941, 1672, "portrait", "nature"),
    background("bg_performance_stage", "Performance Stage", "backgrounds/stage_mobile.png", 941, 1672, "portrait", "attraction"),
    background("bg_windsor", "Windsor Castle", "backgrounds/windsor_mobile.png", 941, 1672, "portrait", "landmark"),
    background("bg_itoshima_cafe", "Itoshima Cafe", "backgrounds/itoshima_cafe.png", 941, 1672, "portrait", "shop"),
    background("bg_cotswolds_hotel", "Cotswolds Hotel", "backgrounds/cottswolds_hotel.png", 941, 1672, "portrait", "hotel"),
    background("bg_buckingham_palace", "Buckingham Palace", "backgrounds/landscapes/buckingham.png", 1672, 941, "landscape", "landmark"),
    background("bg_windsor_castle", "Windsor Castle", "backgrounds/landscapes/windsor.png", 1672, 941, "landscape", "landmark"),
    background("bg_blackpool_beach", "Blackpool", "backgrounds/landscapes/blackpool.png", 1672, 941, "landscape", "nature")
  ];

  TAS.completedScenes = [
    { id: "full_turbo_champion", name: "Turbo Champion", file: "completed_scenes/turbo_champion.png", width: 941, height: 1672 },
    { id: "full_turbo_confident", name: "Turbo Confident", file: "completed_scenes/turbo_confident.png", width: 941, height: 1672 },
    { id: "full_turbo_race", name: "Turbo Race", file: "completed_scenes/turbo_race.png", width: 941, height: 1672 },
    { id: "full_turbo_yufuin", name: "Turbo Yufuin", file: "completed_scenes/turbo_yufuin.png", width: 941, height: 1672 },
    { id: "full_buckingham_airshow", name: "Buckingham Airshow", file: "completed_scenes/buckingham_airshow.png", width: 941, height: 1672 }
  ];

  TAS.inventory = {
    scanned: "2026-11-02",
    folder: "turbo_adventure/",
    notes: [
      "Captain Crumble was removed. The file heroes/captain_crumble.png was a duplicate and is no longer in the collection.",
      "Duchess Dazzle is not in the current heroes folder.",
      "Turbo has 23 illustrations in turbo/. turbo_shopping uses turbo_shopper.png. The Christmas selfie is stored as turbo_chrismas_selfie.png.",
      "turbo_selfie.png is an opaque file with a baked checkerboard. The editor hides that matte for display and does not change the file.",
      "Jordan has side, right side, and back views. There is no front file. The right-side file is spelled jordon_right_side.png.",
      "Sergeant Hooves is stored as sargeant_hooves.png. Octavius is stored as octavious.png. Cotswolds Village is stored as cottswolds_mobile.png.",
      "npc/composites/ holds reference sheets. They are not offered as single character layers.",
      "Portrait backgrounds are 941×1672. Cotswolds Hotel is stored as cottswolds_hotel.png. Landscape alternates live in backgrounds/landscapes/ and keep the earlier scene ids.",
      "Completed scenes are flattened pictures. They can be viewed and downloaded. They are not editable layered scenes. Buckingham Airshow is completed_scenes/buckingham_airshow.png."
    ]
  };

  TAS.fileUrl = function (file) {
    var clean = String(file == null ? "" : file).replace(/^\//, "");
    var path = location.pathname || "";
    // The admin serves artwork/ at /masters/ on its permanent port and on any
    // extra local port of the same server. Do not key this off the port number.
    if (path === "/studio" || path.indexOf("/studio/") === 0 || path === "/creator" || path.indexOf("/creator/") === 0 || path === "/postcards" || path.indexOf("/postcards/") === 0) {
      return "/masters/" + clean;
    }
    var nested = path.indexOf("/turbo-adventures-studio/") !== -1 || /\/turbo-adventures-studio$/.test(path);
    return (nested ? "../turbo_adventure/" : "turbo_adventure/") + clean;
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

  TAS.exportSize = function (format) {
    return format === "landscape" ? TAS.formats.landscape : TAS.formats.portrait;
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
    return TAS.completedScenes.find(function (scene) {
      return scene.id === id;
    }) || null;
  };

  TAS.categoryLabel = function (id) {
    const match = TAS.backgroundCategories.find(function (category) {
      return category.id === id;
    });
    return match ? match.label : id;
  };

  TAS.applyStudioLibrary = function (library) {
    (library && library.items || []).forEach(function (item) {
      if (!item || !item.id || !item.file) return;
      if (item.kind === "character") {
        const found = TAS.findArtwork(item.id);
        if (found) {
          found.artwork.file = item.file;
          found.artwork.width = item.width;
          found.artwork.height = item.height;
          found.artwork.label = item.name || found.artwork.label;
          found.artwork.alpha = true;
          if (found.character.artworks.length === 1) found.character.name = item.name || found.character.name;
          return;
        }
        TAS.characters.push(record({
          id: item.id,
          category: "featured",
          name: item.name || "Character",
          description: item.name || "Character",
          license: "Added in Manage Images.",
          referenceArtworkId: item.id,
          artworks: [pose(item.id, item.name || "Character", item.file, item.width, item.height, { alpha: true })]
        }));
        return;
      }
      const existing = TAS.findBackground(item.id);
      const shape = item.width >= item.height ? "landscape" : "portrait";
      if (existing) {
        existing.name = item.name || existing.name;
        existing.file = item.file;
        existing.width = item.width;
        existing.height = item.height;
        existing.shape = shape;
        return;
      }
      TAS.backgrounds.push(background(item.id, item.name || "Background", item.file, item.width, item.height, shape, "publisher"));
    });
  };

  TAS.loadStudioLibrary = function () {
    return fetch("/api/catalogue/library", { cache: "no-store" })
      .then(function (response) { return response.ok ? response.json() : { items: [] }; })
      .then(function (library) {
        TAS.applyStudioLibrary(library);
        return library;
      })
      .catch(function () { return { items: [] }; });
  };

  window.TAS = TAS;
})();

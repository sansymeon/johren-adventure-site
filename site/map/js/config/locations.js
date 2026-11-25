/**
 * Check-in places. Coordinates for stations come from data/japan/map-data.js.
 * Airport points are passenger terminals, not runway centres.
 *
 * To add a station: append its map pin id to railway.places.
 * Ordinary stations have no artwork. A special station may set special: true
 * and, later, rewards: { stageImage, character, background }. Leave rewards
 * unset until the artwork exists. Every listed station still awards one puzzle piece.
 * To add an airport discovery: append one place. Its id is the lifetime
 * collection id. One place may list several points when those doors should
 * count as the same discovery. Separate terminals that each count once
 * are separate places, as with Fukuoka domestic and international.
 */
(function (global) {
  "use strict";

  var LOCATIONS = {
    railway: {
      id: "railway",
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      places: [],
      /**
       * Every station pin in map-data.js is collectible.
       * Featured stations may name a nearby place and, later, an image path.
       * image is omitted until a photograph exists, so the sheet shows no picture frame.
       * 糸島高校前 remains Turbo's home station and still awards one puzzle piece.
       */
      featured: {
        chikuhi_meinohama: {
          attractionJa: "小戸ヨットハーバー",
          attractionEn: "Odo Yacht Harbor",
          descriptionJa: "ヨットと帆船が見える海辺です。",
          descriptionEn: "A shoreline with yachts and sailboats.",
          image: ""
        },
        chikuhi_kyudaigakkentoshi: {
          attractionJa: "九州大学伊都キャンパス周辺",
          attractionEn: "Around Kyushu University Ito Campus",
          descriptionJa: "キャンパス周辺の風景です。",
          descriptionEn: "The area around the campus.",
          image: ""
        },
        chikuhi_itoshimakoko_mae: {
          attractionJa: "桜井二見ヶ浦",
          attractionEn: "Sakurai Futamigaura",
          descriptionJa: "夫婦岩で知られる海岸です。",
          descriptionEn: "The coast known for the wedded rocks.",
          image: "",
          special: true,
          role: "turbo_home"
        },
        chikuhi_chikuzen_maebaru: {
          attractionJa: "白糸の滝",
          attractionEn: "Shiraito Falls",
          descriptionJa: "前原の南にある滝です。",
          descriptionEn: "A waterfall south of Maebaru.",
          image: ""
        },
        chikuhi_higashi_saga: {
          attractionJa: "虹の松原",
          attractionEn: "Nijinomatsubara",
          descriptionJa: "海岸に続く松原です。",
          descriptionEn: "A pine grove along the coast.",
          image: ""
        },
        chikuhi_saga: {
          attractionJa: "唐津城",
          attractionEn: "Karatsu Castle",
          descriptionJa: "唐津の城です。",
          descriptionEn: "The castle at Karatsu.",
          image: ""
        }
      }
    },
    airport: {
      id: "airport",
      radiusMeters: 250,
      maxAccuracyMeters: 150,
      places: [
        {
          id: "fukuoka_airport_domestic",
          name: "福岡空港 国内線ターミナル",
          nameEn: "Fukuoka Airport Domestic Terminal",
          points: [
            {
              id: "fukuoka_airport_domestic",
              /* NAVITIME 国内線旅客ターミナルビル, 2026-11-23 */
              lat: 33.597935,
              lng: 130.447682
            }
          ]
        },
        {
          id: "fukuoka_airport_international",
          name: "福岡空港 国際線ターミナル",
          nameEn: "Fukuoka Airport International Terminal",
          points: [
            {
              id: "fukuoka_airport_international",
              /* MapFan 国際線旅客ターミナルビル出発口 */
              lat: 33.585058,
              lng: 130.443299
            }
          ]
        },
        {
          id: "saga_airport",
          name: "佐賀空港",
          nameEn: "Saga Airport",
          points: [{
            id: "saga_airport_terminal",
            /* Mapion 国内線出発口 */
            lat: 33.153667,
            lng: 130.303574
          }]
        },
        {
          id: "kitakyushu_airport",
          name: "北九州空港",
          nameEn: "Kitakyushu Airport",
          /* Official aerodrome reference, same island as the passenger terminal. Not a surveyed door. */
          radiusMeters: 400,
          points: [{ id: "kitakyushu_airport", lat: 33.84556, lng: 131.03500 }]
        },
        {
          id: "nagasaki_airport",
          name: "長崎空港",
          nameEn: "Nagasaki Airport",
          radiusMeters: 400,
          points: [{ id: "nagasaki_airport", lat: 32.9169, lng: 129.9136 }]
        },
        {
          id: "tsushima_airport",
          name: "対馬空港",
          nameEn: "Tsushima Airport",
          radiusMeters: 300,
          points: [{ id: "tsushima_airport", lat: 34.284574, lng: 129.331353 }]
        },
        {
          id: "iki_airport",
          name: "壱岐空港",
          nameEn: "Iki Airport",
          radiusMeters: 300,
          points: [{ id: "iki_airport", lat: 33.749026, lng: 129.785263 }]
        },
        {
          id: "fukue_airport",
          name: "福江空港",
          nameEn: "Fukue Airport",
          radiusMeters: 300,
          points: [{ id: "fukue_airport", lat: 32.666394, lng: 128.832984 }]
        },
        {
          id: "kumamoto_airport",
          name: "熊本空港",
          nameEn: "Kumamoto Airport",
          radiusMeters: 400,
          points: [{ id: "kumamoto_airport", lat: 32.83722, lng: 130.85500 }]
        },
        {
          id: "amakusa_airport",
          name: "天草空港",
          nameEn: "Amakusa Airport",
          radiusMeters: 300,
          points: [{ id: "amakusa_airport", lat: 32.482217, lng: 130.158460 }]
        },
        {
          id: "oita_airport",
          name: "大分空港",
          nameEn: "Oita Airport",
          points: [{
            id: "oita_airport",
            /* Bank branch inside the passenger terminal building */
            lat: 33.477082,
            lng: 131.732468
          }]
        },
        {
          id: "miyazaki_airport",
          name: "宮崎空港",
          nameEn: "Miyazaki Airport",
          points: [{
            id: "miyazaki_airport",
            /* Wikimapia label: 宮崎空港 旅客ターミナルビル */
            lat: 31.872778,
            lng: 131.441111
          }]
        },
        {
          id: "kagoshima_airport",
          name: "鹿児島空港",
          nameEn: "Kagoshima Airport",
          radiusMeters: 400,
          points: [{ id: "kagoshima_airport", lat: 31.803333, lng: 130.719444 }]
        },
        {
          id: "tanegashima_airport",
          name: "種子島空港",
          nameEn: "Tanegashima Airport",
          radiusMeters: 300,
          points: [{ id: "tanegashima_airport", lat: 30.604804, lng: 130.992020 }]
        },
        {
          id: "yakushima_airport",
          name: "屋久島空港",
          nameEn: "Yakushima Airport",
          radiusMeters: 300,
          points: [{ id: "yakushima_airport", lat: 30.387514, lng: 130.656788 }]
        },
        {
          id: "amami_airport",
          name: "奄美空港",
          nameEn: "Amami Airport",
          radiusMeters: 300,
          points: [{ id: "amami_airport", lat: 28.430906, lng: 129.710339 }]
        },
        {
          id: "kikai_airport",
          name: "喜界空港",
          nameEn: "Kikai Airport",
          radiusMeters: 300,
          points: [{ id: "kikai_airport", lat: 28.322156, lng: 129.929290 }]
        },
        {
          id: "tokunoshima_airport",
          name: "徳之島空港",
          nameEn: "Tokunoshima Airport",
          radiusMeters: 300,
          points: [{ id: "tokunoshima_airport", lat: 27.835182, lng: 128.881710 }]
        },
        {
          id: "okinoerabu_airport",
          name: "沖永良部空港",
          nameEn: "Okinoerabu Airport",
          radiusMeters: 300,
          points: [{ id: "okinoerabu_airport", lat: 27.431244, lng: 128.705289 }]
        },
        {
          id: "yoron_airport",
          name: "与論空港",
          nameEn: "Yoron Airport",
          radiusMeters: 300,
          points: [{ id: "yoron_airport", lat: 27.043899, lng: 128.401191 }]
        },
        {
          id: "izumo_airport",
          name: "出雲縁結び空港",
          nameEn: "Izumo Enmusubi Airport",
          points: [{ id: "izumo_airport", lat: 35.413143, lng: 132.887806 }]
        },
        {
          id: "iwami_airport",
          name: "萩・石見空港",
          nameEn: "Hagi-Iwami Airport",
          points: [{ id: "iwami_airport", lat: 34.678447, lng: 131.796732 }]
        },
        {
          id: "oki_airport",
          name: "隠岐世界ジオパーク空港",
          nameEn: "Oki Global Geopark Airport",
          points: [{ id: "oki_airport", lat: 36.178304, lng: 133.325086 }]
        },
        {
          id: "tottori_airport",
          name: "鳥取砂丘コナン空港",
          nameEn: "Tottori Sand Dunes Conan Airport",
          points: [{ id: "tottori_airport", lat: 35.526549, lng: 134.167707 }]
        },
        {
          id: "yonago_airport",
          name: "米子鬼太郎空港",
          nameEn: "Yonago Kitaro Airport",
          points: [{ id: "yonago_airport", lat: 35.492222, lng: 133.236389 }]
        },
        {
          id: "hiroshima_airport",
          name: "広島空港",
          nameEn: "Hiroshima Airport",
          points: [{ id: "hiroshima_airport", lat: 34.436111, lng: 132.919444 }]
        },
        {
          id: "okayama_airport",
          name: "岡山桃太郎空港",
          nameEn: "Okayama Momotaro Airport",
          points: [{ id: "okayama_airport", lat: 34.760348, lng: 133.853836 }]
        },
        {
          id: "takamatsu_airport",
          name: "高松空港",
          nameEn: "Takamatsu Airport",
          points: [{ id: "takamatsu_airport", lat: 34.215174, lng: 134.019401 }]
        },
        {
          id: "tokushima_airport",
          name: "徳島阿波おどり空港",
          nameEn: "Tokushima Awaodori Airport",
          points: [{ id: "tokushima_airport", lat: 34.132980, lng: 134.605373 }]
        },
        {
          id: "matsuyama_airport",
          name: "松山空港",
          nameEn: "Matsuyama Airport",
          points: [{ id: "matsuyama_airport", lat: 33.827314, lng: 132.701326 }]
        },
        {
          id: "kochi_airport",
          name: "高知龍馬空港",
          nameEn: "Kochi Ryoma Airport",
          points: [{ id: "kochi_airport", lat: 33.546340, lng: 133.671049 }]
        },
        {
          id: "naha_airport_terminal",
          name: "那覇空港",
          nameEn: "Naha Airport",
          points: [{
            id: "naha_airport_terminal",
            /* OSM aeroway=terminal 那覇空港国内線ターミナル (passenger building). Not the monorail station. */
            lat: 26.206278,
            lng: 127.650803
          }]
        }
      ]
    },
    scenic: {
      id: "scenic",
      radiusMeters: 150,
      maxAccuracyMeters: 150,
      places: [
        {
          id: "tsunoshima_bridge",
          name: "角島大橋",
          nameEn: "Tsunoshima Bridge",
          /* Island-side visitor spot. Not the bridge deck. */
          points: [{ id: "tsunoshima_bridge", lat: 34.347823, lng: 130.895519 }]
        },
        {
          id: "hinoyama_park",
          name: "火の山公園",
          nameEn: "Hinoyama Park",
          points: [{ id: "hinoyama_park", lat: 33.972840, lng: 130.959417 }]
        },
        {
          id: "bishagonohana",
          name: "毘沙ノ鼻",
          nameEn: "Bishagonohana",
          /* Lookout on the cape, not the cliff edge in the water. */
          points: [{ id: "bishagonohana", lat: 34.110090, lng: 130.862359 }]
        },
        {
          id: "akiyoshidai",
          name: "秋吉台",
          nameEn: "Akiyoshidai",
          /* Public car park at the karst lookout. */
          points: [{ id: "akiyoshidai", lat: 34.234080, lng: 131.304827 }]
        },
        {
          id: "akiyoshido",
          name: "秋芳洞",
          nameEn: "Akiyoshido Cave",
          points: [{ id: "akiyoshido", lat: 34.228061, lng: 131.303411 }]
        },
        {
          id: "beppu_benten_pond",
          name: "別府弁天池",
          nameEn: "Beppu Benten Pond",
          points: [{ id: "beppu_benten_pond", lat: 34.255087, lng: 131.244876 }]
        },
        {
          id: "omijima",
          name: "青海島",
          nameEn: "Omijima",
          /* Sightseeing-boat landing, not the open water. */
          points: [{ id: "omijima", lat: 34.388788, lng: 131.203122 }]
        },
        {
          id: "senjojiki_nagato",
          name: "千畳敷",
          nameEn: "Senjojiki",
          points: [{ id: "senjojiki_nagato", lat: 34.414398, lng: 131.090385 }]
        },
        {
          id: "susa_hornfels",
          name: "須佐ホルンフェルス",
          nameEn: "Susa Hornfels",
          points: [{ id: "susa_hornfels", lat: 34.647417, lng: 131.596111 }]
        },
        {
          id: "mount_kasa",
          name: "笠山",
          nameEn: "Mount Kasa",
          points: [{ id: "mount_kasa", lat: 34.449611, lng: 131.401861 }]
        },
        {
          id: "nagasawa_pond",
          name: "長沢池",
          nameEn: "Nagasawa Pond",
          /* Embankment by the road, not the water. */
          points: [{ id: "nagasawa_pond", lat: 34.073634, lng: 131.462415 }]
        },
        {
          id: "mount_ohira",
          name: "大平山",
          nameEn: "Mount Ohira",
          points: [{ id: "mount_ohira", lat: 34.073330, lng: 131.630636 }]
        },
        {
          id: "tokiwa_park",
          name: "ときわ公園",
          nameEn: "Tokiwa Park",
          /* Park entrance, not the lake. */
          points: [{ id: "tokiwa_park", lat: 33.943319, lng: 131.280896 }]
        },
        {
          id: "mount_taika",
          name: "太華山",
          nameEn: "Mount Taika",
          points: [{ id: "mount_taika", lat: 34.008611, lng: 131.819167 }]
        },
        {
          id: "murozumi_coast",
          name: "室積海岸",
          nameEn: "Murozumi Coast",
          points: [{ id: "murozumi_coast", lat: 33.940306, lng: 131.965972 }]
        },
        {
          id: "chausuyama_kofun_park",
          name: "茶臼山古墳公園",
          nameEn: "Chausuyama Kofun Park",
          points: [{ id: "chausuyama_kofun_park", lat: 33.965775, lng: 132.129050 }]
        },
        {
          id: "katazoegahama",
          name: "片添ヶ浜",
          nameEn: "Katazoegahama",
          /* Beach park on Suo-Oshima, not the swim area. */
          points: [{ id: "katazoegahama", lat: 33.896329, lng: 132.360732 }]
        },
        {
          id: "sandankyo",
          name: "三段峡",
          nameEn: "Sandankyo",
          points: [{ id: "sandankyo", lat: 34.59959, lng: 132.208517 }]
        },
        {
          id: "taishakukyo",
          name: "帝釈峡",
          nameEn: "Taishaku-kyo",
          points: [{ id: "taishakukyo", lat: 34.846111, lng: 133.226111 }]
        },
        {
          id: "misen",
          name: "弥山",
          nameEn: "Mount Misen",
          points: [{ id: "misen", lat: 34.279722, lng: 132.319722 }]
        },
        {
          id: "momijidani_park",
          name: "紅葉谷公園",
          nameEn: "Momijidani Park",
          points: [{ id: "momijidani_park", lat: 34.293809, lng: 132.325038 }]
        },
        {
          id: "tomonoura",
          name: "鞆の浦",
          nameEn: "Tomonoura",
          points: [{ id: "tomonoura", lat: 34.380881, lng: 133.379688 }]
        },
        {
          id: "sensuijima",
          name: "仙酔島",
          nameEn: "Sensui Island",
          points: [{ id: "sensuijima", lat: 34.383117, lng: 133.397853 }]
        },
        {
          id: "okunoshima",
          name: "大久野島",
          nameEn: "Okunoshima",
          points: [{ id: "okunoshima", lat: 34.309167, lng: 132.993056 }]
        },
        {
          id: "haigamine",
          name: "灰ヶ峰",
          nameEn: "Mount Haigamine",
          points: [{ id: "haigamine", lat: 34.270139, lng: 132.593444 }]
        },
        {
          id: "fudekageyama",
          name: "筆影山",
          nameEn: "Mount Fudekage",
          points: [{ id: "fudekageyama", lat: 34.376056, lng: 133.081222 }]
        },
        {
          id: "mominoki_forest_park",
          name: "もみのき森林公園",
          nameEn: "Mominoki Forest Park",
          points: [{ id: "mominoki_forest_park", lat: 34.480461, lng: 132.178083 }]
        },
        {
          id: "kiroyama_observatory",
          name: "亀老山展望公園",
          nameEn: "Kiroyama Observatory",
          points: [{ id: "kiroyama_observatory", lat: 34.120278, lng: 133.033612 }]
        },
        {
          id: "washuzan",
          name: "鷲羽山",
          nameEn: "Mount Washu",
          points: [{ id: "washuzan", lat: 34.435478, lng: 133.812447 }]
        },
        {
          id: "hiruzen",
          name: "蒜山高原",
          nameEn: "Hiruzen Highlands",
          points: [{ id: "hiruzen", lat: 35.325, lng: 133.6636 }]
        },
        {
          id: "kanba_falls",
          name: "神庭の滝",
          nameEn: "Kanba Falls",
          points: [{ id: "kanba_falls", lat: 35.118611, lng: 133.678778 }]
        },
        {
          id: "ikura_cave",
          name: "井倉洞",
          nameEn: "Ikura Cave",
          points: [{ id: "ikura_cave", lat: 34.927494, lng: 133.524632 }]
        },
        {
          id: "makido_cave",
          name: "満奇洞",
          nameEn: "Maki-do Cave",
          points: [{ id: "makido_cave", lat: 34.97175, lng: 133.583417 }]
        },
        {
          id: "okutsu_gorge",
          name: "奥津渓",
          nameEn: "Okutsu Gorge",
          points: [{ id: "okutsu_gorge", lat: 35.213572, lng: 133.915097 }]
        },
        {
          id: "gokei",
          name: "豪渓",
          nameEn: "Gokei",
          points: [{ id: "gokei", lat: 34.760028, lng: 133.699222 }]
        },
        {
          id: "ushimado_olive",
          name: "牛窓オリーブ園",
          nameEn: "Ushimado Olive Garden",
          points: [{ id: "ushimado_olive", lat: 34.625694, lng: 134.15625 }]
        },
        {
          id: "ojigatake",
          name: "王子が岳",
          nameEn: "Mount Ojigatake",
          points: [{ id: "ojigatake", lat: 34.461944, lng: 133.882222 }]
        },
        {
          id: "shibukawa_coast",
          name: "渋川海岸",
          nameEn: "Shibukawa Coast",
          points: [{ id: "shibukawa_coast", lat: 34.453889, lng: 133.904722 }]
        },
        {
          id: "bitchu_cave",
          name: "備中鐘乳穴",
          nameEn: "Bitchu Limestone Cave",
          points: [{ id: "bitchu_cave", lat: 34.955494, lng: 133.679022 }]
        },
        {
          id: "onbara_highlands",
          name: "恩原高原",
          nameEn: "Onbara Highlands",
          points: [{ id: "onbara_highlands", lat: 35.305713, lng: 133.985298 }]
        },
        {
          id: "daigo_zakura",
          name: "醍醐桜",
          nameEn: "Daigo Cherry Trees",
          points: [{ id: "daigo_zakura", lat: 35.024, lng: 133.647194 }]
        },
        {
          id: "shinji_sunset",
          name: "宍道湖",
          nameEn: "Shinji Lake",
          points: [{ id: "shinji_sunset", lat: 35.459639, lng: 133.052583 }]
        },
        {
          id: "inasa_beach",
          name: "稲佐の浜",
          nameEn: "Inasa Beach",
          points: [{ id: "inasa_beach", lat: 35.400806, lng: 132.672139 }]
        },
        {
          id: "hinomisaki_lighthouse",
          name: "出雲日御碕灯台",
          nameEn: "Izumo Hinomisaki Lighthouse",
          points: [{ id: "hinomisaki_lighthouse", lat: 35.433743, lng: 132.629271 }]
        },
        {
          id: "mount_sanbe",
          name: "三瓶山",
          nameEn: "Mount Sanbe",
          points: [{ id: "mount_sanbe", lat: 35.140528, lng: 132.621528 }]
        },
        {
          id: "tachikue_gorge",
          name: "立久恵峡",
          nameEn: "Tachikue Gorge",
          points: [{ id: "tachikue_gorge", lat: 35.296267, lng: 132.737008 }]
        },
        {
          id: "oninoshiburi",
          name: "鬼の舌震",
          nameEn: "Oninoshiburi",
          points: [{ id: "oninoshiburi", lat: 35.168333, lng: 133.023333 }]
        },
        {
          id: "ryuzu_falls_shimane",
          name: "龍頭が滝",
          nameEn: "Ryuzu Falls",
          points: [{ id: "ryuzu_falls_shimane", lat: 35.195183, lng: 132.78467 }]
        },
        {
          id: "mihoseki_lighthouse",
          name: "美保関灯台",
          nameEn: "Mihoseki Lighthouse",
          points: [{ id: "mihoseki_lighthouse", lat: 35.5675, lng: 133.325278 }]
        },
        {
          id: "iwami_seaside_park",
          name: "石見海浜公園",
          nameEn: "Iwami Seaside Park",
          points: [{ id: "iwami_seaside_park", lat: 34.951133, lng: 132.118508 }]
        },
        {
          id: "kuniga_coast",
          name: "国賀海岸",
          nameEn: "Kuniga Coast",
          points: [{ id: "kuniga_coast", lat: 36.103333, lng: 132.967778 }]
        },
        {
          id: "matengai_cliff",
          name: "摩天崖",
          nameEn: "Matengai Cliff",
          points: [{ id: "matengai_cliff", lat: 36.106778, lng: 132.972945 }]
        },
        {
          id: "sekiheki_cliff",
          name: "赤壁",
          nameEn: "Sekiheki",
          points: [{ id: "sekiheki_cliff", lat: 36.009805, lng: 133.010148 }]
        },
        {
          id: "akiya_coast",
          name: "明屋海岸",
          nameEn: "Akiya Coast",
          points: [{ id: "akiya_coast", lat: 36.105749, lng: 133.125075 }]
        },
        {
          id: "tottori_dunes",
          name: "鳥取砂丘",
          nameEn: "Tottori Sand Dunes",
          points: [{ id: "tottori_dunes", lat: 35.5425, lng: 134.230278 }]
        },
        {
          id: "uradome_coast",
          name: "浦富海岸",
          nameEn: "Uradome Coast",
          points: [{ id: "uradome_coast", lat: 35.588056, lng: 134.293333 }]
        },
        {
          id: "hakuto_beach",
          name: "白兎海岸",
          nameEn: "Hakuto Beach",
          points: [{ id: "hakuto_beach", lat: 35.526002, lng: 134.116762 }]
        },
        {
          id: "mount_daisen",
          name: "大山",
          nameEn: "Mount Daisen",
          points: [{ id: "mount_daisen", lat: 35.3711, lng: 133.5464 }]
        },
        {
          id: "kagikake_pass",
          name: "鍵掛峠",
          nameEn: "Kagikake Pass",
          points: [{ id: "kagikake_pass", lat: 35.346111, lng: 133.549444 }]
        },
        {
          id: "masumizu_highlands",
          name: "桝水高原",
          nameEn: "Masumizu Highlands",
          points: [{ id: "masumizu_highlands", lat: 35.369658, lng: 133.518149 }]
        },
        {
          id: "amataki_falls",
          name: "雨滝",
          nameEn: "Amataki Falls",
          points: [{ id: "amataki_falls", lat: 35.478251, lng: 134.404591 }]
        },
        {
          id: "mount_hyonosen",
          name: "氷ノ山",
          nameEn: "Mount Hyonosen",
          points: [{ id: "mount_hyonosen", lat: 35.347259, lng: 134.489748 }]
        },
        {
          id: "lake_togo",
          name: "東郷湖",
          nameEn: "Lake Togo",
          points: [{ id: "lake_togo", lat: 35.468786, lng: 133.901989 }]
        },
        {
          id: "lake_koyama",
          name: "湖山池",
          nameEn: "Lake Koyama",
          points: [{ id: "lake_koyama", lat: 35.505288, lng: 134.173928 }]
        },
        {
          id: "enchoen",
          name: "燕趙園",
          nameEn: "Encho-en",
          points: [{ id: "enchoen", lat: 35.465889, lng: 133.893 }]
        },
        {
          id: "kaike_beach",
          name: "皆生温泉海岸",
          nameEn: "Kaike Onsen Beach",
          points: [{ id: "kaike_beach", lat: 35.456303, lng: 133.361803 }]
        },
        {
          id: "yumigahama",
          name: "弓ヶ浜",
          nameEn: "Yumigahama",
          points: [{ id: "yumigahama", lat: 35.467011, lng: 133.288361 }]
        },
        {
          id: "sakurai_futamigaura",
          name: "桜井二見ヶ浦",
          nameEn: "Sakurai Futamigaura",
          points: [{ id: "sakurai_futamigaura", lat: 33.640157, lng: 130.196691 }]
        },
        {
          id: "keya_no_oto",
          name: "芥屋の大門",
          nameEn: "Keya no Oto",
          points: [{ id: "keya_no_oto", lat: 33.596453, lng: 130.107597 }]
        },
        {
          id: "itoshima_shiraito",
          name: "白糸の滝",
          nameEn: "Shiraito Falls",
          points: [{ id: "itoshima_shiraito", lat: 33.480083, lng: 130.175488 }]
        },
        {
          id: "uminonakamichi",
          name: "海の中道海浜公園",
          nameEn: "Uminonakamichi Seaside Park",
          points: [{ id: "uminonakamichi", lat: 33.662627, lng: 130.355711 }]
        },
        {
          id: "nokonoshima",
          name: "能古島",
          nameEn: "Nokonoshima",
          points: [{ id: "nokonoshima", lat: 33.629578, lng: 130.307133 }]
        },
        {
          id: "hiraodai",
          name: "平尾台",
          nameEn: "Hiraodai",
          points: [{ id: "hiraodai", lat: 33.758637, lng: 130.890046 }]
        },
        {
          id: "yanagawa_cruise",
          name: "柳川川下り",
          nameEn: "Yanagawa River Cruise",
          points: [{ id: "yanagawa_cruise", lat: 33.158586, lng: 130.397235 }]
        },
        {
          id: "furuyu_onsen",
          name: "古湯温泉",
          nameEn: "Furuyu Onsen",
          points: [{ id: "furuyu_onsen", lat: 33.37194, lng: 130.20653 }]
        },
        {
          id: "kumanokawa_onsen",
          name: "熊の川温泉",
          nameEn: "Kumanokawa Onsen",
          points: [{ id: "kumanokawa_onsen", lat: 33.36556, lng: 130.24175 }]
        },
        {
          id: "nijinomatsubara",
          name: "虹の松原",
          nameEn: "Nijinomatsubara",
          points: [{ id: "nijinomatsubara", lat: 33.444056, lng: 130.013556 }]
        },
        {
          id: "kagamiyama",
          name: "鏡山展望台",
          nameEn: "Mount Kagami Observatory",
          points: [{ id: "kagamiyama", lat: 33.43076, lng: 130.017936 }]
        },
        {
          id: "nanatsugama",
          name: "七ツ釜",
          nameEn: "Nanatsugama",
          points: [{ id: "nanatsugama", lat: 33.548963, lng: 129.931958 }]
        },
        {
          id: "yobuko_market",
          name: "呼子朝市",
          nameEn: "Yobuko Morning Market",
          points: [{ id: "yobuko_market", lat: 33.53703, lng: 129.895091 }]
        },
        {
          id: "hamanoura",
          name: "浜野浦の棚田",
          nameEn: "Hamanoura Rice Terraces",
          points: [{ id: "hamanoura", lat: 33.489225, lng: 129.847369 }]
        },
        {
          id: "mifuneyama",
          name: "御船山楽園",
          nameEn: "Mifuneyama Rakuen",
          points: [{ id: "mifuneyama", lat: 33.181389, lng: 130.017222 }]
        },
        {
          id: "ureshino_onsen",
          name: "嬉野温泉",
          nameEn: "Ureshino Onsen",
          points: [{ id: "ureshino_onsen", lat: 33.106335, lng: 129.997338 }]
        },
        {
          id: "takeo_onsen_town",
          name: "武雄温泉",
          nameEn: "Takeo Onsen",
          points: [{ id: "takeo_onsen_town", lat: 33.196279, lng: 130.014693 }]
        },
        {
          id: "mikaeri_falls",
          name: "見帰りの滝",
          nameEn: "Mikaeri Falls",
          points: [{ id: "mikaeri_falls", lat: 33.367664, lng: 130.039531 }]
        },
        {
          id: "inasayama",
          name: "稲佐山展望台",
          nameEn: "Mount Inasa Observatory",
          points: [{ id: "inasayama", lat: 32.753361, lng: 129.849333 }]
        },
        {
          id: "kujukushima",
          name: "九十九島展望スポット",
          nameEn: "Kujukushima Viewpoint",
          points: [{ id: "kujukushima", lat: 33.132335, lng: 129.692917 }]
        },
        {
          id: "unzen_jigoku",
          name: "雲仙地獄",
          nameEn: "Unzen Jigoku",
          points: [{ id: "unzen_jigoku", lat: 32.740493, lng: 130.263388 }]
        },
        {
          id: "obama_onsen",
          name: "小浜温泉",
          nameEn: "Obama Onsen",
          points: [{ id: "obama_onsen", lat: 32.72822, lng: 130.20714 }]
        },
        {
          id: "obae_lighthouse",
          name: "大バエ灯台",
          nameEn: "Obae Lighthouse",
          points: [{ id: "obae_lighthouse", lat: 33.439803, lng: 129.43038 }]
        },
        {
          id: "takahama_beach",
          name: "高浜海水浴場",
          nameEn: "Takahama Beach",
          points: [{ id: "takahama_beach", lat: 32.708031, lng: 128.661606 }]
        },
        {
          id: "kurokawa_onsen",
          name: "黒川温泉",
          nameEn: "Kurokawa Onsen",
          points: [{ id: "kurokawa_onsen", lat: 33.078058, lng: 131.141715 }]
        },
        {
          id: "kusasenri",
          name: "阿蘇草千里ヶ浜",
          nameEn: "Kusasenrigahama",
          points: [{ id: "kusasenri", lat: 32.881466, lng: 131.053547 }]
        },
        {
          id: "daikanbo",
          name: "大観峰",
          nameEn: "Daikanbo",
          points: [{ id: "daikanbo", lat: 32.996389, lng: 131.067222 }]
        },
        {
          id: "shirakawa_spring",
          name: "白川水源",
          nameEn: "Shirakawa Spring",
          points: [{ id: "shirakawa_spring", lat: 32.824473, lng: 131.094531 }]
        },
        {
          id: "nabegataki",
          name: "鍋ヶ滝",
          nameEn: "Nabegataki Falls",
          points: [{ id: "nabegataki", lat: 33.137333, lng: 131.035694 }]
        },
        {
          id: "kikuchi_gorge",
          name: "菊池渓谷",
          nameEn: "Kikuchi Gorge",
          points: [{ id: "kikuchi_gorge", lat: 33.003156, lng: 130.946458 }]
        },
        {
          id: "tsuetate_onsen",
          name: "杖立温泉",
          nameEn: "Tsuetate Onsen",
          points: [{ id: "tsuetate_onsen", lat: 33.18256, lng: 131.03425 }]
        },
        {
          id: "amakusa_gokyo",
          name: "天草五橋",
          nameEn: "Amakusa Five Bridges",
          points: [{ id: "amakusa_gokyo", lat: 32.52265, lng: 130.419709 }]
        },
        {
          id: "okoshiki_coast",
          name: "御輿来海岸",
          nameEn: "Okoshiki Coast",
          points: [{ id: "okoshiki_coast", lat: 32.670937, lng: 130.543387 }]
        },
        {
          id: "yufuin_onsen",
          name: "由布院温泉",
          nameEn: "Yufuin Onsen",
          points: [{ id: "yufuin_onsen", lat: 33.26603, lng: 131.36861 }]
        },
        {
          id: "kinrin_lake",
          name: "金鱗湖",
          nameEn: "Lake Kinrin",
          points: [{ id: "kinrin_lake", lat: 33.26672, lng: 131.369039 }]
        },
        {
          id: "beppu_jigoku",
          name: "別府地獄めぐり",
          nameEn: "Beppu Hells",
          points: [{ id: "beppu_jigoku", lat: 33.315888, lng: 131.469683 }]
        },
        {
          id: "myoban_onsen",
          name: "明礬温泉",
          nameEn: "Myoban Onsen",
          points: [{ id: "myoban_onsen", lat: 33.318218, lng: 131.452596 }]
        },
        {
          id: "kokonoe_bridge",
          name: "九重“夢”大吊橋",
          nameEn: "Kokonoe Yume Otsurihashi",
          points: [{ id: "kokonoe_bridge", lat: 33.175483, lng: 131.229156 }]
        },
        {
          id: "chojabaru",
          name: "長者原",
          nameEn: "Chojabaru",
          points: [{ id: "chojabaru", lat: 33.123606, lng: 131.229757 }]
        },
        {
          id: "tadewara",
          name: "タデ原湿原",
          nameEn: "Tadewara Marsh",
          points: [{ id: "tadewara", lat: 33.117871, lng: 131.232272 }]
        },
        {
          id: "harajiri_falls",
          name: "原尻の滝",
          nameEn: "Harajiri Falls",
          points: [{ id: "harajiri_falls", lat: 32.963889, lng: 131.451111 }]
        },
        {
          id: "yabakei",
          name: "耶馬渓",
          nameEn: "Yabakei",
          points: [{ id: "yabakei", lat: 33.44, lng: 131.141389 }]
        },
        {
          id: "matama_coast",
          name: "真玉海岸",
          nameEn: "Matama Coast",
          points: [{ id: "matama_coast", lat: 33.622417, lng: 131.473056 }]
        },
        {
          id: "kuju_flower_park",
          name: "くじゅう花公園",
          nameEn: "Kuju Flower Park",
          points: [{ id: "kuju_flower_park", lat: 33.0483, lng: 131.2439 }]
        },
        {
          id: "takachiho_gorge",
          name: "高千穂峡",
          nameEn: "Takachiho Gorge",
          points: [{ id: "takachiho_gorge", lat: 32.708167, lng: 131.298944 }]
        },
        {
          id: "aoshima_island",
          name: "青島",
          nameEn: "Aoshima",
          points: [{ id: "aoshima_island", lat: 31.805222, lng: 131.475889 }]
        },
        {
          id: "oni_no_sentakuita",
          name: "鬼の洗濯板",
          nameEn: "Oni no Sentakuita",
          points: [{ id: "oni_no_sentakuita", lat: 31.805082, lng: 131.478465 }]
        },
        {
          id: "horikiri_pass",
          name: "堀切峠",
          nameEn: "Horikiri Pass",
          points: [{ id: "horikiri_pass", lat: 31.776825, lng: 131.482161 }]
        },
        {
          id: "toi_cape",
          name: "都井岬",
          nameEn: "Cape Toi",
          points: [{ id: "toi_cape", lat: 31.364556, lng: 131.347389 }]
        },
        {
          id: "ebino_plateau",
          name: "えびの高原",
          nameEn: "Ebino Plateau",
          points: [{ id: "ebino_plateau", lat: 31.943807, lng: 130.839043 }]
        },
        {
          id: "umagase",
          name: "馬ヶ背",
          nameEn: "Umagase",
          points: [{ id: "umagase", lat: 32.425389, lng: 131.68425 }]
        },
        {
          id: "sunmesse_nichinan",
          name: "サンメッセ日南",
          nameEn: "Sun Messe Nichinan",
          points: [{ id: "sunmesse_nichinan", lat: 31.663278, lng: 131.460957 }]
        },
        {
          id: "yunohira",
          name: "湯之平展望所",
          nameEn: "Yunohira Observatory",
          points: [{ id: "yunohira", lat: 31.591489, lng: 130.629976 }]
        },
        {
          id: "shiroyama_kagoshima",
          name: "城山展望台",
          nameEn: "Shiroyama Observatory",
          points: [{ id: "shiroyama_kagoshima", lat: 31.596265, lng: 130.550087 }]
        },
        {
          id: "ibusuki_onsen",
          name: "指宿温泉",
          nameEn: "Ibusuki Onsen",
          points: [{ id: "ibusuki_onsen", lat: 31.22314, lng: 130.65506 }]
        },
        {
          id: "nagasakibana",
          name: "長崎鼻",
          nameEn: "Cape Nagasakibana",
          points: [{ id: "nagasakibana", lat: 31.155767, lng: 130.586662 }]
        },
        {
          id: "lake_ikeda",
          name: "池田湖",
          nameEn: "Lake Ikeda",
          points: [{ id: "lake_ikeda", lat: 31.246606, lng: 130.545574 }]
        },
        {
          id: "kirishima_onsen",
          name: "霧島温泉郷",
          nameEn: "Kirishima Onsen",
          points: [{ id: "kirishima_onsen", lat: 31.893536, lng: 130.827611 }]
        },
        {
          id: "ogawa_falls",
          name: "雄川の滝",
          nameEn: "Ogawa Falls",
          points: [{ id: "ogawa_falls", lat: 31.200306, lng: 130.825278 }]
        },
        {
          id: "shiratani",
          name: "白谷雲水峡",
          nameEn: "Shiratani Unsuikyo",
          points: [{ id: "shiratani", lat: 30.380809, lng: 130.575023 }]
        },
        {
          id: "ayamaru_cape",
          name: "あやまる岬",
          nameEn: "Cape Ayamaru",
          points: [{ id: "ayamaru_cape", lat: 28.473038, lng: 129.716302 }]
        },
        {
          id: "karato_market",
          name: "唐戸市場",
          nameEn: "Karato Market",
          points: [{ id: "karato_market", lat: 33.956611, lng: 130.945833 }]
        },
        {
          id: "kamon_wharf",
          name: "カモンワーフ",
          nameEn: "Kamon Wharf",
          points: [{ id: "kamon_wharf", lat: 33.956287, lng: 130.944123 }]
        },
        {
          id: "kaikyokan",
          name: "海響館",
          nameEn: "Kaikyokan",
          points: [{ id: "kaikyokan", lat: 33.954472, lng: 130.942417 }]
        },
        {
          id: "tsunoshima_lighthouse",
          name: "角島灯台",
          nameEn: "Tsunoshima Lighthouse",
          points: [{ id: "tsunoshima_lighthouse", lat: 34.3525, lng: 130.841111 }]
        },
        {
          id: "kawatana_onsen_town",
          name: "川棚温泉",
          nameEn: "Kawatana Onsen",
          points: [{ id: "kawatana_onsen_town", lat: 34.140679, lng: 130.935872 }]
        },
        {
          id: "kanmon_walkway",
          name: "関門トンネル人道",
          nameEn: "Kanmon Pedestrian Tunnel",
          points: [{ id: "kanmon_walkway", lat: 33.965532, lng: 130.955801 }]
        },
        {
          id: "mimosuso_park",
          name: "みもすそ川公園",
          nameEn: "Mimosusogawa Park",
          points: [{ id: "mimosuso_park", lat: 33.966233, lng: 130.957556 }]
        },
        {
          id: "chichibugahama",
          name: "父母ヶ浜",
          nameEn: "Chichibugahama",
          points: [{ id: "chichibugahama", lat: 34.18831, lng: 133.646831 }]
        },
        {
          id: "shiudeyama",
          name: "紫雲出山",
          nameEn: "Mount Shiude",
          points: [{ id: "shiudeyama", lat: 34.2447, lng: 133.5956 }]
        },
        {
          id: "yashima_observatory",
          name: "屋島展望台",
          nameEn: "Yashima Observatory",
          points: [{ id: "yashima_observatory", lat: 34.358105, lng: 134.098629 }]
        },
        {
          id: "kankakei",
          name: "寒霞渓",
          nameEn: "Kankakei",
          points: [{ id: "kankakei", lat: 34.515567, lng: 134.300574 }]
        },
        {
          id: "angel_road",
          name: "エンジェルロード",
          nameEn: "Angel Road",
          points: [{ id: "angel_road", lat: 34.479802, lng: 134.186478 }]
        },
        {
          id: "zenigata",
          name: "銭形砂絵",
          nameEn: "Zenigata Sand Art",
          points: [{ id: "zenigata", lat: 34.134142, lng: 133.642281 }]
        },
        {
          id: "goshikidai",
          name: "五色台",
          nameEn: "Goshikidai",
          points: [{ id: "goshikidai", lat: 34.35, lng: 133.938889 }]
        },
        {
          id: "naruto_whirlpools",
          name: "鳴門の渦潮",
          nameEn: "Naruto Whirlpools",
          points: [{ id: "naruto_whirlpools", lat: 34.237498, lng: 134.646977 }]
        },
        {
          id: "oboke_gorge",
          name: "大歩危",
          nameEn: "Oboke Gorge",
          points: [{ id: "oboke_gorge", lat: 33.884574, lng: 133.755902 }]
        },
        {
          id: "koboke_gorge",
          name: "小歩危",
          nameEn: "Koboke Gorge",
          points: [{ id: "koboke_gorge", lat: 33.930257, lng: 133.761756 }]
        },
        {
          id: "kazurabashi",
          name: "祖谷のかずら橋",
          nameEn: "Iya Vine Bridge",
          points: [{ id: "kazurabashi", lat: 33.875462, lng: 133.833764 }]
        },
        {
          id: "iya_double_bridge",
          name: "奥祖谷二重かずら橋",
          nameEn: "Iya Double Vine Bridge",
          points: [{ id: "iya_double_bridge", lat: 33.8535, lng: 134.045722 }]
        },
        {
          id: "bizan",
          name: "眉山展望台",
          nameEn: "Mount Bizan Observatory",
          points: [{ id: "bizan", lat: 34.066926, lng: 134.537699 }]
        },
        {
          id: "mount_tsurugi",
          name: "剣山",
          nameEn: "Mount Tsurugi",
          points: [{ id: "mount_tsurugi", lat: 33.867284, lng: 134.089727 }]
        },
        {
          id: "dogo_onsen",
          name: "道後温泉",
          nameEn: "Dogo Onsen",
          points: [{ id: "dogo_onsen", lat: 33.851944, lng: 132.786389 }]
        },
        {
          id: "kurushima_observatory",
          name: "来島海峡展望館",
          nameEn: "Kurushima Kaikyo Observatory",
          points: [{ id: "kurushima_observatory", lat: 34.114025, lng: 132.977833 }]
        },
        {
          id: "himezurudaira",
          name: "姫鶴平",
          nameEn: "Himezurudaira",
          points: [{ id: "himezurudaira", lat: 33.467498, lng: 132.962504 }]
        },
        {
          id: "omogo_gorge",
          name: "面河渓",
          nameEn: "Omogo Gorge",
          points: [{ id: "omogo_gorge", lat: 33.736239, lng: 133.114961 }]
        },
        {
          id: "futami_seaside",
          name: "双海シーサイド公園",
          nameEn: "Futami Seaside Park",
          points: [{ id: "futami_seaside", lat: 33.685222, lng: 132.634222 }]
        },
        {
          id: "cape_sadamizaki",
          name: "佐田岬",
          nameEn: "Cape Sada",
          points: [{ id: "cape_sadamizaki", lat: 33.344, lng: 132.012973 }]
        },
        {
          id: "yusu_terraces",
          name: "遊子水荷浦の段畑",
          nameEn: "Yusu Mizugaura Terraces",
          points: [{ id: "yusu_terraces", lat: 33.20675, lng: 132.455417 }]
        },
        {
          id: "katsurahama",
          name: "桂浜",
          nameEn: "Katsurahama",
          points: [{ id: "katsurahama", lat: 33.495497, lng: 133.573836 }]
        },
        {
          id: "sada_chinka",
          name: "佐田沈下橋",
          nameEn: "Sada Chinka Bridge",
          points: [{ id: "sada_chinka", lat: 33.015432, lng: 132.885949 }]
        },
        {
          id: "cape_ashizuri",
          name: "足摺岬",
          nameEn: "Cape Ashizuri",
          points: [{ id: "cape_ashizuri", lat: 32.723333, lng: 133.02 }]
        },
        {
          id: "cape_muroto",
          name: "室戸岬",
          nameEn: "Cape Muroto",
          points: [{ id: "cape_muroto", lat: 33.242778, lng: 134.176389 }]
        },
        {
          id: "kashima_island",
          name: "柏島",
          nameEn: "Kashima Island",
          points: [{ id: "kashima_island", lat: 32.769361, lng: 132.621444 }]
        },
        {
          id: "nikobuchi",
          name: "にこ淵",
          nameEn: "Nikobuchi",
          points: [{ id: "nikobuchi", lat: 33.705145, lng: 133.341099 }]
        },
        {
          id: "ryuga_cave",
          name: "龍河洞",
          nameEn: "Ryuga Cave",
          points: [{ id: "ryuga_cave", lat: 33.603164, lng: 133.745178 }]
        },
        {
          id: "tengu_plateau",
          name: "天狗高原",
          nameEn: "Tengu Plateau",
          points: [{ id: "tengu_plateau", lat: 33.474694, lng: 132.994556 }]
        },
        {
          id: "monet_garden_kitagawa",
          name: "モネの庭マルモッタン",
          nameEn: "Monet's Garden Marmottan",
          points: [{ id: "monet_garden_kitagawa", lat: 33.439809, lng: 134.033601 }]
        },
      ]
    }
  };

  function pointRecord(category, place, point) {
    return {
      category: category.id,
      placeId: place.id,
      pointId: point.id,
      radiusMeters: place.radiusMeters || category.radiusMeters,
      maxAccuracyMeters: category.maxAccuracyMeters,
      name: point.name || place.name,
      nameEn: point.nameEn || place.nameEn || "",
      placeName: place.name,
      placeNameEn: place.nameEn || "",
      lat: point.lat,
      lng: point.lng,
      special: place.special === true,
      role: place.role || "",
      rewards: place.rewards || null
    };
  }

  function findPoint(pointId) {
    var categories = [LOCATIONS.railway, LOCATIONS.airport, LOCATIONS.scenic];
    var c;
    var p;
    var i;
    var point;
    for (c = 0; c < categories.length; c += 1) {
      for (p = 0; p < categories[c].places.length; p += 1) {
        var place = categories[c].places[p];
        var points = place.points || [{ id: place.id }];
        for (i = 0; i < points.length; i += 1) {
          if (points[i].id === pointId) {
            point = points[i];
            return pointRecord(categories[c], place, point);
          }
        }
      }
    }
    return airportFromMap(pointId) || stationById(pointId);
  }

  function airportFromMap(pointId) {
    var pins = (global.MAP_DATA && global.MAP_DATA.pins) || [];
    var i;
    var pin;
    for (i = 0; i < pins.length; i += 1) {
      pin = pins[i];
      if (pin.id !== pointId || String(pin.type || "").toLowerCase() !== "airport") continue;
      if (typeof pin.lat !== "number" || typeof pin.lng !== "number") return null;
      return {
        category: "airport",
        placeId: pin.id,
        pointId: pin.id,
        radiusMeters: LOCATIONS.airport.radiusMeters,
        maxAccuracyMeters: LOCATIONS.airport.maxAccuracyMeters,
        name: pin.name,
        nameEn: pin.nameEn || "",
        placeName: pin.name,
        placeNameEn: pin.nameEn || "",
        lat: pin.lat,
        lng: pin.lng,
        special: false,
        role: "",
        rewards: null,
        featured: null
      };
    }
    return null;
  }

  function stationById(id) {
    var pins = (global.MAP_DATA && global.MAP_DATA.pins) || [];
    var i;
    var pin;
    var feature;
    for (i = 0; i < pins.length; i += 1) {
      pin = pins[i];
      if (pin.id !== id || String(pin.type || "").toLowerCase() !== "station") continue;
      if (typeof pin.lat !== "number" || typeof pin.lng !== "number") return null;
      feature = (LOCATIONS.railway.featured || {})[id] || null;
      return {
        category: "railway",
        placeId: pin.id,
        pointId: pin.id,
        radiusMeters: LOCATIONS.railway.radiusMeters,
        maxAccuracyMeters: LOCATIONS.railway.maxAccuracyMeters,
        name: pin.name,
        nameEn: pin.nameEn || "",
        placeName: pin.name,
        placeNameEn: pin.nameEn || "",
        lat: pin.lat,
        lng: pin.lng,
        special: !!(feature && feature.special),
        role: (feature && feature.role) || "",
        rewards: feature && feature.image ? { stageImage: feature.image } : null,
        featured: feature
      };
    }
    return null;
  }

  function airportPins() {
    var pins = [];
    LOCATIONS.airport.places.forEach(function (place) {
      (place.points || []).forEach(function (point) {
        pins.push({
          id: point.id,
          instanceKey: point.id,
          name: point.name || place.name,
          nameEn: point.nameEn || place.nameEn,
          area: "airport",
          line: "",
          type: "airport",
          filter: "airport",
          lat: point.lat,
          lng: point.lng,
          placeId: place.id,
          pointName: point.name,
          pointNameEn: point.nameEn
        });
      });
    });
    return pins;
  }

  global.TURBO_LOCATIONS = {
    config: LOCATIONS,
    findPoint: findPoint,
    airportPins: airportPins
  };
})(window);

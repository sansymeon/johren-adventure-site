window.MAP_CONFIG = window.MAP_CONFIG || {};

window.MAP_CONFIG.KK_GAYA = {
  center: [5.9826, 116.0737],
  zoom: 16,
  stations: [],

  pins: [
    // ☕ Coffee
    { id:"kk_gaya_daily_coffee", name:"Daily Coffee", nameEn:"Daily Coffee", type:"coffee", lat:5.985660732321517, lng:116.07799084381578 },
    { id:"kk_gaya_mizu_mizu", name:"MizuMizu Coffee", nameEn:"MizuMizu Coffee", type:"coffee", lat:5.983050873372208, lng:116.07683515719098 },

    // 🛒 Supermarket / café
    { id:"kk_gaya_tong_hing", name:"Tong Hing Supermarket & Café", nameEn:"Tong Hing Supermarket & Café", type:"supermarket", lat:5.986761323690038, lng:116.07860753607171 },

    // 🍗 Restaurants / food
    { id:"kk_gaya_5star_chicken", name:"5 Star Chicken", nameEn:"5 Star Chicken", type:"restaurant", lat:5.983031764408568, lng:116.07654463607166 },
    { id:"kk_gaya_market", name:"Api Api Night Market", nameEn:"Api Api Night Market", type:"restaurant", lat:5.984943829919245, lng:116.07773967412899 },

    // 📍 Landmarks (use restaurant or park icon fallback if you want later)
    { id:"kk_atkinson_clock", name:"Atkinson Clock Tower", nameEn:"Atkinson Clock Tower", type:"landmark", lat:5.982215481272314, lng:116.0773183937425 },
    { id:"kk_signal_hill", name:"Signal Hill Observatory", nameEn:"Signal Hill Observatory", type:"landmark", lat:5.985572923668009, lng:116.07922822257807 },
    { id:"kk_jesselton_point", name:"Jesselton Point Ferry Terminal", nameEn:"Jesselton Point Ferry Terminal", type:"landmark", lat:5.990159207045816, lng:116.07903429465016 },
    { id:"kk_waterfront", name:"Kota Kinabalu Waterfront", nameEn:"Kota Kinabalu Waterfront", type:"landmark", lat:5.979362334949551, lng:116.069949222578 },

    // 🛍️ Shopping
    { id:"kk_suria_sabah", name:"Suria Sabah", nameEn:"Suria Sabah", type:"supermarket", lat:5.986803951094435, lng:116.07751459351678 },
    { id:"kk_central_market", name:"Kota Kinabalu Central Market", nameEn:"Kota Kinabalu Central Market", type:"supermarket", lat:5.983128958818589, lng:116.07288009374253 },
    { id:"kk_filipino_market", name:"Handicraft Market", nameEn:"Filipino Market", type:"supermarket", lat:5.981233323587597, lng:116.07179395141341 },
    { id:"kk_wisma_merdeka", name:"Wisma Merdeka", nameEn:"Wisma Merdeka", type:"supermarket", lat:5.985733240095716, lng:116.07576779351677 },

    // ⛪ Church
    { id:"kk_sacred_heart_cathedral", name:"Sacred Heart Cathedral", nameEn:"Sacred Heart Cathedral", type:"church", lat:5.9651963565132435, lng:116.07241272442612 },
    { id:"kk_all_saints_cathedral", name:"All Saints Cathedral Anglican", nameEn:"All Saints Cathedral Anglican", type:"church",  lat:5.972951642647269, lng:116.07230478239839 },

    // 🕌 Mosque (fallback icon unless you add mosque.png)
    { id:"kk_floating_mosque", name:"Masjid Bandaraya Kota Kinabalu (Floating Mosque)", nameEn:"Floating Mosque", type:"mosque", lat:5.995620541789315, lng:116.10821949798203 },
    { id:"kk_state_mosque", name:"Sabah State Mosque", nameEn:"State Mosque", type:"mosque", lat:5.959647452024467, lng:116.06715338024884 },
     
    // 🏛️ Museum
    { id:"kk_sabah_museum", name:"Sabah State Museum", nameEn:"Sabah State Museum", type:"museum", lat:5.960591352375199, lng:116.07145826490698 }
  ]
};
window.MAP_CONFIG.ITOSHIMA = {
  center: [33.557, 130.199],
  zoom: 12,

 pins: [
  // 🖼️ Museums
  {
    id: "ito_art_museum",
    name: "伊都郷土美術館",
    nameEn: "Ito Art Museum",
    type: "museum",
    lat: 33.56063278048929,
    lng: 130.20447283810256
  },
  {
    id: "ito_history_museum",
    name: "伊都国歴史博物館",
    nameEn: "Ito-koku History Museum",
    type: "museum",
    lat: 33.53641274192818,
    lng: 130.25185578816215
  },

  // 🚉 Stations (Chikuhi Line)
  {
    id: "chikuhi_imajuku",
    name: "今宿",
    nameEn: "Imajuku",
    type: "station",
    line: "chikuhi",
    lat: 33.579257,
    lng: 130.273519
  },
  {
    id: "chikuhi_kyudaigakkentoshi",
    name: "九大学研都市",
    nameEn: "Kyudai-Gakkentoshi",
    type: "station",
    line: "chikuhi",
    lat: 33.578150,
    lng: 130.259861
  },
  {
    id: "chikuhi_susenji",
    name: "周船寺",
    nameEn: "Susenji",
    type: "station",
    line: "chikuhi",
    lat: 33.570792,
    lng: 130.246136
  },
  {
    id: "chikuhi_hatae",
    name: "波多江",
    nameEn: "Hatae",
    type: "station",
    line: "chikuhi",
    lat: 33.563944,
    lng: 130.226822
  },
  {
    id: "chikuhi_itoshimakoko_mae",
    name: "糸島高校前",
    nameEn: "Itoshimakoko-Mae",
    type: "station",
    line: "chikuhi",
    lat: 33.560660,
    lng: 130.213243
  },
  {
    id: "chikuhi_chikuzen_maebaru",
    name: "筑前前原",
    nameEn: "Chikuzen Maebaru",
    type: "station",
    line: "chikuhi",
    lat: 33.557082,
    lng: 130.199305
  },
  {
    id: "chikuhi_misakigaoka",
    name: "美咲が丘",
    nameEn: "Misakigaoka",
    type: "station",
    line: "chikuhi",
    lat: 33.549959,
    lng: 130.185515
  },
  {
    id: "chikuhi_kafuri",
    name: "加布里",
    nameEn: "Kafuri",
    type: "station",
    line: "chikuhi",
    lat: 33.543150,
    lng: 130.176150
  },
  {
    id: "chikuhi_ikisan",
    name: "一貴山",
    nameEn: "Ikisan",
    type: "station",
    line: "chikuhi",
    lat: 33.534295,
    lng: 130.168242,
    visible: false
  },
  {
    id: "chikuhi_chikuzen_fukae",
    name: "筑前深江",
    nameEn: "Chikuzen Fukae",
    type: "station",
    line: "chikuhi",
    lat: 33.514949,
    lng: 130.139429
  },
  {
    id: "chikuhi_dainyu",
    name: "大入",
    nameEn: "Dainyu",
    type: "station",
    line: "chikuhi",
    lat: 33.508855,
    lng: 130.106038,
    visible: false
  },
  {
    id: "chikuhi_fukuyoshi",
    name: "福吉",
    nameEn: "Fukuyoshi",
    type: "station",
    line: "chikuhi",
    lat: 33.501554,
    lng: 130.079523
  },
  {
    id: "chikuhi_shikaka",
    name: "鹿家",
    nameEn: "Shikaka",
    type: "station",
    line: "chikuhi",
    lat: 33.484259,
    lng: 130.047476,
    visible: false
  },

  // ⛪ Churches
  {
    id: "itoshima_catholic",
    name: "糸島カトリック教会",
    nameEn: "Itoshima Catholic Church",
    type: "church",
    lat: 33.584095,
    lng: 130.189016
  },
  {
    id: "west_fukuoka_baptist",
    name: "福岡西部バプテスト教会",
    nameEn: "West Fukuoka Baptist Church",
    type: "church",
    lat: 33.56349797391542,
    lng: 130.20519427279035
  },
  {
    id: "maebaru_christian",
    name: "日本基督教団 前原教会",
    nameEn: "Maebaru Christian Church (UCCJ)",
    type: "church",
    lat: 33.55976434044294,
    lng: 130.19648464789108
  },

  // ⛩️ Shrines
  {
    id: "futamigaura_torii",
    name: "二見ヶ浦 海中大鳥居",
    nameEn: "Futamigaura Seaside Torii Gate",
    type: "shrine",
    lat: 33.6393416472,
    lng: 130.1971275794
  },
  {
    id: "sakurai_shrine",
    name: "櫻井神社",
    nameEn: "Sakurai Shrine",
    type: "shrine",
    lat: 33.6281710061135,
    lng: 130.191945877441
  },

  // 🛕 Temples
  {
    id: "raizan_sennyoji",
    name: "雷山千如寺 大悲王院",
    nameEn: "Raizan Sennyoji Daihioin",
    type: "temple",
    lat: 33.49445385812953,
    lng: 130.22869414812786
  },
  {
    id: "myokyuji",
    name: "妙休寺",
    nameEn: "Myokyuji Temple",
    type: "temple",
    lat: 33.5209311307555,
    lng: 130.1898939676296
   },
  ],

  history_pool: [
    "このあたりには、古い埋葬の跡が点在しています。",
    "伊都国と呼ばれた土地の記憶が、この地域に重なっています。",
    "人が集まり、祈り、別れた痕跡が残る場所です。",
    "文字になる前の時間が、静かに積み重なっています。",
    "海と陸の境で、多くの往来があったと考えられています。",
    "地面の下には、まだ語られていない記憶があります。"
  ]
};

window.MAP_CONFIG = window.MAP_CONFIG || {};356

window.MAP_CONFIG.kk_gaya = {
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
window.MAP_CONFIG.itoshima = {
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
  window.MAP_CONFIG.karatsu = {  
    center: [33.4533, 129.9782], 
    zoom: 12,

  pins: [
    //  stations
    { 
      id: "jr-chikuhi-jk16", 
      name: "浜崎", 
      nameEn: "Hamasaki", 
      type: "station",
      lat: 33.44672, 
      lng: 130.036798 
      },
      { 
        id: "jr-chikuhi-jk17", 
       name: "虹の松原", 
       nameEn: "Nijinomatsubara", 
        type: "station",
        lat: 33.441033, 
        lng: 130.01619 
      },
      { 
        id: "jr-chikuhi-jk18", 
       name: "東唐津", 
       nameEn: "Higashi Karatsu", 
         type: "station",
        lat: 33.439393, 
        lng: 129.996837 
  
      },
    
      { 
        id: "jr-chikuhi-jk19", 
       name: "和多田", 
        nameEn: "Watada", 
         type: "station",
        lat: 33.436933, 
        lng: 129.980768 
      },
      { 
        id: "jr-chikuhi-jk20", 
       name: "唐津", 
       nameEn: "Karatsu", 
        type: "station",
        lat: 33.446223, 
       lng: 129.967587 
      },
      { 
        id: "jr-chikuhi-jk21", 
       name: "西唐津", 
       nameEn: "Nishi Karatsu", 
         type: "station",
        lat: 33.461434, 
        lng: 129.95748 
      },
      { 
        id: "jr-karatsu-yamamoto", 
       name: "山本", 
       nameEn: "Yamamoto", 
        type: "station",
        lat: 33.39278208271683, 
        lng: 129.98118155167737 
      },
      { 
        id: "jr-karatsu-ouchi", 
       name: "相知", 
        nameEn: "Ouchi", 
        type: "station",
        lat: 33.34699039849446, 
        lng: 130.01952634118035 
      },
      { 
        id: "jr-karatsu-iwaya", 
       name: "岩屋", 
        nameEn: "Iwaya", 
        type: "station",
        lat: 33.33076505677805, 
        lng: 130.03827683163834 
      }
    ],

    churches: [
      {
        id: "karatsu_catholic",
        name: "カトリック唐津教会",      
        nameEn: "Karatsu Catholic Church",
         type: "church",
        lat: 33.45252801155086,            
        lng: 129.9614152412968
      }
    ],

    museums: [
      { 
         id: "hikiyama_hall",
       name: "曳山展示場", 
       nameEn: "Hikiyama Exhibition Hall", 
        type: "museum",
       lat: 33.445946414612074, 
       lng: 129.96991124129468 
      },
      { 
        id: "karatsu_castle",
        name: "唐津城", 
       nameEn: "Karatsu Castle", 
        type: "museum",
          lat: 33.45345765716856, 
       lng: 129.9782080418245 
      },
      { 
        id: "takatori_museum",
        name: "旧高取邸", 
       nameEn: "Former Takatori Residence", 
        type: "museum",
          lat: 33.45437629769318, 
       lng: 129.97209266442803 
      }
    ],

    shrines: [
      { 
        id: "karatsu_shrine",
        name: "唐津神社", 
       nameEn: "Karatsu Shrine", 
        type: "shrine",
      lat: 33.45227410257489, 
       lng: 129.96948404957564 
      },
      { 
        id: "myoken_shrine",
        name: "妙見神社", 
       nameEn: "Myoken Shrine", 
         type: "shrine",
          lat: 33.46854559781762, 
       lng: 129.95317852240166 
      }
    ],

    temples: [
      { 
        id: "gonshoji_temple",
        name: "近松寺", 
       nameEn: "Gonshoji Temple", 
         type: "temple",
      lat: 33.449901908390125, 
       lng: 129.96520797775324 
      }
    ],

    history_pool: [
      "この土地は、海から来るものと陸に残るものを見分けてきました。",
      "波の記憶と、人の営みが重なって残っています。",
      "通り過ぎる者と、ここに留まった者の痕跡があります。",
      "境であることが、長く続いてきた場所です。",
      "名が変わっても、役割は静かに受け継がれてきました。",
      "語られなかった時間が、このあたりに沈んでいます。"
    ]
};
window.MAP_CONFIG = { fukuoka_chuo: {
    center: [33.58602, 130.37622],
    zoom: 12,

    pins: {
      stations: [
        {
          id: "airport-tenjin",
          type: "station",
          name: "天神",
          nameEn: "Tenjin",
          lat: 33.5913469503287,
          lng: 130.39891098113026
        },
        {
          id: "airport-akasaka",
          type: "station",
          name: "赤坂",
          nameEn: "Akasaka",
          lat: 33.589112760371975,
          lng: 130.3905781504464
        },
        {
          id: "airport-ohorikoen",
          type: "station",
          name: "大濠公園",
          nameEn: "Ohorikoen",
          lat: 33.59014125983869,
          lng: 130.37884327558552
        },
        {
          id: "fukuoka-tenjin-minami",
          type: "station",
          name: "天神南",
          nameEn: "Tenjin Minami",
          lat: 33.588670997721565,
          lng: 130.40265554434566
        },
        {
          id: "fukuoka-yakuin",
          type: "station",
          name: "薬院",
          nameEn: "Yakuin",
          lat: 33.5817638907711,
          lng: 130.40165000141508
        }
      ],

      churches: [
        {
          id: "daimyo_catholic_church",
          type: "church",
          name: "カトリック大名町教会",
          nameEn: "Daimyo Catholic Church",
          lat: 33.59028689597394,
          lng: 130.39490595063134
        }
      ],

      museums: [
        {
          id: "fukuoka_art_museum",
          type: "museum",
          name: "福岡市美術館",
          nameEn: "Fukuoka Art Museum",
          lat: 33.58411652460625,
          lng: 130.37958344698214
        }
      ],

      shrines: [
        {
          id: "terumo_shrine",
          type: "shrine",
          name: "光雲神社",
          nameEn: "Terumo Shrine",
          lat: 33.597145537533365,
          lng: 130.37643231206792
        },
        {
          id: "fukuoka_gokoku_shrine",
          type: "shrine",
          name: "福岡縣護國神社",
          nameEn: "Fukuoka Prefecture Gokoku Shrine",
          lat: 33.58171522775,
          lng: 130.38203472165
        }
      ],

      temples: [],
      parks: []
       },

    history_pool: [
      "かつて境界だった場所が、日常の通り道になりました。",
      "見張るための高みが、憩いの場所に変わっています。",
      "権力の気配と生活の音が、同じ地面に重なっています。",
      "囲いと解放が、何度も書き換えられてきました。",
      "人の流れが、役割を終えた土地をやわらかくしています。",
      "静けさの中に、長く管理されてきた記憶があります。"
    ]
  }
};

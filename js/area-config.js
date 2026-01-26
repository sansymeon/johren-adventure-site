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

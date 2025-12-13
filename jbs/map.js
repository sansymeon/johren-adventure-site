
// -------------------------------
// INITIALIZE MAP
// -------------------------------
const map = L.map('map', {
  zoomControl: true
}).setView([33.413, 130.630], 12);   // Northern Kyushu center



// -------------------------------
// TILE LAYER
// -------------------------------
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 7,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// -------------------------------
// ICON FACTORY (cleaner)
// -------------------------------
function makeIcon(file) {
  return L.icon({
    iconUrl: `../../../img/map/${file}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -30]
  });
}

// -------------------------------
// ALL ICONS
// -------------------------------
const icons = {
  bookstore: makeIcon('bookstore.png'),
  coffee: makeIcon('coffee.png'),
  bakery: makeIcon('bakery_jbs.png'),
  barbershop: makeIcon('barber_jbs.png'),
  beauty: makeIcon('beauty_jbs.png'),
  restaurant: makeIcon('restaurant_jbs.png'),
  convenience: makeIcon('combini_jbs.png'),
  noodles: makeIcon('noodles_jbs.png'),
  artisan: makeIcon('artisan_jbs.png'),
  therapy: makeIcon('therapy_jbs.png'),
  supermarket: makeIcon('supermarket_jbs.png'),
  // Add more anytime — ALL handled automatically
};


// -------------------------------
// GENERIC CATEGORY LOADER
// -------------------------------
function loadCategory(categoryName, iconName) {
  const list = window[categoryName];
  const icon = icons[iconName];

  if (list && list.length > 0 && icon) {
    list.forEach(item => {
      L.marker([item.lat, item.lng], { icon })
        .addTo(map)
        .bindPopup(item.name);
    });
  }
}


// -------------------------------
// LOAD ALL CATEGORIES
// (Add or remove freely — no extra JS edits needed)
// -------------------------------
loadCategory("artisans", "artisan");
loadCategory("bakeries", "bakery");
loadCategory("barbershops", "barbershop");
loadCategory("beautyshops", "beauty");
loadCategory("bookstores", "bookstore");
loadCategory("coffeeshops", "coffee");
loadCategory("combini", "convenience");
loadCategory("noodles", "noodles");
loadCategory("restaurants", "restaurant");
loadCategory("supermarkets", "supermarket");
loadCategory("therapies", "therapy");


// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

// -------------------------------
// INITIALIZE MAP
// -------------------------------
const map = L.map('map', {
  zoomControl: true
}).setView([33.557082, 130.199305], 12);   // Chikuzen-Maebaru center


// -------------------------------
// TILE LAYER
// -------------------------------
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
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
  station: makeIcon('station.png'),
  bookstore: makeIcon('bookstore.png'),
  coffee: makeIcon('coffee.png'),
  bakery: makeIcon('bakery.png'),
  clinic: makeIcon('clinic.png'),
  barbershop: makeIcon('barber.png'),
  beauty: makeIcon('beauty.png'),
  shrine: makeIcon('shrine.png'),
  temple: makeIcon('temple.png'),
  church: makeIcon('church.png'),
  museum: makeIcon('museum.png'),
  restaurant: makeIcon('restaurant.png'),
  convenience: makeIcon('combini.png'),
  noodles: makeIcon('noodles.png'),
  artisan: makeIcon('artisan.png'),
  library: makeIcon('library.png'),
  clinic: makeIcon('clinic.png'),
  playground: makeIcon('playground.png'),
  park: makeIcon('park.png')
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
loadCategory("stations", "station");
loadCategory("bookstores", "bookstore");
loadCategory("coffeeshops", "coffee");
loadCategory("bakeries", "bakery");
loadCategory("clinics", "clinic");
loadCategory("barbershops", "barbershop");
loadCategory("beautyshops", "beauty");
loadCategory("shrines", "shrine");
loadCategory("temples", "temple");
loadCategory("churches", "church");
loadCategory("museums", "museum");
loadCategory("combini", "convenience");
loadCategory("restaurants", "restaurant");
loadCategory("noodles", "noodles");
loadCategory("supermarkets", "supermarket");
loadCategory("artisans", "artisan");
loadCategory("clinics", "clinic");
loadCategory("libraries", "library");
loadCategory("playgrounds", "playground");
loadCategory("parks", "park");

// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

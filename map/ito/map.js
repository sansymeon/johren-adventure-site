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
  artisan: makeIcon('artisan.png'),
  bakery: makeIcon('bakery.png'),
  barbershop: makeIcon('barber.png'),
  bath: makeIcon('bath.png'),
  beauty: makeIcon('beauty.png'),
  bookstore: makeIcon('bookstore.png'),
  church: makeIcon('church.png'),
  clinic: makeIcon('clinic.png'),
  coffee: makeIcon('coffee.png'),
  combini: makeIcon('combini.png'),
  drugstore: makeIcon('drugs.png'),
  hotel: makeIcon('hotel.png'),
  library: makeIcon('library.png'),
  museum: makeIcon('museum.png'),
  noodles: makeIcon('noodles.png'),
  park: makeIcon('park.png'),
  playground: makeIcon('playground.png'),
  restaurant: makeIcon('restaurant.png'),
  shrine: makeIcon('shrine.png'),
  station: makeIcon('station.png'),
  supermarket: makeIcon('supermarket.png'),
  temple: makeIcon('temple.png')
  
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
loadCategory("bath", "bath");
loadCategory("beautyshops", "beauty");
loadCategory("bookstores", "bookstore");
loadCategory("churches", "church");
loadCategory("clinics", "clinic");
loadCategory("coffeeshops", "coffee");
loadCategory("combini", "combini");
loadCategory("drugstores", "drugstore");
loadCategory("hotels", "hotel");
loadCategory("libraries", "library");
loadCategory("museums", "museum");
loadCategory("noodles", "noodles");
loadCategory("parks", "park");
loadCategory("playgrounds", "playground");
loadCategory("restaurants", "restaurant");
loadCategory("shrines", "shrine");
loadCategory("stations", "station");
loadCategory("supermarkets", "supermarket");
loadCategory("temples", "temple");

// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

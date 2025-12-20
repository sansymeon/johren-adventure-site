// -------------------------------
// INITIALIZE MAP
// -------------------------------
const params = new URLSearchParams(window.location.search);

const lat  = parseFloat(params.get('lat'));
const lng  = parseFloat(params.get('lng'));
const zoom = parseInt(params.get('zoom')) || 12;

// fallback if link has no params
const defaultCenter = [33.557082, 130.199305]; // Itoshima
const defaultZoom = 12;

const hasValidCoords = !isNaN(lat) && !isNaN(lng);

const map = L.map('map', { zoomControl: false })
  .setView(
    hasValidCoords ? [lat, lng] : defaultCenter,
    hasValidCoords ? zoom : defaultZoom
  );


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
  coffee: makeIcon('coffee.png'),
  combini: makeIcon('combini.png'),
  drugstore: makeIcon('drugs.png'),
  hotel: makeIcon('hotel.png'),
  noodles: makeIcon('noodles.png'),
  restaurant: makeIcon('restaurant.png'),
  supermarket: makeIcon('supermarket.png'),
  sample: makeIcon('sample.png')
  
  // Add more anytime — ALL handled automatically
};

// -------------------------------
// GENERIC CATEGORY LOADER (JBS)
// Only shows items with explicit permission
// -------------------------------
function loadCategory(categoryName, iconName) {
  const list = window[categoryName];
  const icon = icons[iconName];

  if (!list || !icon) return;

  list
    .filter(item => item.visible === true)
    .forEach(item => {
      L.marker([item.lat, item.lng], { icon })
        .addTo(map)
        .bindPopup(item.name);
    });
}


// -------------------------------
// LOAD ALL CATEGORIES
// (Add or remove freely — no extra JS edits needed)
// -------------------------------

loadCategory("artisans", "artisan");
loadCategory("bakeries", "bakery");
loadCategory("baths", "bath");
loadCategory("beautyshops", "beauty");
loadCategory("bookstores", "bookstore");
loadCategory("coffeeshops", "coffee");
loadCategory("combini", "combini");
loadCategory("drugstores", "drugstore");
loadCategory("hotels", "hotel");
loadCategory("noodles", "noodles");
loadCategory("playgrounds", "playground");
loadCategory("restaurants", "restaurant");
loadCategory("supermarkets", "supermarket");


// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

window.samples.forEach(s => {
  L.marker([s.lat, s.lng], { icon: icons.sample })
    .addTo(map)
    .on('click', () => {
      window.location.href = s.url;
    });
});



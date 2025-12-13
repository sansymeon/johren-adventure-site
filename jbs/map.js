
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
  maxZoom: 3,
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
  bakery: makeIcon('bakery.png'),
  barbershop: makeIcon('barber.png'),
  beauty: makeIcon('beauty.png'),
  restaurant: makeIcon('restaurant.png'),
  convenience: makeIcon('combini.png'),
  noodles: makeIcon('noodles.png'),
  artisan: makeIcon('artisan.png'),
  therapy: makeIcon('therapy.png'),
  clinic: makeIcon('clinic.png'),
  supermarket: makeIcon('supermarket.png'),
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
loadCategory("bookstores", "bookstore");
loadCategory("coffeeshops", "coffee");
loadCategory("bakeries", "bakery");
loadCategory("barbershops", "barbershop");
loadCategory("beautyshops", "beauty");
loadCategory("combini", "convenience");
loadCategory("restaurants", "restaurant");
loadCategory("noodles", "noodles");
loadCategory("supermarkets", "supermarket");
loadCategory("artisans", "artisan");
loadCategory("therapies", "therapy");
loadCategory("clinics", "clinic");

// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

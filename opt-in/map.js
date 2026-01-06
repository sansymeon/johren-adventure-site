// ===============================
// MAP CONTEXT DETECTION
// ===============================
const isOptInMap = !!window.OPT_IN_MAP;

if (!isOptInMap && !window.AREA_KEY) {
  console.error('AREA_KEY missing');
  return;
}

// Resolve map configuration ONCE
const mapConfig = isOptInMap
  ? window.OPT_IN_MAP
  : window.MAP_CONFIG?.[window.AREA_KEY];

if (!mapConfig) {
  console.error('Map config not found');
  return;
}

// ===============================
// MAP INITIALIZATION
// ===============================
const params = new URLSearchParams(window.location.search);

const lat  = parseFloat(params.get('lat'));
const lng  = parseFloat(params.get('lng'));
const zoom = parseInt(params.get('zoom'), 10);

const hasValidCoords = !isNaN(lat) && !isNaN(lng);

const center = hasValidCoords
  ? [lat, lng]
  : mapConfig.center;

const finalZoom = hasValidCoords
  ? (zoom || mapConfig.zoom)
  : mapConfig.zoom;

const map = L.map('map', { zoomControl: false })
  .setView(center, finalZoom);

// ===============================
// TILE LAYER
// ===============================
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ===============================
// ICON FACTORY
// ===============================
function makeIcon(file) {
  return L.icon({
    iconUrl: `../../../img/map/${file}`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -30]
  });
}

// ===============================
// ICON REGISTRY
// ===============================
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
  playground: makeIcon('playground.png'),
  sample: makeIcon('sample.png')
};

// ===============================
// CATEGORY LOADER
// ===============================
function loadCategory(categoryName, iconName) {
  const list = window[categoryName];
  const icon = ic

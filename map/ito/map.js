// -------------------------------
// LOCAL STORAGE KEYS
// -------------------------------
const STORAGE_KEY = "johren_station_checkin";
const EMERGED_KEY = "johren_emerged_category";

function getCheckedInStation() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}


function setCheckedInStation(station) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: station.name,
      lat: station.lat,
      lng: station.lng
    })
  );
}


function getEmergedCategory() {
  return localStorage.getItem(EMERGED_KEY);
}

function setEmergedCategory(cat) {
  localStorage.setItem(EMERGED_KEY, cat);
}

function resetJohrenState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(EMERGED_KEY);
}

// -------------------------------
// INITIALIZE MAP
// -------------------------------
const map = L.map('map', {
  zoomControl: false
}).setView([33.557082, 130.199305], 12);   // Chikuzen-Maebaru center

L.control.zoom({
  position: 'topright'
}).addTo(map);



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

function triggerEmergence(station) {
  if (getEmergedCategory()) return;

  const categoryToReveal = "coffeeshops";
  setEmergedCategory(categoryToReveal);
  revealCategory(categoryToReveal, station);
}


function revealCategory(categoryName, station, radiusKm = 1.2) {
  const list = window[categoryName];
  if (!list) return;

  list.forEach(item => {
    if (!item._marker) return;

    const d = distanceKm(station, item);
    if (d <= radiusKm) {
      item._marker.addTo(map).bindPopup(item.name);
    }
  });
}



// -------------------------------
// GENERIC CATEGORY LOADER
// -------------------------------
function loadCategory(categoryName, iconName, options = {}) {
  const list = window[categoryName];
  const icon = icons[iconName];

  if (!list || !icon) return;

  list.forEach(item => {
    const marker = L.marker([item.lat, item.lng], { icon });

    if (options.onClick) {
      marker.on("click", () => options.onClick(item, marker));
    }

    if (!options.hidden) {
      marker.addTo(map);
    }

    item._marker = marker; // store reference
  });
}
loadCategory("stations", "station", {
  onClick: (station) => {
    if (!getCheckedInStation()) {
      setCheckedInStation(station);
      triggerEmergence(station);
    }
  }
});

function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x = Math.sin(dLat/2)**2 +
            Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));



// -------------------------------
// LOAD ALL CATEGORIES
// (Add or remove freely — no extra JS edits needed)
// -------------------------------

loadCategory("artisans", "artisan" ,{ hidden: true });
loadCategory("bakeries", "bakery" ,{ hidden: true });
loadCategory("baths", "bath" ,{ hidden: true });
loadCategory("beautyshops", "beauty" ,{ hidden: true });
loadCategory("bookstores", "bookstore" ,{ hidden: true });
loadCategory("churches", "church" ,{ hidden: true });
loadCategory("clinics", "clinic" ,{ hidden: true });
loadCategory("coffeeshops", "coffee", { hidden: true });
loadCategory("combini", "combini" ,{ hidden: true });
loadCategory("drugstores", "drugstore" ,{ hidden: true });
loadCategory("hotels", "hotel" ,{ hidden: true });
loadCategory("libraries", "library" ,{ hidden: true });
loadCategory("museums", "museum" ,{ hidden: true });
loadCategory("noodles", "noodles" ,{ hidden: true });
loadCategory("parks", "park" ,{ hidden: true });
loadCategory("playgrounds", "playground" ,{ hidden: true });
loadCategory("restaurants", "restaurant" ,{ hidden: true });
loadCategory("shrines", "shrine" ,{ hidden: true });
loadCategory("supermarkets", "supermarket", { hidden: true });
loadCategory("temples", "temple" ,{ hidden: true });

// Add new categories anytime — only 2 steps:
// 1) put your icon → /img/map/
// 2) add "window.xxx = [...]" in map-data.js

const emerged = getEmergedCategory();
const station = getCheckedInStation();

if (emerged && station) {
  revealCategory(emerged, station);
}




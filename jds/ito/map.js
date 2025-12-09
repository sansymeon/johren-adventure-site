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
// CUSTOM ICONS
// -------------------------------
const stationIcon = L.icon({
  iconUrl: '../../../img/map/station.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

const bookstoreIcon = L.icon({
  iconUrl: '../../../img/map/bookstore.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

const coffeeIcon = L.icon({
  iconUrl: '../../../img/map/coffee.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

// -------------------------------
// STATIONS (loaded from map-data.js)
// -------------------------------
if (window.stations && window.stations.length > 0) {
  window.stations.forEach(st => {
    L.marker([st.lat, st.lng], { icon: stationIcon })
      .addTo(map)
      .bindPopup(st.name);
  });
} else {
  console.error("stations[] not loaded!");
}

// -------------------------------
// BOOKSTORES
// -------------------------------
if (window.bookstores && window.bookstores.length > 0) {
  window.bookstores.forEach(store => {
    L.marker([store.lat, store.lng], { icon: bookstoreIcon })
      .addTo(map)
      .bindPopup(store.name);
  });
}
// -------------------------------
// COFFEESHOPS
// -------------------------------
if (window.coffeeshops && window.coffeeshops.length > 0) {
  window.coffeeshops.forEach(store => {
    L.marker([store.lat, store.lng], { icon: coffeeIcon })
      .addTo(map)
      .bindPopup(store.name);
  });
}

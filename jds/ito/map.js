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
// STATIONS (loaded from map-data.js)
// -------------------------------
if (window.stations && window.stations.length > 0) {
  window.stations.forEach(st => {
    L.marker([st.lat, st.lng])
      .addTo(map)
      .bindPopup(st.name);
  });
} else {
  console.error("stations[] not loaded!");
}

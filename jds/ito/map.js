// jds/ito/map.js

// Fallback: if stations failed to load, don't crash
const stationData = Array.isArray(window.stations) ? window.stations : [];

const mapCenter = [33.560660, 130.213243]; // 糸島高校前付近

const map = L.map('map').setView(mapCenter, 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Drop a pin for each station
stationData.forEach(st => {
  if (typeof st.lat === "number" && typeof st.lng === "number") {
    L.marker([st.lat, st.lng])
      .addTo(map)
      .bindPopup(`<b>${st.name}</b>`);
  }
});

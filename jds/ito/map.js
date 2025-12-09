// Create map centered on Chikuhi Line
const map = L.map('map').setView([33.557, 130.199], 11);

// Load OpenStreetMap tiles (correct URL)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add station markers
window.stations.forEach(st => {
  L.marker([st.lat, st.lng])
    .addTo(map)
    .bindPopup(st.name);
});

// -------------------------------
// INITIALIZE MAP (JDS – Oita)
// -------------------------------
const map = L.map('map', { zoomControl: false })
  .setView([33.23301788712402, 131.60622313693307], 12);

L.control.zoom({ position: 'topright' }).addTo(map);

// -------------------------------
// TILE LAYER
// -------------------------------
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// -------------------------------
// ICON FACTORY
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
// ICONS (JDS)
// -------------------------------
const icons = {
  church: makeIcon('church.png'),
  museum: makeIcon('museum.png'),
  station: makeIcon('station.png'),
  shrine: makeIcon('shrine.png'),
  temple: makeIcon('temple.png'),
  park: makeIcon('park.png')
};

// -------------------------------
// DISTANCE (km)
// -------------------------------
function distanceKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(x));
}

// -------------------------------
// LAYERS (JDS)
// -------------------------------
const churchLayer  = L.layerGroup().addTo(map);
const museumLayer  = L.layerGroup().addTo(map);
const shrineLayer  = L.layerGroup().addTo(map);
const templeLayer  = L.layerGroup().addTo(map);
const parkLayer    = L.layerGroup().addTo(map);
const stationLayer = L.layerGroup().addTo(map);

let selectedStation = null;
let lastTappedStation = null;

// -------------------------------
// LOAD STATIONS
// Mobile UX:
// 1st tap → name
// 2nd tap → set base station
// -------------------------------
window.stations.forEach(station => {
  const marker = L.marker([station.lat, station.lng], {
    icon: icons.station
  }).addTo(stationLayer);

  marker.bindTooltip(station.name, {
    direction: 'top',
    offset: [0, -28],
    opacity: 0.9
  });

  marker.on('click', () => {
    if (lastTappedStation !== station) {
      lastTappedStation = station;
      marker.openTooltip();
      return;
    }

    selectedStation = station;
    updateDistances();
    marker.bindPopup(`基準駅：${station.name}`).openPopup();
  });
});

// -------------------------------
// LOAD LANDMARK CATEGORIES
// -------------------------------
function loadCategory(list, layer, icon) {
  if (!list) return;

  list.forEach(item => {
    const marker = L.marker([item.lat, item.lng], { icon })
      .addTo(layer)
      .bindPopup(item.name);

    item._marker = marker;
  });
}

loadCategory(window.churches,  churchLayer, icons.church);
loadCategory(window.museums,  museumLayer, icons.museum);
loadCategory(window.shrines,  shrineLayer, icons.shrine);
loadCategory(window.temples,  templeLayer, icons.temple);
loadCategory(window.parks,    parkLayer,   icons.park);

// -------------------------------
// UPDATE DISTANCES FROM SELECTED STATION
// (Applies to all landmarks)
// -------------------------------
function updateDistances() {
  if (!selectedStation) return;

  const allItems = [
    ...(window.churches || []),
    ...(window.museums || []),
    ...(window.shrines || []),
    ...(window.temples || []),
    ...(window.parks || [])
  ];

  allItems.forEach(item => {
    if (!item._marker) return;

    const d = distanceKm(selectedStation, item).toFixed(1);
    item._marker.bindPopup(
      `${item.name}<br>駅から約 ${d} km`
    );
  });
}

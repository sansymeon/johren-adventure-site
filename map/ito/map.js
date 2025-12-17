// -------------------------------
// INITIALIZE MAP
// -------------------------------
const map = L.map('map', {
  zoomControl: false
}).setView([33.557082, 130.199305], 12);

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
// ICONS
// -------------------------------
const icons = {
  station: makeIcon('station.png'),
  coffee: makeIcon('coffee.png'),
  restaurant: makeIcon('restaurant.png')
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
// MARKER GROUPS
// -------------------------------
const coffeeLayer = L.layerGroup();
const restaurantLayer = L.layerGroup();

let selectedStation = null;

// -------------------------------
// LOAD STATIONS (always visible, name on interaction)
// -------------------------------
window.stations.forEach(station => {
  const marker = L.marker([station.lat, station.lng], {
    icon: icons.station
  }).addTo(map);

  // lightweight label on hover / tap
  marker.bindTooltip(station.name, {
    direction: 'top',
    offset: [0, -28],
    opacity: 0.9
  });

  marker.on("click", () => {
    selectedStation = station;
    updateDistances();
    marker.bindPopup(`基準駅：${station.name}`).openPopup();
  });
});


// -------------------------------
// LOAD COFFEE SHOPS
// -------------------------------
window.coffeeshops.forEach(shop => {
  const marker = L.marker([shop.lat, shop.lng], {
    icon: icons.coffee
  });
  shop._marker = marker;
  coffeeLayer.addLayer(marker);
});

// -------------------------------
// LOAD RESTAURANTS
// -------------------------------
window.restaurants.forEach(place => {
  const marker = L.marker([place.lat, place.lng], {
    icon: icons.restaurant
  });
  place._marker = marker;
  restaurantLayer.addLayer(marker);
});

// -------------------------------
// UPDATE DISTANCES FROM SELECTED STATION
// -------------------------------
function updateDistances() {
  if (!selectedStation) return;

  [...window.coffeeshops, ...window.restaurants].forEach(item => {
    const d = distanceKm(selectedStation, item).toFixed(1);
    item._marker.bindPopup(
      `${item.name}<br>駅から約 ${d} km`
    );
  });
}

// -------------------------------
// CATEGORY TOGGLES (simple version)
// -------------------------------
function showCoffee() {
  map.addLayer(coffeeLayer);
  map.removeLayer(restaurantLayer);
}

function showRestaurants() {
  map.addLayer(restaurantLayer);
  map.removeLayer(coffeeLayer);
}

function showBoth() {
  map.addLayer(coffeeLayer);
  map.addLayer(restaurantLayer);
}

// Default view
showBoth();





(function () {
  if (!window.PLACE_CONFIG) {
    console.error("PLACE_CONFIG not found");
    return;
  }

  if (!window.JAPAN_MAP_DATA || !Array.isArray(window.JAPAN_MAP_DATA.pins)) {
    console.error("JAPAN_MAP_DATA.pins not found");
    return;
  }

  const { center, zoom, bounds } = window.PLACE_CONFIG;

  const map = L.map("map", {
    zoomControl: true
  }).setView(center, zoom);

  if (bounds) {
    map.setMaxBounds(bounds);
  }

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: ""
  }).addTo(map);

  window.JAPAN_MAP_DATA.pins.forEach(pin => {
    if (!pin.lat || !pin.lng) return;

    L.marker([pin.lat, pin.lng]).addTo(map);
  });
})();

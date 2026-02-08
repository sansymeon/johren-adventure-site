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

  const map = L.map("map", { zoomControl: true }).setView(center, zoom);

  if (bounds) map.setMaxBounds(bounds);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: ""
  }).addTo(map);

  // -------------------------------
  // ICONS (minimal, extend later)
  // -------------------------------
  const icons = {
    station: L.icon({
      iconUrl: "/img/map/station.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    museum: L.icon({
      iconUrl: "/img/map/museum.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    }),
    church: L.icon({
      iconUrl: "/img/map/church.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
   }),
       shrine: L.icon({
      iconUrl: "/img/map/shrine.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
   })
  };

  // -------------------------------
  // PIN RENDERING (2 categories)
  // -------------------------------
  window.JAPAN_MAP_DATA.pins.forEach(pin => {
    if (!pin.lat || !pin.lng) return;

    // Data-driven visibility (museums can be hidden)
    if (pin.visible === false) return;

    const type = (pin.type || "").toLowerCase();
    const icon = icons[type];

    const marker = L.marker(
      [pin.lat, pin.lng],
      icon ? { icon } : {}
    ).addTo(map);

    // Light labels so you can "read" the map
    if (type === "station") {
      marker.bindTooltip(
        pin.nameEn
          ? `${pin.name} / ${pin.nameEn}`
          : pin.name,
        { direction: "top", offset: [0, -20] }
      );
    }

    if (type === "museum") {
      marker.bindTooltip(
        pin.nameEn || pin.name,
        { direction: "top", offset: [0, -18] }
      );
    }
  });
})();

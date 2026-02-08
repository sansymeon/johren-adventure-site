// ===============================
// JOHREN MAP ENGINE (UNIVERSAL)
// ===============================
(function () {
  // --------------------------------
  // Required configs
  // --------------------------------
  if (!window.PLACE_CONFIG) {
    console.error("PLACE_CONFIG not found");
    return;
  }

  if (!window.MAP_DATA || !Array.isArray(window.MAP_DATA.pins)) {
    console.error("MAP_DATA.pins not found");
    return;
  }

  const { center, zoom, bounds } = window.PLACE_CONFIG;

  // --------------------------------
  // Init map
  // --------------------------------
  const map = L.map("map", {
    zoomControl: true
  }).setView(center, zoom);

  if (bounds) {
    map.setMaxBounds(bounds);
  }

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: ""
  }).addTo(map);

  // --------------------------------
  // Icons (extend freely)
  // --------------------------------
  const icons = {
    coffee: L.icon({
      iconUrl: "/img/map/coffee.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    mosque: L.icon({
      iconUrl: "/img/map/mosque.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    supermarket: L.icon({
      iconUrl: "/img/map/supermarket.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    landmark: L.icon({
      iconUrl: "/img/map/landmark.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    church: L.icon({
      iconUrl: "/img/map/church.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    }),
    temple: L.icon({
      iconUrl: "/img/map/temple.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    }),
    shrine: L.icon({
      iconUrl: "/img/map/shrine.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    }),
    museum: L.icon({
      iconUrl: "/img/map/museum.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    }),
    station: L.icon({
      iconUrl: "/img/map/station.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    })
  };

  // --------------------------------
  // Render pins
  // --------------------------------
  window.MAP_DATA.pins.forEach(pin => {
    if (!pin || typeof pin.lat !== "number" || typeof pin.lng !== "number") {
      return;
    }

    // soft visibility control
    if (pin.visible === false) return;

    const type = (pin.type || "").toLowerCase();
    const icon = icons[type];

    const marker = L.marker(
      [pin.lat, pin.lng],
      icon ? { icon } : {}
    ).addTo(map);

    // simple readable label
    const label =
      pin.nameEn
        ? `${pin.name} / ${pin.nameEn}`
        : pin.name;

    if (label) {
      marker.bindTooltip(label, {
        direction: "top",
        offset: [0, -20]
      });
    }
  });

})();

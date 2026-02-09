// ===============================
// JOHREN MAP ENGINE (UNIVERSAL)
// ===============================
const KEY = `here:${window.AREA_KEY || "global"}`;

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
    zoomControl: false
  }).setView(center, zoom);
  L.control.zoom({ position: "topright" }).addTo(map);

  if (bounds) {
    map.setMaxBounds(bounds);
  }

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

  const savedHere = loadHere();
if (savedHere) {
  placeMarker(savedHere);
}

  // --------------------------------
  // Icons (extend freely)
  // --------------------------------
  const icons = {
    restaurant: L.icon({
      iconUrl: "/img/map/restaurant.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
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

  // =====================================================
// I'M HERE (minimal v1)
// =====================================================
(function setupImHere(map) {
  if (!map) return;

  const AREA = (window.AREA_KEY || "default").trim();
  const KEY = `johren_here_v1:${AREA}`;

  let hereMarker = null;
  let armed = false;

  function loadHere() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }

  function saveHere(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  function clearHere() {
    localStorage.removeItem(KEY);
  }

  function placeMarker(h) {
    if (!h) return;
    if (hereMarker) {
      hereMarker.setLatLng([h.lat, h.lng]);
    } else {
      hereMarker = L.marker([h.lat, h.lng]).addTo(map);
    }
    hereMarker.bindPopup("I’m here").openPopup();
  }

  // ---- Leaflet control ----
  const HereControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const div = L.DomUtil.create("div", "leaflet-bar");
      const a = L.DomUtil.create("a", "", div);
      a.href = "#";
      a.textContent = "I’m here";
      a.style.padding = "0";
      a.style.lineHeight = "32px";
      a.style.fontSize = "13px";
      a.style.background = "#fff";
      a.style.color = "#222";
      a.style.textDecoration = "none";
      a.style.width = "96px";        // ← fixed width so it doesn’t jump
      a.style.textAlign = "center";
      


      L.DomEvent.disableClickPropagation(div);

      a.onclick = (e) => {
        e.preventDefault();

        const existing = loadHere();
        if (existing && !armed) {
          clearHere();
          if (hereMarker) {
            map.removeLayer(hereMarker);
            hereMarker = null;
          }
          a.textContent = "I’m here";
          return;
        }

        armed = true;
        a.textContent = "Tap map…";
      };

      return div;
    }
  });

  map.addControl(new HereControl());

  // ---- Map click (only when armed) ----
  map.on("click", (e) => {
    if (!armed) return;

    const h = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      ts: Date.now()
    };

    saveHere(h);
    placeMarker(h);

    armed = false;

    // reset button label
    const btn = document.querySelector(".leaflet-bar a");
    if (btn) btn.textContent = "Clear";
  });

  // ---- Restore on load ----
  const existing = loadHere();
  if (existing) {
    placeMarker(existing);
  }

})(map);


})();

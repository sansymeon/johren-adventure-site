// ===============================
// JOHREN MAP ENGINE (CLEAN v1)
// ===============================

let map;
let pinLayer;
let hereMarker = null;
let hereLocation = null;
let hereArmed = false;

const HERE_STORAGE_KEY = `johren_here_v1:${window.AREA_KEY || "global"}`;

// -------------------------------
// Guard clauses
// -------------------------------
(function () {
  if (!window.PLACE_CONFIG) {
    console.error("PLACE_CONFIG missing");
    return;
  }

  if (!window.MAP_DATA || !Array.isArray(window.MAP_DATA.pins)) {
    console.error("MAP_DATA.pins missing");
    return;
  }

  const { center, zoom, bounds } = window.PLACE_CONFIG;

  // -------------------------------
  // Init map
  // -------------------------------
  map = L.map("map", { zoomControl: false }).setView(center, zoom);

  if (bounds) map.setMaxBounds(bounds);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  pinLayer = L.layerGroup().addTo(map);

  // -------------------------------
  // Icons
  // -------------------------------
  const icons = {
    station: L.icon({
      iconUrl: "/img/map/station.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
     restaurant: L.icon({
      iconUrl: "/img/map/restaurant.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
     supermarket: L.icon({
      iconUrl: "/img/map/supermarket.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
     museum: L.icon({
      iconUrl: "/img/map/museum.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
     mosque: L.icon({
      iconUrl: "/img/map/mosque.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
     landmark: L.icon({
      iconUrl: "/img/map/landmark.png",
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),

    coffee: L.icon({
      iconUrl: "/img/map/coffee.png",
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

    church: L.icon({
      iconUrl: "/img/map/church.png",
      iconSize: [26, 26],
      iconAnchor: [13, 26]
    })
  };

  // -------------------------------
  // HERE helpers
  // -------------------------------
  function loadHere() {
    try {
      return JSON.parse(localStorage.getItem(HERE_STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function saveHere(h) {
    localStorage.setItem(HERE_STORAGE_KEY, JSON.stringify(h));
  }

  function clearHereStorage() {
    localStorage.removeItem(HERE_STORAGE_KEY);
  }

  function placeHereMarker(h) {
    if (!h) return;

    hereLocation = h;

    if (hereMarker) {
      hereMarker.setLatLng([h.lat, h.lng]);
    } else {
      hereMarker = L.marker([h.lat, h.lng]).addTo(map);
    }

    hereMarker.bindPopup("I’m here");
  }

  function clearHereAll() {
    if (hereMarker) map.removeLayer(hereMarker);
    hereMarker = null;
    hereLocation = null;
    clearHereStorage();
  }

  function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  // -------------------------------
  // Render pins (single source)
  // -------------------------------
  function renderPins() {
    pinLayer.clearLayers();

    window.MAP_DATA.pins.forEach(pin => {
      if (pin.area && pin.area !== window.AREA_KEY) return;
      if (typeof pin.lat !== "number") return;

      const icon = icons[pin.type];

      const marker = L.marker(
        [pin.lat, pin.lng],
        icon ? { icon } : {}
      );

      let label = pin.nameEn
        ? `${pin.name} / ${pin.nameEn}`
        : pin.name;

      if (hereLocation) {
        const meters = map.distance(
          [hereLocation.lat, hereLocation.lng],
          [pin.lat, pin.lng]
        );
        label += ` · ${formatDistance(meters)}`;
      }

      marker.bindTooltip(label, {
        direction: "top",
        offset: [0, -20]
      });

      pinLayer.addLayer(marker);
    });
  }
// Render a single pin by adding it to MAP_DATA then re-rendering
function renderPin(pin) {
  if (!window.MAP_DATA) window.MAP_DATA = { pins: [] };
  if (!Array.isArray(window.MAP_DATA.pins)) window.MAP_DATA.pins = [];

  window.MAP_DATA.pins.push(pin);
  renderPins();
}

  // -------------------------------
  // Restore HERE on load
  // -------------------------------
  const existingHere = loadHere();
  if (existingHere) {
    placeHereMarker(existingHere);
  }

  // -------------------------------
  // HERE control
  // -------------------------------
  const HereControl = L.Control.extend({
    options: { position: "topleft" },

    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-bar");
      const btn = L.DomUtil.create("a", "", container);

      btn.href = "#";
      btn.textContent = existingHere ? "Clear" : "I’m here";

      btn.style.width = "96px";
      btn.style.lineHeight = "32px";
      btn.style.textAlign = "center";
      btn.style.fontSize = "13px";
      btn.style.background = "#fff";
      btn.style.color = "#222";
      btn.style.textDecoration = "none";

      L.DomEvent.disableClickPropagation(container);

      btn.onclick = (e) => {
        e.preventDefault();

        if (hereMarker && !hereArmed) {
          clearHereAll();
          renderPins();
          btn.textContent = "I’m here";
          return;
        }

        hereArmed = true;
        btn.textContent = "Tap map…";
      };

      return container;
    }
  });

  map.addControl(new HereControl());

  // -------------------------------
  // Map click (set HERE)
  // -------------------------------
  map.on("click", (e) => {
    if (!hereArmed) return;

    const h = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      ts: Date.now()
    };

    saveHere(h);
    placeHereMarker(h);
    hereArmed = false;

    const btn = document.querySelector(".leaflet-bar a");
    if (btn) btn.textContent = "Clear";

    renderPins();
  });

  // -------------------------------
  // Hide empty categories (Gaya rule)
  // -------------------------------
  const presentTypes = new Set(
    window.MAP_DATA.pins
      .filter(p => !p.area || p.area === window.AREA_KEY)
      .map(p => p.type)
  );

  document
    .querySelectorAll("#map-controls input[data-type]")
    .forEach(input => {
      if (!presentTypes.has(input.dataset.type)) {
        input.closest("label").style.display = "none";
      }
    });

  // -------------------------------
  // Initial render
  // -------------------------------
  renderPins();
let addPinMode = false;

document.getElementById("add-pin-btn").addEventListener("click", () => {
  addPinMode = true;
  alert("Click on the map to add a pin");
});

map.on("click", (e) => {
  if (!addPinMode) return;
  addPinMode = false;

  const name = prompt("Place name?");
  if (!name) return;

  const newPin = {
    id: `draft_${Date.now()}`,
    name,
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    area: window.AREA_KEY,
    status: "draft",
    createdAt: Date.now()
  };

  saveLocalPin(newPin);
  renderPin(newPin, true);
});
function getLocalPins() {
  return JSON.parse(localStorage.getItem("johren_local_pins") || "[]");
}

function saveLocalPin(pin) {
  const pins = getLocalPins();
  pins.push(pin);
  localStorage.setItem("johren_local_pins", JSON.stringify(pins));
}
getLocalPins().forEach(pin => renderPin(pin, true));

})();

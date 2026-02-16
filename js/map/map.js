// ===============================
// JOHREN MAP ENGINE (CLEAN v1.1)
// ===============================

let map;
let pinLayer;
let tempPinLayer;
let hereMarker = null;
let hereLocation = null;
let hereArmed = false;
let addPinMode = false;

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
  tempPinLayer = L.layerGroup().addTo(map);

  // -------------------------------
  // Icons
  // -------------------------------
  const draftPinIcon = L.icon({
    iconUrl: "/img/map/pin_personal.png",
     iconSize: [26, 26],      // 👈 bigger than stations
  iconAnchor: [13, 26],    // 👈 bottom-center stays correct
  tooltipAnchor: [0, -18] // optional, keeps label readable
});

  const icons = {
    station: icon("/img/map/station.png", 28),
    restaurant: icon("/img/map/restaurant.png", 28),
    supermarket: icon("/img/map/supermarket.png", 28),
    museum: icon("/img/map/museum.png", 28),
    mosque: icon("/img/map/mosque.png", 28),
    landmark: icon("/img/map/landmark.png", 28),
    coffee: icon("/img/map/coffee.png", 26),
    temple: icon("/img/map/temple.png", 26),
    shrine: icon("/img/map/shrine.png", 26),
    church: icon("/img/map/church.png", 26)
  };

  function icon(url, size) {
    return L.icon({
      iconUrl: url,
      iconSize: [size, size],
      iconAnchor: [size / 2, size]
    });
  }

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

  function clearHere() {
    if (hereMarker) map.removeLayer(hereMarker);
    hereMarker = null;
    hereLocation = null;
    localStorage.removeItem(HERE_STORAGE_KEY);
  }

  function placeHere(h) {
    hereLocation = h;

    if (!hereMarker) {
      hereMarker = L.marker([h.lat, h.lng]).addTo(map);
    } else {
      hereMarker.setLatLng([h.lat, h.lng]);
    }

    hereMarker.bindPopup("I’m here");
  }

  function formatDistance(m) {
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  }
window.removeAddedPins = function () {
  if (!tempPinLayer) return;
  tempPinLayer.clearLayers();
  localStorage.removeItem("johren_local_pins");
};



  // -------------------------------
  // Render official pins
  // -------------------------------
  function renderPins() {
    pinLayer.clearLayers();

    window.MAP_DATA.pins.forEach(pin => {
      if (pin.area && pin.area !== window.AREA_KEY) return;
      if (typeof pin.lat !== "number") return;

      const icon = icons[pin.type];
      const marker = L.marker(
  [pin.lat, pin.lng],
  icon ? { icon, pinType: pin.type } : { pinType: pin.type }
);


      let label = pin.nameEn ? `${pin.name} / ${pin.nameEn}` : pin.name;

      if (hereLocation) {
        const meters = map.distance(
          [hereLocation.lat, hereLocation.lng],
          [pin.lat, pin.lng]
        );
        label += ` · ${formatDistance(meters)}`;
      }

      marker.bindTooltip(label, { direction: "top", offset: [0, -20] });
      pinLayer.addLayer(marker);
    });
  }

  // -------------------------------
  // Render draft pin (local only)
  // -------------------------------
function renderDraftPin(pin) {
  if (!pin || typeof pin.lat !== "number") return;

  const marker = L.marker([pin.lat, pin.lng], {
    icon: draftPinIcon
  });

  marker.bindTooltip(pin.name || "Draft pin", {
    direction: "top",
    offset: [0, -20]
  });

  tempPinLayer.addLayer(marker);
}

function renderPinFilters() {
  const container = document.getElementById("pin-filters");
  if (!container) return;

  container.innerHTML = "";

  // Collect pin types for this area
  const types = new Set(
  window.MAP_DATA.pins
    .filter(p => !p.area || p.area === window.AREA_KEY)
    .map(p => p.type)
    .filter(Boolean)
);


  // Create a checkbox for each type
  types.forEach(type => {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    checkbox.addEventListener("change", () => {
      pinLayer.eachLayer(layer => {
        if (layer.options?.pinType === type) {
          checkbox.checked
            ? layer.addTo(map)
            : map.removeLayer(layer);
        }
      });
    });

    label.appendChild(checkbox);
    label.append(" " + type.charAt(0).toUpperCase() + type.slice(1));

    container.appendChild(label);
  });
}


  // -------------------------------
  // Local draft storage
  // -------------------------------
  function getLocalPins() {
    return JSON.parse(localStorage.getItem("johren_local_pins") || "[]");
  }

  function saveLocalPin(pin) {
    const pins = getLocalPins();
    pins.push(pin);
    localStorage.setItem("johren_local_pins", JSON.stringify(pins));
  }

  // -------------------------------
  // Restore HERE + draft pins
  // -------------------------------
  const savedHere = loadHere();
  if (savedHere) placeHere(savedHere);

  getLocalPins().forEach(renderDraftPin);

  // -------------------------------
// HERE control
// -------------------------------
const HereControl = L.Control.extend({
  options: { position: "topleft" },

  onAdd() {
    const div = L.DomUtil.create("div", "leaflet-bar");
    const btn = L.DomUtil.create("a", "", div);

    btn.href = "#";
    btn.textContent = savedHere ? "Clear" : "I’m here";
    btn.style.cssText = `
      width:96px;
      line-height:32px;
      text-align:center;
      background:#fff;
      color:#222;
      font-size:13px;
      text-decoration:none;
    `;

    L.DomEvent.disableClickPropagation(div);

    btn.onclick = (e) => {
      e.preventDefault();

      if (hereMarker) {
        clearHere();
        btn.textContent = "I’m here";
        renderPins();
        renderPinFilters();
      } else {
        hereArmed = true;
        btn.textContent = "Tap map…";
      }
    };

    return div;
  }
});

map.addControl(new HereControl());

  // -------------------------------
  // Add Pin button
  // -------------------------------
  const addBtn = document.getElementById("add-pin-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addPinMode = true;
      alert("Click on the map to add a pin");
    });
  }

  // -------------------------------
  // Map click handler (single!)
  // -------------------------------
  map.on("click", e => {
    if (addPinMode) {
      addPinMode = false;

      const name = prompt("Place name?");
      if (!name) return;

      const pin = {
        id: `draft_${Date.now()}`,
        name,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        area: window.AREA_KEY,
        status: "draft",
        createdAt: Date.now()
      };

      saveLocalPin(pin);
      renderDraftPin(pin);
      return;
    }

    if (hereArmed) {
      hereArmed = false;
      const h = { lat: e.latlng.lat, lng: e.latlng.lng, ts: Date.now() };
      saveHere(h);
      placeHere(h);
      renderPins();
    }
  });

  // -------------------------------
  // Initial render
  // -------------------------------
   renderPins();
  renderPinFilters();

})(); // closes (function () { ... })

// ===============================
// JOHREN MAP ENGINE (CLEAN v1.1)
// ===============================

let map;
let pinLayer;
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

  // -------------------------------
  // Icons
  // -------------------------------
  const draftPinIcon = L.icon({
    iconUrl: "../../img/map/pin-draft.png",
    iconSize: [18, 18],
    iconAnchor: [9, 18]
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

  // -------------------------------
  // Render official pins
  // -------------------------------
  function renderPins() {
    pinLayer.clearLayers();

    window.MAP_DATA.pins.forEach(pin => {
      if (pin.area && pin.area !== window.AREA_KEY) return;
      if (typeof pin.lat !== "number") return;

      const icon = icons[pin.type];
      const marker = L.marker([pin.lat, pin.lng], icon ? { icon } : {});

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
    const marker = L.marker(
      [pin.lat, pin.lng],
      { icon: draftPinIcon }
    );

    marker.bindTooltip(pin.name, { direction: "top", offset: [0, -20] });
    pinLayer.addLayer(marker);
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
        width:96px; line-height:32px; text-align:center;
        background:#fff; color:#222; font-size:13px;
        text-decoration:none;
      `;

      L.DomEvent.disableClickPropagation(div);

      btn.onclick = e => {
        e.preventDefault();
        if (hereMarker) {
          clearHere();
          btn.textContent = "I’m here";
          renderPins();
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
map.on("click", (e) => {
  if (!addPinMode) return;
  addPinMode = false;

  const name = prompt("Place name?");
  if (!name) return;

  const newPin = {
    id: `draft_${Date.now()}`,
    name: name,
    lat: e.latlng.lat,
    lng: e.latlng.lng,
    area: window.AREA_KEY,
    status: "draft",
    createdAt: Date.now()
  };

  console.log("Draft pin added", newPin);

  saveLocalPin(newPin);
  renderDraftPin(newPin);
});
// Restore locally-added draft pins
getLocalPins().forEach(pin => {
  renderDraftPin(pin);
});

})();

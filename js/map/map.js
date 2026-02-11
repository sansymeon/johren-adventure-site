// ===============================
// JOHREN MAP ENGINE (BASELINE)
// ===============================
let map;
const HERE_KEY = `johren_here:${window.AREA_KEY || "global"}`;

(function () {

  if (!window.PLACE_CONFIG) return console.error("PLACE_CONFIG missing");
  if (!window.MAP_DATA || !Array.isArray(window.MAP_DATA.pins))
    return console.error("MAP_DATA.pins missing");

  const { center, zoom, bounds } = window.PLACE_CONFIG;
const LABELS = {
  cafe:   { ja: "カフェ", en: "Cafés" },
  shrine: { ja: "神社・お寺", en: "Shrines & Temples" },
  church: { ja: "教会", en: "Churches" }
};

const controls = document.getElementById("map-controls");

  // ---- Init map ----
  map = L.map("map", { zoomControl: false }).setView(center, zoom);

  if (bounds) map.setMaxBounds(bounds);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  
// =====================================================
// I'M HERE (clean v1)
// =====================================================
let hereMarker = null;
let hereArmed = false;

const HERE_STORAGE_KEY = `johren_here_v1:${window.AREA_KEY || "global"}`;

// ---- helpers ----
function loadHere() {
  try {
    return JSON.parse(localStorage.getItem(HERE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveHere(obj) {
  localStorage.setItem(HERE_STORAGE_KEY, JSON.stringify(obj));
}

function clearHere() {
  localStorage.removeItem(HERE_STORAGE_KEY);
}

function placeHereMarker(h) {
  if (!h) return;

  if (hereMarker) {
    hereMarker.setLatLng([h.lat, h.lng]);
  } else {
    hereMarker = L.marker([h.lat, h.lng]).addTo(map);
  }

  hereMarker.bindPopup("I’m here");
}

// ---- restore on load ----
const existingHere = loadHere();
if (existingHere) {
  placeHereMarker(existingHere);
}

// ---- Leaflet control ----
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
        map.removeLayer(hereMarker);
        hereMarker = null;
        clearHere();
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
// ---- Icons ----
const icons = {
  station: L.icon({
    iconUrl: "/icons/station.png",
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  }),

  cafe: L.icon({
    iconUrl: "/img/map/cafe.png",
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

// ---- map click ----
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
});
  
  // ---- Hide empty menu categories (Gaya rule) ----
 const presentTypes = new Set(
  window.MAP_DATA.pins
    .filter(p => (!p.area || p.area === window.AREA_KEY))
    .map(p => p.type)
);
  
  document
    .querySelectorAll("#map-controls input[data-type]")
    .forEach(input => {
      if (!presentTypes.has(input.dataset.type)) {
        input.closest("label").style.display = "none";
      }
    });

  // ---- Render pins ----
  window.MAP_DATA.pins.forEach(pin => {
  if (pin.area && pin.area !== window.AREA_KEY) return;
  if (typeof pin.lat !== "number") return;

 const icon = icons[pin.type];

L.marker(
  [pin.lat, pin.lng],
  icon ? { icon } : {}
)
.addTo(map)
.bindTooltip(
  pin.nameEn ? `${pin.name} / ${pin.nameEn}` : pin.name,
  { direction: "top", offset: [0, -20] }
);

});


})();

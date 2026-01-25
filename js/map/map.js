// ===============================
// JOHREN MAP ENGINE (UNIVERSAL)
// ===============================
(function () {
  if (!window.MAP_CONFIG) return console.error('MAP_CONFIG missing');
  const AREA_KEY = window.AREA_KEY;
  if (!AREA_KEY) return console.error('AREA_KEY missing');

  const area = window.MAP_CONFIG[AREA_KEY];
  if (!area) return console.error('Invalid AREA_KEY:', AREA_KEY);

  const {
    center,
    zoom,
    stations = [],
    churches = [],
    mosques = [],
    museums = [],
    shrines = [],
    temples = [],
    parks = [],
    pins = []
  } = area;

  const storageKey = `johren:${AREA_KEY}`;

  const map = L.map('map', { zoomControl: false }).setView(center, zoom);
  L.control.zoom({ position: 'topright' }).addTo(map);

  // =====================================================
// RESET CONTROL (center on "here" if set, else area center)
// =====================================================
(function setupReset(map, center, zoom) {
  if (!map || !Array.isArray(center) || center.length !== 2) return;

  const AREA = (window.AREA_KEY || "default_area").trim();
  const HERE_KEY = `johren_here_v1:${AREA}`;

  function loadHere() {
    try {
      const raw = localStorage.getItem(HERE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.lat !== "number" || typeof obj.lng !== "number") return null;
      return obj;
    } catch { return null; }
  }

  const ResetControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-bar");
      const a = L.DomUtil.create("a", "leaflet-text-btn", container);
      a.href = "#";
      a.textContent = "Reset";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      L.DomEvent.on(a, "click", (e) => {
        L.DomEvent.preventDefault(e);

        const h = loadHere();
        if (h) {
          map.setView([h.lat, h.lng], Math.max(map.getZoom(), 16), { animate: true });
        } else {
          map.setView(center, zoom, { animate: true });
        }
      });

      return container;
    }
  });

  map.addControl(new ResetControl());
})(map, center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  function getVisitedStations() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(data?.visitedStations) ? data.visitedStations.map(String) : [];
    } catch {
      return [];
    }
  }

  function makeIcon(file) {
    return L.icon({
      iconUrl: `/img/map/${file}`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -30]
    });
  }

  const icons = {
    church: makeIcon('church.png'),
    landmark: makeIcon('landmark.png'),
    museum: makeIcon('museum.png'),
    mosque: makeIcon('mosque.png'),
    shrine: makeIcon('shrine.png'),
    temple: makeIcon('temple.png'),
    park: makeIcon('park.png'),
    personal: makeIcon('pin_personal.png'),
    stationDefault: makeIcon('station.png'),
    stationVisited: makeIcon('station_visited.png'),

    coffee: makeIcon('coffee.png'),
    restaurant: makeIcon('restaurant.png'),
    supermarket: makeIcon('supermarket.png')
  };

  const stationLayer = L.layerGroup().addTo(map);
  const churchLayer  = L.layerGroup().addTo(map);
  const mosqueLayer  = L.layerGroup().addTo(map);
  const museumLayer  = L.layerGroup().addTo(map);
  const shrineLayer  = L.layerGroup().addTo(map);
  const templeLayer  = L.layerGroup().addTo(map);
  const parkLayer    = L.layerGroup().addTo(map);
  const pinLayer     = L.layerGroup().addTo(map);

  function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c])
    );
  }
   
   function makePersonalIcon(){ return icons.personal; }

  function formatStationLabel(station) {
    return station.nameEn
      ? `<div class="station-label"><div class="jp">${escapeHtml(station.name)}</div><div class="en">${escapeHtml(station.nameEn)}</div></div>`
      : `<div class="station-label"><div class="jp">${escapeHtml(station.name)}</div></div>`;
  }

  function formatLandmarkLabel(item) {
    const jp = (item.name || '').trim();
    const en = (item.nameEn || '').trim();
    const title = escapeHtml(jp || en || '');
    const sub = (jp && en && jp !== en)
      ? `<div class="en" style="font-size:11px;color:#777;margin-top:2px;">${escapeHtml(en)}</div>`
      : '';
    return `<div class="landmark-label"><div class="jp">${title}</div>${sub}</div>`;
  }

  // -------------------------------
  // STATIONS (Japan only)
  // -------------------------------
  if (stations.length) {
    const visitedStations = getVisitedStations();
    let lastTappedStation = null;

    stations.forEach(station => {
      if (!station || typeof station.lat !== 'number' || typeof station.lng !== 'number') return;

      const isVisited = visitedStations.includes(String(station.id));
      const marker = L.marker([station.lat, station.lng], {
        icon: isVisited ? icons.stationVisited : icons.stationDefault
      }).addTo(stationLayer);

      marker.bindTooltip(formatStationLabel(station), {
        direction: 'top',
        offset: [0, -28],
        sticky: true,
        className: 'station-tooltip'
      });

      marker.on('click', () => {
        if (lastTappedStation !== station) {
          lastTappedStation = station;
          marker.openTooltip();
          return;
        }
        const base = station.nameEn ? `${station.name}（${station.nameEn}）` : station.name;
        marker.bindPopup(`基準駅：${escapeHtml(base)}`).openPopup();
      });
    });
  }
const markerById = new Map(); // id -> Leaflet marker

 // -------------------------------
// LANDMARKS (existing categories)
// -------------------------------
function loadCategory(list, layer, icon, kind) {
  if (!Array.isArray(list)) return;

  list.forEach(item => {
    if (!item || typeof item.lat !== "number" || typeof item.lng !== "number") return;

    const marker = L.marker([item.lat, item.lng], { icon })
      .addTo(layer)
      .bindPopup(`formatLandmarkLabel(item));

    // ✅ store by id so Nearest-click can open it
    const id = String(item.id || `${kind}:${item.lat},${item.lng}`);
    markerById.set(id, marker);
  });
}

loadCategory(churches, churchLayer, icons.church, "church");
loadCategory(mosques, mosqueLayer, icons.mosque, "mosque");
loadCategory(museums, museumLayer, icons.museum, "museum");
loadCategory(shrines, shrineLayer, icons.shrine, "shrine");
loadCategory(temples, templeLayer, icons.temple, "temple");
loadCategory(parks, parkLayer, icons.park, "park");


  // -------------------------------
  // PINS + FILTER UI (KK demo)
  // -------------------------------
  const pinMarkers = [];

  
  // id -> Leaflet marker

 

function loadPins(list, layer) {
  if (!Array.isArray(list)) return;
  list.forEach(item => {
    if (!item || typeof item.lat !== 'number' || typeof item.lng !== 'number') return;

    const type = (item.type || '').toLowerCase();
    const icon = icons[type] || icons.park;

    const marker = L.marker([item.lat, item.lng], { icon })
      .addTo(layer)
      .bindPopup(`formatLandmarkLabel(item));

    marker._pinType = type;

    // ✅ store by id so we can open it later
    const id = String(item.id || `${type}:${item.lat},${item.lng}`);
    markerById.set(id, marker);

    pinMarkers.push(marker);
  });
}


  function renderPinFilters(types) {
    const el = document.getElementById('pinFilters');
    if (!el) return;

    const labels = 
    { coffee:"Coffee", 
     restaurant:"Food", 
     supermarket:"Shop", 
     church:"Church", 
     museum: "Museum", 
     mosque:"Mosque", 
     personal: "Pin"
};

    el.innerHTML = types.map(t => `
      <label>
        <input type="checkbox" data-type="${t}" checked>
        <span>${labels[t] || t}</span>
      </label>
    `).join("");

    el.addEventListener('change', () => {
      const checked = new Set(
        Array.from(el.querySelectorAll('input[type="checkbox"]:checked')).map(x => x.dataset.type)
      );
      pinMarkers.forEach(m => {
        const show = checked.has(m._pinType);
        if (show) m.addTo(pinLayer);
        else pinLayer.removeLayer(m);

        
     syncPersonalVisibility(); // ✅ add this

    });
  }

  loadPins(pins, pinLayer);

  const pinTypes = Array.from(new Set((pins || []).map(p => (p.type || '').toLowerCase()))).filter(Boolean);
  if (pinTypes.length) renderPinFilters([...new Set([...pinTypes, "personal"])]);
else renderPinFilters(["personal"]); // optional: still show +Pin filter even if no server pins



  // -------------------------------
// NEAREST SPOT (from "here")
// -------------------------------
function kmBetween(a, b) {
  // Haversine
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function buildSpotList() {
  const add = (arr, kind) =>
    (Array.isArray(arr) ? arr : [])
      .filter(x => x && typeof x.lat === "number" && typeof x.lng === "number")
      .map(x => ({
        kind,
        lat: x.lat,
        lng: x.lng,
        name: (x.name || x.nameEn || "").trim() || kind,
        ref: x
      }));

  return [
    ...add(pins, "pin"),
    ...add(churches, "church"),
    ...add(mosques, "mosque"),
    ...add(museums, "museum"),
    ...add(shrines, "shrine"),
    ...add(temples, "temple"),
    ...add(parks, "park"),
    ...add(stations, "station"),
  ];
}

let ALL_SPOTS = buildSpotList();
function refreshAllSpots() { ALL_SPOTS = buildSpotList(); }


let nearestCache = null; // { lat, lng, name }
(function hookNearestClick(){
  const el = document.getElementById("nearestPill");
  if (!el) return;

  el.addEventListener("click", () => {
    if (!nearestCache) return;

    map.setView([nearestCache.lat, nearestCache.lng], Math.max(map.getZoom(), 17), { animate: true });

    const m = markerById.get(nearestCache.id);
    if (m) m.openPopup();
  });
})();

  
function updateNearestPill(fromLatLng) {
  const el = document.getElementById("nearestPill");
  if (!el) return;

  if (!fromLatLng || typeof fromLatLng.lat !== "number" || typeof fromLatLng.lng !== "number") {
    el.textContent = "";
    nearestCache = null;
    return;
  }

  let best = null;
  let bestKm = Infinity;

  for (const s of ALL_SPOTS) {
    const d = kmBetween(fromLatLng, s);
    if (d < bestKm) { bestKm = d; best = s; }
  }

  if (!best || !isFinite(bestKm)) {
    el.textContent = "";
    nearestCache = null;
    return;
  }

  nearestCache = {
  id: String(best.ref?.id || `${best.kind}:${best.lat},${best.lng}`),
  lat: best.lat,
  lng: best.lng,
  name: best.name,
  kind: best.kind
};


  const dist = bestKm < 1 ? `${Math.round(bestKm*1000)} m` : `${bestKm.toFixed(1)} km`;
  el.innerHTML = `Nearest: <b>${escapeHtml(best.name)}</b> <span style="color:#555;">(${dist})</span>`;
  el.style.cursor = "pointer";
}

// Click-to-jump (attach once)



// =====================================================
// "I'M HERE" (MAP-FIRST) — local-only, demo-friendly
// Requires: Leaflet map instance named `map`
// Uses: window.AREA_KEY for per-area storage
// =====================================================
(function setupImHere(map) {
  if (typeof L === "undefined") return;
  if (!map) {
    console.warn("[Johren] map instance missing — 'I'm here' not initialized");
    return;
  }

  const AREA = (window.AREA_KEY || "default_area").trim();
  const KEY  = `johren_here_v1:${AREA}`;

  let hereMarker = null;
  let armed = false;

  function round(n, dp = 6) {
    const p = Math.pow(10, dp);
    return Math.round(n * p) / p;
  }

  function loadHere() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.lat !== "number" || typeof obj.lng !== "number") return null;
      return obj;
    } catch {
      return null;
    }
  }

  function saveHere(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
  }

  function clearHere() {
    try { localStorage.removeItem(KEY); } catch {}
  }

  function setButtonState(btnEl, mode) {
    // mode: "idle" | "armed" | "has"
    if (!btnEl) return;

    if (mode === "armed") {
      btnEl.textContent = "Tap map…";
      btnEl.style.opacity = "0.95";
    } else if (mode === "has") {
      btnEl.textContent = "Clear";
      btnEl.style.opacity = "0.95";
    } else {
      btnEl.textContent = "I’m here";
      btnEl.style.opacity = "0.95";
    }
  }

  function placeMarker(h) {
    if (!h) return;
    const lat = h.lat, lng = h.lng;

    if (hereMarker) {
      hereMarker.setLatLng([lat, lng]);
    } else {
      hereMarker = L.marker([lat, lng], { keyboard: false }).addTo(map);
    }

    const label = (h.label || "You are here").trim();
    hereMarker.bindPopup(`<b>${label}</b>`).openPopup();
  }

  // ---- Leaflet control UI ----
  const HereControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const container = L.DomUtil.create("div", "leaflet-bar");
      const a = L.DomUtil.create("a", "", container);

      a.href = "#";
      a.style.width = "auto";
      a.style.padding = "0 10px";
      a.style.lineHeight = "30px";
      a.style.fontSize = "13px";
      a.style.fontFamily = "system-ui, -apple-system, Segoe UI, sans-serif";
      a.style.background = "#fff";
      a.style.color = "#222";
      a.style.cursor = "pointer";
      a.style.textDecoration = "none";

      // prevent map drag/zoom when tapping the button
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      // initial state based on saved "here"
      const existing = loadHere();
      if (existing) setButtonState(a, "has");
      else setButtonState(a, "idle");

      L.DomEvent.on(a, "click", (e) => {
        L.DomEvent.preventDefault(e);

        const existingNow = loadHere();

        // If we already have a here -> clicking means clear
if (existingNow && !armed) {
  clearHere();
armed = false;
map.getContainer().classList.remove("here-armed");
updateNearestPill(null);

  if (hereMarker) {
    map.removeLayer(hereMarker);
    hereMarker = null;
  }

  // ✅ reset cursor
  setButtonState(a, "idle");

  if (typeof window.logVisit === "function") {
    window.logVisit({ kind: "clear_here", area: AREA });
  }
  return;
}

// Arm "tap to set"
armed = !armed;

// visual cue: crosshair while armed (CSS class)
const mapEl = map.getContainer();
mapEl.classList.toggle("here-armed", armed);

if (armed) setButtonState(a, "armed");
else setButtonState(a, existingNow ? "has" : "idle");

      });

      // expose for other UI if needed
      container._btn = a;
      return container;
    }
  });

  const hereControl = new HereControl();
  map.addControl(hereControl);

  function getBtnEl() {
    // Leaflet stores container as _container
    // our <a> is firstChild of that container
    return hereControl?._container?._btn || hereControl?._container?.querySelector("a");
  }

    // ---- Map click handler (only when armed) ----
  map.on("click", (ev) => {
    if (!armed) return;

    const lat = round(ev.latlng.lat, 6);
    const lng = round(ev.latlng.lng, 6);

    const hereObj = {
      lat,
      lng,
      area: AREA,
      source: "map_tap",
      ts: Date.now(),
      label: "I’m here"
    };

    saveHere(hereObj);
    placeMarker(hereObj);
    map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true });

    updateNearestPill({ lat, lng });

    armed = false;
    map.getContainer().classList.remove("here-armed");
    setButtonState(getBtnEl(), "has");

    if (typeof window.logVisit === "function") {
      window.logVisit({ kind: "set_here", area: AREA, lat, lng, source: "map_tap" });
    }
  });

  // ---- Restore on load ----
  const existing = loadHere();
  if (existing) {
    placeMarker(existing);
    map.setView([existing.lat, existing.lng], Math.max(map.getZoom(), 16));
    updateNearestPill({ lat: existing.lat, lng: existing.lng });
  } else {
    updateNearestPill(null);
  }
// ===============================
// Step A: Personal Local Pins (localStorage per AREA_KEY)
// ===============================
const PERSONAL_TYPE = "personal";

function personalStorageKey() {
  return `JBS_PERSONAL_PINS__${window.AREA_KEY || "DEFAULT"}`;
}

function loadPersonalPins() {
  try {
    return JSON.parse(localStorage.getItem(personalStorageKey()) || "[]");
  } catch {
    return [];
  }
}

function savePersonalPins(pins) {
  localStorage.setItem(personalStorageKey(), JSON.stringify(pins));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// Keep personal pins in memory (so filters can toggle them)
let personalPins = loadPersonalPins();

// Create a layer group so we can hide/show personal pins cleanly
const personalLayer = L.layerGroup();

// Style: simple but distinct
function makePersonalIcon() {
  // uses Leaflet default marker; if you already use custom icons, swap here
  return new L.Icon.Default();
}

function bindPersonalPopup(marker, pin) {
  const safeName = (pin.name || "Pinned spot").replace(/[<>]/g, "");
  marker.bindPopup(`
    <b>${safeName}</b>
    <div style="margin-top:6px; font-size:12px; color:#444;">
      Personal pin (local only)
    </div>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button data-action="rename" style="padding:6px 10px;">Rename</button>
      <button data-action="delete" style="padding:6px 10px;">Delete</button>
    </div>
  `);

  marker.on("popupopen", (e) => {
    const el = e.popup.getElement();
    if (!el) return;

    const renameBtn = el.querySelector('button[data-action="rename"]');
    const deleteBtn = el.querySelector('button[data-action="delete"]');

    if (renameBtn) {
      renameBtn.onclick = () => {
        const next = prompt("Name this pin:", pin.name || "");
        if (next === null) return;
        pin.name = next.trim() || "Pinned spot";
        savePersonalPins(personalPins);
        marker.setPopupContent(`
          <b>${pin.name.replace(/[<>]/g, "")}</b>
          <div style="margin-top:6px; font-size:12px; color:#444;">
            Personal pin (local only)
          </div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button data-action="rename" style="padding:6px 10px;">Rename</button>
            <button data-action="delete" style="padding:6px 10px;">Delete</button>
          </div>
        `);
      };
    }

    if (deleteBtn) {
      deleteBtn.onclick = () => {
        if (!confirm("Delete this personal pin?")) return;
        personalPins = personalPins.filter(p => p.id !== pin.id);
        savePersonalPins(personalPins);
        personalLayer.removeLayer(marker);
      };
    }
  });
}

function renderPersonalPins() {
  personalLayer.clearLayers();

  personalPins.forEach(pin => {
    const m = L.marker([pin.lat, pin.lng], { icon: makePersonalIcon() });

    m._pinType = PERSONAL_TYPE;

    const id = String(pin.id || `personal:${pin.lat},${pin.lng}`);
    markerById.set(id, m); // ✅ allow Nearest click to open popup

    bindPersonalPopup(m, pin);
    m.addTo(personalLayer);
  });
}


// Helper: if you already have a filter system, hook into it by
// showing/hiding personalLayer when "personal" is checked.
function isTypeEnabled(type) {
  const box = document.querySelector(`.pin-filters input[data-type="${type}"]`);
  return !box ? true : box.checked;
}

// Call this whenever filters change
function syncPersonalVisibility() {
  const on = isTypeEnabled(PERSONAL_TYPE);
  if (on) {
    if (!map.hasLayer(personalLayer)) personalLayer.addTo(map);
  } else {
    if (map.hasLayer(personalLayer)) map.removeLayer(personalLayer);
  }
}

// Add a Leaflet text button: "+ Pin"
function addPersonalPinControl() {
  const PinControl = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      const div = L.DomUtil.create("div", "leaflet-bar");
      const a = L.DomUtil.create("a", "leaflet-text-btn", div);
      a.href = "#";
      a.textContent = "+ Pin";
      a.title = "Add a personal pin (local only)";

      // Prevent map drag/zoom when clicking control
      L.DomEvent.disableClickPropagation(div);

      a.onclick = (ev) => {
        ev.preventDefault();
        armPersonalPinPlacement();
      };

      return div;
    }
  });

  map.addControl(new PinControl());
}

let pinArmed = false;

function armPersonalPinPlacement() {
  if (pinArmed) return;
  pinArmed = true;

  // Visual cue
  map.getContainer().classList.add("here-armed");

  // One-time click handler
  const once = (e) => {
    pinArmed = false;
    map.getContainer().classList.remove("here-armed");
    map.off("click", once);

    const name = prompt("Pin name:", "Pinned spot");
    const pin = {
      id: uid(),
      type: PERSONAL_TYPE,
      name: (name || "Pinned spot").trim() || "Pinned spot",
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      createdAt: Date.now()
    };

    personalPins.push(pin);
    savePersonalPins(personalPins);

    renderPersonalPins();
    syncPersonalVisibility();
  };

  map.once("click", once);
}


})(map);
// --- Initialize Step A ---
// Make sure "personal" shows in your filters list.
// If you already build "types" dynamically, just include PERSONAL_TYPE.
// Example: renderPinFilters([...types, PERSONAL_TYPE])
(function initPersonalPinsStepA() {
  // 1) render markers
  renderPersonalPins();

  // 2) ensure layer visibility matches current filters
  syncPersonalVisibility();

  // 4) add +Pin control
  addPersonalPinControl();
})();


})(); // ✅ closes JOHREN MAP ENGINE (UNIVERSAL)


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

  // -------------------------------
  // LANDMARKS (existing categories)
  // -------------------------------
  function loadCategory(list, layer, icon) {
    if (!Array.isArray(list)) return;
    list.forEach(item => {
      if (!item || typeof item.lat !== 'number' || typeof item.lng !== 'number') return;
      L.marker([item.lat, item.lng], { icon }).addTo(layer).bindPopup(formatLandmarkLabel(item));
    });
  }

  loadCategory(churches, churchLayer, icons.church);
  loadCategory(mosques, mosqueLayer, icons.mosque);
  loadCategory(museums, museumLayer, icons.museum);
  loadCategory(shrines, shrineLayer, icons.shrine);
  loadCategory(temples, templeLayer, icons.temple);
  loadCategory(parks, parkLayer, icons.park);

  // -------------------------------
  // PINS + FILTER UI (KK demo)
  // -------------------------------
  const pinMarkers = [];

  function loadPins(list, layer) {
    if (!Array.isArray(list)) return;
    list.forEach(item => {
      if (!item || typeof item.lat !== 'number' || typeof item.lng !== 'number') return;

      const type = (item.type || '').toLowerCase();
      const icon = icons[type] || icons.park;

      const marker = L.marker([item.lat, item.lng], { icon })
        .addTo(layer)
        .bindPopup(formatLandmarkLabel(item));

      marker._pinType = type;
      pinMarkers.push(marker);
    });
  }

  function renderPinFilters(types) {
    const el = document.getElementById('pinFilters');
    if (!el) return;

    const labels = { coffee:"Coffee", restaurant:"Food", supermarket:"Shop", church:"Church", museum: "Museum", mosque:"Mosque"};

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
      });
    });
  }

  loadPins(pins, pinLayer);

  const pinTypes = Array.from(new Set((pins || []).map(p => (p.type || '').toLowerCase()))).filter(Boolean);
  if (pinTypes.length) renderPinFilters(pinTypes);
// =====================================================
// "I'M HERE" (MAP-FIRST) — local-only, demo-friendly
// Requires: Leaflet map instance named `map`
// Uses: window.AREA_KEY for per-area storage
// =====================================================
(function setupImHere() {
  if (typeof L === "undefined") return;
  if (typeof map === "undefined") {
    console.warn("[Johren] map var not found — 'I'm here' not initialized");
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
          if (hereMarker) {
            map.removeLayer(hereMarker);
            hereMarker = null;
          }
          setButtonState(a, "idle");
          if (typeof window.logVisit === "function") {
            window.logVisit({ kind: "clear_here", area: AREA });
          }
          return;
        }

        // Arm "tap to set"
        armed = !armed;

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

    armed = false;
    setButtonState(getBtnEl(), "has");

    if (typeof window.logVisit === "function") {
      // Optional: for privacy, you can round to 3 decimals here
      window.logVisit({ kind: "set_here", area: AREA, lat, lng, source: "map_tap" });
    }
  });

  // ---- Restore on load ----
  const existing = loadHere();
  if (existing) {
    placeMarker(existing);
    map.setView([existing.lat, existing.lng], Math.max(map.getZoom(), 16));
  }
})();
})(); // ✅ closes JOHREN MAP ENGINE (UNIVERSAL)


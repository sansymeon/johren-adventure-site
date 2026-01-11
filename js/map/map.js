
// ===============================
// JOHREN MAP ENGINE (UNIVERSAL)
// ===============================

(function () {
  if (!window.MAP_CONFIG) {
    console.error('MAP_CONFIG missing');
    return;
  }

  const AREA_KEY = window.AREA_KEY;
  if (!AREA_KEY) {
    console.error('AREA_KEY missing');
    return;
  }

  const area = window.MAP_CONFIG[AREA_KEY];
  if (!area) {
    console.error('Invalid AREA_KEY:', AREA_KEY);
    return;
  }

  const {
    center,
    zoom,
    stations = [],
    churches = [],
    museums = [],
    shrines = [],
    temples = [],
    parks = []
  } = area;

  // ✅ AREA-SCOPED STORAGE
  const storageKey = `johren:${AREA_KEY}`;


  // -------------------------------
  // MAP INITIALIZATION
  // -------------------------------
  const map = L.map('map', {
  zoomControl: false,
  attributionControl: false
}).setView(center, zoom);
;

  L.control.zoom({ position: 'topright' }).addTo(map);

  // -------------------------------
  // TILE LAYER
  // -------------------------------
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // -------------------------------
  // STORAGE
  // -------------------------------
  function getVisitedStations() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(data?.visitedStations)
        ? data.visitedStations.map(String)
        : [];
    } catch {
      return [];
    }
  }

  function setVisitedStations(list) {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ visitedStations: list })
    );
  }

  // -------------------------------
  // ICON FACTORY
  // -------------------------------
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
    museum: makeIcon('museum.png'),
    shrine: makeIcon('shrine.png'),
    temple: makeIcon('temple.png'),
    park: makeIcon('park.png'),
    stationDefault: makeIcon('station.png'),
    stationVisited: makeIcon('station_visited.png')
  };

  // -------------------------------
  // DISTANCE
  // -------------------------------
  function distanceKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // -------------------------------
  // LAYERS
  // -------------------------------
  const stationLayer = L.layerGroup().addTo(map);
  const churchLayer  = L.layerGroup().addTo(map);
  const museumLayer  = L.layerGroup().addTo(map);
  const shrineLayer  = L.layerGroup().addTo(map);
  const templeLayer  = L.layerGroup().addTo(map);
  const parkLayer    = L.layerGroup().addTo(map);

  // ===============================
// HISTORICAL WHISPER LAYER
// Area-level quiet context
// One line max. No explanations.
// Absence is intentional.
// ===============================

// Simple deterministic hash (stable across reloads)
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // 32bit
  }
  return Math.abs(hash);
}

  // Decide whether this station should show history (~25%)
function shouldShowHistory(stationId) {
  return hashString(stationId) % 4 === 0;
}



// Pick a stable history line from the area's pool
function pickHistoryLine(stationId, pool) {
  if (!pool || pool.length === 0) return null;
  const index = hashString(stationId + "_history") % pool.length;
  return pool[index];
}

// Render in ONE place only (bottom image / quiet zone)
function renderHistoryLine(text) {
  if (!text) return;

  const container = document.querySelector(".history-whisper");
  if (!container) return;

  const p = document.createElement("p");
  p.className = "history-line";
  p.textContent = text;

  container.appendChild(p);
}

  // -------------------------------
  // STATIONS
  // -------------------------------
  let selectedStation = null;
  let lastTappedStation = null;
  const visitedStations = getVisitedStations();

  function formatStationLabel(station) {
    return station.nameEn
      ? `<div class="station-label">
           <div class="jp">${station.name}</div>
           <div class="en">${station.nameEn}</div>
         </div>`
      : `<div class="station-label"><div class="jp">${station.name}</div></div>`;
  }

  stations.forEach(station => {
  if (
    !station ||
    typeof station.lat !== 'number' ||
    typeof station.lng !== 'number'
  ) {
    console.warn('[Johren] Invalid station:', station);
    return;
  }

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

    selectedStation = station;
    marker.bindPopup(`基準駅：${station.name}`).openPopup();
    updateDistances();
  });
});

  // -------------------------------
  // LANDMARKS
  // -------------------------------
 function loadCategory(list, layer, icon) {
  if (!Array.isArray(list)) return;

  list.forEach(item => {
    if (
      !item ||
      typeof item.lat !== 'number' ||
      typeof item.lng !== 'number'
    ) {
      console.warn('[Johren] Invalid landmark:', item);
      return;
    }

    const marker = L.marker([item.lat, item.lng], { icon })
      .addTo(layer)
      .bindPopup(item.name);

    item._marker = marker;
  });
}
// -------------------------------
// LOAD LANDMARK CATEGORIES
// -------------------------------
loadCategory(churches, churchLayer, icons.church);
loadCategory(museums, museumLayer, icons.museum);
loadCategory(shrines, shrineLayer, icons.shrine);
loadCategory(temples, templeLayer, icons.temple);
loadCategory(parks, parkLayer, icons.park);

  // -------------------------------
  // DISTANCE UPDATE
  // -------------------------------
  function updateDistances() {
    if (!selectedStation) return;

    [...churches, ...museums, ...shrines, ...temples, ...parks].forEach(item => {
      if (!item._marker) return;
      const d = distanceKm(selectedStation, item).toFixed(1);
      item._marker.bindPopup(`${item.name}<br>駅から約 ${d} km`);
    });
  }



})();

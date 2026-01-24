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

    const labels = { coffee:"Coffee", restaurant:"Food", supermarket:"Shop", church:"Church", museum:"Museum",  mosque:"Mosque"};

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

})();

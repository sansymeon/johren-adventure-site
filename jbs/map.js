(async function () {
  // ===============================
  // HELPERS
  // ===============================
  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[c])
    );
  }

  async function loadVisiblePlaces() {
    const res = await fetch('/jbs/data/merchants.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load /jbs/data/merchants.json');

    const data = await res.json(); // object keyed by id
    const places = Object.entries(data).map(([id, p]) => ({ id, ...p }));

    // Validate: pin_url should match level segment
    for (const p of places) {
      const seg = `level_${String(p.level).padStart(2, '0')}`;
      if (p.pin_url && !p.pin_url.includes(seg)) {
        console.warn('pin_url level mismatch', p.id, p.pin_url, p.level);
      }
    }

    // Only render places explicitly visible and having a pin_url
    return places.filter(p => p.visible === true && typeof p.pin_url === 'string' && p.pin_url.length > 0);
  }

  // ===============================
  // MAP CONFIG
  // ===============================
  const mapConfig = { center: [33.5, 130.5], zoom: 9 };

  // Optional deep-link center/zoom via URL params
  const params = new URLSearchParams(window.location.search);
  const lat  = parseFloat(params.get('lat'));
  const lng  = parseFloat(params.get('lng'));
  const zoom = parseInt(params.get('zoom'), 10);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng);

  const center    = hasValidCoords ? [lat, lng] : mapConfig.center;
  const finalZoom = hasValidCoords ? (zoom || mapConfig.zoom) : mapConfig.zoom;

  // ===============================
  // MAP INITIALIZATION
  // ===============================
  const map = L.map('map', { zoomControl: false }).setView(center, finalZoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // ===============================
  // ICON
  // ===============================
  const sampleIcon = L.icon({
    iconUrl: '/img/map/sample.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -30]
  });

  // ===============================
  // JBS PLACES (Pin only — no QR links)
  // ===============================
  const places = await loadVisiblePlaces();

  if (places.length && !hasValidCoords) {
    const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2));
  }

  places.forEach(p => {
    const popup = `
      <div style="line-height:1.4">
        <div><strong>${escapeHtml(p.name || p.id)}</strong></div>
        <div style="margin-top:6px;">
          <a href="${p.pin_url}">開く →</a>
        </div>
      </div>
    `;

    L.marker([p.lat, p.lng], { icon: sampleIcon })
      .addTo(map)
      .bindPopup(popup);
  });

})().catch(err => console.error(err));

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
    const res = await fetch('/jbs/merchants.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load /jbs/merchants.json');

    const data = await res.json(); // object keyed by id
    const places = Object.entries(data).map(([id, p]) => ({ id, ...p }));

    // Basic validation: level should match URL segment
    for (const p of places) {
      const seg = `level_${String(p.level).padStart(2, '0')}`;
      if (p.pin_url && !p.pin_url.includes(seg)) console.warn('pin_url level mismatch', p.id, p.pin_url, p.level);
      if (p.qr_url  && !p.qr_url.includes(seg))  console.warn('qr_url level mismatch',  p.id, p.qr_url,  p.level);
    }

    return places.filter(p => p.visible);
  }

  // ===============================
  // MAP CONFIG (no more map-data.js)
  // ===============================
  const mapConfig = { center: [33.5, 130.5], zoom: 9 };

  // Allow optional deep-link center/zoom via URL params
  const params = new URLSearchParams(window.location.search);
  const lat  = parseFloat(params.get('lat'));
  const lng  = parseFloat(params.get('lng'));
  const zoom = parseInt(params.get('zoom'), 10);
  const hasValidCoords = !isNaN(lat) && !isNaN(lng);

  const center   = hasValidCoords ? [lat, lng] : mapConfig.center;
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
  // ICON FACTORY + REGISTRY
  // ===============================
  function makeIcon(file) {
    return L.icon({
      iconUrl: `/img/map/${file}`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -30]
    });
  }

  const icons = {
    artisan: makeIcon('artisan.png'),
    bakery: makeIcon('bakery.png'),
    barbershop: makeIcon('barb

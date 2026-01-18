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
    barbershop: makeIcon('barber.png'),
    bath: makeIcon('bath.png'),
    beauty: makeIcon('beauty.png'),
    bookstore: makeIcon('bookstore.png'),
    coffee: makeIcon('coffee.png'),
    combini: makeIcon('combini.png'),
    drugstore: makeIcon('drugs.png'),
    hotel: makeIcon('hotel.png'),
    noodles: makeIcon('noodles.png'),
    restaurant: makeIcon('restaurant.png'),
    supermarket: makeIcon('supermarket.png'),
    playground: makeIcon('playground.png'),
    sample: makeIcon('sample.png')
  };

  // ===============================
  // OPTIONAL: legacy categories (only if those arrays exist on window)
  // ===============================
  function loadCategory(categoryName, iconName) {
    const list = window[categoryName];
    const icon = icons[iconName];

    if (!Array.isArray(list) || !icon) return;

    list
      .filter(item => item.visible === true)
      .forEach(item => {
        const lvl = item.level || 1;
        const pinUrl =
          item.pin_url ||
          (item.id ? `/jbs/pin/level_${String(lvl).padStart(2,'0')}/?id=${encodeURIComponent(item.id)}` : null);

        const html = pinUrl
          ? `<div>${escapeHtml(item.name)}</div>
             <div style="margin-top:6px;">
               <a href="${pinUrl}">開く →</a>
             </div>`
          : `<div>${escapeHtml(item.name)}</div>`;

        L.marker([item.lat, item.lng], { icon }).addTo(map).bindPopup(html);
      });
  }

  // Keep these if you still use them somewhere else. If not, you can delete this whole block.
  loadCategory("artisans", "artisan");
  loadCategory("bakeries", "bakery");
  loadCategory("baths", "bath");
  loadCategory("beautyshops", "beauty");
  loadCategory("bookstores", "bookstore");
  loadCategory("coffeeshops", "coffee");
  loadCategory("combini", "combini");
  loadCategory("drugstores", "drugstore");
  loadCategory("hotels", "hotel");
  loadCategory("noodles", "noodles");
  loadCategory("playgrounds", "playground");
  loadCategory("restaurants", "restaurant");
  loadCategory("supermarkets", "supermarket");

  // ===============================
  // JBS PLACES (from merchants.json)
  // ===============================
  const places = await loadVisiblePlaces();

  if (places.length && !hasValidCoords) {
    const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2));
  }

  places.forEach(p => {
    const links =
      `<div style="line-height:1.4">
         <div><strong>${escapeHtml(p.name || p.id)}</strong></div>
         <div style="margin-top:6px;">
           <a href="${p.pin_url}">Pin</a> ・ <a href="${p.qr_url}">QR</a>${
             p.merchant_url ? ` ・ <a href="${p.merchant_url}">Merchant</a>` : ''
           }
         </div>
       </div>`;

    L.marker([p.lat, p.lng], { icon: icons.sample })
      .addTo(map)
      .bindPopup(links);
  });

})().catch(err => console.error(err));

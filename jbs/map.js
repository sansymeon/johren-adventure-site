(function () {
  // ===============================
  // JBS MAP CONFIG (from map-data.js)
  // ===============================
  const mapConfig = window.JBS_MAP || { center: [33.5, 130.5], zoom: 9 };

  // ===============================
  // MAP INITIALIZATION
  // ===============================
  const params = new URLSearchParams(window.location.search);

  const lat  = parseFloat(params.get('lat'));
  const lng  = parseFloat(params.get('lng'));
  const zoom = parseInt(params.get('zoom'), 10);

  const hasValidCoords = !isNaN(lat) && !isNaN(lng);

  const center = hasValidCoords ? [lat, lng] : mapConfig.center;
  const finalZoom = hasValidCoords ? (zoom || mapConfig.zoom) : mapConfig.zoom;

  const map = L.map('map', { zoomControl: false }).setView(center, finalZoom);

  // ===============================
  // TILE LAYER
  // ===============================
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // ===============================
  // ICON FACTORY
  // ===============================
  function makeIcon(file) {
    return L.icon({
      iconUrl: `/img/map/${file}`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -30]
    });
  }

  // ===============================
  // ICON REGISTRY
  // ===============================
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
  // CATEGORY LOADER
  // ===============================
  function loadCategory(categoryName, iconName) {
    const list = window[categoryName];
    const icon = icons[iconName];

    if (!Array.isArray(list) || !icon) return;

    list
      .filter(item => item.visible === true)
      .forEach(item => {
        const pinUrl =
  item.pin_url ||
  (item.id ? `/jbs/pin/level_0${item.level || 1}/?id=${encodeURIComponent(item.id)}` : null);

const html = pinUrl
  ? `<div>${item.name}</div>
     <div style="margin-top:6px;">
       <a href="${pinUrl}">開く →</a>
     </div>`
  : `<div>${item.name}</div>`;

L.marker([item.lat, item.lng], { icon })
  .addTo(map)
  .bindPopup(html);

      });
  }

  // ===============================
  // LOAD CATEGORIES
  // ===============================
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
  // OPTIONAL SAMPLES
  // ===============================
  if (Array.isArray(window.samples)) {
    window.samples.forEach(s => {
      L.marker([s.lat, s.lng], { icon: icons.sample })
        .addTo(map)
        .bindPopup(
          `<div>${s.name}</div>
           <div style="margin-top:6px;">
             <a href="${s.pin_url}">開く →</a>
           </div>`
        );
    });
  }
})();

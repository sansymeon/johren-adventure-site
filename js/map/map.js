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

  // ---- Init map ----
  map = L.map("map", { zoomControl: false }).setView(center, zoom);

  if (bounds) map.setMaxBounds(bounds);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // ---- Hide empty menu categories (Gaya rule) ----
  const presentTypes = new Set(
    window.MAP_DATA.pins
      .filter(p => p.area === window.AREA_KEY)
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
    if (pin.area !== window.AREA_KEY) return;
    if (typeof pin.lat !== "number") return;

    L.marker([pin.lat, pin.lng])
      .addTo(map)
      .bindTooltip(
        pin.nameEn ? `${pin.name} / ${pin.nameEn}` : pin.name,
        { direction: "top", offset: [0, -20] }
      );
  });

})();

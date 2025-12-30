// ===============================
// JOHREN CHECK-IN (STATION PAGE)
// ===============================

(function () {
  if (!window.STATION_ID) {
    console.warn('[Johren] No STATION_ID, skipping check-in');
    return;
  }

  if (typeof window.markStationVisited !== 'function') {
    console.error('[Johren] markStationVisited not available');
    return;
  }

  window.markStationVisited(window.STATION_ID);
})();

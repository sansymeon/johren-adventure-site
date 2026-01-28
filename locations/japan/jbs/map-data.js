// place policy:
// Only locations explicitly marked as visible are rendered on the map.
// Sample markers are shown separately for demonstration purposes.

window.JBS_MAP = {
  center: [33.5, 130.5], // Kyushu overview
  zoom: 9
};

// If you later want “real” joined locations in one array:
window.PLACE_MAP = {
  center: [33.557082, 130.199305], // Itoshima (optional if you ever use it)
  zoom: 11,
  places: [
    // joined locations only
  ]
};

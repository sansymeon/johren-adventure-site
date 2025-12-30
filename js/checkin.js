if (!window.STATION_ID) {
  console.warn("No station ID, skipping check-in");
  return;
}

const STORAGE_KEY = "johren_itoshima";

const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  visitedStations: []
};

if (!data.visitedStations.includes(window.STATION_ID)) {
  data.visitedStations.push(window.STATION_ID);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

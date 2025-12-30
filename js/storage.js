function getStorageKey() {
  return window.AREA_KEY
    ? `johren:${window.AREA_KEY}`
    : 'johren';
}

function getJohrenData() {
  return JSON.parse(localStorage.getItem(getStorageKey())) || {
    visitedStations: []
  };
}

function saveJohrenData(data) {
  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(data)
  );
}

function markStationVisited(stationId) {
  const id = String(stationId);
  const data = getJohrenData();

  if (!data.visitedStations.includes(id)) {
    data.visitedStations.push(id);
    saveJohrenData(data);
  }
}

// expose for checkin.js
window.markStationVisited = markStationVisited;

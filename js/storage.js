function getStorageKey() {
  if (!window.AREA_KEY) {
    console.warn('[Johren] AREA_KEY missing, using global storage');
    return 'johren';
  }
  return `johren:${window.AREA_KEY}`;
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

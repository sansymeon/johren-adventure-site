function getStorageKey() {
  return window.AREA_KEY ? `johren:${AREA_KEY}` : 'johren';
}

function getJohrenData() {
  return JSON.parse(localStorage.getItem(getStorageKey())) || {
    visitedStations: []
  };
}

function saveJohrenData(data) {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
}


function markStationVisited(stationId) {
  const data = getJohrenData();

  if (!data.visitedStations.includes(stationId)) {
    data.visitedStations.push(stationId);
    saveJohrenData(data);
  }
}

// expose for checkin.js
window.markStationVisited = markStationVisited;

const STORAGE_KEY = 'johren';

function getJohrenData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    visitedStations: []
  };
}

function saveJohrenData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

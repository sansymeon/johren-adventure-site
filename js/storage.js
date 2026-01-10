// ===============================
// STORAGE KEY (area-scoped)
// ===============================
function getStorageKey() {
  if (!window.AREA_KEY) {
    console.warn('[Johren] AREA_KEY missing, using global storage');
    return 'johren';
  }
  return `johren:${window.AREA_KEY}`;
}

// ===============================
// LOAD / SAVE
// ===============================
function getJohrenData() {
  return JSON.parse(localStorage.getItem(getStorageKey())) || {
    visitedStations: [],
    visitCounts: {}
  };
}

function saveJohrenData(data) {
  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(data)
  );
}

// ===============================
// STATIONS (existing behavior)
// ===============================
function markStationVisited(stationId) {
  const id = String(stationId);
  const data = getJohrenData();

  if (!data.visitedStations.includes(id)) {
    data.visitedStations.push(id);
    saveJohrenData(data);
  }
}

// ===============================
// VISIT COUNT (NEW, SILENT)
// ===============================
function recordVisit(spotId) {
  const id = String(spotId);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data = getJohrenData();

  if (!data.visitCounts[id]) {
    data.visitCounts[id] = {
      total: 0,
      lastVisitDate: null
    };
  }

  // only increment once per day
  if (data.visitCounts[id].lastVisitDate !== today) {
    data.visitCounts[id].total += 1;
    data.visitCounts[id].lastVisitDate = today;
    saveJohrenData(data);
  }
}

// ===============================
// READ-ONLY ACCESS (DISPLAY LAYER)
// ===============================
function getVisitCount(spotId) {
  const data = getJohrenData();
  return data.visitCounts?.[String(spotId)]?.total || 0;
}

// ===============================
// EXPOSE
// ===============================
window.markStationVisited = markStationVisited;
window.recordVisit = recordVisit;
window.getVisitCount = getVisitCount;

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
export function getOptInId() {
  let id = localStorage.getItem("johren_optin_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("johren_optin_id", id);
  }
  return id;
}
export function getOptInCount() {
  return parseInt(localStorage.getItem("johren_optin_count") || "0", 10);
}

export function incrementOptInCount() {
  const next = getOptInCount() + 1;
  localStorage.setItem("johren_optin_count", String(next));
  return next;
}


// expose for checkin.js
window.markStationVisited = markStationVisited;

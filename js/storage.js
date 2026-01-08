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
const OPTIN_COUNT_KEY = "johren_optin_count";
const OPTIN_LAST_DATE_KEY = "johren_optin_last_date";

function todayString() {
  // Local calendar day, not UTC
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

export function getOptInCount() {
  return parseInt(localStorage.getItem(OPTIN_COUNT_KEY) || "0", 10);
}

export function canIncrementOptInToday() {
  const last = localStorage.getItem(OPTIN_LAST_DATE_KEY);
  return last !== todayString();
}

export function incrementOptInCountOncePerDay() {
  if (!canIncrementOptInToday()) {
    return false; // already counted today
  }

  const next = getOptInCount() + 1;
  localStorage.setItem(OPTIN_COUNT_KEY, String(next));
  localStorage.setItem(OPTIN_LAST_DATE_KEY, todayString());
  return true;
}
// -------------------------------
// OPT-IN GPS CONTEXT (OPTIONAL)
// -------------------------------

const OPTIN_GPS_KEY = "johren_optin_gps";

export function saveOptInGPSContext({ lat, lng, acc }) {
  localStorage.setItem(
    OPTIN_GPS_KEY,
    JSON.stringify({
      lat,
      lng,
      acc,
      t: Date.now()
    })
  );
}

export function getOptInGPSContext() {
  const raw = localStorage.getItem(OPTIN_GPS_KEY);
  return raw ? JSON.parse(raw) : null;
}


// expose for checkin.js
window.markStationVisited = markStationVisited;

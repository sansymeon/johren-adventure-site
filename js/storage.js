/*
JOHREN QR SYSTEM — DO NOT OPTIMIZE

This code handles QR access for Johren.
It is intentionally quiet and minimal.

Rules (non-negotiable):
- QR access is for presence, not engagement.
- Users must NEVER see visit counts or progress.
- No instant feedback, rewards, or explanations.
- Any effects (if ever) must be delayed and subtle.
- Johren does not issue incentives or manage rewards.

If you are thinking about:
- gamification
- optimization
- engagement metrics
- progress indicators
- “just one small improvement”

Stop and read:
  /jbs/qr/README.md

Calm is a feature.
*/
/*
JOHREN QR SYSTEM — DO NOT OPTIMIZE

... (your full header comment unchanged) ...
*/

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
// LOAD / SAVE (HARDENED)
// ===============================
function getJohrenData() {
  const base = { visitedStations: [], visitCounts: {} };

  let raw = null;
  try {
    raw = localStorage.getItem(getStorageKey());
  } catch (e) {
    return base; // blocked storage; stay quiet
  }

  if (!raw) return base;

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') return base;

    if (!Array.isArray(parsed.visitedStations)) parsed.visitedStations = [];

    if (!parsed.visitCounts || typeof parsed.visitCounts !== 'object' || Array.isArray(parsed.visitCounts)) {
      parsed.visitCounts = {};
    }

    return parsed;
  } catch (e) {
    console.warn('[Johren] storage parse failed, resetting');
    return base;
  }
}

function saveJohrenData(data) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  } catch (e) {
    console.warn('[Johren] storage write failed');
  }
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
// VISIT COUNT (GENERIC, SILENT)
// ===============================
function recordVisit(key) {
  const id = String(key);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data = getJohrenData();

  // guard schema
  if (!data.visitCounts || typeof data.visitCounts !== 'object' || Array.isArray(data.visitCounts)) {
    data.visitCounts = {};
  }

  const cur = data.visitCounts[id];
  if (!cur || typeof cur !== 'object' || Array.isArray(cur) || cur === null) {
    data.visitCounts[id] = { total: 0, lastDate: null };
  } else {
    if (typeof cur.total !== 'number') cur.total = 0;
    if (cur.lastDate !== null && typeof cur.lastDate !== 'string') cur.lastDate = null;
  }

  // only increment once per day
  if (data.visitCounts[id].lastDate !== today) {
    data.visitCounts[id].total += 1;
    data.visitCounts[id].lastDate = today;
    saveJohrenData(data);
  }
}

// ===============================
// READ-ONLY ACCESS (DISPLAY LAYER)
// ===============================
function getVisitCount(key) {
  const data = getJohrenData();
  const id = String(key);
  const item = data.visitCounts?.[id];
  return (item && typeof item.total === 'number') ? item.total : 0;
}

// ===============================
// EXPOSE
// ===============================
window.markStationVisited = markStationVisited;
window.recordVisit = recordVisit;
window.getVisitCount = getVisitCount;


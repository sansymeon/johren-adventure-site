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
  const raw = localStorage.getItem(getStorageKey());

  // Default schema
  const base = {
    visitedStations: [],
    visitCounts: {}
  };

  if (!raw) return base;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn("[Johren] Bad JSON in storage, resetting", e);
    return base;
  }

  // Must be an object
  if (!data || typeof data !== "object") return base;

  // visitedStations must be an array of strings
  if (!Array.isArray(data.visitedStations)) {
    data.visitedStations = [];
  } else {
    data.visitedStations = data.visitedStations.map(String);
  }

  // visitCounts must be an object
  if (!data.visitCounts || typeof data.visitCounts !== "object" || Array.isArray(data.visitCounts)) {
    data.visitCounts = {};
  }

  // Self-heal each visitCounts entry
  for (const k of Object.keys(data.visitCounts)) {
    const v = data.visitCounts[k];
    if (!v || typeof v !== "object") {
      data.visitCounts[k] = { total: 0, lastDate: null };
      continue;
    }
    if (typeof v.total !== "number") v.total = 0;
    if (v.lastDate !== null && typeof v.lastDate !== "string") v.lastDate = null;
  }

  return data;
}

  // Default shape (schema)
  const base = {
    visitedStations: [],
    visitCounts: {}
  };

  if (!raw) return base;

  try {
    const parsed = JSON.parse(raw);

    // Self-heal missing / wrong-typed fields
    if (!parsed || typeof parsed !== 'object') return base;

    if (!Array.isArray(parsed.visitedStations)) {
      parsed.visitedStations = [];
    }

    if (!parsed.visitCounts || typeof parsed.visitCounts !== 'object') {
      parsed.visitCounts = {};
    }

    return parsed;
  } catch (e) {
    // Storage may be corrupted; reset quietly to safe base.
    console.warn('[Johren] storage parse failed, resetting');
    return base;
  }
}

function saveJohrenData(data) {
  try {
    // Self-heal / sanitize before saving (keeps schema stable)
    const safe = {
      visitedStations: Array.isArray(data?.visitedStations)
        ? data.visitedStations.map(String)
        : [],
      visitCounts: (data?.visitCounts && typeof data.visitCounts === "object" && !Array.isArray(data.visitCounts))
        ? data.visitCounts
        : {}
    };

    // Normalize each entry
    for (const k of Object.keys(safe.visitCounts)) {
      const v = safe.visitCounts[k];
      if (!v || typeof v !== "object") {
        safe.visitCounts[k] = { total: 0, lastDate: null };
        continue;
      }
      if (typeof v.total !== "number") v.total = 0;
      if (v.lastDate !== null && typeof v.lastDate !== "string") v.lastDate = null;
    }

    localStorage.setItem(getStorageKey(), JSON.stringify(safe));
  } catch (e) {
    // If storage is full/blocked, stay quiet. No user-facing effects.
    console.warn("[Johren] storage write failed");
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

  // Extra guard in case old schema sneaks in mid-session
  if (!data.visitCounts || typeof data.visitCounts !== 'object') {
    data.visitCounts = {};
  }

  if (!data.visitCounts[id] || typeof data.visitCounts[id] !== 'object' || data.visitCounts[id] === null) {
    data.visitCounts[id] = { total: 0, lastDate: null };
  } else {
    // Self-heal partial objects
    if (typeof data.visitCounts[id].total !== 'number') data.visitCounts[id].total = 0;
    if (typeof data.visitCounts[id].lastDate !== 'string') data.visitCounts[id].lastDate = null;
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

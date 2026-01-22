<script>
  // --- local visit logging ---
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; }
    catch { return fallback; }
  }

  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function logVisit({ kind, id, area, line }) {
    const now = Date.now();
    const date = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD

    const data = loadJSON("johren_visits_v1", {
      totals: { all: 0 },
      byKind: {},      // station / pin (future)
      byId: {},        // id -> counts
      byArea: {},      // area -> counts
      byDate: {},      // YYYY-MM-DD -> counts
      last10: []       // recent visits
    });

    data.totals.all += 1;

    data.byKind[kind] = (data.byKind[kind] || 0) + 1;

    data.byId[id] = data.byId[id] || { count: 0, kind, area: area || null, line: line || null, last: null };
    data.byId[id].count += 1;
    data.byId[id].last = now;

    if (area) data.byArea[area] = (data.byArea[area] || 0) + 1;
    data.byDate[date] = (data.byDate[date] || 0) + 1;

    data.last10.unshift({ t: now, kind, id, area: area || null });
    data.last10 = data.last10.slice(0, 10);

    saveJSON("johren_visits_v1", data);
    return data;
  }
</script>

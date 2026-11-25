/**
 * Normalize Johren MAP_DATA.pins for the prototype without mutating the source file.
 * Handles duplicate ids safely for display / lookup.
 */
(function (global) {
  "use strict";

  const KNOWN_DUP_IDS = new Set(["iwayado_orthodox", "jr_west_kanazawa"]);

  function normalizeType(pin) {
    const raw = pin.type || pin.pinType || pin.pintype || "";
    const t = String(raw).toLowerCase().trim();
    return t || "other";
  }

  // Visitor filters. The pin's own type is kept on pin.type.
  function filterCategory(normType) {
    if (normType === "station") return "railway";
    if (normType === "airport") return "airport";
    if (["church", "shrine", "temple", "museum", "castle", "castle_ruins", "historic"].indexOf(normType) !== -1) {
      return "cultural";
    }
    if (["beach", "waterfall", "forest", "mountain", "viewpoint", "nature", "landmark"].indexOf(normType) !== -1) {
      return "scenic";
    }
    if (["coffee", "restaurant", "supermarket", "market"].indexOf(normType) !== -1) {
      return "place";
    }
    return "cultural";
  }

  /**
   * @returns {{
   *   pins: Array,
   *   byId: Map<string, object>,
   *   duplicateIds: string[],
   *   skipped: number,
   *   stats: object
   * }}
   */
  function normalizePins(rawPins) {
    const seen = new Map(); // id -> count
    const byId = new Map(); // first occurrence wins for discovery join
    const pins = [];
    const duplicateIds = [];
    let skipped = 0;

    (rawPins || []).forEach((pin, index) => {
      if (typeof pin.lat !== "number" || typeof pin.lng !== "number") {
        skipped += 1;
        return;
      }

      const id = pin.id || `anon_${index}`;
      const count = (seen.get(id) || 0) + 1;
      seen.set(id, count);

      const isDuplicate = count > 1;
      if (isDuplicate && !duplicateIds.includes(id)) duplicateIds.push(id);

      const normType = normalizeType(pin);
      const entry = {
        id,
        instanceKey: isDuplicate ? `${id}__dup${count}` : id,
        duplicateIndex: isDuplicate ? count : 0,
        name: pin.name || id,
        nameEn: pin.nameEn || "",
        area: pin.area || "",
        line: pin.line || "",
        type: normType,
        filter: filterCategory(normType),
        lat: pin.lat,
        lng: pin.lng,
        rawType: pin.type || pin.pinType || pin.pintype || "",
        image: typeof pin.image === "string" ? pin.image : "",
        castleKind: pin.castleKind || "",
        iata: pin.iata || ""
      };

      pins.push(entry);
      if (!byId.has(id)) byId.set(id, entry);
    });

    const stats = {
      total: pins.length,
      uniqueIds: byId.size,
      byFilter: pins.reduce((acc, p) => {
        acc[p.filter] = (acc[p.filter] || 0) + 1;
        return acc;
      }, {})
    };

    return {
      pins,
      byId,
      duplicateIds: [...new Set([...duplicateIds, ...KNOWN_DUP_IDS].filter((id) => seen.get(id) > 1))],
      skipped,
      stats,
      knownDupIds: [...KNOWN_DUP_IDS]
    };
  }

  global.TURBO_GEO = { normalizePins, KNOWN_DUP_IDS };
})(window);

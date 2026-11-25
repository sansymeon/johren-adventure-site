/**
 * Turbo Adventures Discovery Map — prototype controller.
 * Flow: discover → destination card → stage preview / welcome demo / directions.
 */
(function () {
  "use strict";

  const JAPAN_CENTER = [36.5, 138.0];
  const JAPAN_ZOOM = 5;

  const FILTERS = [
    { key: "railway", labelKey: "filterRailway" },
    { key: "airport", labelKey: "filterAirport" },
    { key: "cultural", labelKey: "filterCultural" },
    { key: "scenic", labelKey: "filterScenic" },
    { key: "place", labelKey: "filterPlace" },
    { key: "merchant", labelKey: "filterMerchant" }
  ];

  function icon(url, size) {
    return L.icon({
      iconUrl: url,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      tooltipAnchor: [0, -size + 4]
    });
  }

  const PIN_MAP = window.TURBO_PINS.categories;

  function iconFromCategory(key) {
    const spec = PIN_MAP[key];
    if (!spec) return iconFromCategory("cultural");
    if (spec.kind === "div") {
      const size = spec.size;
      return L.divIcon({
        className: spec.className,
        html: spec.html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });
    }
    const url = spec.assetMissing ? spec.fallbackUrl : spec.url;
    return icon(url, spec.size);
  }

  const CATEGORY_ICONS = {
    railway: iconFromCategory("railway"),
    airport: iconFromCategory("airport"),
    cultural: iconFromCategory("cultural"),
    scenic: iconFromCategory("scenic"),
    place: iconFromCategory("cultural"),
    merchant: iconFromCategory("merchant")
  };

  let map;
  let geoLayer;
  let geo;
  let mode = "explore";
  let countryId = "japan";
  const SABAH_CENTER = [5.98, 116.075];
  let regionId = "";
  let prefectureId = "";
  let enabledFilters = new Set(FILTERS.map((f) => f.key));
  let selection = null; // { pin, discovery }
  const els = {};
  const VIEW_HISTORY_CAP = 30;
  const viewHistory = [];
  const CONTROLS_MQ = window.matchMedia("(max-width: 720px)");
  let suppressHistory = false;

  function cacheEls() {
    [
      "destination-sheet",
      "sheet-backdrop",
      "sheet-close",
      "sheet-image",
      "sheet-image-badge",
      "sheet-name",
      "sheet-name-en",
      "sheet-desc",
      "btn-view-stage",
      "btn-directions",
      "btn-preview-welcome",
      "stage-view",
      "stage-back",
      "stage-view-title",
      "stage-view-image",
      "stage-view-badge",
      "stage-view-caption",
      "welcome-view",
      "welcome-back",
      "welcome-return",
      "welcome-title",
      "welcome-message",
      "welcome-image",
      "reward-bg-name",
      "reward-char-name"
    ].forEach((id) => {
      const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      els[key] = document.getElementById(id);
    });
  }

  function pinLabel(pin) {
    return pin.nameEn ? `${pin.name} / ${pin.nameEn}` : pin.name;
  }

  function typeIconFor(pin) {
    if (pin.type === "station" || pin.filter === "railway") return CATEGORY_ICONS.railway;
    if (pin.type === "airport" || pin.filter === "airport") return CATEGORY_ICONS.airport;
    if (pin.filter && CATEGORY_ICONS[pin.filter]) return CATEGORY_ICONS[pin.filter];
    return CATEGORY_ICONS.cultural;
  }

  function discoveryForMappedId(mappedId) {
    return (
      (window.TURBO_DISCOVERY?.discoveries || []).find(
        (d) => d.mapped_location_id === mappedId
      ) || null
    );
  }

  function directionsUrl(lat, lng, label) {
    const q = encodeURIComponent(label || `${lat},${lng}`);
    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
    if (isApple) return `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  function setBadge(el, discovery) {
    if (!el) return;
    let text = "";
    if (discovery?.stage_image_kind === "placeholder") text = "Temporary placeholder";
    else if (discovery?.stage_image_kind === "turbo_artwork") text = "Turbo Adventures artwork";
    if (!text) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle("is-placeholder", discovery.stage_image_kind === "placeholder");
  }

  /* ---- Destination sheet ---- */

  function openDestination(pin, discovery) {
    selection = { pin, discovery };

    const place = window.TURBO_LOCATIONS ? TURBO_LOCATIONS.findPoint(pin.id) : null;
    const railway = place && place.category === "railway";
    const castle = pin.type === "castle" || pin.type === "castle_ruins";
    const stageImage = place && place.rewards && place.rewards.stageImage;
    const castleImage = castle && pin.image ? pin.image : "";

    els.sheetName.textContent = pin.name;
    els.sheetNameEn.textContent = pin.nameEn || "";
    els.sheetNameEn.hidden = !pin.nameEn;

    if (railway) {
      const line = pin.line && pin.line !== "unknown" ? pin.line : "";
      const parts = [];
      if (line) parts.push(TURBO_I18N.t("stationLine", { line: line }));
      const feature = place.featured;
      if (feature) {
        const en = TURBO_I18N.lang() === "en";
        const attraction = en ? feature.attractionEn : feature.attractionJa;
        const about = en ? feature.descriptionEn : feature.descriptionJa;
        if (attraction) parts.push(attraction);
        if (about) parts.push(about);
      }
      els.sheetDesc.textContent = parts.join("\n");
    } else if (discovery && discovery.stage_description) {
      els.sheetDesc.textContent = discovery.stage_description;
    } else if (place && place.category === "airport") {
      els.sheetDesc.textContent = TURBO_I18N.t("airportSheet");
    } else if (place && place.category === "scenic") {
      els.sheetDesc.textContent = TURBO_I18N.t("scenicSheet");
    } else if (place && place.category === "sabah") {
      els.sheetDesc.textContent = TURBO_I18N.t("sabahSheet");
    } else if (place && place.category === "merchant") {
      els.sheetDesc.textContent = TURBO_I18N.t("merchantSheet");
    } else if (place && place.category === "cultural") {
      els.sheetDesc.textContent = TURBO_I18N.t("culturalSheet");
    } else if (castle) {
      els.sheetDesc.textContent = TURBO_I18N.t("culturalSheet");
    } else {
      els.sheetDesc.textContent = TURBO_I18N.t("discoverySheet");
    }

    const showArt = railway ? !!stageImage : castle ? !!castleImage : !!(discovery && discovery.stage_image);
    const media = document.querySelector("#destination-sheet .sheet-media");
    if (media) media.hidden = !showArt;
    if (els.btnViewStage) els.btnViewStage.hidden = castle || !showArt;
    if (els.btnPreviewWelcome) els.btnPreviewWelcome.hidden = railway || castle || !showArt;

    if (showArt) {
      els.sheetImage.src = railway ? stageImage : castle ? castleImage : discovery.stage_image;
      els.sheetImage.alt = (discovery && discovery.stage_title) || pinLabel(pin);
      setBadge(els.sheetImageBadge, railway || castle ? null : discovery);
    }

    els.btnDirections.href = directionsUrl(pin.lat, pin.lng, pinLabel(pin));
    if (window.TURBO_GPS_CHECKIN) window.TURBO_GPS_CHECKIN.syncSheet(pin);

    els.destinationSheet.hidden = false;
    els.destinationSheet.setAttribute("aria-hidden", "false");
    els.sheetBackdrop.hidden = false;
    document.body.classList.add("sheet-open");
  }

  function closeDestination() {
    els.destinationSheet.hidden = true;
    els.destinationSheet.setAttribute("aria-hidden", "true");
    els.sheetBackdrop.hidden = true;
    document.body.classList.remove("sheet-open");
  }

  /* ---- Stage preview ---- */

  function openStage() {
    if (!selection) return;
    const { pin, discovery } = selection;
    closeDestination();

    els.stageViewTitle.textContent = discovery?.stage_title || pinLabel(pin);
    els.stageViewImage.src = discovery?.stage_image || "./media/stages/placeholder-stage.svg";
    els.stageViewImage.alt = discovery?.stage_title || pinLabel(pin);
    els.stageViewCaption.textContent = discovery?.stage_description || TURBO_I18N.t("stageTemp");
    setBadge(els.stageViewBadge, discovery);

    els.stageView.hidden = false;
    els.stageView.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
  }

  function closeStage() {
    els.stageView.hidden = true;
    els.stageView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
  }

  function backFromStage() {
    closeStage();
    if (selection) openDestination(selection.pin, selection.discovery);
  }

  /* ---- Welcome reward demo ---- */

  function openWelcome() {
    if (!selection) return;
    const { pin, discovery } = selection;
    closeDestination();

    const place = discovery || {};
    els.welcomeTitle.textContent =
      place.welcome_title || pinLabel(pin);
    els.welcomeMessage.textContent =
      place.welcome_message || TURBO_I18N.t("stageTemp");
    els.welcomeImage.src = place.stage_image || "./media/stages/placeholder-stage.svg";
    els.welcomeImage.alt = place.stage_title || pinLabel(pin);

    els.rewardBgName.textContent = place.background_reward_id
      ? `${place.stage_title || "Scenic Background"} — Unlocked!`
      : "Scenic background — placeholder (artwork not assigned yet)";

    els.rewardCharName.textContent = place.character_reward_id
      ? `Character ${place.character_reward_id} — Discovered!`
      : "Character reward — placeholder (no approved character assigned)";

    els.welcomeView.hidden = false;
    els.welcomeView.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
  }

  function closeWelcome() {
    els.welcomeView.hidden = true;
    els.welcomeView.setAttribute("aria-hidden", "false");
    els.welcomeView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
  }

  function finishWelcome() {
    closeWelcome();
    selection = null;
  }

  /* ---- Map layers ---- */

  function pinVisible(pin) {
    if (!enabledFilters.has(pin.filter)) return false;
    if (prefectureId && window.TURBO_REGIONS) {
      return TURBO_REGIONS.matchesPrefecture(pin.area, prefectureId);
    }
    return true;
  }

  function renderExplore() {
    geoLayer.clearLayers();
    closeDestination();

    geo.pins.forEach((pin) => {
      if (!pinVisible(pin)) return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: typeIconFor(pin),
        keyboard: true,
        title: pinLabel(pin)
      });
      const discovery = discoveryForMappedId(pin.id);
      marker.on("click", () => openDestination(pin, discovery));
      marker.bindTooltip(pinLabel(pin), {
        direction: "top",
        offset: [0, -18],
        opacity: 0.95
      });
      geoLayer.addLayer(marker);
    });
  }

  function pinsInRegion(id) {
    if (!id || !window.TURBO_REGIONS) return [];
    return geo.pins.filter((pin) => TURBO_REGIONS.inRegion(pin.area, id));
  }

  function snapshotView() {
    const center = map.getCenter();
    return {
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
      regionId: regionId,
      prefectureId: prefectureId,
      filters: Array.from(enabledFilters)
    };
  }

  function syncMapBack() {
    const back = document.getElementById("btn-map-back");
    if (!back) return;
    const empty = viewHistory.length === 0;
    back.disabled = empty;
    back.setAttribute("aria-disabled", empty ? "true" : "false");
  }

  function pushView() {
    if (suppressHistory || !map) return;
    viewHistory.push(snapshotView());
    if (viewHistory.length > VIEW_HISTORY_CAP) {
      viewHistory.splice(0, viewHistory.length - VIEW_HISTORY_CAP);
    }
    syncMapBack();
  }

  function applyFilterKeys(keys) {
    enabledFilters = new Set(keys);
    document.querySelectorAll("#filter-bar input[data-filter]").forEach((input) => {
      input.checked = enabledFilters.has(input.dataset.filter);
    });
  }

  function restoreView(snap) {
    suppressHistory = true;
    regionId = snap.regionId || "";
    prefectureId = snap.prefectureId || "";
    applyFilterKeys(snap.filters || []);
    syncAreaControls();
    renderExplore();
    map.setView([snap.lat, snap.lng], snap.zoom);
    suppressHistory = false;
    syncMapBack();
    updateControlsSummary();
  }

  function onMapBack(event) {
    if (!viewHistory.length) {
      event.preventDefault();
      return;
    }
    restoreView(viewHistory.pop());
  }

  function clusterClickZooms(cluster) {
    if (!cluster || !geoLayer) return true;
    let bottom = cluster;
    while (bottom._childClusters && bottom._childClusters.length === 1) {
      bottom = bottom._childClusters[0];
    }
    if (typeof bottom._zoom !== "number" || typeof bottom._childCount !== "number") {
      return true;
    }
    const maxZoom = geoLayer._maxZoom;
    const spiderfy =
      geoLayer.options.spiderfyOnMaxZoom &&
      bottom._zoom === maxZoom &&
      bottom._childCount === cluster._childCount;
    return !spiderfy;
  }

  // leaflet.markercluster 1.5.3 overrides listens(type, propagate) but Leaflet
  // 1.9 calls listens(type, fn, context, propagate). A function in the second
  // slot makes the "cluster" + type fallback look up the wrong event, so
  // clusterclick never reaches listeners and the default zoom still runs.
  function patchClusterListens() {
    const proto = L.MarkerClusterGroup && L.MarkerClusterGroup.prototype;
    if (!proto || proto.turboListensPatched) return;
    proto.listens = function (type, fn, context, propagate) {
      const featureListens = L.FeatureGroup.prototype.listens;
      if (typeof fn !== "function") {
        return (
          featureListens.call(this, type, fn) ||
          featureListens.call(this, "cluster" + type, fn)
        );
      }
      return (
        featureListens.call(this, type, fn, context, propagate) ||
        featureListens.call(this, "cluster" + type, fn, context, propagate)
      );
    };
    proto.turboListensPatched = true;
  }

  function installClusterHistory(group) {
    let skipNextZoomRecord = false;
    group.on("clusterclick", (event) => {
      if (!clusterClickZooms(event.layer)) return;
      pushView();
      skipNextZoomRecord = true;
      setTimeout(() => {
        skipNextZoomRecord = false;
      }, 0);
    });

    const proto = L.MarkerCluster.prototype;
    if (!proto.turboZoomToBounds) {
      proto.turboZoomToBounds = proto.zoomToBounds;
      proto.zoomToBounds = function (fitBoundsOptions) {
        if (this._group === group) {
          if (skipNextZoomRecord) skipNextZoomRecord = false;
          else pushView();
        }
        return proto.turboZoomToBounds.call(this, fitBoundsOptions);
      };
    }
  }

  function wireMapHistory() {
    const back = document.getElementById("btn-map-back");
    const home = document.getElementById("btn-map-home");
    const en = window.TURBO_I18N && TURBO_I18N.lang() === "en";
    if (back) {
      back.setAttribute("aria-label", TURBO_I18N.t("mapBack"));
      back.addEventListener("click", onMapBack);
    }
    if (home) {
      home.href = en ? "/en/" : "/";
      home.textContent = TURBO_I18N.t("mapHome");
    }
    syncMapBack();
  }

  function fitPins(pins, maxZoom) {
    suppressHistory = true;
    if (!pins.length) {
      map.setView(JAPAN_CENTER, JAPAN_ZOOM);
    } else {
      const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng]));
      if (!bounds.isValid()) map.setView(JAPAN_CENTER, JAPAN_ZOOM);
      else map.fitBounds(bounds.pad(0.25), { maxZoom: maxZoom });
    }
    suppressHistory = false;
  }

  function showJapan() {
    regionId = "";
    prefectureId = "";
    syncAreaControls();
    syncSabahPrototypeNote();
    map.setView(JAPAN_CENTER, JAPAN_ZOOM);
    renderExplore();
  }

  function showRegion(id) {
    if (countryId === "malaysia") {
      regionId = "sabah";
      prefectureId = "";
      syncAreaControls();
      renderExplore();
      fitPins(geo.pins, 15);
      return;
    }
    regionId = id;
    prefectureId = "";
    syncAreaControls();
    renderExplore();
    fitPins(pinsInRegion(id), 8);
  }

  function showPrefecture(id) {
    prefectureId = id;
    if (id && window.TURBO_REGIONS) {
      regionId = TURBO_REGIONS.regionOf(id) || regionId;
    }
    syncAreaControls();
    renderExplore();
    if (!id) {
      fitPins(pinsInRegion(regionId), 8);
      return;
    }
    fitPins(
      geo.pins.filter((pin) => TURBO_REGIONS.matchesPrefecture(pin.area, id)),
      12
    );
  }

  function syncAreaControls() {
    const regionSelect = document.getElementById("area-region");
    const prefSelect = document.getElementById("area-prefecture");
    if (!regionSelect || !prefSelect || !window.TURBO_REGIONS) return;
    regionSelect.value = regionId;
    prefSelect.disabled = countryId === "malaysia" ? false : !regionId;
    prefSelect.innerHTML = "";
    if (countryId === "malaysia") {
      const kk = document.createElement("option");
      kk.value = "";
      kk.textContent = TURBO_I18N.t("areaKotaKinabalu");
      prefSelect.appendChild(kk);
      prefSelect.value = "";
      updateControlsSummary();
      return;
    }
    const all = document.createElement("option");
    all.value = "";
    all.textContent = TURBO_I18N.t("areaAllPrefectures");
    prefSelect.appendChild(all);
    if (regionId) {
      TURBO_REGIONS.prefecturesIn(regionId).forEach((slug) => {
        const option = document.createElement("option");
        option.value = slug;
        option.textContent = TURBO_REGIONS.label(TURBO_REGIONS.PREFECTURES[slug]);
        prefSelect.appendChild(option);
      });
    }
    prefSelect.value = prefectureId;
    updateControlsSummary();
  }

  function controlsNarrow() {
    return CONTROLS_MQ.matches;
  }

  function categorySummary() {
    const active = FILTERS.filter((f) => enabledFilters.has(f.key));
    if (active.length === FILTERS.length) return TURBO_I18N.t("controlsAllCategories");
    if (!active.length) return TURBO_I18N.t("controlsNoCategories");
    return active.map((f) => TURBO_I18N.t(f.labelKey)).join(" · ");
  }

  function updateControlsSummary() {
    const text = document.getElementById("controls-summary-text");
    const button = document.getElementById("controls-summary");
    if (button) button.setAttribute("aria-label", TURBO_I18N.t("controlsSummary"));
    if (text) text.textContent = TURBO_I18N.t("filterPanel");
    if (!button) return;
    const parts = [TURBO_I18N.t(countryId === "malaysia" ? "countryMalaysia" : "areaJapan")];
    if (countryId === "malaysia") parts.push(TURBO_I18N.t("regionSabah"));
    if (regionId && window.TURBO_REGIONS) {
      const region = TURBO_REGIONS.REGIONS.find((item) => item.id === regionId);
      if (region) parts.push(TURBO_REGIONS.label(region));
    }
    if (prefectureId && window.TURBO_REGIONS && TURBO_REGIONS.PREFECTURES[prefectureId]) {
      parts.push(TURBO_REGIONS.label(TURBO_REGIONS.PREFECTURES[prefectureId]));
    }
    parts.push(categorySummary());
    button.setAttribute("aria-label", TURBO_I18N.t("filterPanel") + " — " + parts.join(" · "));
  }

  function setControlsCollapsed(collapsed) {
    const panel = document.getElementById("map-filters");
    const summary = document.getElementById("controls-summary");
    if (panel) panel.hidden = !!collapsed;
    if (summary) summary.setAttribute("aria-expanded", collapsed ? "false" : "true");
    updateControlsSummary();
  }

  function collapseControlsAfterChoice() {
    setControlsCollapsed(true);
  }

  function loadGeo() {
    const raw = countryId === "malaysia"
      ? ((window.SABAH_MAP_DATA && SABAH_MAP_DATA.pins) || [])
      : window.MAP_DATA.pins;
    geo = window.TURBO_GEO.normalizePins(raw);
    if (countryId === "japan" && window.TURBO_LOCATIONS) {
      TURBO_LOCATIONS.airportPins().forEach((pin) => {
        if (geo.byId.has(pin.id)) return;
        geo.pins.push(pin);
        geo.byId.set(pin.id, pin);
      });
    }
  }

  function fillRegionSelect(regionSelect) {
    regionSelect.innerHTML = "";
    if (countryId === "malaysia") {
      const sabah = document.createElement("option");
      sabah.value = "sabah";
      sabah.textContent = TURBO_I18N.t("regionSabah");
      regionSelect.appendChild(sabah);
      regionSelect.value = "sabah";
      return;
    }
    const japan = document.createElement("option");
    japan.value = "";
    japan.textContent = TURBO_I18N.t("areaJapan");
    regionSelect.appendChild(japan);
    TURBO_REGIONS.REGIONS.forEach((region) => {
      const option = document.createElement("option");
      option.value = region.id;
      option.textContent = TURBO_REGIONS.label(region);
      regionSelect.appendChild(option);
    });
  }

  function syncSabahPrototypeNote() {
    const note = document.getElementById("sabah-prototype-note");
    if (note) note.hidden = countryId !== "malaysia";
  }

  function showCountry(next) {
    countryId = next === "malaysia" ? "malaysia" : "japan";
    regionId = countryId === "malaysia" ? "sabah" : "";
    prefectureId = "";
    loadGeo();
    const regionSelect = document.getElementById("area-region");
    if (regionSelect) fillRegionSelect(regionSelect);
    syncAreaControls();
    syncSabahPrototypeNote();
    if (countryId === "malaysia") fitPins(geo.pins, 15);
    else map.setView(JAPAN_CENTER, JAPAN_ZOOM);
    renderExplore();
  }

  function buildAreaSelector() {
    const bar = document.getElementById("area-bar");
    if (!bar || !window.TURBO_REGIONS) return;
    bar.innerHTML = "";

    const countrySelect = document.createElement("select");
    countrySelect.id = "area-country";
    countrySelect.setAttribute("aria-label", TURBO_I18N.t("countryLabel"));
    [
      ["japan", "countryJapan"],
      ["malaysia", "countryMalaysia"]
    ].forEach((pair) => {
      const option = document.createElement("option");
      option.value = pair[0];
      option.textContent = TURBO_I18N.t(pair[1]);
      countrySelect.appendChild(option);
    });
    countrySelect.value = countryId;
    countrySelect.addEventListener("change", () => {
      pushView();
      showCountry(countrySelect.value);
      collapseControlsAfterChoice();
    });

    const regionSelect = document.createElement("select");
    regionSelect.id = "area-region";
    regionSelect.setAttribute("aria-label", TURBO_I18N.t("areaRegion"));
    fillRegionSelect(regionSelect);
    regionSelect.addEventListener("change", () => {
      pushView();
      if (!regionSelect.value) showJapan();
      else showRegion(regionSelect.value);
      collapseControlsAfterChoice();
    });

    const prefSelect = document.createElement("select");
    prefSelect.id = "area-prefecture";
    prefSelect.setAttribute("aria-label", TURBO_I18N.t("areaPrefecture"));
    prefSelect.addEventListener("change", () => {
      pushView();
      showPrefecture(prefSelect.value);
      collapseControlsAfterChoice();
    });

    bar.appendChild(countrySelect);
    bar.appendChild(regionSelect);
    bar.appendChild(prefSelect);
    syncAreaControls();
  }

  function setFiltersOpen(open) {
    const bar = document.getElementById("filter-bar");
    const toggle = document.getElementById("filter-toggle");
    if (bar) bar.hidden = !open;
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setMode() {
    mode = "explore";
    closeStage();
    closeWelcome();
    closeDestination();
    selection = null;
    document.body.classList.remove("overlay-open", "sheet-open");
    showJapan();
  }

  function buildFilters() {
    const bar = document.getElementById("filter-bar");
    if (!bar) return;
    bar.innerHTML = "";
    FILTERS.forEach((f) => {
      const label = document.createElement("label");
      label.className = "filter-chip";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.filter = f.key;
      input.checked = true;
      input.addEventListener("change", () => {
        if (input.checked) enabledFilters.add(f.key);
        else enabledFilters.delete(f.key);
        renderExplore();
        updateControlsSummary();
      });
      label.appendChild(input);
      label.append(` ${TURBO_I18N.t(f.labelKey)}`);
      bar.appendChild(label);
    });
  }

  function init() {
    if (!window.MAP_DATA?.pins || !window.TURBO_GEO || !window.TURBO_DISCOVERY) {
      console.error("Prototype dependencies missing");
      return;
    }

    cacheEls();
    loadGeo();

    map = L.map("map", { zoomControl: false, attributionControl: true }).setView(
      JAPAN_CENTER,
      JAPAN_ZOOM
    );
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    patchClusterListens();
    geoLayer = L.markerClusterGroup({
      disableClusteringAtZoom: 12,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      showCoverageOnHover: false,
      maxClusterRadius: 56
    });
    installClusterHistory(geoLayer);
    geoLayer.addTo(map);

    buildAreaSelector();
    wireMapHistory();
    buildFilters();
    setFiltersOpen(true);
    setControlsCollapsed(true);
    const summary = document.getElementById("controls-summary");
    if (summary) {
      summary.addEventListener("click", () => {
        const panel = document.getElementById("map-filters");
        setControlsCollapsed(!(panel && panel.hidden));
      });
    }

    els.sheetClose.addEventListener("click", closeDestination);
    els.sheetBackdrop.addEventListener("click", closeDestination);
    els.btnViewStage.addEventListener("click", openStage);
    els.btnPreviewWelcome.addEventListener("click", openWelcome);
    els.stageBack.addEventListener("click", backFromStage);
    els.welcomeBack.addEventListener("click", finishWelcome);
    els.welcomeReturn.addEventListener("click", finishWelcome);

    // Grand opening shows first; welcome.js calls setMode after curtains part.
    if (!document.body.classList.contains("is-welcome")) {
      setMode("explore");
    }

    window.TURBO_DISCOVERY_MAP = {
      getMode: () => mode,
      geo,
      setMode,
      map,
      selectedPin: () => (selection ? selection.pin : null)
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

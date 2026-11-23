/**
 * Turbo Adventures Discovery Map — prototype controller.
 * Flow: discover → destination card → stage preview / welcome demo / directions.
 */
(function () {
  "use strict";

  const JAPAN_CENTER = [36.5, 138.0];
  const JAPAN_ZOOM = 5;
  const LOCAL_ZOOM = 11;

  const FILTERS = [
    { key: "railway", labelKey: "filterRailway" },
    { key: "airport", labelKey: "filterAirport" },
    { key: "cultural", labelKey: "filterCultural" },
    { key: "scenic", labelKey: "filterScenic" },
    { key: "turbo", labelKey: "filterTurbo" }
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
    merchant: iconFromCategory("merchant")
  };

  const turboIcon = L.divIcon({
    className: "turbo-disc-marker",
    html: '<span class="turbo-disc-dot" aria-hidden="true"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  let map;
  let geoLayer;
  let turboLayer;
  let geo;
  let mode = "turbo";
  let enabledFilters = new Set(FILTERS.map((f) => f.key));
  let selection = null; // { pin, discovery }
  const els = {};

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

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    } else if (castle) {
      els.sheetDesc.textContent = window.TURBO_I18N ? TURBO_I18N.t("filterCultural") : "";
    } else {
      els.sheetDesc.textContent =
        (discovery && discovery.stage_description) ||
        (window.TURBO_I18N ? TURBO_I18N.t("airportSheet") : "");
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

  function explorePopupHtml(pin, discovery) {
    const bits = [
      `<div class="popup-title">${escapeHtml(pin.name)}</div>`
    ];
    if (pin.nameEn) bits.push(`<div class="popup-en">${escapeHtml(pin.nameEn)}</div>`);
    bits.push(
      `<div class="popup-meta">${escapeHtml(pin.filter)} · ${escapeHtml(pin.area || "—")}</div>`
    );
    if (discovery?.active) {
      bits.push(`<div class="popup-turbo">Turbo Adventure available</div>`);
    }
    return bits.join("");
  }

  function renderExplore() {
    geoLayer.clearLayers();
    turboLayer.clearLayers();
    closeDestination();

    geo.pins.forEach((pin) => {
      const turboSpot = !!discoveryForMappedId(pin.id)?.active;
      const shown = enabledFilters.has(pin.filter) || (turboSpot && enabledFilters.has("turbo"));
      if (!shown) return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: typeIconFor(pin),
        keyboard: true,
        title: pinLabel(pin)
      });

      const discovery = discoveryForMappedId(pin.id);
      if (discovery?.active || pin.type === "airport" || pin.type === "station" || pin.type === "castle" || pin.type === "castle_ruins") {
        marker.on("click", () => openDestination(pin, discovery));
      } else {
        marker.bindPopup(explorePopupHtml(pin, discovery), {
          maxWidth: 260,
          className: "turbo-popup"
        });
      }

      marker.bindTooltip(pinLabel(pin), {
        direction: "top",
        offset: [0, -18],
        opacity: 0.95
      });
      geoLayer.addLayer(marker);
    });

  }

  function renderTurbo() {
    geoLayer.clearLayers();
    turboLayer.clearLayers();

    const active = window.TURBO_DISCOVERY.activeDiscoveries();
    const focus = [];

    active.forEach((disc) => {
      const pin = geo.byId.get(disc.mapped_location_id);
      if (!pin) {
        console.warn("mapped_location_id not found:", disc.mapped_location_id);
        return;
      }
      focus.push([pin.lat, pin.lng]);

      // Stations and airports already get their category pin below.
      // The green disc is only the discovery marker, not a collected badge.
      if (pin.type === "station" || pin.type === "airport") return;

      const marker = L.marker([pin.lat, pin.lng], {
        icon: turboIcon,
        keyboard: true,
        title: pinLabel(pin)
      });
      marker.on("click", () => openDestination(pin, disc));
      marker.bindTooltip(pinLabel(pin), {
        direction: "top",
        offset: [0, -14],
        opacity: 0.95
      });
      turboLayer.addLayer(marker);
    });

    geo.pins.forEach((pin) => {
      if (pin.type !== "station") return;
      const marker = L.marker([pin.lat, pin.lng], {
        icon: typeIconFor(pin),
        keyboard: true,
        title: pinLabel(pin)
      });
      marker.on("click", () => openDestination(pin, discoveryForMappedId(pin.id)));
      marker.bindTooltip(pinLabel(pin), { direction: "top", offset: [0, -18], opacity: 0.95 });
      geoLayer.addLayer(marker);
    });

    geo.pins.forEach((pin) => {
      if (pin.type !== "airport") return;
      const marker = L.marker([pin.lat, pin.lng], {
        icon: typeIconFor(pin),
        keyboard: true,
        title: pinLabel(pin)
      });
      marker.on("click", () => openDestination(pin, null));
      marker.bindTooltip(pinLabel(pin), { direction: "top", offset: [0, -14], opacity: 0.95 });
      turboLayer.addLayer(marker);
      focus.push([pin.lat, pin.lng]);
    });

    if (focus.length) {
      const bounds = L.latLngBounds(focus);
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.35), { maxZoom: LOCAL_ZOOM });
    }
  }

  function setMode(next) {
    mode = next;
    closeStage();
    closeWelcome();
    closeDestination();
    selection = null;
    document.body.classList.remove("overlay-open", "sheet-open");

    document.querySelectorAll("[data-mode]").forEach((btn) => {
      const on = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    const filterBar = document.getElementById("filter-bar");
    if (filterBar) filterBar.hidden = mode !== "explore";

    if (mode === "explore") {
      map.setView(JAPAN_CENTER, JAPAN_ZOOM);
      renderExplore();
    } else {
      renderTurbo();
    }
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
      input.checked = true;
      input.addEventListener("change", () => {
        if (input.checked) enabledFilters.add(f.key);
        else enabledFilters.delete(f.key);
        if (mode === "explore") renderExplore();
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
    geo = window.TURBO_GEO.normalizePins(window.MAP_DATA.pins);
    if (window.TURBO_LOCATIONS) {
      TURBO_LOCATIONS.airportPins().forEach((pin) => {
        geo.pins.push(pin);
        if (!geo.byId.has(pin.id)) geo.byId.set(pin.id, pin);
      });
    }

    map = L.map("map", { zoomControl: false, attributionControl: true }).setView(
      JAPAN_CENTER,
      JAPAN_ZOOM
    );
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    geoLayer = L.layerGroup().addTo(map);
    turboLayer = L.featureGroup().addTo(map);

    buildFilters();

    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.getAttribute("data-mode")));
    });

    els.sheetClose.addEventListener("click", closeDestination);
    els.sheetBackdrop.addEventListener("click", closeDestination);
    els.btnViewStage.addEventListener("click", openStage);
    els.btnPreviewWelcome.addEventListener("click", openWelcome);
    els.stageBack.addEventListener("click", backFromStage);
    els.welcomeBack.addEventListener("click", finishWelcome);
    els.welcomeReturn.addEventListener("click", finishWelcome);

    // Grand opening shows first; welcome.js calls setMode after curtains part.
    if (!document.body.classList.contains("is-welcome")) {
      setMode("turbo");
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

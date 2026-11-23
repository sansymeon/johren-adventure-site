/**
 * GPS check-in. Validates a reading against TURBO_LOCATIONS, then asks
 * TURBO_COLLECTION to keep a lifetime record. Does not scan QR codes.
 *
 * showDiagnostics: set false before a public release.
 */
(function (global) {
  "use strict";

  var GPS_UI = {
    showDiagnostics: true,
    timeoutMs: 15000
  };

  var button = null;
  var statusEl = null;
  var diagEl = null;
  var pending = false;

  function t(key, vars) {
    return global.TURBO_I18N.t(key, vars);
  }

  function metres(n) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    if (n >= 1000) return (n / 1000).toFixed(1) + " km";
    return String(Math.round(n));
  }

  function distanceMeters(lat1, lng1, lat2, lng2) {
    var earth = 6371000;
    var p1 = (lat1 * Math.PI) / 180;
    var p2 = (lat2 * Math.PI) / 180;
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLng = ((lng2 - lng1) * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * earth * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function targetFor(pin) {
    if (!pin) return null;
    var spec = global.TURBO_LOCATIONS.findPoint(pin.id);
    if (!spec) return null;
    return {
      spec: spec,
      lat: typeof spec.lat === "number" ? spec.lat : pin.lat,
      lng: typeof spec.lng === "number" ? spec.lng : pin.lng
    };
  }

  function ensureControls() {
    var actions = document.querySelector("#destination-sheet .sheet-actions");
    if (!actions) return;
    button = document.getElementById("btn-gps-checkin");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-primary";
      button.id = "btn-gps-checkin";
      button.hidden = true;
      actions.appendChild(button);
    }
    button.textContent = t("gpsButton");
    statusEl = document.getElementById("gps-checkin-status");
    if (!statusEl) {
      statusEl = document.createElement("p");
      statusEl.id = "gps-checkin-status";
      statusEl.className = "gps-checkin-status";
      statusEl.hidden = true;
      statusEl.setAttribute("role", "status");
      actions.appendChild(statusEl);
    }
    diagEl = document.getElementById("gps-checkin-diag");
    if (!diagEl) {
      diagEl = document.createElement("pre");
      diagEl.id = "gps-checkin-diag";
      diagEl.className = "gps-checkin-diag";
      diagEl.hidden = true;
      actions.appendChild(diagEl);
    }
  }

  function setStatus(text, kind) {
    if (!statusEl) return;
    statusEl.hidden = !text;
    statusEl.textContent = text || "";
    statusEl.className = "gps-checkin-status" + (kind ? " is-" + kind : "");
  }

  function hideDiag() {
    if (!diagEl) return;
    diagEl.hidden = true;
    diagEl.textContent = "";
  }

  function showDiag(name, distanceM, accuracyM, radius, resultKey, collected) {
    if (!diagEl || !GPS_UI.showDiagnostics) {
      hideDiag();
      return;
    }
    diagEl.hidden = false;
    diagEl.textContent =
      t("diagStation") + ": " + (name || "—") + "\n" +
      t("diagDistance") + ": " + metres(distanceM) + " m\n" +
      t("diagAccuracy") + ": " + metres(accuracyM) + " m\n" +
      t("diagRadius") + ": " + radius + " m\n" +
      t("diagResult") + ": " + t(resultKey) + "\n" +
      t("diagCollected") + ": " + t(collected ? "diagYes" : "diagNo");
  }

  function displayName(target, pin) {
    if (global.TURBO_I18N.lang() === "en") {
      return target.spec.placeNameEn || target.spec.nameEn || pin.nameEn || pin.name;
    }
    return target.spec.placeName || pin.name;
  }

  function syncSheet(pin) {
    ensureControls();
    if (!button) return;
    var target = targetFor(pin);
    button.hidden = !target;
    button.disabled = false;
    if (!target) {
      setStatus("", "");
      hideDiag();
      return;
    }
    hideDiag();
    if (global.TURBO_COLLECTION.owns(target.spec.category, target.spec.placeId)) {
      setStatus(t(target.spec.category === "airport" ? "airportOwned" : "stationOwned"), "done");
    } else {
      setStatus("", "");
    }
  }

  function onPosition(pin, target, position) {
    pending = false;
    button.disabled = false;
    var accuracy = position.coords.accuracy;
    var distance = distanceMeters(
      position.coords.latitude,
      position.coords.longitude,
      target.lat,
      target.lng
    );
    var radius = target.spec.radiusMeters;
    var name = displayName(target, pin);
    var owned = global.TURBO_COLLECTION.owns(target.spec.category, target.spec.placeId);
    if (typeof accuracy !== "number" || accuracy > target.spec.maxAccuracyMeters) {
      showDiag(name, distance, accuracy, radius, "resultUncertain", owned);
      setStatus(t("gpsUncertain", { n: metres(accuracy) }), "warn");
      return;
    }
    if (distance > radius) {
      showDiag(name, distance, accuracy, radius, "resultFar", owned);
      setStatus(t("gpsFar", { n: metres(distance) }), "warn");
      return;
    }
    if (owned) {
      showDiag(name, distance, accuracy, radius, "resultOwned", true);
      setStatus(t(target.spec.category === "airport" ? "airportOwned" : "stationOwned"), "done");
      return;
    }
    global.TURBO_COLLECTION.record(target.spec.category, target.spec.placeId, {
      pointId: target.spec.pointId,
      distanceM: Math.round(distance),
      accuracyM: Math.round(accuracy)
    });
    showDiag(name, distance, accuracy, radius, "resultOk", true);
    if (target.spec.category === "airport") {
      setStatus(t("airportSuccess", {
        name: name,
        count: global.TURBO_COLLECTION.list("airport").length
      }), "ok");
    } else {
      var puzzle = global.TURBO_RAILWAY_PUZZLE.progress();
      setStatus(puzzle.finished
        ? t("puzzleFinished", { name: name })
        : t("stationSuccess", {
          name: name,
          pieces: puzzle.pieces,
          need: puzzle.needed,
          level: puzzle.level
        }), "ok");
    }
    if (global.TURBO_COLLECTION_SCREEN) global.TURBO_COLLECTION_SCREEN.paint();
  }

  function onError(error) {
    pending = false;
    if (button) button.disabled = false;
    if (error && error.code === 1) {
      setStatus(t("gpsDenied"), "warn");
      return;
    }
    if (error && error.code === 3) {
      setStatus(t("gpsTimeout"), "warn");
      return;
    }
    setStatus(t("gpsFail"), "warn");
  }

  function request(pin) {
    var target = targetFor(pin);
    if (!target || pending) return;
    if (!global.navigator.geolocation) {
      setStatus(t("gpsUnsupported"), "warn");
      return;
    }
    if (!global.isSecureContext) {
      setStatus(t("gpsInsecure"), "warn");
      return;
    }
    pending = true;
    button.disabled = true;
    setStatus(t("gpsWorking"), "");
    navigator.geolocation.getCurrentPosition(
      function (position) { onPosition(pin, target, position); },
      onError,
      { enableHighAccuracy: true, timeout: GPS_UI.timeoutMs, maximumAge: 0 }
    );
  }

  function init() {
    ensureControls();
    if (!button || button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", function () {
      var pin = global.TURBO_DISCOVERY_MAP && global.TURBO_DISCOVERY_MAP.selectedPin
        ? global.TURBO_DISCOVERY_MAP.selectedPin()
        : null;
      request(pin);
    });
  }

  global.TURBO_GPS_CHECKIN = {
    config: GPS_UI,
    syncSheet: syncSheet
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

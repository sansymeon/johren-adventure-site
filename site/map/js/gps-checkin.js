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
    timeoutMs: 18000
  };

  var button = null;
  var retryBtn = null;
  var statusEl = null;
  var diagEl = null;
  var pending = false;
  var watchId = null;
  var timerId = null;
  var session = 0;
  var best = null;

  function t(key, vars) {
    return global.TURBO_I18N.t(key, vars);
  }

  function formatSpan(n) {
    if (typeof n !== "number" || !isFinite(n)) return "—";
    if (n >= 1000) return (Math.round((n / 1000) * 10) / 10).toFixed(1) + " km";
    return Math.round(n) + " m";
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
    retryBtn = document.getElementById("btn-gps-retry");
    if (!retryBtn) {
      retryBtn = document.createElement("button");
      retryBtn.type = "button";
      retryBtn.className = "btn btn-primary";
      retryBtn.id = "btn-gps-retry";
      retryBtn.hidden = true;
      actions.appendChild(retryBtn);
    }
    retryBtn.textContent = t("gpsRetry");
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
      t("diagDistance") + ": " + formatSpan(distanceM) + "\n" +
      t("diagAccuracy") + ": " + formatSpan(accuracyM) + "\n" +
      t("diagRadius") + ": " + formatSpan(radius) + "\n" +
      t("diagResult") + ": " + t(resultKey) + "\n" +
      t("diagCollected") + ": " + t(collected ? "diagYes" : "diagNo");
  }

  function showRetry(on) {
    if (!retryBtn) return;
    retryBtn.hidden = !on;
    if (on) retryBtn.disabled = false;
  }

  function stopListening() {
    if (watchId != null && global.navigator.geolocation && global.navigator.geolocation.clearWatch) {
      global.navigator.geolocation.clearWatch(watchId);
    }
    watchId = null;
    if (timerId != null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function readingAccuracy(position) {
    if (!position || !position.coords) return null;
    var accuracy = position.coords.accuracy;
    if (typeof accuracy !== "number" || !isFinite(accuracy)) return null;
    return accuracy;
  }

  function noteProgress() {
    var line = t("gpsMeasuring");
    if (best && best.accuracy != null) {
      line += "\n" + t("gpsBest", { n: formatSpan(best.accuracy) });
    } else {
      line += "\n" + t("gpsBestWait");
    }
    setStatus(line, "progress");
  }

  function categoryConfig(category) {
    return global.TURBO_DISCOVERY_CATEGORIES && TURBO_DISCOVERY_CATEGORIES.byId(category);
  }

  function ownedKey(category) {
    var cat = categoryConfig(category);
    return (cat && cat.ownedKey) || "stationOwned";
  }

  function isPublicPuzzle(category) {
    var cat = categoryConfig(category);
    if (cat) return !!(cat.publicDiscovery && cat.puzzle);
    return category === "railway" || category === "airport" || category === "cultural" || category === "scenic";
  }

  function displayName(target, pin) {
    if (global.TURBO_I18N.lang() === "en") {
      return target.spec.placeNameEn || target.spec.nameEn || pin.nameEn || pin.name;
    }
    return target.spec.placeName || pin.name;
  }

  function puzzleApi() {
    return global.TURBO_CATEGORY_PUZZLE || global.TURBO_RAILWAY_PUZZLE;
  }

  function successStatus(target, name) {
    var category = target.spec.category;
    var cat = categoryConfig(category);
    if (!isPublicPuzzle(category)) {
      return t((cat && cat.successKey) || "merchantSuccess", {
        name: name,
        count: global.TURBO_COLLECTION.list(category).length
      });
    }
    var puzzle = puzzleApi().progressFor(category);
    if (puzzle.finished) return t("puzzleFinished", { name: name });
    return t((cat && cat.successKey) || "stationSuccess", {
      name: name,
      pieces: puzzle.pieces,
      need: puzzle.needed,
      level: puzzle.level,
      count: puzzle.collected
    });
  }

  function syncSheet(pin) {
    ensureControls();
    if (!button) return;
    var target = targetFor(pin);
    button.hidden = !target;
    button.disabled = false;
    showRetry(false);
    if (!target) {
      setStatus("", "");
      hideDiag();
      return;
    }
    hideDiag();
    var owned = global.TURBO_COLLECTION.owns(target.spec.category, target.spec.placeId);
    if (owned && !target.spec.repeatable) {
      setStatus(t(ownedKey(target.spec.category)), "done");
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
    var repeatable = !!target.spec.repeatable;
    if (typeof accuracy !== "number" || accuracy > target.spec.maxAccuracyMeters) {
      showDiag(name, distance, accuracy, radius, "resultUncertain", owned);
      showRetry(true);
      setStatus(t("gpsUncertain", { n: formatSpan(accuracy) }), "warn");
      return;
    }
    showRetry(false);
    if (distance > radius) {
      showDiag(name, distance, accuracy, radius, "resultFar", owned);
      setStatus(t("gpsFar", { n: formatSpan(distance) }), "warn");
      return;
    }
    if (owned && !repeatable) {
      showDiag(name, distance, accuracy, radius, "resultOwned", true);
      setStatus(t(ownedKey(target.spec.category)), "done");
      return;
    }
    var category = target.spec.category;
    var beforeCount = global.TURBO_COLLECTION.list(category).length;
    global.TURBO_COLLECTION.record(category, target.spec.placeId, {
      pointId: target.spec.pointId,
      distanceM: Math.round(distance),
      accuracyM: Math.round(accuracy),
      repeatable: repeatable
    });
    showDiag(name, distance, accuracy, radius, "resultOk", true);
    setStatus(successStatus(target, name), "ok");
    if (category === "railway" && global.TURBO_RAILWAY_MOSAIC && puzzleApi()) {
      var started = puzzleApi().progressFor("railway");
      if (!started.finished && started.pieces >= 1) {
        global.TURBO_RAILWAY_MOSAIC.assign(started.level);
      }
    }
    if (isPublicPuzzle(category) && global.TURBO_COLLECTION_SCREEN && global.TURBO_COLLECTION_SCREEN.noteCompletion) {
      global.TURBO_COLLECTION_SCREEN.noteCompletion(
        beforeCount,
        global.TURBO_COLLECTION.list(category).length,
        category
      );
    }
    if (global.TURBO_COLLECTION_SCREEN) global.TURBO_COLLECTION_SCREEN.paint();
  }

  function onError(error) {
    pending = false;
    if (button) button.disabled = false;
    showRetry(true);
    if (global.navigator && global.navigator.onLine === false) {
      setStatus(t("gpsOffline"), "warn");
      return;
    }
    if (error && error.code === 1) {
      setStatus(t("gpsDenied"), "warn");
      return;
    }
    if (error && error.code === 2 || error && error.code === 3) {
      setStatus(t("gpsFail"), "warn");
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
    session += 1;
    var token = session;
    var settled = false;
    var started = Date.now();
    best = null;
    pending = true;
    button.disabled = true;
    showRetry(false);
    hideDiag();
    noteProgress();

    function finish() {
      if (settled || token !== session) return;
      settled = true;
      stopListening();
      if (!best) {
        onError({ code: 3 });
        return;
      }
      onPosition(pin, target, best.position);
    }

    function ingest(position) {
      if (settled || token !== session) return;
      var accuracy = readingAccuracy(position);
      if (!best || (accuracy != null && (best.accuracy == null || accuracy < best.accuracy))) {
        best = { position: position, accuracy: accuracy };
      }
      noteProgress();
      if (accuracy != null && accuracy <= target.spec.maxAccuracyMeters) {
        settled = true;
        stopListening();
        onPosition(pin, target, position);
      }
    }

    function onWatchError(error) {
      if (settled || token !== session) return;
      if (error && error.code === 1) {
        settled = true;
        stopListening();
        onError(error);
      }
    }

    var geo = global.navigator.geolocation;
    var options = { enableHighAccuracy: true, timeout: GPS_UI.timeoutMs, maximumAge: 0 };
    if (typeof geo.watchPosition === "function") {
      watchId = geo.watchPosition(ingest, onWatchError, options);
    } else {
      (function poll() {
        if (settled || token !== session) return;
        var remain = GPS_UI.timeoutMs - (Date.now() - started);
        if (remain <= 200) return;
        geo.getCurrentPosition(function (position) {
          ingest(position);
          if (!settled && token === session) poll();
        }, function (error) {
          onWatchError(error);
          if (!settled && token === session) setTimeout(poll, 400);
        }, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: Math.min(5000, remain)
        });
      })();
    }
    timerId = setTimeout(finish, GPS_UI.timeoutMs);
  }

  function init() {
    ensureControls();
    if (!button || button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    function onCheckinClick() {
      var pin = global.TURBO_DISCOVERY_MAP && global.TURBO_DISCOVERY_MAP.selectedPin
        ? global.TURBO_DISCOVERY_MAP.selectedPin()
        : null;
      request(pin);
    }
    button.addEventListener("click", onCheckinClick);
    if (retryBtn && retryBtn.dataset.bound !== "1") {
      retryBtn.dataset.bound = "1";
      retryBtn.addEventListener("click", onCheckinClick);
    }
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

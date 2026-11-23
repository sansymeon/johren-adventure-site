/**
 * Grand Opening — welcome theatre → calm map handoff (prototype only).
 * No audio. Respects prefers-reduced-motion via CSS.
 */
(function () {
  "use strict";

  const opening = document.getElementById("grand-opening");
  const mapApp = document.getElementById("map-app");
  const btnFind = document.getElementById("btn-find-turbo");
  const btnExplore = document.getElementById("btn-explore-japan");
  const btnTheatre = document.getElementById("btn-theatre");

  function showWelcome() {
    document.body.classList.add("is-welcome");
    document.body.classList.remove("is-entering");
    if (opening) {
      opening.hidden = false;
      opening.setAttribute("aria-hidden", "false");
    }
    if (mapApp) mapApp.setAttribute("aria-hidden", "true");
  }

  function enterMap(mode) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("is-entering");

    const finish = () => {
      document.body.classList.remove("is-welcome", "is-entering");
      if (opening) {
        opening.hidden = true;
        opening.setAttribute("aria-hidden", "true");
      }
      if (mapApp) mapApp.setAttribute("aria-hidden", "false");

      const api = window.TURBO_DISCOVERY_MAP;
      if (api?.map) {
        // Leaflet needs a size refresh after becoming visible
        setTimeout(() => {
          api.map.invalidateSize();
          api.setMode("explore");
        }, 40);
      } else if (api?.setMode) {
        api.setMode("explore");
      }
    };

    if (reduce) finish();
    else setTimeout(finish, 720);
  }

  function route() {
    const params = new URLSearchParams(location.search);
    const mapParam = params.get("map");
    const showMap = location.hash === "#collection" || mapParam === "1" || mapParam === "turbo" || mapParam === "explore";
    if (showMap) enterMap("explore");
    else showWelcome();
    document.dispatchEvent(new CustomEvent("turbo-route"));
  }

  function remember(mode) {
    const url = mode ? "?map=" + mode : location.pathname;
    history.pushState({ turbo: mode || "welcome" }, "", url);
    route();
  }

  function bind() {
    if (btnFind) btnFind.addEventListener("click", () => remember("turbo"));
    if (btnExplore) btnExplore.addEventListener("click", () => remember("explore"));
    if (btnTheatre) btnTheatre.addEventListener("click", () => remember(""));
    window.addEventListener("popstate", route);
    route();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  window.TURBO_GRAND_OPENING = { showWelcome, enterMap };
})();

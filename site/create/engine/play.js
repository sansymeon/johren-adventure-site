(function () {
  /* Mobile Creative Game starter prototype.
     Scene editing reuses TASEditor.mountPlay. Discovery/welcome stays in this page
     only and does not change the editor engine. */

  var onLocalAdmin = location.hostname === "127.0.0.1" && location.port === "8770";
  if (onLocalAdmin && location.search.indexOf("creatorTest=1") !== -1) {
    window.TURBO_CREATOR_TEST = true;
    window.TURBO_CREATOR_ASSET_BASE = "/masters/";
  }
  const creatorTest = !!window.TURBO_CREATOR_TEST;
  const DRAFT_KEY = creatorTest ? "tas.creatorTestScene.v1" : "tas.playScene.v1";
  const WELCOME_KEY = "tas.playWelcome.v1";
  const STARTER_BACKGROUND = "bg_performance_stage_wide";
  const STARTER_ARTWORK = ["turbo_selfie", "bubbles"];

  const choose = document.getElementById("play-choose");
  const arrange = document.getElementById("play-arrange");
  const welcome = document.getElementById("play-welcome");
  const grid = document.getElementById("play-grid");
  const arrangeButton = document.getElementById("play-arrange-btn");
  const backgroundNote = document.getElementById("play-bg-note");
  const tools = document.getElementById("play-tools");
  const selectedName = document.getElementById("play-selected-name");
  const status = document.getElementById("play-status");
  const preview = document.getElementById("play-preview");
  const previewImg = document.getElementById("play-preview-img");
  const previewName = document.getElementById("play-preview-name");
  const previewAdd = document.getElementById("play-preview-add");

  const state = {
    selectedLayerId: null,
    scene: {
      id: null,
      name: "My First Picture",
      format: "landscape",
      background: null,
      layers: []
    }
  };

  let toastTimer = 0;
  let lastPlaceId = "";
  let lastPlaceAt = 0;
  const undoStack = [];

  function notify(message) {
    status.hidden = false;
    status.textContent = message;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { status.hidden = true; }, 3200);
  }

  function remember() {
    undoStack.push(JSON.stringify({
      format: state.scene.format,
      layers: state.scene.layers,
      background: state.scene.background,
      selectedLayerId: state.selectedLayerId
    }));
    if (undoStack.length > 40) undoStack.shift();
  }

  function persist() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        scene: state.scene,
        selectedLayerId: state.selectedLayerId
      }));
    } catch (error) { /* Scene still works if storage is refused. */ }
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY) || sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.scene) return false;
      state.scene.name = String(data.scene.name || "My First Picture").slice(0, 80);
      state.scene.format = data.scene.format === "portrait" ? "portrait" : "landscape";
      state.scene.layers = [];
      state.scene.background = null;
      const background = data.scene.background;
      const backgroundAllowed = !!(background && (creatorTest || background.assetId === STARTER_BACKGROUND));
      if (background && background.source === "catalogue" && backgroundAllowed && TAS.findBackground(background.assetId)) {
        state.scene.background = {
          source: "catalogue",
          assetId: background.assetId,
          focusX: TAS.clamp(background.focusX == null ? 50 : background.focusX, 0, 100),
          focusY: TAS.clamp(background.focusY == null ? 50 : background.focusY, 0, 100),
          scale: TAS.clamp(background.scale == null ? 1 : background.scale, 1, 3)
        };
      }
      (data.scene.layers || []).forEach(function (layer) {
        const artworkId = TAS.resolveArtworkId ? TAS.resolveArtworkId(layer.artworkId) : layer.artworkId;
        if (!creatorTest && STARTER_ARTWORK.indexOf(artworkId) === -1) return;
        const found = TAS.findArtwork(artworkId);
        if (!found || found.artwork.placeable === false) return;
        state.scene.layers.push({
          id: layer.id || TAS.uid(),
          artworkId: found.artwork.id,
          x: TAS.clamp(layer.x, -20, 120),
          y: TAS.clamp(layer.y, -20, 120),
          heightPct: TAS.clamp(layer.heightPct, 8, 140),
          flip: !!layer.flip,
          rotation: TAS.clamp(layer.rotation || 0, -18, 18),
          shadow: layer.shadow !== false
        });
      });
      if (data.selectedLayerId && state.scene.layers.some(function (layer) { return layer.id === data.selectedLayerId; })) {
        state.selectedLayerId = data.selectedLayerId;
      }
      return !!(state.scene.background || state.scene.layers.length);
    } catch (error) {
      return false;
    }
  }

  function layerById(id) {
    return state.scene.layers.find(function (layer) { return layer.id === id; }) || null;
  }

  function selectedLayer() {
    return layerById(state.selectedLayerId);
  }

  function copiesOf(artworkId) {
    return state.scene.layers.filter(function (layer) { return layer.artworkId === artworkId; }).length;
  }

  function placeableLayer(artworkId, x, y, heightPct) {
    const found = TAS.findArtwork(artworkId);
    if (!found) return null;
    return {
      id: TAS.uid(),
      artworkId: found.artwork.id,
      x: x,
      y: y,
      heightPct: heightPct,
      flip: false,
      rotation: 0,
      shadow: true
    };
  }

  function seedStarterComposition() {
    state.scene.format = "landscape";
    state.scene.name = "My First Picture";
    state.scene.background = {
      source: "catalogue",
      assetId: STARTER_BACKGROUND,
      focusX: 50,
      focusY: 46,
      scale: 1
    };
    const turbo = placeableLayer("turbo_selfie", 34, 70, 52);
    const bubbles = placeableLayer("bubbles", 70, 72, 56);
    state.scene.layers = [turbo, bubbles].filter(Boolean);
    state.selectedLayerId = bubbles ? bubbles.id : (turbo ? turbo.id : null);
    persist();
  }

  /* ----- Discovery welcome (not part of the scene editor) ----- */

  function welcomeSeen() {
    try {
      if (localStorage.getItem(WELCOME_KEY) === "1") return true;
    } catch (error) { /* treat as unseen */ }
    return false;
  }

  function markWelcomeSeen() {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch (error) { /* ignore */ }
  }

  function forceWelcomeReplay() {
    try {
      const params = new URLSearchParams(location.search);
      return params.get("welcome") === "1";
    } catch (error) {
      return false;
    }
  }

  function showWelcome() {
    choose.hidden = true;
    arrange.hidden = true;
    welcome.hidden = false;
    const found = TAS.findArtwork("bubbles");
    const img = document.getElementById("play-welcome-img");
    if (img && found) {
      img.src = TAS.thumbUrl ? TAS.thumbUrl(found.artwork.file) : TAS.fileUrl(found.artwork.file);
      img.alt = "Bubbles";
    }
  }

  function startFromWelcome() {
    markWelcomeSeen();
    welcome.hidden = true;
    seedStarterComposition();
    showArrange();
    notify("Drag Turbo and Bubbles to arrange your picture.");
  }

  /* ----- Choose / Arrange (scene editor UI) ----- */

  function paintFooter() {
    arrangeButton.textContent = "Arrange My Scene (" + state.scene.layers.length + ")";
    const background = state.scene.background && TAS.findBackground(state.scene.background.assetId);
    backgroundNote.textContent = background ? "Stage" : "Choose Stage";
    paintBgTools();
  }

  function paintBgTools() {
    const panel = document.getElementById("play-bg-tools");
    if (!panel) return;
    panel.hidden = !state.scene.background || !choose.hidden || !welcome.hidden;
  }

  function paintSelection() {
    const layer = selectedLayer();
    tools.hidden = !layer;
    paintBgTools();
    if (!layer) return;
    const found = TAS.findArtwork(layer.artworkId);
    selectedName.textContent = found ? found.character.name : "Character";
    const index = state.scene.layers.findIndex(function (item) { return item.id === layer.id; });
    const back = arrange.querySelector("[data-action='send-backward']");
    const forward = arrange.querySelector("[data-action='bring-forward']");
    if (back) back.disabled = index <= 0;
    if (forward) forward.disabled = index < 0 || index >= state.scene.layers.length - 1;
  }

  function ownedIds() {
    try {
      var data = JSON.parse(localStorage.getItem("turbo.playerInventory.v1") || "");
      return data && data.ids ? data.ids : [];
    } catch (error) {
      return [];
    }
  }

  function playerCards() {
    var owned = ownedIds();
    return testCards().filter(function (card) { return owned.indexOf(card.id) !== -1; });
  }

  function testCards() {
    const cards = [];
    (TAS.backgrounds || []).forEach(function (background) {
      cards.push({
        kind: "background",
        id: background.id,
        file: background.file,
        name: background.name,
        pose: "Background",
        current: !!(state.scene.background && state.scene.background.assetId === background.id)
      });
    });
    (TAS.characters || []).forEach(function (character) {
      (character.artworks || []).forEach(function (artwork) {
        if (artwork.placeable === false) return;
        cards.push({
          kind: "character",
          id: artwork.id,
          file: artwork.file,
          name: character.name,
          pose: artwork.label === character.name ? "" : artwork.label,
          current: false,
          added: copiesOf(artwork.id) > 0,
          count: copiesOf(artwork.id)
        });
      });
    });
    return cards;
  }

  function starterCards() {
    const cards = [];
    const background = TAS.findBackground(STARTER_BACKGROUND);
    if (background) {
      cards.push({
        kind: "background",
        id: background.id,
        file: background.file,
        name: "Stage",
        pose: "Background",
        current: !!(state.scene.background && state.scene.background.assetId === background.id)
      });
    }
    STARTER_ARTWORK.forEach(function (artworkId) {
      const found = TAS.findArtwork(artworkId);
      if (!found) return;
      cards.push({
        kind: "character",
        id: found.artwork.id,
        file: found.artwork.file,
        name: found.character.name,
        pose: found.artwork.label === found.character.name ? "" : found.artwork.label,
        current: false,
        added: copiesOf(found.artwork.id) > 0,
        count: copiesOf(found.artwork.id)
      });
    });
    return cards;
  }

  function cardShell(item) {
    const action = item.kind === "background" ? "use-background" : "add-artwork";
    const actionLabel = item.kind === "background"
      ? (item.current ? "Using this" : "Use this")
      : "Add to Scene";
    const badge = item.added
      ? '<span class="play-badge">' + (item.count > 1 ? "Added ×" + item.count : "Added") + "</span>"
      : "";
    const thumb = TAS.thumbUrl ? TAS.thumbUrl(item.file) : TAS.fileUrl(item.file);
    const full = TAS.fileUrl(item.file);
    return '<article class="play-card' + (item.kind === "background" ? " is-place" : "") + (item.current ? " is-current" : "") + (item.added ? " is-added" : "") + '" data-kind="' + item.kind + '" data-id="' + TAS.esc(item.id) + '">'
      + '<div class="play-figure">'
      + '<button type="button" class="play-pick" data-action="' + action + '" data-id="' + TAS.esc(item.id) + '" aria-label="' + TAS.esc(item.name) + '">'
      + '<img alt="" loading="lazy" decoding="async" src="' + TAS.esc(thumb) + '" data-full="' + TAS.esc(full) + '">'
      + "</button>"
      + '<button type="button" class="play-look" data-action="preview" data-kind="' + item.kind + '" data-id="' + TAS.esc(item.id) + '">See</button>'
      + badge
      + "</div>"
      + '<p class="play-name">' + TAS.esc(item.name) + "</p>"
      + (item.pose ? '<p class="play-pose">' + TAS.esc(item.pose) + "</p>" : "")
      + '<button type="button" class="play-add" data-action="' + action + '" data-id="' + TAS.esc(item.id) + '">' + actionLabel + "</button>"
      + "</article>";
  }

  function paintGrid() {
    const cards = creatorTest ? testCards() : playerCards();
    var empty = document.documentElement.lang === "ja"
      ? "まだ集めている絵がありません。"
      : "You have not collected any pictures yet.";
    grid.innerHTML = cards.map(cardShell).join("") || '<p class="play-empty">' + empty + "</p>";
    grid.querySelectorAll("img[data-full]").forEach(function (img) {
      img.addEventListener("error", function onThumbError() {
        img.removeEventListener("error", onThumbError);
        const full = img.getAttribute("data-full");
        if (full && img.src !== full) img.src = full;
        else img.classList.add("is-broken");
      });
    });
  }

  function refreshCards() {
    if (!choose.hidden) paintGrid();
  }

  function applyFormat(format) {
    state.scene.format = format === "portrait" ? "portrait" : "landscape";
    document.body.dataset.sceneFormat = state.scene.format;
    const stage = document.getElementById("stage");
    if (stage) stage.dataset.format = state.scene.format;
    document.querySelectorAll(".play-format-note").forEach(function (note) {
      note.textContent = state.scene.format === "portrait" ? "9:16 portrait" : "16:9 · 1600×900";
    });
    persist();
    if (window.TASEditor) TASEditor.sync({ stage: true });
  }

  function useBackground(id) {
    if (!creatorTest && id !== STARTER_BACKGROUND) return;
    const background = TAS.findBackground(id);
    if (!background) return;
    const current = state.scene.background;
    const same = current && current.source === "catalogue" && current.assetId === id;
    if (!same) {
      remember();
      state.scene.background = { source: "catalogue", assetId: id, focusX: 50, focusY: 46, scale: 1 };
      persist();
      TASEditor.sync({ stage: true });
    }
    paintFooter();
    refreshCards();
    notify(background.name + " is the background.");
  }

  function addArtwork(id) {
    if (!creatorTest && STARTER_ARTWORK.indexOf(id) === -1) return;
    const found = TAS.findArtwork(id);
    if (!found || found.artwork.placeable === false) {
      notify("That picture cannot be added.");
      return;
    }
    const now = Date.now();
    if (found.artwork.id === lastPlaceId && now - lastPlaceAt < 500) return;
    lastPlaceId = found.artwork.id;
    lastPlaceAt = now;
    remember();
    const layer = TAS.newLayer(state.scene, found.artwork);
    state.scene.layers.push(layer);
    state.selectedLayerId = layer.id;
    persist();
    TASEditor.sync({ stage: true });
    paintFooter();
    paintSelection();
    refreshCards();
    notify("Added " + found.character.name + ".");
  }

  function showArrange() {
    welcome.hidden = true;
    choose.hidden = true;
    arrange.hidden = false;
    document.body.dataset.sceneFormat = state.scene.format || "landscape";
    paintFooter();
    requestAnimationFrame(function () {
      TASEditor.sync({ stage: true });
      paintSelection();
    });
  }

  function showChoose() {
    welcome.hidden = true;
    arrange.hidden = true;
    choose.hidden = false;
    paintFooter();
    paintGrid();
  }

  function nudgeBackground(scaleDelta) {
    if (!state.scene.background) return;
    remember();
    const current = state.scene.background.scale == null ? 1 : state.scene.background.scale;
    state.scene.background.scale = TAS.clamp(current + scaleDelta, 1, 3);
    persist();
    TASEditor.sync({ stage: true });
  }

  function resetBackgroundFrame() {
    if (!state.scene.background) return;
    remember();
    state.scene.background.focusX = 50;
    state.scene.background.focusY = 46;
    state.scene.background.scale = 1;
    persist();
    TASEditor.sync({ stage: true });
    notify("Stage reset.");
  }

  function openPreview(kind, id) {
    let file = "";
    let name = "";
    if (kind === "background") {
      const background = TAS.findBackground(id);
      if (!background) return;
      file = background.file;
      name = background.name;
      preview.classList.add("is-place");
      previewAdd.textContent = "Use this";
      previewAdd.dataset.kind = "background";
    } else {
      const found = TAS.findArtwork(id);
      if (!found) return;
      file = found.artwork.file;
      name = found.character.name;
      preview.classList.remove("is-place");
      previewAdd.textContent = "Add to Scene";
      previewAdd.dataset.kind = "character";
    }
    previewAdd.dataset.id = id;
    previewImg.alt = name;
    previewImg.src = TAS.fileUrl(file);
    previewName.textContent = name;
    preview.hidden = false;
  }

  function closePreview() {
    preview.hidden = true;
    previewImg.removeAttribute("src");
  }

  function onChooseClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !choose.contains(button)) return;
    if (button.dataset.action === "preview") openPreview(button.dataset.kind, button.dataset.id);
    if (button.dataset.action === "use-background") useBackground(button.dataset.id);
    if (button.dataset.action === "add-artwork") addArtwork(button.dataset.id);
  }

  function onArrangeClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !arrange.contains(button)) return;
    if (button.dataset.action === "bg-zoom-in") nudgeBackground(0.15);
    if (button.dataset.action === "bg-zoom-out") nudgeBackground(-0.15);
    if (button.dataset.action === "bg-reset") resetBackgroundFrame();
    if (button.dataset.action === "resize-up" || button.dataset.action === "resize-down") {
      const layer = selectedLayer();
      if (!layer) return;
      remember();
      layer.heightPct = TAS.clamp(layer.heightPct + (button.dataset.action === "resize-up" ? 8 : -8), 8, 140);
      persist();
      TASEditor.sync({ stage: true });
    }
  }

  const api = {
    state: state,
    notify: notify,
    remember: remember,
    persistDraft: persist,
    onSelectionChange: paintSelection,
    selectLayer: function (id) {
      state.selectedLayerId = id && layerById(id) ? id : null;
      persist();
      paintSelection();
    },
    selectedLayer: selectedLayer,
    layerById: layerById,
    backgroundUrl: function () {
      const background = state.scene.background;
      if (!background || background.source !== "catalogue") return "";
      const found = TAS.findBackground(background.assetId);
      return found ? TAS.fileUrl(found.file) : "";
    },
    backgroundLabel: function () {
      const background = state.scene.background && TAS.findBackground(state.scene.background.assetId);
      return background ? background.name : "";
    },
    toggleFlip: function () {
      const layer = selectedLayer();
      if (!layer) return;
      layer.flip = !layer.flip;
      persist();
    },
    toggleShadow: function () {
      const layer = selectedLayer();
      if (!layer) return;
      layer.shadow = layer.shadow === false;
      persist();
    },
    reorderLayer: function (direction) {
      const layers = state.scene.layers;
      const index = layers.findIndex(function (layer) { return layer.id === state.selectedLayerId; });
      const next = index + direction;
      if (index < 0 || next < 0 || next >= layers.length) return;
      remember();
      const item = layers.splice(index, 1)[0];
      layers.splice(next, 0, item);
      persist();
      paintSelection();
    },
    removeSelectedLayer: function () {
      if (!state.selectedLayerId) return;
      remember();
      state.scene.layers = state.scene.layers.filter(function (layer) {
        return layer.id !== state.selectedLayerId;
      });
      state.selectedLayerId = null;
      persist();
      paintFooter();
      paintSelection();
      refreshCards();
    }
  };

  choose.addEventListener("click", onChooseClick);
  arrange.addEventListener("click", onArrangeClick);
  arrangeButton.addEventListener("click", showArrange);
  document.getElementById("play-add-btn").addEventListener("click", showChoose);
  document.getElementById("play-welcome-start").addEventListener("click", startFromWelcome);
  preview.addEventListener("click", function (event) {
    if (event.target === preview || event.target.closest("[data-action='close-preview']")) {
      closePreview();
      return;
    }
    if (!event.target.closest("#play-preview-add")) return;
    if (previewAdd.dataset.kind === "background") useBackground(previewAdd.dataset.id);
    else addArtwork(previewAdd.dataset.id);
    closePreview();
  });
  window.addEventListener("orientationchange", function () {
    window.setTimeout(function () { TASEditor.sync({ stage: true }); }, 180);
  });

  var land = document.getElementById("play-format-land");
  var port = document.getElementById("play-format-port");
  if (land) land.addEventListener("click", function () { applyFormat("landscape"); });
  if (port) port.addEventListener("click", function () { applyFormat("portrait"); });
  const hadDraft = restoreDraft();
  TASEditor.mountPlay(arrange, api);
  if (creatorTest) applyFormat(state.scene.format || "landscape");

  if (hadDraft) showArrange();
  else showChoose();
  paintFooter();
})();

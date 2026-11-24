(function () {
  const DRAFT_KEY = "tas.sceneDraft.v1";

  const state = {
    view: "catalogue",
    catalogueCategory: "characters",
    catalogueCast: "turbo",
    catalogueQuery: "",
    selectedCharacterId: "turbo",
    selectedBackgroundId: "bg_buckingham",
    uploads: [],
    uploadUrls: {},
    scenes: [],
    scene: emptyScene(),
    selectedLayerId: null
  };

  let toastTimer = 0;

  function emptyScene() {
    return {
      id: null,
      name: "Untitled scene",
      format: "portrait",
      background: null,
      layers: []
    };
  }

  function normalizeLayer(layer) {
    const artworkId = TAS.resolveArtworkId(layer && layer.artworkId);
    const found = artworkId ? TAS.findArtwork(artworkId) : null;
    if (!found || found.artwork.placeable === false) return null;
    return {
      id: layer.id || TAS.uid(),
      artworkId: found.artwork.id,
      x: TAS.clamp(layer.x, -20, 120),
      y: TAS.clamp(layer.y, -20, 120),
      heightPct: TAS.clamp(layer.heightPct, 8, 140),
      flip: !!layer.flip,
      rotation: TAS.clamp(layer.rotation || 0, -18, 18),
      shadow: layer.shadow !== false
    };
  }

  function normalizeBackground(background) {
    if (!background) return null;
    const next = {
      source: background.source,
      focusX: TAS.clamp(background.focusX == null ? 50 : background.focusX, 0, 100),
      focusY: TAS.clamp(background.focusY == null ? 50 : background.focusY, 0, 100),
      scale: TAS.clamp(background.scale == null ? 1 : background.scale, 1, 3)
    };
    if (background.source === "catalogue" && TAS.findBackground(background.assetId)) {
      next.assetId = background.assetId;
      return next;
    }
    if (background.source === "upload" && state.uploadUrls[background.uploadId]) {
      next.uploadId = background.uploadId;
      return next;
    }
    return null;
  }

  function notify(message) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { status.hidden = true; }, 4600);
  }

  function persistDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        scene: state.scene,
        selectedLayerId: state.selectedLayerId
      }));
    } catch (error) {
      /* The arrangement still works if the browser refuses session storage. */
    }
  }

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || !draft.scene) return;
      const scene = emptyScene();
      scene.id = draft.scene.id || null;
      scene.name = String(draft.scene.name || "Untitled scene").slice(0, 80);
      scene.format = draft.scene.format === "landscape" ? "landscape" : "portrait";
      scene.background = normalizeBackground(draft.scene.background);
      (draft.scene.layers || []).forEach(function (layer) {
        const next = normalizeLayer(layer);
        if (next) scene.layers.push(next);
      });
      state.scene = scene;
      if (draft.selectedLayerId && scene.layers.some(function (layer) { return layer.id === draft.selectedLayerId; })) {
        state.selectedLayerId = draft.selectedLayerId;
      }
    } catch (error) {
      /* Ignore a damaged draft. */
    }
  }

  let hashLock = false;
  let pendingView = null;

  function viewFromHash() {
    if (location.hash === "#editor") return "editor";
    if (location.hash === "#scenes") return "scenes";
    if (location.hash === "#puzzle") return "puzzle";
    return "catalogue";
  }

  function scenePack(scene) {
    const background = scene.background || null;
    return JSON.stringify({
      name: String(scene.name || ""),
      format: scene.format === "landscape" ? "landscape" : "portrait",
      background: background ? {
        source: background.source || "",
        assetId: background.assetId || "",
        uploadId: background.uploadId || "",
        scale: background.scale == null ? 1 : background.scale,
        focusX: background.focusX == null ? 50 : background.focusX,
        focusY: background.focusY == null ? 50 : background.focusY
      } : null,
      layers: (scene.layers || []).map(function (layer) {
        return [
          layer.artworkId,
          layer.x,
          layer.y,
          layer.heightPct,
          layer.flip ? 1 : 0,
          layer.rotation || 0,
          layer.shadow === false ? 0 : 1
        ];
      })
    });
  }

  function isDirty() {
    const scene = state.scene;
    const empty = !scene.layers.length && !scene.background && (scene.name || "Untitled scene") === "Untitled scene";
    if (!scene.id) return !empty;
    const saved = state.scenes.find(function (item) { return item.id === scene.id; });
    if (!saved) return true;
    return scenePack(scene) !== scenePack(saved);
  }

  function keepMastInView() {
    const root = document.documentElement;
    const mast = document.querySelector(".mast");
    const view = window.visualViewport;
    if (!document.querySelector(".workspace") || !mast || !view) {
      root.classList.remove("vv-pin");
      return;
    }
    if (root.classList.contains("vv-pin")) {
      root.style.setProperty("--vv-top", Math.round(view.offsetTop) + "px");
      root.style.setProperty("--vv-height", Math.round(view.height) + "px");
      return;
    }
    const box = mast.getBoundingClientRect();
    const visibleTop = view.offsetTop;
    const visibleBottom = visibleTop + view.height;
    const hidden = box.height >= 40 && (box.top < visibleTop - 1 || box.bottom > visibleBottom + 1);
    if (!hidden) return;
    root.classList.add("vv-pin");
    root.style.setProperty("--vv-top", Math.round(visibleTop) + "px");
    root.style.setProperty("--vv-height", Math.round(view.height) + "px");
  }

  function render() {
    document.querySelectorAll(".nav-btn").forEach(function (button) {
      const current = button.dataset.view === state.view;
      if (current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    const main = document.getElementById("main");
    if (state.view === "editor" || state.view === "scenes") {
      TASEditor.showDock(state.view === "scenes" ? "scenes" : "characters");
      TASEditor.mount(main, api);
    } else if (state.view === "puzzle") TASPuzzle.mount(main, api);
    else TASCatalogue.mount(main, api);
    requestAnimationFrame(keepMastInView);
  }

  function applyView(next) {
    state.view = next;
    const hash = "#" + next;
    if (location.hash !== hash) {
      hashLock = true;
      location.hash = hash;
      hashLock = false;
    }
    render();
  }

  function go(view) {
    const next = view === "editor" || view === "scenes" || view === "puzzle" ? view : "catalogue";
    if (next === state.view) return;
    const leavingWork = (state.view === "editor" || state.view === "scenes") && next === "catalogue";
    if (leavingWork && isDirty()) {
      pendingView = next;
      document.getElementById("leave-dialog").showModal();
      return;
    }
    applyView(next);
  }

  function layerById(id) {
    return state.scene.layers.find(function (layer) { return layer.id === id; }) || null;
  }

  function selectedLayer() {
    return layerById(state.selectedLayerId);
  }

  function selectLayer(id) {
    state.selectedLayerId = id && layerById(id) ? id : null;
    persistDraft();
  }

  function backgroundUrl() {
    const background = state.scene.background;
    if (!background) return "";
    if (background.source === "catalogue") {
      const found = TAS.findBackground(background.assetId);
      return found ? TAS.fileUrl(found.file) : "";
    }
    return state.uploadUrls[background.uploadId] || "";
  }

  function backgroundLabel() {
    const background = state.scene.background;
    if (!background) return "";
    if (background.source === "catalogue") {
      const found = TAS.findBackground(background.assetId);
      return found ? found.name : "";
    }
    const upload = state.uploads.find(function (item) { return item.id === background.uploadId; });
    return upload ? upload.name : "Local photograph";
  }

  let undoStack = [];
  let lastPlaceId = "";
  let lastPlaceAt = 0;

  function sceneSnapshot() {
    return JSON.stringify({
      layers: state.scene.layers,
      background: state.scene.background,
      format: state.scene.format,
      selectedLayerId: state.selectedLayerId
    });
  }

  function remember() {
    undoStack.push(sceneSnapshot());
    if (undoStack.length > 40) undoStack.shift();
  }

  function undo() {
    const raw = undoStack.pop();
    if (!raw) {
      notify("Nothing to undo.");
      return;
    }
    const data = JSON.parse(raw);
    state.scene.layers = data.layers || [];
    state.scene.background = data.background || null;
    state.scene.format = data.format === "landscape" ? "landscape" : "portrait";
    state.selectedLayerId = data.selectedLayerId && state.scene.layers.some(function (layer) {
      return layer.id === data.selectedLayerId;
    }) ? data.selectedLayerId : null;
    persistDraft();
    if (state.view === "editor") TASEditor.sync({ all: true });
    notify("Undone.");
  }

  function placeArtwork(artworkId) {
    const found = TAS.findArtwork(artworkId);
    if (!found || found.artwork.placeable === false) {
      notify("That drawing is not placed as a character layer.");
      return;
    }
    const now = Date.now();
    if (found.artwork.id === lastPlaceId && now - lastPlaceAt < 500) {
      notify("Already added. Use + Add to Scene again for another copy.");
      return;
    }
    lastPlaceId = found.artwork.id;
    lastPlaceAt = now;
    remember();
    const count = state.scene.layers.length;
    const portrait = state.scene.format !== "landscape";
    const layer = {
      id: TAS.uid(),
      artworkId: found.artwork.id,
      x: TAS.clamp(50 + ((count % 3) - 1) * 16, -20, 120),
      y: portrait ? 74 : 62,
      heightPct: TAS.defaultHeight(found.artwork, state.scene.format),
      flip: false,
      rotation: 0,
      shadow: true
    };
    state.scene.layers.push(layer);
    state.selectedLayerId = layer.id;
    persistDraft();
    const total = state.scene.layers.length;
    notify("Added " + found.character.name + " · " + found.artwork.label + ". " + total + (total === 1 ? " character" : " characters") + " in this scene.");
    if (state.view !== "editor") go("editor");
    else TASEditor.sync({ stage: true, inspector: true });
  }

  function applyBackground(background, options) {
    const current = state.scene.background;
    const changed = !current || current.source !== background.source || current.assetId !== background.assetId || current.uploadId !== background.uploadId;
    if (changed) remember();
    state.scene.background = background;
    persistDraft();
    const stay = options && options.stay;
    if (!stay && state.view !== "editor") {
      go("editor");
      return;
    }
    if (state.view === "editor") TASEditor.sync({ stage: true, inspector: true, library: true });
    else TASCatalogue.mount(document.getElementById("main"), api);
  }

  function useBackground(id, options) {
    if (!TAS.findBackground(id)) return;
    state.selectedBackgroundId = id;
    const current = state.scene.background;
    const same = current && current.source === "catalogue" && current.assetId === id;
    applyBackground(same ? current : { source: "catalogue", assetId: id, focusX: 50, focusY: 50, scale: 1 }, options);
  }

  function useUpload(id, options) {
    if (!state.uploadUrls[id]) {
      notify("That photograph is no longer in this browser.");
      return;
    }
    const current = state.scene.background;
    const same = current && current.source === "upload" && current.uploadId === id;
    applyBackground(same ? current : { source: "upload", uploadId: id, focusX: 50, focusY: 50, scale: 1 }, options);
  }

  function setFormat(format) {
    const next = format === "landscape" ? "landscape" : "portrait";
    if (state.scene.format === next) return;
    remember();
    state.scene.format = next;
    persistDraft();
    if (state.view === "editor" || state.view === "scenes") TASEditor.sync({ all: true });
  }

  function toggleFlip() {
    const layer = selectedLayer();
    if (!layer) return;
    layer.flip = !layer.flip;
    persistDraft();
  }

  function toggleShadow() {
    const layer = selectedLayer();
    if (!layer) return;
    layer.shadow = layer.shadow === false;
    persistDraft();
  }

  function resetBackground() {
    const background = state.scene.background;
    if (!background) return;
    const scale = background.scale == null ? 1 : background.scale;
    const focusX = background.focusX == null ? 50 : background.focusX;
    const focusY = background.focusY == null ? 50 : background.focusY;
    if (scale === 1 && focusX === 50 && focusY === 50) return;
    remember();
    background.scale = 1;
    background.focusX = 50;
    background.focusY = 50;
    persistDraft();
    if (state.view === "editor" || state.view === "scenes") TASEditor.sync({ stage: true, inspector: true });
  }

  function clearBackground() {
    if (!state.scene.background) return;
    remember();
    state.scene.background = null;
    persistDraft();
    if (state.view === "editor") TASEditor.sync({ stage: true, inspector: true, library: true });
  }

  function addCharacterFile(file) {
    if (!file || !/\.png$/i.test(file.name || "")) {
      notify("Choose a character PNG.");
      return;
    }
    const body = new FormData();
    body.append("name", String(file.name || "Character").replace(/\.png$/i, "") || "Character");
    body.append("kind", "character");
    body.append("replaceId", "");
    body.append("file", file);
    fetch("/api/catalogue/library", { method: "POST", body: body })
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) throw new Error(payload.error || "Save failed");
          return payload;
        });
      })
      .then(function (payload) {
        TAS.applyStudioLibrary(payload.library);
        notify("Character saved in the catalogue.");
        placeArtwork(payload.item.id);
        if (state.view === "editor" || state.view === "scenes") TASEditor.sync({ all: true });
      })
      .catch(function () {
        notify("The character PNG could not be saved. Open Studio through the local server.");
      });
  }

  function addUpload(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      notify("Choose an image file.");
      return;
    }
    const upload = {
      id: TAS.uid(),
      name: file.name || "Photograph",
      type: file.type,
      created: Date.now(),
      blob: file
    };
    TASStore.saveUpload(upload).then(function () {
      state.uploads.unshift(upload);
      state.uploadUrls[upload.id] = URL.createObjectURL(file);
      notify("Photograph kept in this browser. It has not been sent anywhere.");
      applyBackground({ source: "upload", uploadId: upload.id }, { stay: state.view === "editor" });
    }).catch(function () {
      notify("This browser could not store the photograph.");
    });
  }

  function deleteUpload(id) {
    if (!window.confirm("Remove this photograph from the browser?")) return;
    TASStore.deleteUpload(id).then(function () {
      if (state.uploadUrls[id]) URL.revokeObjectURL(state.uploadUrls[id]);
      delete state.uploadUrls[id];
      state.uploads = state.uploads.filter(function (upload) { return upload.id !== id; });
      if (state.scene.background && state.scene.background.uploadId === id) state.scene.background = null;
      persistDraft();
      notify("Photograph removed from this browser.");
      if (state.view === "editor") TASEditor.sync({ all: true });
      else TASCatalogue.mount(document.getElementById("main"), api);
    }).catch(function () {
      notify("The photograph could not be removed.");
    });
  }

  function renameScene(name) {
    state.scene.name = String(name).slice(0, 80);
    persistDraft();
  }

  function swapArtwork(artworkId) {
    const layer = selectedLayer();
    const next = TAS.findArtwork(artworkId);
    const current = layer ? TAS.findArtwork(layer.artworkId) : null;
    if (!layer || !next || !current || next.character.id !== current.character.id) return;
    if (next.artwork.placeable === false) return;
    if (layer.artworkId === next.artwork.id) return;
    remember();
    layer.artworkId = next.artwork.id;
    persistDraft();
  }

  function reorderLayer(direction) {
    const layers = state.scene.layers;
    const index = layers.findIndex(function (layer) { return layer.id === state.selectedLayerId; });
    const next = index + direction;
    if (index < 0 || next < 0 || next >= layers.length) return;
    remember();
    const item = layers.splice(index, 1)[0];
    layers.splice(next, 0, item);
    persistDraft();
  }

  function duplicateLayer() {
    const layer = selectedLayer();
    if (!layer) return;
    const copy = normalizeLayer(layer);
    copy.id = TAS.uid();
    copy.x = TAS.clamp(layer.x + 8, -20, 120);
    copy.y = TAS.clamp(layer.y + 4, -20, 120);
    state.scene.layers.push(copy);
    state.selectedLayerId = copy.id;
    persistDraft();
  }

  function removeSelectedLayer() {
    if (!state.selectedLayerId) return;
    remember();
    state.scene.layers = state.scene.layers.filter(function (layer) {
      return layer.id !== state.selectedLayerId;
    });
    state.selectedLayerId = null;
    persistDraft();
  }

  function newScene() {
    const dirty = state.scene.layers.length || state.scene.background;
    if (dirty && !window.confirm("Start a new scene? Save first if you want to keep this arrangement.")) return;
    state.scene = emptyScene();
    state.selectedLayerId = null;
    persistDraft();
    if (state.view === "editor") TASEditor.sync({ all: true });
    notify("New scene.");
  }

  function sceneRecord() {
    if (!state.scene.id) state.scene.id = TAS.uid();
    return {
      id: state.scene.id,
      name: state.scene.name.trim() || "Untitled scene",
      format: state.scene.format === "landscape" ? "landscape" : "portrait",
      updated: Date.now(),
      background: state.scene.background,
      layers: state.scene.layers.map(function (layer) {
        return normalizeLayer(layer);
      }).filter(Boolean)
    };
  }

  function saveScene() {
    const record = sceneRecord();
    state.scene.name = record.name;
    return TASStore.saveScene(record).then(function () {
      return TASStore.listScenes();
    }).then(function (scenes) {
      state.scenes = scenes;
      persistDraft();
      if (state.view === "editor" || state.view === "scenes") TASEditor.sync({ toolbar: true, inspector: true });
      notify("Scene saved in this browser.");
    }).catch(function () {
      notify("The scene could not be saved in this browser.");
      return Promise.reject(new Error("save"));
    });
  }

  function openScene(id) {
    const saved = state.scenes.find(function (scene) { return scene.id === id; });
    if (!saved) return;
    remember();
    const scene = emptyScene();
    scene.id = saved.id;
    scene.name = saved.name;
    scene.format = saved.format === "landscape" ? "landscape" : "portrait";
    scene.background = normalizeBackground(saved.background);
    (saved.layers || []).forEach(function (layer) {
      const next = normalizeLayer(layer);
      if (next) scene.layers.push(next);
    });
    state.scene = scene;
    state.selectedLayerId = null;
    persistDraft();
    if (state.view === "editor" || state.view === "scenes") TASEditor.sync({ all: true });
    notify("Opened “" + scene.name + "”.");
  }

  function deleteScene(id) {
    const saved = state.scenes.find(function (scene) { return scene.id === id; });
    if (!saved || !window.confirm("Delete “" + saved.name + "” from this browser?")) return;
    TASStore.deleteScene(id).then(function () {
      return TASStore.listScenes();
    }).then(function (scenes) {
      state.scenes = scenes;
      if (state.scene.id === id) state.scene.id = null;
      persistDraft();
      if (state.view === "editor") TASEditor.sync({ inspector: true });
      notify("Saved scene deleted.");
    }).catch(function () {
      notify("The saved scene could not be deleted.");
    });
  }

  function exportJson() {
    const payload = {
      format: "turbo-adventures-scene-v2",
      publisher: TAS.publisher,
      name: state.scene.name,
      sceneFormat: state.scene.format === "landscape" ? "landscape" : "portrait",
      background: state.scene.background,
      layers: state.scene.layers.map(function (layer) {
        const next = normalizeLayer(layer);
        if (!next) return null;
        delete next.id;
        return next;
      }).filter(Boolean)
    };
    const background = state.scene.background;
    const upload = background && background.source === "upload"
      ? state.uploads.find(function (item) { return item.id === background.uploadId; })
      : null;
    const ready = upload
      ? blobToDataUrl(upload.blob).then(function (dataUrl) {
        payload.background = { source: "upload", name: upload.name, dataUrl: dataUrl };
      })
      : Promise.resolve();
    ready.then(function () {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = slug(state.scene.name) + ".json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify("Scene file exported. It records placement, not a new drawing.");
    }).catch(function () {
      notify("The scene file could not be exported.");
    });
  }

  function importJson(file) {
    file.text().then(function (text) {
      return JSON.parse(text);
    }).then(function (data) {
      if (!data || (data.format !== "turbo-adventures-scene-v1" && data.format !== "turbo-adventures-scene-v2")) {
        notify("That file is not a Turbo Adventures scene.");
        return null;
      }
      const scene = emptyScene();
      scene.name = String(data.name || "Imported scene").slice(0, 80);
      scene.format = data.sceneFormat === "landscape" ? "landscape" : "portrait";
      scene.id = TAS.uid();
      let backgroundReady = Promise.resolve();
      if (data.background && data.background.source === "catalogue" && TAS.findBackground(data.background.assetId)) {
        scene.background = normalizeBackground(data.background);
      } else if (data.background && data.background.source === "upload" && data.background.dataUrl) {
        backgroundReady = fetch(data.background.dataUrl).then(function (response) {
          return response.blob();
        }).then(function (blob) {
          const upload = {
            id: TAS.uid(),
            name: data.background.name || "Imported photograph",
            type: blob.type || "image/png",
            created: Date.now(),
            blob: blob
          };
          return TASStore.saveUpload(upload).then(function () {
            state.uploads.unshift(upload);
            state.uploadUrls[upload.id] = URL.createObjectURL(blob);
            scene.background = normalizeBackground({
              source: "upload",
              uploadId: upload.id,
              focusX: data.background.focusX,
              focusY: data.background.focusY,
              scale: data.background.scale
            });
          });
        });
      } else if (data.background && data.background.source === "upload" && state.uploadUrls[data.background.uploadId]) {
        scene.background = normalizeBackground(data.background);
      }
      return backgroundReady.then(function () {
        let skipped = 0;
        (data.layers || []).forEach(function (layer) {
          if (!TAS.findArtwork(layer.artworkId)) {
            skipped += 1;
            return;
          }
          const next = normalizeLayer(layer);
          if (next) scene.layers.push(next);
        });
        state.scene = scene;
        state.selectedLayerId = null;
        persistDraft();
        if (state.view !== "editor") go("editor");
        else TASEditor.sync({ all: true });
        notify(skipped
          ? "Scene imported. Some layers had no local artwork and were left out."
          : "Scene imported.");
      });
    }).catch(function () {
      notify("That scene file could not be read.");
    });
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(blob);
    });
  }

  function slug(name) {
    const value = String(name || "scene").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return value || "scene";
  }

  function setCategory(category) {
    const allowed = { characters: true, npcs: true, backgrounds: true, scenes: true, manage: true };
    state.catalogueCategory = allowed[category] ? category : "characters";
    state.catalogueQuery = "";
    if (state.view === "catalogue") TASCatalogue.mount(document.getElementById("main"), api);
  }

  function selectCharacter(id) {
    if (!TAS.findCharacter(id)) return;
    state.selectedCharacterId = id;
    if (state.view === "catalogue") TASCatalogue.refreshSelection();
  }

  function selectBackground(id) {
    if (!TAS.findBackground(id)) return;
    state.selectedBackgroundId = id;
    if (state.view === "catalogue") TASCatalogue.refreshSelection();
  }

  const api = {
    state: state,
    notify: notify,
    persistDraft: persistDraft,
    go: go,
    setCategory: setCategory,
    selectCharacter: selectCharacter,
    selectBackground: selectBackground,
    placeArtwork: placeArtwork,
    remember: remember,
    undo: undo,
    useBackground: useBackground,
    useUpload: useUpload,
    clearBackground: clearBackground,
    resetBackground: resetBackground,
    addUpload: addUpload,
    addCharacterFile: addCharacterFile,
    deleteUpload: deleteUpload,
    selectLayer: selectLayer,
    selectedLayer: selectedLayer,
    layerById: layerById,
    backgroundUrl: backgroundUrl,
    backgroundLabel: backgroundLabel,
    renameScene: renameScene,
    swapArtwork: swapArtwork,
    reorderLayer: reorderLayer,
    duplicateLayer: duplicateLayer,
    removeSelectedLayer: removeSelectedLayer,
    newScene: newScene,
    saveScene: saveScene,
    openScene: openScene,
    deleteScene: deleteScene,
    exportJson: exportJson,
    importJson: importJson,
    setFormat: setFormat,
    toggleFlip: toggleFlip,
    toggleShadow: toggleShadow
  };

  document.querySelector(".mast").addEventListener("click", function (event) {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    go(button.dataset.view);
  });

  document.getElementById("leave-dialog").addEventListener("click", function (event) {
    const button = event.target.closest("[data-leave]");
    if (!button) return;
    const choice = button.dataset.leave;
    const dialog = document.getElementById("leave-dialog");
    if (choice === "cancel") {
      pendingView = null;
      dialog.close();
      return;
    }
    if (choice === "keep") {
      const next = pendingView;
      pendingView = null;
      dialog.close();
      if (next) applyView(next);
      return;
    }
    if (choice === "save") {
      const next = pendingView;
      saveScene().then(function () {
        pendingView = null;
        dialog.close();
        if (next) applyView(next);
      });
    }
  });

  if (window.visualViewport) {
    visualViewport.addEventListener("resize", keepMastInView);
    visualViewport.addEventListener("scroll", keepMastInView);
  }
  window.addEventListener("resize", keepMastInView);

  window.addEventListener("hashchange", function () {
    if (hashLock) return;
    const next = viewFromHash();
    if (next === state.view) return;
    const leavingWork = (state.view === "editor" || state.view === "scenes") && next === "catalogue";
    if (leavingWork && isDirty()) {
      pendingView = next;
      hashLock = true;
      location.hash = "#" + state.view;
      hashLock = false;
      document.getElementById("leave-dialog").showModal();
      return;
    }
    state.view = next;
    render();
  });

  document.addEventListener("keydown", function (event) {
    if (state.view !== "editor") return;
    if (event.target.closest("input, textarea, select")) return;
    if (event.key === "Escape") {
      selectLayer(null);
      TASEditor.sync({ stage: true, inspector: true });
      return;
    }
    const layer = selectedLayer();
    if (!layer) return;
    const step = event.shiftKey ? 2 : 0.5;
    let handled = true;
    if (event.key === "ArrowLeft") layer.x = TAS.clamp(layer.x - step, -15, 115);
    else if (event.key === "ArrowRight") layer.x = TAS.clamp(layer.x + step, -15, 115);
    else if (event.key === "ArrowUp") layer.y = TAS.clamp(layer.y - step, -15, 115);
    else if (event.key === "ArrowDown") layer.y = TAS.clamp(layer.y + step, -15, 115);
    else if (event.key === "Delete" || event.key === "Backspace") removeSelectedLayer();
    else handled = false;
    if (!handled) return;
    event.preventDefault();
    persistDraft();
    TASEditor.sync({ stage: true, inspector: true });
  });

  document.getElementById("main").addEventListener("change", function (event) {
    if (event.target.id !== "upload-input") return;
    const file = event.target.files && event.target.files[0];
    if (file) addUpload(file);
    event.target.value = "";
  });

  function boot() {
    const stored = TASStore.listUploads().then(function (uploads) {
      state.uploads = uploads;
      uploads.forEach(function (upload) {
        state.uploadUrls[upload.id] = URL.createObjectURL(upload.blob);
      });
      return TASStore.listScenes();
    }).then(function (scenes) {
      state.scenes = scenes;
    }).catch(function () {
      notify("Local storage is unavailable. You can still arrange a scene for this visit.");
    });
    const library = TAS.loadStudioLibrary ? TAS.loadStudioLibrary() : Promise.resolve();
    Promise.all([stored, library]).then(function () {
      restoreDraft();
      state.view = viewFromHash();
      render();
    });
  }

  boot();
})();

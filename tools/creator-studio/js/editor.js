(function () {
  let app = null;
  let host = null;
  let shell = null;
  let dock = "characters";
  let libraryTab = "turbo";
  let libraryCharacterId = "turbo";
  let selectedPoseId = "";
  let observer = null;
  const pointers = new Map();
  let press = null;
  let previewClone = null;

  function mount(root, studio) {
    app = studio;
    host = root;
    if (observer) observer.disconnect();
    root.innerHTML = ""
      + '<div class="workspace"><section class="stage-column"><div class="stage-frame">'
      + '<div class="stage-fit"><div class="stage" id="stage" data-format="portrait"><p class="stage-hint"></p><div class="layers"></div></div>'
      + '<button type="button" class="preview-open" data-action="open-preview">Preview</button></div>'
      + '<div class="stage-save">'
      + '<button type="button" class="btn" data-action="save-scene">Save Scene</button>'
      + '<button type="button" class="btn btn-primary" data-action="export-png">Save Picture</button>'
      + "</div></div></section>"
      + '<aside class="dock" aria-label="Editing controls">'
      + '<div class="dock-tabs" role="tablist" aria-label="Editing controls">'
      + '<button type="button" data-action="dock" data-dock="backgrounds">Backgrounds</button>'
      + '<button type="button" data-action="dock" data-dock="characters">Characters</button>'
      + '<button type="button" data-action="dock" data-dock="adjust">Adjust</button>'
      + '<button type="button" data-action="dock" data-dock="layers">Layers</button>'
      + '<button type="button" data-action="dock" data-dock="scenes">Scenes</button>'
      + "</div>"
      + '<div class="dock-body" id="dock-body"></div>'
      + "</aside></div>"
      + '<dialog class="sheet" id="bg-preview"><div class="sheet-body" id="bg-preview-body"></div></dialog>';
    shell = root.querySelector(".workspace");
    document.documentElement.classList.toggle("tas-touch", window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0);
    closePreview();
    shell.addEventListener("click", onClick);
    shell.addEventListener("dblclick", onDoubleClick);
    root.querySelector("#bg-preview").addEventListener("click", onClick);
    shell.addEventListener("input", onInput);
    shell.addEventListener("change", onChange);
    shell.addEventListener("pointerdown", onPointerDown);
    shell.addEventListener("pointermove", onPointerMove);
    shell.addEventListener("pointerup", onPointerUp);
    shell.addEventListener("pointercancel", onPointerUp);
    shell.addEventListener("dragstart", function (event) { event.preventDefault(); });
    observer = new ResizeObserver(function () { fitStage(); });
    observer.observe(shell.querySelector(".stage-column"));
    observer.observe(shell.querySelector(".stage-fit"));
    sync({ all: true });
    applyZoom(1);
  }

  function sync(parts) {
    if (!shell) return;
    const flags = parts || {};
    if (flags.all || flags.toolbar) paintToolbar();
    if (flags.all || flags.stage) ensureStage();
    if (flags.all || flags.inspector || flags.library) paintDock();
  }

  function paintToolbar() {
    const input = shell.querySelector("#scene-name");
    if (input && document.activeElement !== input) input.value = app.state.scene.name;
    const format = app.state.scene.format === "landscape" ? "landscape" : "portrait";
    shell.querySelectorAll("button[data-format]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.format === format ? "true" : "false");
    });
    shell.querySelector(".stage").dataset.format = format;
    const count = app.state.scene.layers.length;
    const tally = shell.querySelector("#layer-count");
    if (tally) tally.textContent = count + (count === 1 ? " character" : " characters");
  }

  function paintDock() {
    shell.querySelectorAll("[data-dock]").forEach(function (button) {
      button.setAttribute("aria-selected", button.dataset.dock === dock ? "true" : "false");
    });
    const body = shell.querySelector("#dock-body");
    const stage = shell.querySelector(".stage");
    if (stage) stage.classList.toggle("is-background-edit", dock === "backgrounds");
    const kept = body.scrollTop;
    if (dock === "backgrounds") body.innerHTML = "<h2>Backgrounds</h2>" + backgroundControls() + backgroundLibrary();
    else if (dock === "characters") body.innerHTML = charactersHtml();
    else if (dock === "layers") body.innerHTML = layersHtml();
    else if (dock === "scenes") body.innerHTML = scenesHtml();
    else body.innerHTML = adjustHtml();
    hydrate(body);
    body.scrollTop = kept;
  }

  function charactersHtml() {
    const tabs = ""
      + '<div class="library-tabs" role="tablist">'
      + '<button type="button" data-action="library-tab" data-tab="turbo" aria-selected="' + (libraryTab === "turbo") + '">Turbo</button>'
      + '<button type="button" data-action="library-tab" data-tab="featured" aria-selected="' + (libraryTab === "featured") + '">Featured</button>'
      + '<button type="button" data-action="library-tab" data-tab="npcs" aria-selected="' + (libraryTab === "npcs") + '">Children</button>'
      + "</div>";
    return tabs + artworkGrid(libraryTab === "npcs" ? "npc" : libraryTab) + deviceCharacters();
  }

  function deviceCharacters() {
    const cards = [];
    TAS.characters.forEach(function (character) {
      character.artworks.forEach(function (artwork) {
        if (!artwork.file || artwork.file.indexOf("studio_library/") !== 0) return;
        cards.push('<div class="card"><button type="button" class="card" data-action="add-to-scene" data-id="' + artwork.id + '">'
          + '<span class="card-figure"><img alt="" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '"></span>'
          + '<span class="card-body"><h3>' + TAS.esc(character.name) + "</h3></span></button></div>");
      });
    });
    return '<h3 class="subhead">On this device</h3>'
      + '<label class="btn file-btn">Add a character PNG<input id="character-png-input" type="file" accept="image/png,.png" hidden></label>'
      + '<div class="grid">' + cards.join("") + "</div>";
  }

  function artworkGrid(category) {
    const characters = TAS.characters.filter(function (character) { return character.category === category; });
    const drawings = [];
    characters.forEach(function (character) {
      character.artworks.forEach(function (artwork) {
        if (artwork.placeable === false) return;
        drawings.push({ character: character, artwork: artwork });
      });
    });
    if (!drawings.some(function (item) { return item.artwork.id === selectedPoseId; }) && drawings[0]) {
      selectedPoseId = drawings[0].artwork.id;
      libraryCharacterId = drawings[0].character.id;
    }
    const cards = drawings.map(function (item) {
      const artwork = item.artwork;
      const selected = artwork.id === selectedPoseId;
      if (selected) libraryCharacterId = item.character.id;
      return '<article class="art-card' + (selected ? " is-selected" : "") + '">'
        + '<button type="button" class="art-pick" data-action="preview-artwork" data-id="' + artwork.id + '" aria-pressed="' + (selected ? "true" : "false") + '">'
        + '<img alt="" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '">'
        + '<span class="art-name">' + TAS.esc(item.character.name) + "</span>"
        + '<span class="art-pose">' + TAS.esc(artwork.label) + "</span></button>"
        + (selected ? '<button type="button" class="btn btn-primary art-add" data-action="add-to-scene" data-id="' + artwork.id + '">+ Add to Scene</button>' : "")
        + "</article>";
    }).join("");
    return '<div class="art-grid">' + cards + "</div>";
  }

  function previewBackground(id) {
    const background = TAS.findBackground(id);
    const dialog = host.querySelector("#bg-preview");
    if (!background || !dialog) return;
    const shape = TAS.ratioLabel(background.width, background.height);
    dialog.querySelector("#bg-preview-body").innerHTML = ''
      + '<div class="sheet-head"><div><p class="kicker">Background</p><h2>' + TAS.esc(background.name) + "</h2></div>"
      + '<button type="button" class="btn" data-action="close-bg-preview">Close</button></div>'
      + '<div class="detail-figure ' + (shape === "16:9" ? "is-landscape" : "is-portrait") + '"><img src="' + TAS.esc(TAS.fileUrl(background.file)) + '" alt="' + TAS.esc(background.name) + '"></div>'
      + '<p class="note">' + shape + ". The original photograph is unchanged.</p>"
      + '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="use-background" data-id="' + background.id + '">Use in scene</button></div>';
    if (!dialog.open) dialog.showModal();
  }

  function closeBackgroundPreview() {
    const dialog = host.querySelector("#bg-preview");
    if (dialog && dialog.open) dialog.close();
  }

  function backgroundLibrary() {
    const cards = TAS.backgrounds.map(function (background) {
      const current = app.state.scene.background && app.state.scene.background.source === "catalogue" && app.state.scene.background.assetId === background.id;
      const shape = TAS.ratioLabel(background.width, background.height);
      const frame = shape === "16:9" ? "bg-landscape" : (shape === "3:4" ? "bg-file" : "bg-portrait");
      return '<button type="button" class="card' + (current ? " is-reference" : "") + '" data-action="preview-background" data-id="' + background.id + '">'
        + '<span class="card-figure ' + frame + '"><img src="' + TAS.esc(TAS.fileUrl(background.file)) + '" alt="" loading="lazy"></span>'
        + '<span class="card-body"><h3>' + TAS.esc(background.name) + "</h3><p>" + shape + "</p></span></button>";
    }).join("");
    const uploads = app.state.uploads.map(function (upload) {
      const url = app.state.uploadUrls[upload.id] || "";
      return '<div class="card"><button type="button" class="card" data-action="use-upload" data-id="' + upload.id + '">'
        + '<span class="card-figure bg-file"><img src="' + TAS.esc(url) + '" alt=""></span>'
        + '<span class="card-body"><h3>' + TAS.esc(upload.name) + "</h3></span></button>"
        + '<button type="button" class="textish" data-action="delete-upload" data-id="' + upload.id + '">Remove</button></div>';
    }).join("");
    return '<div class="grid bg-grid">' + cards + '</div><h3 class="subhead">On this phone</h3>'
      + '<label class="btn file-btn">Add a photograph<input id="upload-input" type="file" accept="image/*" hidden></label>'
      + '<div class="grid">' + (uploads || "") + "</div>";
  }

  function adjustHtml() {
    const layer = app.selectedLayer();
    return "<h2>Adjust</h2>" + (layer ? layerControls(layer) : '<p class="note">Select a character on the scene. Size, turn, and order stay on this character and do not change the preview zoom.</p>');
  }

  function layersHtml() {
    const count = app.state.scene.layers.length;
    return "<h2>Layers</h2><p class=\"note\">" + count + (count === 1 ? " character" : " characters") + " in this scene. The top of the list is in front.</p>"
      + (layerStack() || '<p class="note">No characters yet. Choose one in Characters, then use + Add to Scene.</p>');
  }

  function layerControls(layer) {
    const found = TAS.findArtwork(layer.artworkId);
    const siblings = found.character.artworks.filter(function (artwork) {
      return artwork.placeable !== false;
    }).map(function (artwork) {
      const current = artwork.id === layer.artworkId ? ' aria-current="true"' : "";
      return '<button type="button" class="pose" data-action="swap-artwork" data-id="' + artwork.id + '"' + current + ">"
        + '<span class="pose-frame"><img alt="" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '"></span>'
        + '<span class="pose-label">' + TAS.esc(artwork.label) + "</span></button>";
    }).join("");
    const index = app.state.scene.layers.findIndex(function (item) { return item.id === layer.id; });
    return '<p><strong>' + TAS.esc(found.character.name) + "</strong> · " + TAS.esc(found.artwork.label) + "</p>"
      + '<p class="note">Drag to move. The red handle resizes. Flip and turn stay in this scene.</p>'
      + '<label class="field">Size <span id="size-readout">' + Math.round(layer.heightPct) + '%</span>'
      + '<input id="layer-size" type="range" min="8" max="140" step="1" value="' + layer.heightPct + '"></label>'
      + '<label class="field">Turn <span id="turn-readout">' + Math.round(layer.rotation || 0) + '°</span>'
      + '<input id="layer-rotation" type="range" min="-18" max="18" step="1" value="' + (layer.rotation || 0) + '"></label>'
      + '<div class="btn-row">'
      + '<button type="button" class="btn" data-action="flip" aria-pressed="' + (layer.flip ? "true" : "false") + '">Flip</button>'
      + '<button type="button" class="btn" data-action="shadow" aria-pressed="' + (layer.shadow !== false ? "true" : "false") + '">Shadow</button>'
      + "</div>"
      + '<div class="btn-row">'
      + '<button type="button" class="btn" data-action="send-backward"' + (index === 0 ? " disabled" : "") + ">Send back</button>"
      + '<button type="button" class="btn" data-action="bring-forward"' + (index === app.state.scene.layers.length - 1 ? " disabled" : "") + ">Bring forward</button>"
      + '<button type="button" class="btn" data-action="remove-layer">Remove</button>'
      + "</div>"
      + '<h3>Same character</h3><div class="pose-grid">' + siblings + "</div>";
  }

  function backgroundControls() {
    const background = app.state.scene.background;
    if (!background) return "<h3>Photograph</h3><p class=\"note\">Choose a place above. A 16:9 picture can be slid inside the portrait frame.</p>";
    const focusX = background.focusX == null ? 50 : background.focusX;
    const focusY = background.focusY == null ? 50 : background.focusY;
    const zoom = Math.round((background.scale == null ? 1 : background.scale) * 100);
    return "<h3>Photograph</h3><p class=\"note\">" + TAS.esc(app.backgroundLabel()) + ". Drag the picture to move it. It always covers the frame, and the characters stay where they are.</p>"
      + '<label class="field"><span class="field-label">Background Zoom <span id="bg-zoom-readout">' + zoom + '%</span></span>'
      + '<input id="bg-scale" type="range" min="100" max="300" step="1" value="' + zoom + '"></label>'
      + '<label class="field">Horizontal<input id="bg-x" type="range" min="0" max="100" step="0.5" value="' + focusX + '"></label>'
      + '<label class="field">Vertical<input id="bg-y" type="range" min="0" max="100" step="0.5" value="' + focusY + '"></label>'
      + '<div class="bg-actions"><button type="button" class="btn" data-action="reset-background">Reset Background</button>'
      + '<button type="button" class="btn" data-action="clear-background">Remove photograph</button></div>';
  }

  function layerStack() {
    if (!app.state.scene.layers.length) return "";
    const items = app.state.scene.layers.slice().reverse().map(function (layer) {
      const found = TAS.findArtwork(layer.artworkId);
      const name = found ? found.character.name + " · " + found.artwork.label : layer.artworkId;
      const current = layer.id === app.state.selectedLayerId ? ' aria-current="true"' : "";
      return '<li><button type="button" data-action="select-layer" data-id="' + layer.id + '"' + current + ">" + TAS.esc(name) + "</button></li>";
    }).join("");
    return "<h3>Front to back</h3><ol class=\"stack\">" + items + "</ol>";
  }

  function scenesHtml() {
    const items = app.state.scenes.length
      ? app.state.scenes.map(function (scene) {
        const when = new Date(scene.updated).toLocaleString();
        return '<li><button type="button" data-action="open-scene" data-id="' + scene.id + '">' + TAS.esc(scene.name) + "</button>"
          + '<button type="button" class="textish" data-action="delete-scene" data-id="' + scene.id + '">Delete</button>'
          + '<small class="note">' + TAS.esc(when) + "</small></li>";
      }).join("")
      : "<li class=\"note\">Saved scenes stay in this browser.</li>";
    const size = TAS.exportSize(app.state.scene.format);
    const format = app.state.scene.format === "landscape" ? "landscape" : "portrait";
    return "<h2>Scenes</h2>"
      + '<label class="scene-name">Scene<input id="scene-name" type="text" maxlength="80" autocomplete="off" value="' + TAS.esc(app.state.scene.name) + '"></label>'
      + '<div class="format-row" role="group" aria-label="Scene shape">'
      + '<button type="button" data-action="format" data-format="portrait" aria-pressed="' + (format === "portrait" ? "true" : "false") + '">9:16</button>'
      + '<button type="button" data-action="format" data-format="landscape" aria-pressed="' + (format === "landscape" ? "true" : "false") + '">16:9</button>'
      + "</div>"
      + '<div class="btn-row"><button type="button" class="btn" data-action="undo">Undo</button>'
      + '<p class="layer-count" id="layer-count">' + app.state.scene.layers.length + (app.state.scene.layers.length === 1 ? " character" : " characters") + "</p></div>"
      + '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="save-scene">Save</button>'
      + '<button type="button" class="btn" data-action="new-scene">New</button></div>'
      + '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="export-png">Save Picture to Device</button>'
      + '<button type="button" class="btn" data-action="export-json">Export scene</button>'
      + '<label class="btn file-btn">Open file<input id="import-input" type="file" accept="application/json,.json" hidden></label></div>'
      + '<p class="note">The picture is ' + size.width + "×" + size.height + ". The scene file can be opened again and still edited.</p>"
      + '<ul class="scene-list">' + items + "</ul>";
  }

  function hydrate(scope) {
    scope.querySelectorAll("img[data-cutout]").forEach(function (image) {
      const source = image.dataset.cutout;
      TASCutout.prepare(source).then(function (url) {
        if (image.dataset.cutout === source) image.src = url;
      });
    });
  }

  function ensureStage() {
    const stage = shell.querySelector(".stage");
    const format = app.state.scene.format === "landscape" ? "landscape" : "portrait";
    stage.dataset.format = format;
    fitStage();
    const holder = stage.querySelector(".layers");
    const seen = new Set();
    app.state.scene.layers.forEach(function (layer, index) {
      const found = TAS.findArtwork(layer.artworkId);
      if (!found) return;
      let node = holder.querySelector('[data-layer="' + layer.id + '"]');
      if (!node) {
        node = document.createElement("div");
        node.className = "layer";
        node.dataset.layer = layer.id;
        node.innerHTML = '<span class="ground-shadow"></span><img alt="" draggable="false"><button type="button" class="handle" aria-label="Resize"></button>';
        holder.appendChild(node);
      }
      const image = node.querySelector("img");
      const source = TAS.fileUrl(found.artwork.file);
      if (image.dataset.source !== source) {
        image.dataset.source = source;
        image.removeAttribute("src");
        TASCutout.prepare(source).then(function (clean) {
          if (image.dataset.source === source) image.src = clean;
        });
      }
      image.alt = found.character.name + ", " + found.artwork.label;
      image.style.transform = "scaleX(" + (layer.flip ? -1 : 1) + ") rotate(" + (layer.rotation || 0) + "deg)";
      node.style.left = layer.x + "%";
      node.style.top = layer.y + "%";
      node.style.height = layer.heightPct + "%";
      node.style.zIndex = String(index + 1);
      node.classList.toggle("is-selected", layer.id === app.state.selectedLayerId);
      node.classList.toggle("has-shadow", layer.shadow !== false);
      seen.add(layer.id);
    });
    holder.querySelectorAll(".layer").forEach(function (node) {
      if (!seen.has(node.dataset.layer)) node.remove();
    });
    const tally = shell.querySelector("#layer-count");
    if (tally) tally.textContent = app.state.scene.layers.length + (app.state.scene.layers.length === 1 ? " character" : " characters");
    const hint = stage.querySelector(".stage-hint");
    const empty = !app.state.scene.layers.length && !app.state.scene.background;
    hint.hidden = !empty;
    hint.textContent = "Choose a photograph, then add a character.";
  }

  function layoutBackground() {
    const stage = shell.querySelector(".stage");
    if (!stage) return;
    const url = app.backgroundUrl();
    let background = stage.querySelector(".stage-bg");
    if (!url) {
      if (background) background.remove();
      return;
    }
    if (!background) {
      background = document.createElement("img");
      background.className = "stage-bg";
      background.alt = "";
      stage.insertBefore(background, stage.firstChild);
    }
    if (background.getAttribute("src") !== url) background.src = url;
    background.alt = app.backgroundLabel();
    if (!background.naturalWidth) {
      background.onload = function () { layoutBackground(); };
      return;
    }
    const frame = app.state.scene.background || {};
    const layout = TAS.backgroundBox(TAS.backgroundFrame(
      stage.clientWidth,
      stage.clientHeight,
      background.naturalWidth,
      background.naturalHeight,
      frame.scale == null ? 1 : frame.scale,
      frame.focusX,
      frame.focusY
    ));
    background.style.left = layout.x + "px";
    background.style.top = layout.y + "px";
    background.style.width = layout.drawW + "px";
    background.style.height = layout.drawH + "px";
  }

  function onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !host.contains(button)) return;
    if (button.classList.contains("handle")) return;
    const action = button.dataset.action;
    if (action === "show-catalogue") {
      app.go("catalogue");
      return;
    }
    const id = button.dataset.id;
    if (action === "dock") {
      dock = button.dataset.dock;
      paintDock();
      return;
    }
    if (action === "undo") {
      app.undo();
      return;
    }
    if (action === "preview-artwork") {
      selectedPoseId = id;
      const found = TAS.findArtwork(id);
      if (found) libraryCharacterId = found.character.id;
      paintDock();
      return;
    }
    if (action === "add-to-scene") {
      app.placeArtwork(id);
      return;
    }
    if (action === "library-tab") {
      libraryTab = button.dataset.tab;
      const panel = shell.querySelector("#dock-body");
      if (panel) panel.scrollTop = 0;
      paintDock();
      return;
    }
    if (action === "library-character") {
      libraryCharacterId = id;
      paintDock();
      return;
    }
    if (action === "preview-background") {
      previewBackground(id);
      return;
    }
    if (action === "close-bg-preview") {
      closeBackgroundPreview();
      return;
    }
    if (action === "use-background") {
      closeBackgroundPreview();
      app.useBackground(id, { stay: true });
      return;
    }
    if (action === "use-upload") {
      app.useUpload(id, { stay: true });
      return;
    }
    if (action === "delete-upload") app.deleteUpload(id);
    if (action === "format") app.setFormat(button.dataset.format);
    if (action === "clear-background") app.clearBackground();
    if (action === "reset-background") app.resetBackground();
    if (action === "select-layer") {
      app.selectLayer(id);
      dock = "adjust";
      sync({ stage: true, inspector: true });
    }
    if (action === "swap-artwork") {
      app.swapArtwork(id);
      sync({ stage: true, inspector: true });
    }
    if (action === "flip") {
      app.toggleFlip();
      sync({ stage: true, inspector: true });
    }
    if (action === "shadow") {
      app.toggleShadow();
      sync({ stage: true, inspector: true });
    }
    if (action === "bring-forward") {
      app.reorderLayer(1);
      sync({ stage: true, inspector: true });
    }
    if (action === "send-backward") {
      app.reorderLayer(-1);
      sync({ stage: true, inspector: true });
    }
    if (action === "remove-layer") {
      app.removeSelectedLayer();
      sync({ stage: true, inspector: true });
    }
    if (action === "save-scene") app.saveScene();
    if (action === "new-scene") app.newScene();
    if (action === "export-json") app.exportJson();
    if (action === "export-png") exportPng();
    if (action === "open-preview") openPreview();
    if (action === "open-scene") app.openScene(id);
    if (action === "delete-scene") app.deleteScene(id);
  }

  function fitStage() {
    const fit = shell.querySelector(".stage-fit");
    const stage = shell.querySelector(".stage");
    const column = shell.querySelector(".stage-column");
    if (!fit || !stage) return;
    const zoom = Math.min(2.5, Math.max(1, Number(stage.style.getPropertyValue("--zoom")) || 1));
    const landscape = stage.dataset.format === "landscape";
    const ratio = landscape ? 16 / 9 : 9 / 16;
    let availW = fit.clientWidth;
    let availH = fit.clientHeight;
    if (availW < 8 || availH < 8) {
      const chrome = shell.querySelectorAll(".stage-tools, .stage-actions, .zoom-field, .save-picture");
      let chromeH = 0;
      chrome.forEach(function (el) { chromeH += el.offsetHeight; });
      availW = Math.max(80, (column && column.clientWidth) || Math.min(window.innerWidth, 640));
      availH = Math.max(48, ((column && column.clientHeight) || window.innerHeight) - chromeH);
    }
    let height = availH;
    let width = height * ratio;
    if (width > availW) {
      width = availW;
      height = width / ratio;
    }
    stage.style.width = Math.max(1, Math.round(width * zoom)) + "px";
    stage.style.height = Math.max(1, Math.round(height * zoom)) + "px";
    const bar = shell.querySelector(".stage-save");
    if (bar) bar.style.width = Math.max(1, Math.round(Math.min(width, availW))) + "px";
    layoutBackground();
  }

  function applyZoom(value) {
    const zoom = Math.min(2.5, Math.max(1, Number(value) || 1));
    const stage = shell.querySelector(".stage");
    const fit = shell.querySelector(".stage-fit");
    stage.style.setProperty("--zoom", String(zoom));
    fit.classList.toggle("is-zoomed", zoom > 1.02);
    const readout = shell.querySelector("#zoom-readout");
    if (readout) readout.textContent = zoom <= 1.02 ? "Fit to screen" : Math.round(zoom * 100) + "%";
    const zoomInput = shell.querySelector("#stage-zoom");
    if (zoomInput && document.activeElement !== zoomInput) zoomInput.value = String(zoom);
    fitStage();
  }

  function onInput(event) {
    const target = event.target;
    if (target.id === "scene-name") {
      app.renameScene(target.value);
      return;
    }
    if (target.id === "stage-zoom") {
      applyZoom(target.value);
      return;
    }
    const layer = app.selectedLayer();
    if (target.id === "layer-size" && layer) {
      layer.heightPct = TAS.clamp(target.value, 8, 140);
      const readout = shell.querySelector("#size-readout");
      if (readout) readout.textContent = Math.round(layer.heightPct) + "%";
      app.persistDraft();
      ensureStage();
      return;
    }
    if (target.id === "layer-rotation" && layer) {
      layer.rotation = TAS.clamp(target.value, -18, 18);
      const readout = shell.querySelector("#turn-readout");
      if (readout) readout.textContent = Math.round(layer.rotation) + "°";
      app.persistDraft();
      ensureStage();
      return;
    }
    const background = app.state.scene.background;
    if (!background) return;
    if (target.id === "bg-x") background.focusX = TAS.clamp(target.value, 0, 100);
    if (target.id === "bg-y") background.focusY = TAS.clamp(target.value, 0, 100);
    if (target.id === "bg-scale") {
      background.scale = TAS.clamp(target.value, 100, 300) / 100;
      const readout = shell.querySelector("#bg-zoom-readout");
      if (readout) readout.textContent = Math.round(background.scale * 100) + "%";
    }
    if (target.id === "bg-x" || target.id === "bg-y" || target.id === "bg-scale") {
      app.persistDraft();
      layoutBackground();
    }
  }

  function onChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (event.target.id === "upload-input") app.addUpload(file);
    if (event.target.id === "character-png-input") app.addCharacterFile(file);
    if (event.target.id === "import-input") app.importJson(file);
    event.target.value = "";
    event.stopPropagation();
  }

  function onDoubleClick(event) {
    if (!event.target.closest("#stage")) return;
    if (event.target.closest(".handle, .preview-open")) return;
    if (press && press.moved) return;
    if (press && app.state.selectedLayerId !== press.selected) {
      app.selectLayer(press.selected);
      ensureStage();
      app.persistDraft();
    }
    openPreview();
  }

  function previewBox() {
    const landscape = app.state.scene.format === "landscape";
    const ratio = landscape ? 16 / 9 : 9 / 16;
    const availW = window.innerWidth;
    const availH = window.innerHeight;
    let height = availH;
    let width = height * ratio;
    if (width > availW) {
      width = availW;
      height = width / ratio;
    }
    return {
      width: Math.max(1, Math.floor(width)),
      height: Math.max(1, Math.floor(height))
    };
  }

  function placePreviewBackground() {
    if (!previewClone || !previewClone.isConnected) return;
    const background = previewClone.querySelector(".stage-bg");
    if (!background) return;
    if (!background.naturalWidth) {
      if (background.complete) requestAnimationFrame(placePreviewBackground);
      else background.onload = placePreviewBackground;
      return;
    }
    const frame = app.state.scene.background || {};
    const layout = TAS.backgroundBox(TAS.backgroundFrame(
      previewClone.clientWidth,
      previewClone.clientHeight,
      background.naturalWidth,
      background.naturalHeight,
      frame.scale == null ? 1 : frame.scale,
      frame.focusX,
      frame.focusY
    ));
    background.style.left = layout.x + "px";
    background.style.top = layout.y + "px";
    background.style.width = layout.drawW + "px";
    background.style.height = layout.drawH + "px";
  }

  function layoutPreview() {
    if (!previewClone) return;
    const box = previewBox();
    previewClone.style.width = box.width + "px";
    previewClone.style.height = box.height + "px";
    placePreviewBackground();
  }

  function onPreviewKey(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closePreview();
  }

  function openPreview() {
    const stage = shell && shell.querySelector("#stage");
    if (!stage || document.getElementById("scene-preview")) return;
    const overlay = document.createElement("div");
    overlay.id = "scene-preview";
    overlay.className = "scene-preview";
    const clone = stage.cloneNode(true);
    clone.removeAttribute("id");
    clone.querySelectorAll(".is-selected").forEach(function (node) { node.classList.remove("is-selected"); });
    clone.querySelectorAll(".handle").forEach(function (node) { node.remove(); });
    previewClone = clone;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "preview-close";
    close.textContent = "Close";
    close.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      closePreview();
    });
    overlay.appendChild(clone);
    overlay.appendChild(close);
    document.body.appendChild(overlay);
    layoutPreview();
    overlay.addEventListener("dblclick", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.closest(".stage")) closePreview();
    });
    document.addEventListener("keydown", onPreviewKey, true);
    window.addEventListener("resize", layoutPreview);
  }

  function closePreview() {
    const overlay = document.getElementById("scene-preview");
    if (overlay) overlay.remove();
    previewClone = null;
    document.removeEventListener("keydown", onPreviewKey, true);
    window.removeEventListener("resize", layoutPreview);
  }

  function onPointerDown(event) {
    if (event.target.closest("#bg-x, #bg-y, #bg-scale")) app.remember();
    if (event.target.closest("button, input, label, a") && !event.target.closest(".handle") && !event.target.closest(".layer")) return;
    press = { selected: app.state.selectedLayerId, moved: false };
    const handle = event.target.closest(".handle");
    const layerEl = event.target.closest(".layer");
    const stage = shell.querySelector(".stage");
    if (handle && layerEl) {
      event.preventDefault();
      const layer = app.layerById(layerEl.dataset.layer);
      if (!layer) return;
      app.selectLayer(layer.id);
      ensureStage();
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + (layer.x / 100) * rect.width;
      const centerY = rect.top + (layer.y / 100) * rect.height;
      pointers.set(event.pointerId, {
        mode: "resize",
        id: layer.id,
        cx: centerX,
        cy: centerY,
        dist: Math.max(28, Math.hypot(event.clientX - centerX, event.clientY - centerY)),
        height: layer.heightPct,
        remembered: false
      });
      try { handle.setPointerCapture(event.pointerId); } catch (error) { /* capture is optional */ }
      return;
    }
    if (layerEl && shell.contains(layerEl)) {
      event.preventDefault();
      const layer = app.layerById(layerEl.dataset.layer);
      if (!layer) return;
      app.selectLayer(layer.id);
      ensureStage();
      const rect = stage.getBoundingClientRect();
      pointers.set(event.pointerId, {
        mode: "move",
        id: layer.id,
        rect: rect,
        x: event.clientX,
        y: event.clientY,
        lx: layer.x,
        ly: layer.y,
        remembered: false
      });
      try { layerEl.setPointerCapture(event.pointerId); } catch (error) { /* capture is optional */ }
      if (dock === "adjust") paintDock();
      return;
    }
    if (!event.target.closest(".stage")) return;
    event.preventDefault();
    if (dock !== "backgrounds") {
      app.selectLayer(null);
      ensureStage();
      if (dock === "adjust") paintDock();
      return;
    }
    const frame = app.state.scene.background;
    if (!frame) return;
    pointers.set(event.pointerId, {
      mode: "pan",
      x: event.clientX,
      y: event.clientY,
      focusX: frame.focusX == null ? 50 : frame.focusX,
      focusY: frame.focusY == null ? 50 : frame.focusY,
      remembered: false
    });
  }

  function onPointerMove(event) {
    const drag = pointers.get(event.pointerId);
    if (!drag) return;
    event.preventDefault();
    if (press) press.moved = true;
    if (!drag.remembered) {
      app.remember();
      drag.remembered = true;
    }
    if (drag.mode === "move") {
      const layer = app.layerById(drag.id);
      const node = shell.querySelector('[data-layer="' + drag.id + '"]');
      if (!layer || !node) return;
      layer.x = TAS.clamp(drag.lx + ((event.clientX - drag.x) / drag.rect.width) * 100, -20, 120);
      layer.y = TAS.clamp(drag.ly + ((event.clientY - drag.y) / drag.rect.height) * 100, -20, 120);
      node.style.left = layer.x + "%";
      node.style.top = layer.y + "%";
      return;
    }
    if (drag.mode === "resize") {
      const layer = app.layerById(drag.id);
      const node = shell.querySelector('[data-layer="' + drag.id + '"]');
      if (!layer || !node) return;
      const dist = Math.max(28, Math.hypot(event.clientX - drag.cx, event.clientY - drag.cy));
      layer.heightPct = TAS.clamp(drag.height * (dist / drag.dist), 8, 140);
      node.style.height = layer.heightPct + "%";
      const readout = shell.querySelector("#size-readout");
      const slider = shell.querySelector("#layer-size");
      if (readout) readout.textContent = Math.round(layer.heightPct) + "%";
      if (slider && document.activeElement !== slider) slider.value = String(layer.heightPct);
      return;
    }
    if (drag.mode === "pan") {
      const stage = shell.querySelector(".stage");
      const image = stage.querySelector(".stage-bg");
      const frame = app.state.scene.background;
      if (!image || !image.naturalWidth || !frame) return;
      const layout = TAS.backgroundFrame(stage.clientWidth, stage.clientHeight, image.naturalWidth, image.naturalHeight, frame.scale || 1, 50, 50);
      frame.focusX = TAS.clamp(drag.focusX - ((event.clientX - drag.x) / layout.drawW) * 100, 0, 100);
      frame.focusY = TAS.clamp(drag.focusY - ((event.clientY - drag.y) / layout.drawH) * 100, 0, 100);
      layoutBackground();
      const xSlider = shell.querySelector("#bg-x");
      const ySlider = shell.querySelector("#bg-y");
      if (xSlider && document.activeElement !== xSlider) xSlider.value = String(frame.focusX);
      if (ySlider && document.activeElement !== ySlider) ySlider.value = String(frame.focusY);
    }
  }

  function onPointerUp(event) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    app.persistDraft();
  }

  function exportPng() {
    const size = TAS.exportSize(app.state.scene.format);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    const background = shell.querySelector(".stage-bg");
    const frame = app.state.scene.background;
    const backgroundReady = background && background.complete && background.naturalWidth && frame;
    if (!backgroundReady) {
      context.fillStyle = "#d9d2c6";
      context.fillRect(0, 0, size.width, size.height);
    }
    if (backgroundReady) {
      const layout = TAS.backgroundBox(TAS.backgroundFrame(
        size.width,
        size.height,
        background.naturalWidth,
        background.naturalHeight,
        frame.scale || 1,
        frame.focusX,
        frame.focusY
      ));
      context.drawImage(background, layout.x, layout.y, layout.drawW, layout.drawH);
    }
    let waiting = false;
    app.state.scene.layers.forEach(function (layer) {
      const found = TAS.findArtwork(layer.artworkId);
      const image = shell.querySelector('[data-layer="' + layer.id + '"] img');
      if (!found || !image || !image.complete || !image.naturalWidth) {
        waiting = true;
        return;
      }
      const ratio = image.naturalWidth / image.naturalHeight;
      const imageHeight = (layer.heightPct / 100) * size.height;
      const imageWidth = imageHeight * ratio;
      const cx = (layer.x / 100) * size.width;
      const cy = (layer.y / 100) * size.height;
      if (layer.shadow !== false) {
        context.save();
        context.translate(cx, cy + imageHeight * 0.46);
        context.scale(1, 0.22);
        const radius = imageWidth * 0.42;
        const gradient = context.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        gradient.addColorStop(0, "rgba(28, 23, 18, 0.4)");
        gradient.addColorStop(1, "rgba(28, 23, 18, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      context.save();
      context.translate(cx, cy);
      context.rotate(((layer.rotation || 0) * Math.PI) / 180);
      if (layer.flip) context.scale(-1, 1);
      context.drawImage(image, -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
      context.restore();
    });
    if (waiting) {
      app.notify("A drawing is still preparing. Export the picture again in a moment.");
      return;
    }
    let blob;
    try {
      blob = dataUrlToBlob(canvas.toDataURL("image/png"));
    } catch (error) {
      app.notify("This browser blocked the picture export. Open the studio through the local server and try again.");
      return;
    }
    savePictureFile(blob, fileSlug(app.state.scene.name) + ".png", size);
  }

  function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl).split(",");
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || "image/png";
    const binary = atob(parts[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  function appleTouch() {
    const points = navigator.maxTouchPoints || 0;
    if (points < 1) return false;
    const agent = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(agent)) return true;
    return navigator.platform === "MacIntel" && points > 1;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function showPictureHold(blob, size) {
    const existing = document.getElementById("picture-hold");
    if (existing) existing.remove();
    const url = URL.createObjectURL(blob);
    const hold = document.createElement("div");
    hold.id = "picture-hold";
    hold.className = "picture-hold";
    hold.innerHTML = '<p>Touch and hold the picture, then choose Save Image.</p><img alt="Finished scene" draggable="false"><button type="button">Close</button>';
    hold.querySelector("img").src = url;
    hold.querySelector("button").addEventListener("click", function () {
      URL.revokeObjectURL(url);
      hold.remove();
    });
    document.body.appendChild(hold);
    app.notify("Picture ready at " + size.width + "×" + size.height + ".");
  }

  function savePictureFile(blob, filename, size) {
    const file = new File([blob], filename, { type: "image/png" });
    if (appleTouch() && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: filename }).then(function () {
        app.notify("Picture ready at " + size.width + "×" + size.height + ". Save it from the share sheet.");
      }).catch(function (error) {
        if (error && error.name === "AbortError") return;
        showPictureHold(blob, size);
      });
      return;
    }
    if (appleTouch()) {
      showPictureHold(blob, size);
      return;
    }
    downloadBlob(blob, filename);
    app.notify("Picture exported at " + size.width + "×" + size.height + ".");
  }

  function fileSlug(name) {
    const slug = String(name || "scene").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return slug || "scene";
  }

  function showDock(name) {
    dock = name || "characters";
    if (shell && shell.isConnected) paintDock();
  }

  window.TASEditor = { mount: mount, sync: sync, showDock: showDock };
})();

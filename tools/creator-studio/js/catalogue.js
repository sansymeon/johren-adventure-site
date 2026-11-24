(function () {
  let app = null;
  let shell = null;

  function charactersIn(category) {
    const key = category === "npcs" ? "npc" : category;
    return TAS.characters.filter(function (character) {
      return character.category === key;
    });
  }

  function referenceOf(character) {
    if (!character || !character.referenceArtworkId) return null;
    return character.artworks.find(function (artwork) {
      return artwork.id === character.referenceArtworkId;
    }) || character.artworks[0] || null;
  }

  function manageForm() {
    const options = ['<option value="">New image</option>'];
    TAS.backgrounds.forEach(function (background) {
      options.push('<option value="' + TAS.esc(background.id) + '">Background · ' + TAS.esc(background.name) + "</option>");
    });
    TAS.characters.forEach(function (character) {
      character.artworks.forEach(function (artwork) {
        if (artwork.placeable === false) return;
        options.push('<option value="' + TAS.esc(artwork.id) + '">Character · ' + TAS.esc(character.name + " · " + artwork.label) + "</option>");
      });
    });
    return '<form class="manage-form" id="manage-form">'
      + '<label class="field">Name<input id="manage-name" name="name" type="text" maxlength="80" required></label>'
      + '<label class="field">Kind<select id="manage-kind" name="kind"><option value="background">Background</option><option value="character">Transparent character PNG</option></select></label>'
      + '<label class="field">Replace<select id="manage-replace" name="replaceId">' + options.join("") + "</select></label>"
      + '<label class="field">Image<input id="manage-file" name="file" type="file" accept="image/png,image/jpeg" required></label>'
      + '<button type="submit" class="btn btn-primary">Save to catalogue</button>'
      + '<p class="note" id="manage-status"></p></form>';
  }

  function mount(root, studio) {
    app = studio;
    const category = app.state.catalogueCategory;
    root.innerHTML = ""
      + '<div class="catalogue"><div class="cat-bar">'
      + chips(category)
      + '<input class="search" id="catalogue-search" type="search" placeholder="Search" aria-label="Search this category">'
      + "</div>"
      + intro(category)
      + castChips(category)
      + '<div class="grid' + (category === "backgrounds" ? " bg-grid" : "") + '" id="catalogue-grid">' + grid(category) + "</div>"
      + localUploads(category)
      + inventory()
      + '<dialog class="sheet" id="detail-dialog"><div class="sheet-body" id="detail-body"></div></dialog>'
      + "</div>";
    shell = root.querySelector(".catalogue");
    const search = shell.querySelector("#catalogue-search");
    if (search) search.value = app.state.catalogueQuery || "";
    shell.addEventListener("click", onClick);
    shell.addEventListener("input", onInput);
    shell.addEventListener("submit", onManage);
    applyFilter();
    hydrateImages(shell);
  }

  function chips(category) {
    const items = [
      ["characters", "Characters"],
      ["npcs", "Children"],
      ["backgrounds", "Backgrounds"],
      ["scenes", "Completed Scenes"],
      ["manage", "Manage Images"]
    ];
    return '<div class="cat-list" role="group" aria-label="Asset categories">' + items.map(function (item) {
      return '<button type="button" class="cat-btn" data-action="category" data-category="' + item[0]
        + '" aria-pressed="' + (item[0] === category ? "true" : "false") + '">' + item[1] + "</button>";
    }).join("") + "</div>";
  }

  function castChips(category) {
    if (category !== "characters") return "";
    const cast = app.state.catalogueCast || "turbo";
    const items = [["turbo", "Turbo"], ["featured", "Other characters"]];
    return '<div class="seg" role="group" aria-label="Character groups">' + items.map(function (item) {
      return '<button type="button" data-action="cast" data-cast="' + item[0] + '" aria-selected="' + (item[0] === cast ? "true" : "false") + '">' + item[1] + "</button>";
    }).join("") + "</div>";
  }

  function intro(category) {
    if (category === "characters") {
      return app.state.catalogueCast === "featured"
        ? '<p class="lede">Other featured mascots. Tap one for the official record and its approved drawings.</p>'
        : '<p class="lede">Turbo No. 32. Tap him for the official record, then choose a pose or costume.</p>';
    }
    if (category === "npcs") {
      return '<p class="lede">Child supporting characters. Place an individual view. A reference sheet stays in the record and is not a scene layer.</p>';
    }
    if (category === "scenes") {
      return '<p class="lede">Finished pictures. View them here and save a copy to this device. They are not editable layered scenes.</p>';
    }
    if (category === "manage") {
      return '<p class="lede">Add a background or a transparent character PNG. Replacing an image keeps its catalogue id, so saved scenes still use it.</p>';
    }
    return '<p class="lede">Portrait photographs fill the scene. The 16:9 pictures slide and zoom inside that frame and are not cropped.</p>';
  }

  function grid(category) {
    if (category === "manage") return manageForm();
    if (category === "scenes") {
      return TAS.completedScenes.map(function (scene) {
        return ''
          + '<button type="button" class="card" data-action="open-scene" data-id="' + scene.id + '" data-search="' + TAS.esc(scene.name) + '">'
          + '<span class="card-figure bg-figure"><img src="' + TAS.esc(TAS.fileUrl(scene.file)) + '" alt="" loading="lazy"></span>'
          + '<span class="card-body"><h3>' + TAS.esc(scene.name) + "</h3><p>Finished picture</p></span></button>";
      }).join("");
    }
    if (category === "backgrounds") {
      return TAS.backgrounds.map(function (background) {
        const shape = TAS.ratioLabel(background.width, background.height);
        const frame = shape === "16:9" ? "bg-landscape" : (shape === "3:4" ? "bg-file" : "bg-portrait");
        return ''
          + '<button type="button" class="card" data-action="open-background" data-id="' + background.id + '" data-search="' + TAS.esc(background.name + " " + shape) + '">'
          + '<span class="card-figure ' + frame + '"><img src="' + TAS.esc(TAS.fileUrl(background.file)) + '" alt="" loading="lazy"></span>'
          + '<span class="card-body"><h3>' + TAS.esc(background.name) + "</h3><p>" + shape + "</p></span></button>";
      }).join("");
    }
    const group = category === "characters" ? (app.state.catalogueCast || "turbo") : category;
    return charactersIn(group).map(function (character) {
      const artwork = referenceOf(character);
      const missing = artwork ? "" : " is-missing";
      const figure = artwork
        ? '<span class="card-figure"><img alt="" loading="lazy" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '">'
          + (character.number ? '<span class="number-badge">' + TAS.esc(character.number) + "</span>" : "")
          + "</span>"
        : '<span class="card-figure"><span class="missing-label">No picture</span></span>';
      const drawings = character.artworks.filter(function (item) { return item.placeable !== false; });
      const count = drawings.length === 1 ? "1 drawing" : drawings.length + " drawings";
      return ''
        + '<button type="button" class="card' + missing + '" data-action="open-character" data-id="' + character.id + '" data-search="' + TAS.esc(character.name + " " + character.description) + '">'
        + figure
        + '<span class="card-body"><h3>' + TAS.esc(character.name) + "</h3><p>" + count + "</p></span></button>";
    }).join("");
  }

  function localUploads(category) {
    if (category !== "backgrounds") return "";
    const cards = app.state.uploads.map(function (upload) {
      const url = app.state.uploadUrls[upload.id] || "";
      return ''
        + '<article class="card" data-search="' + TAS.esc(upload.name) + '">'
        + '<button type="button" class="card" data-action="use-upload" data-id="' + upload.id + '">'
        + '<span class="card-figure bg-file"><img src="' + TAS.esc(url) + '" alt=""></span>'
        + '<span class="card-body"><h3>' + TAS.esc(upload.name) + "</h3><p>On this phone</p></span></button>"
        + '<button type="button" class="textish" data-action="delete-upload" data-id="' + upload.id + '">Remove</button></article>';
    }).join("");
    return '<h2 class="subhead">On this phone</h2><p class="lede">A test photograph stays in this browser.</p>'
      + '<label class="btn file-btn">Add a photograph<input id="upload-input" type="file" accept="image/*" hidden></label>'
      + '<div class="grid">' + cards + "</div>";
  }

  function inventory() {
    const notes = TAS.inventory.notes.map(function (note) {
      return "<li>" + TAS.esc(note) + "</li>";
    }).join("");
    return '<details class="inventory"><summary>Local inventory</summary><ul>' + notes + "</ul></details>";
  }

  function openCharacter(id) {
    const character = TAS.findCharacter(id);
    if (!character) return;
    app.state.selectedCharacterId = id;
    const dialog = shell.querySelector("#detail-dialog");
    dialog.querySelector("#detail-body").innerHTML = characterDetail(character);
    hydrateImages(dialog);
    if (!dialog.open) dialog.showModal();
  }

  function openBackground(id) {
    const background = TAS.findBackground(id);
    if (!background) return;
    app.state.selectedBackgroundId = id;
    const dialog = shell.querySelector("#detail-dialog");
    dialog.querySelector("#detail-body").innerHTML = backgroundDetail(background);
    if (!dialog.open) dialog.showModal();
  }

  function closeDialog() {
    const dialog = shell.querySelector("#detail-dialog");
    if (dialog && dialog.open) dialog.close();
  }

  function characterDetail(character) {
    const artwork = referenceOf(character);
    const figure = artwork
      ? '<div class="detail-figure"><img alt="" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '"></div>'
      : '<div class="detail-figure"><p>No reference image in the local folder.</p></div>';
    const rows = [
      ["Character ID", character.id],
      ["Name", character.number ? character.name + " · No. " + character.number : character.name],
      ["Role", character.ageGroup === "child" ? "Child supporting character" : "Featured mascot"],
      ["Description", character.description],
      ["Personality", character.personality || "—"],
      ["Creator", character.creator],
      ["Approval", character.approval],
      ["Licensing", character.license]
    ];
    const meta = rows.map(function (row) {
      return "<div><dt>" + row[0] + "</dt><dd>" + TAS.esc(row[1]) + "</dd></div>";
    }).join("");
    const kicker = character.category === "npc" ? "Children" : character.category === "turbo" ? "Turbo" : "Featured";
    return '<div class="sheet-head"><div><p class="kicker">' + kicker + "</p><h2>" + TAS.esc(character.name) + "</h2></div>"
      + '<button type="button" class="btn" data-action="close-detail">Close</button></div>'
      + figure
      + (character.filesNote ? '<p class="note">' + TAS.esc(character.filesNote) + "</p>" : "")
      + '<dl class="meta">' + meta + "</dl>"
      + artworksBlock(character);
  }

  function artworksBlock(character) {
    const placeable = character.artworks.filter(function (artwork) { return artwork.placeable !== false; });
    const sheets = character.artworks.filter(function (artwork) { return artwork.placeable === false; });
    const film = placeable.map(function (artwork) {
      const flags = [];
      if (artwork.id === character.referenceArtworkId) flags.push("reference");
      if (artwork.extra) flags.push("extra");
      if (!artwork.alpha) flags.push("matte hidden in scenes");
      return ''
        + '<button type="button" class="pose' + (artwork.id === character.referenceArtworkId ? " is-reference" : "") + '" data-action="place-artwork" data-id="' + artwork.id + '">'
        + '<span class="pose-frame"><img alt="" data-cutout="' + TAS.esc(TAS.fileUrl(artwork.file)) + '"></span>'
        + '<span class="pose-label">' + TAS.esc(artwork.label) + (flags.length ? " · " + flags.join(", ") : "") + "</span></button>";
    }).join("");
    const references = sheets.map(function (artwork) {
      return '<figure class="pose is-sheet"><span class="pose-frame"><img alt="" src="' + TAS.esc(TAS.fileUrl(artwork.file)) + '"></span>'
        + '<figcaption class="pose-label">' + TAS.esc(artwork.label) + " · not a scene layer</figcaption></figure>";
    }).join("");
    return "<h3>Poses and costumes</h3><p class=\"note\">Placing a drawing does not change the file.</p><div class=\"film\">" + film + "</div>"
      + (references ? "<h3>Reference sheet</h3>" + references : "");
  }

  function backgroundDetail(background) {
    return ''
      + '<div class="sheet-head"><div><p class="kicker">Background</p><h2>' + TAS.esc(background.name) + '</h2></div>'
      + '<button type="button" class="btn" data-action="close-detail">Close</button></div>'
      + '<div class="detail-figure ' + (TAS.ratioLabel(background.width, background.height) === "16:9" ? "is-landscape" : "is-portrait") + '"><img src="' + TAS.esc(TAS.fileUrl(background.file)) + '" alt="' + TAS.esc(background.name) + '"></div>'
      + '<p class="note">' + (TAS.ratioLabel(background.width, background.height) === "9:16"
        ? "This photograph is already 9:16 and fills a portrait scene."
        : "This photograph stays intact. The portrait frame shows a movable window of it.") + "</p>"
      + '<dl class="meta">'
      + "<div><dt>ID</dt><dd>" + TAS.esc(background.id) + "</dd></div>"
      + "<div><dt>Description</dt><dd>" + TAS.esc(background.description) + "</dd></div>"
      + "<div><dt>Shape</dt><dd>" + TAS.esc(TAS.ratioLabel(background.width, background.height)) + "</dd></div>"
      + "<div><dt>Licensing</dt><dd>" + TAS.esc(background.license) + "</dd></div>"
      + "</dl>"
      + '<div class="btn-row"><button type="button" class="btn btn-primary" data-action="use-background" data-id="' + background.id + '">Use in scene</button></div>';
  }

  function openCompleted(id) {
    const scene = TAS.findCompletedScene(id);
    if (!scene) return;
    const dialog = shell.querySelector("#detail-dialog");
    const url = TAS.fileUrl(scene.file);
    dialog.querySelector("#detail-body").innerHTML = ''
      + '<div class="sheet-head"><div><p class="kicker">Completed scene</p><h2>' + TAS.esc(scene.name) + '</h2></div>'
      + '<button type="button" class="btn" data-action="close-detail">Close</button></div>'
      + '<div class="detail-figure"><img src="' + TAS.esc(url) + '" alt="' + TAS.esc(scene.name) + '"></div>'
      + '<p class="note">This is a finished picture. It is not opened as separate characters and a background.</p>'
      + '<div class="btn-row"><a class="btn btn-primary" href="' + TAS.esc(url) + '" download>Save picture to device</a></div>';
    if (!dialog.open) dialog.showModal();
  }

  function hydrateImages(scope) {
    scope.querySelectorAll("img[data-cutout]").forEach(function (image) {
      const source = image.dataset.cutout;
      TASCutout.prepare(source).then(function (url) {
        if (image.dataset.cutout === source) image.src = url;
      });
    });
  }

  function applyFilter() {
    const query = (app.state.catalogueQuery || "").trim().toLowerCase();
    shell.querySelectorAll("[data-search]").forEach(function (node) {
      const hay = (node.dataset.search || "").toLowerCase();
      node.hidden = !!query && hay.indexOf(query) === -1;
    });
  }

  function onManage(event) {
    if (!event.target || event.target.id !== "manage-form") return;
    event.preventDefault();
    const form = event.target;
    const status = form.querySelector("#manage-status");
    const data = new FormData(form);
    const file = data.get("file");
    const kind = data.get("kind");
    const replaceId = data.get("replaceId") || "";
    if (!file || !file.size) {
      status.textContent = "Choose an image file.";
      return;
    }
    if (kind === "character" && !/\.png$/i.test(file.name)) {
      status.textContent = "A character must be a PNG.";
      return;
    }
    if (replaceId) {
      const existingKind = TAS.findBackground(replaceId) ? "background" : (TAS.findArtwork(replaceId) ? "character" : "");
      if (existingKind && existingKind !== kind) {
        status.textContent = "Replace a background with a background, or a character with a character.";
        return;
      }
    }
    status.textContent = "Saving…";
    fetch("/api/catalogue/library", { method: "POST", body: data })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) throw new Error(body.error || "Save failed");
          return body;
        });
      })
      .then(function (body) {
        TAS.applyStudioLibrary(body.library);
        status.textContent = "Saved. It is in the catalogue and the Scene Editor.";
        form.reset();
      })
      .catch(function (error) {
        status.textContent = error.message || "The image could not be saved.";
      });
  }

  function onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !shell.contains(button)) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === "category") {
      closeDialog();
      app.setCategory(button.dataset.category);
      return;
    }
    if (action === "cast") {
      closeDialog();
      app.state.catalogueCast = button.dataset.cast === "featured" ? "featured" : "turbo";
      app.setCategory("characters");
      return;
    }
    if (action === "open-character") openCharacter(id);
    if (action === "open-scene") openCompleted(id);
    if (action === "open-background") openBackground(id);
    if (action === "close-detail") closeDialog();
    if (action === "place-artwork") {
      closeDialog();
      app.placeArtwork(id);
    }
    if (action === "use-background") {
      closeDialog();
      app.useBackground(id);
    }
    if (action === "use-upload") app.useUpload(id);
    if (action === "delete-upload") app.deleteUpload(id);
  }

  function onInput(event) {
    if (event.target.id !== "catalogue-search") return;
    app.state.catalogueQuery = event.target.value;
    applyFilter();
  }

  window.TASCatalogue = {
    mount: mount,
    refreshSelection: function () {}
  };
})();

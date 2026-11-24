(function () {
  var STORAGE_KEY = "tas.puzzlePrototype.v1";
  // preferredPiece is a hint for which region a merchant would award.
  // The core region is never given until every other piece is already open.
  var MERCHANTS = [
    { id: "harbour-tea", name: "Harbour Tea Room", place: "North Pier", preferredPiece: 0 },
    { id: "clocktower-books", name: "Clocktower Books", place: "Market Square", preferredPiece: 1 },
    { id: "lantern-noodles", name: "Lantern Noodle Bar", place: "Lantern Lane", preferredPiece: 2 },
    { id: "marble-post", name: "Marble Post", place: "Palace Gate", preferredPiece: 3 },
    { id: "pier-sweets", name: "Pier Sweet Shop", place: "South Pier", preferredPiece: 4 }
  ];
  // Regions are fractions of the picture, so the same rules apply to any image.
  // The final piece is the region whose centroid is closest to the image center.
  // A region may set finalPiece: true to choose the last reveal by hand
  // (another layout, a sponsored puzzle, or a publisher's pick).
  var PIECE_REGIONS = [
    { role: "top", box: [0, 0, 0.5, 0.34] },
    { role: "top", box: [0.5, 0, 1, 0.34] },
    { role: "core", box: [0, 0.34, 1, 0.67] },
    { role: "bottom", box: [0, 0.67, 0.5, 1] },
    { role: "bottom", box: [0.5, 0.67, 1, 1] }
  ];

  var host = null;
  var listening = false;
  var screen = "builder";
  var draft = {
    title: "",
    characterName: "Turbo",
    location: "Test Harbour — North Pier",
    image: "",
    sourceName: ""
  };
  var revealTimer = 0;

  function emptyStore() {
    return { definitions: [], progress: {}, collection: [], activeId: "" };
  }

  function loadStore() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
      if (!parsed || !parsed.definitions) return emptyStore();
      parsed.progress = parsed.progress || {};
      parsed.collection = parsed.collection || [];
      return parsed;
    } catch (error) {
      return emptyStore();
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function activePuzzle(store) {
    return store.definitions.find(function (item) { return item.id === store.activeId; }) || null;
  }

  function progressFor(store, id) {
    if (!store.progress[id]) store.progress[id] = { awards: {} };
    if (!store.progress[id].awards) store.progress[id].awards = {};
    return store.progress[id];
  }

  function awardedPieces(progress) {
    var pieces = [];
    Object.keys(progress.awards).forEach(function (merchantId) {
      pieces.push(progress.awards[merchantId]);
    });
    return pieces;
  }

  function awardVisit(merchantId) {
    var merchant = MERCHANTS.find(function (item) { return item.id === merchantId; });
    if (!merchant) return { ok: false, reason: "unknown-merchant" };
    var store = loadStore();
    var puzzle = activePuzzle(store);
    if (!puzzle) return { ok: false, reason: "no-puzzle" };
    var progress = progressFor(store, puzzle.id);
    if (Object.prototype.hasOwnProperty.call(progress.awards, merchantId)) {
      return {
        ok: false,
        reason: "repeat",
        pieceIndex: progress.awards[merchantId],
        count: awardedPieces(progress).length,
        completed: awardedPieces(progress).length >= MERCHANTS.length
      };
    }
    var pieceIndex = nextPieceIndex(progress, merchant, puzzle);
    progress.awards[merchantId] = pieceIndex;
    var count = awardedPieces(progress).length;
    var completed = count >= MERCHANTS.length;
    if (completed && !progress.completedAt) progress.completedAt = Date.now();
    saveStore(store);
    return { ok: true, pieceIndex: pieceIndex, count: count, completed: completed, merchant: merchant };
  }

  function resetAdventure() {
    var store = loadStore();
    if (!store.activeId) return { ok: false, reason: "no-puzzle" };
    store.progress[store.activeId] = { awards: {} };
    saveStore(store);
    return { ok: true };
  }

  function collectAdventure() {
    var store = loadStore();
    var puzzle = activePuzzle(store);
    if (!puzzle) return { ok: false, reason: "no-puzzle" };
    var progress = progressFor(store, puzzle.id);
    if (awardedPieces(progress).length < MERCHANTS.length) return { ok: false, reason: "incomplete" };
    var existing = store.collection.find(function (item) { return item.puzzleId === puzzle.id; });
    var record = existing || { id: TAS.uid(), puzzleId: puzzle.id };
    record.title = puzzle.title;
    record.characterName = puzzle.characterName || "";
    record.location = puzzle.location || "";
    record.image = puzzle.image;
    record.completedAt = progress.completedAt || Date.now();
    if (!existing) store.collection.unshift(record);
    saveStore(store);
    return { ok: true, record: record };
  }

  window.TASPuzzleUnlock = {
    merchants: MERCHANTS.map(function (merchant) { return { id: merchant.id, name: merchant.name, place: merchant.place }; }),
    awardVisit: awardVisit,
    resetAdventure: resetAdventure,
    collectAdventure: collectAdventure
  };

  function defaultPieces() {
    var scored = PIECE_REGIONS.map(function (region, index) {
      var box = region.box;
      return {
        index: index,
        role: region.role,
        distance: Math.hypot((box[0] + box[2]) / 2 - 0.5, (box[1] + box[3]) / 2 - 0.5),
        authoredFinal: region.finalPiece === true
      };
    });
    var authored = scored.filter(function (piece) { return piece.authoredFinal; });
    var core = authored[0] || scored.slice().sort(function (a, b) {
      return a.distance - b.distance || a.index - b.index;
    })[0];
    var priority = 1;
    return scored.map(function (piece) {
      var finalPiece = piece === core;
      return {
        index: piece.index,
        role: finalPiece ? "core" : piece.role,
        unlockPriority: finalPiece ? scored.length : priority++,
        finalPiece: finalPiece
      };
    });
  }

  function piecePlan(puzzle) {
    var stored = puzzle && puzzle.pieces;
    if (!stored || stored.length !== MERCHANTS.length) return defaultPieces();
    var usable = stored.every(function (piece) {
      return piece && typeof piece.index === "number" && typeof piece.unlockPriority === "number";
    }) && stored.some(function (piece) { return piece.finalPiece; });
    return usable ? stored : defaultPieces();
  }

  function nextPieceIndex(progress, merchant, puzzle) {
    var taken = {};
    awardedPieces(progress).forEach(function (index) { taken[index] = true; });
    var remaining = piecePlan(puzzle).filter(function (piece) { return !taken[piece.index]; });
    var outers = remaining.filter(function (piece) { return !piece.finalPiece; });
    var pool = outers.length ? outers : remaining;
    var preferred = pool.find(function (piece) { return piece.index === merchant.preferredPiece; });
    if (preferred) return preferred.index;
    pool.sort(function (a, b) { return a.unlockPriority - b.unlockPriority; });
    return pool[0].index;
  }

  function round(number) {
    return Math.round(number * 10) / 10;
  }

  function point(x, y) {
    return round(x) + " " + round(y);
  }

  function edge(x1, y1, x2, y2, bx, by) {
    if (!bx && !by) return "L " + point(x2, y2);
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var depth = Math.min(78, len * 0.2);
    function at(t, off) {
      return [x1 + dx * t + bx * off, y1 + dy * t + by * off];
    }
    var a = at(0.33, 0);
    var c1 = at(0.36, depth * 0.35);
    var c2 = at(0.44, depth * 1.05);
    var tip = at(0.5, depth * 1.15);
    var c3 = at(0.56, depth * 1.05);
    var c4 = at(0.64, depth * 0.35);
    var b = at(0.67, 0);
    return "L " + point(a[0], a[1])
      + " C " + point(c1[0], c1[1]) + " " + point(c2[0], c2[1]) + " " + point(tip[0], tip[1])
      + " C " + point(c3[0], c3[1]) + " " + point(c4[0], c4[1]) + " " + point(b[0], b[1])
      + " L " + point(x2, y2);
  }

  function piecePaths(width, height) {
    var mid = width / 2;
    var upper = height * 0.34;
    var lower = height * 0.67;
    return [
      "M " + point(0, 0) + " " + edge(0, 0, mid, 0, 0, 0) + " " + edge(mid, 0, mid, upper, 1, 0) + " " + edge(mid, upper, 0, upper, 0, 1) + " " + edge(0, upper, 0, 0, 0, 0) + " Z",
      "M " + point(mid, 0) + " " + edge(mid, 0, width, 0, 0, 0) + " " + edge(width, 0, width, upper, 0, 0) + " " + edge(width, upper, mid, upper, 0, -1) + " " + edge(mid, upper, mid, 0, 1, 0) + " Z",
      "M " + point(0, upper) + " " + edge(0, upper, mid, upper, 0, 1) + " " + edge(mid, upper, width, upper, 0, -1) + " " + edge(width, upper, width, lower, 0, 0) + " " + edge(width, lower, mid, lower, 0, 1) + " " + edge(mid, lower, 0, lower, 0, -1) + " " + edge(0, lower, 0, upper, 0, 0) + " Z",
      "M " + point(0, lower) + " " + edge(0, lower, mid, lower, 0, -1) + " " + edge(mid, lower, mid, height, -1, 0) + " " + edge(mid, height, 0, height, 0, 0) + " " + edge(0, height, 0, lower, 0, 0) + " Z",
      "M " + point(mid, lower) + " " + edge(mid, lower, width, lower, 0, 1) + " " + edge(width, lower, width, height, 0, 0) + " " + edge(width, height, mid, height, 0, 0) + " " + edge(mid, height, mid, lower, -1, 0) + " Z"
    ];
  }

  function packImage(image) {
    var maxWidth = 720;
    var scale = Math.min(1, maxWidth / image.naturalWidth);
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return { href: canvas.toDataURL("image/jpeg", 0.86), width: canvas.width, height: canvas.height };
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("image")); };
      image.src = src;
    });
  }

  function boardMarkup(image, unlocked, freshIndex, complete) {
    var paths = piecePaths(image.width, image.height);
    var clips = paths.map(function (path, index) {
      return '<clipPath id="puzzle-clip-' + index + '" clipPathUnits="userSpaceOnUse"><path d="' + path + '"/></clipPath>';
    }).join("");
    var seams = paths.map(function (path) {
      return '<path class="puzzle-seam" d="' + path + '"/>';
    }).join("");
    var pieces = paths.map(function (path, index) {
      var on = unlocked.indexOf(index) !== -1 || complete;
      var fresh = freshIndex === index;
      var cls = "puzzle-piece" + (on ? " is-on" : "") + (fresh ? " is-new" : "");
      return '<g class="' + cls + '" clip-path="url(#puzzle-clip-' + index + ')">'
        + '<image href="' + image.href + '" x="0" y="0" width="' + image.width + '" height="' + image.height + '" preserveAspectRatio="none"/>'
        + "</g>";
    }).join("");
    var whole = complete
      ? '<image class="puzzle-whole" href="' + image.href + '" x="0" y="0" width="' + image.width + '" height="' + image.height + '" preserveAspectRatio="none"/>'
      : "";
    return '<svg class="puzzle-board" viewBox="0 0 ' + image.width + " " + image.height + '" role="img" aria-label="Five piece adventure">'
      + "<defs>" + clips + "</defs>"
      + pieces
      + seams
      + whole
      + "</svg>";
  }

  function setStatus(message) {
    var node = host.querySelector("[data-puzzle-status]");
    if (!node) return;
    node.textContent = message || "";
  }

  function celebrate() {
    var frame = host.querySelector(".puzzle-phone");
    if (!frame) return;
    var burst = document.createElement("div");
    burst.className = "puzzle-confetti";
    burst.setAttribute("aria-hidden", "true");
    var colors = ["#c83b32", "#e7c27a", "#f3eee4", "#8d6b38", "#fffaf4"];
    for (var i = 0; i < 28; i += 1) {
      var bit = document.createElement("i");
      bit.style.left = Math.round(8 + Math.random() * 84) + "%";
      bit.style.background = colors[i % colors.length];
      bit.style.animationDelay = (Math.random() * 0.25) + "s";
      bit.style.transform = "rotate(" + Math.round(Math.random() * 80) + "deg)";
      burst.appendChild(bit);
    }
    frame.appendChild(burst);
    window.setTimeout(function () { burst.remove(); }, 1700);
  }

  function paint() {
    if (!host) return;
    if (screen === "collection") host.innerHTML = collectionHtml();
    else if (screen === "adventure") host.innerHTML = adventureHtml();
    else host.innerHTML = builderHtml();
    if (screen === "adventure") {
      var store = loadStore();
      var puzzle = activePuzzle(store);
      var progress = puzzle ? progressFor(store, puzzle.id) : null;
      if (progress && awardedPieces(progress).length >= MERCHANTS.length) celebrate();
    }
  }

  function builderHtml() {
    var scenes = (window.TAS && TAS.completedScenes ? TAS.completedScenes : []).map(function (scene) {
      var selected = draft.sourceName === scene.name && draft.image ? " is-selected" : "";
      return '<button type="button" class="puzzle-source' + selected + '" data-puzzle="use-scene" data-id="' + TAS.esc(scene.id) + '">'
        + '<img alt="" src="' + TAS.esc(TAS.fileUrl(scene.file)) + '">'
        + "<span>" + TAS.esc(scene.name) + "</span></button>";
    }).join("");
    var preview = draft.image
      ? '<img class="puzzle-preview-img" alt="Selected puzzle picture" src="' + draft.image + '">'
      : '<p class="puzzle-empty">Choose a completed picture, or import one from this device.</p>';
    return '<div class="puzzle-app"><header class="puzzle-head"><p class="puzzle-kicker">Puzzle Builder</p>'
      + "<h1>Five-piece adventure</h1>"
      + "<p>Turn one finished picture into a collectible. The Scene Editor is unchanged.</p></header>"
      + '<div class="puzzle-builder"><section class="puzzle-phone puzzle-phone-builder">' + preview + "</section>"
      + '<form class="puzzle-form" data-puzzle-form="builder">'
      + '<label>Puzzle title<input name="title" maxlength="80" value="' + TAS.esc(draft.title) + '" placeholder="Harbour morning"></label>'
      + '<label>Character name<input name="characterName" maxlength="80" value="' + TAS.esc(draft.characterName) + '" placeholder="Turbo"></label>'
      + '<label>Discovery location<input name="location" maxlength="120" value="' + TAS.esc(draft.location) + '"></label>'
      + "<h2>Completed pictures</h2><div class=\"puzzle-sources\">" + scenes + "</div>"
      + '<label class="puzzle-import">Import a local image<input name="file" type="file" accept="image/*"></label>'
      + '<div class="puzzle-actions"><button type="button" class="btn btn-primary" data-puzzle="create"' + (draft.image ? "" : " disabled") + ">Create Puzzle</button>"
      + '<button type="button" class="btn" data-puzzle="test"' + (activePuzzle(loadStore()) ? "" : " disabled") + ">Test Adventure</button>"
      + '<button type="button" class="btn" data-puzzle="collection">My Collection</button></div>'
      + '<p class="puzzle-status" data-puzzle-status></p></form></div></div>';
  }

  function adventureHtml() {
    var store = loadStore();
    var puzzle = activePuzzle(store);
    if (!puzzle) {
      return '<div class="puzzle-app"><p>Create a puzzle first.</p><button type="button" class="btn" data-puzzle="builder">Puzzle Builder</button></div>';
    }
    var progress = progressFor(store, puzzle.id);
    var unlocked = awardedPieces(progress);
    var count = unlocked.length;
    var complete = count >= MERCHANTS.length;
    var merchants = MERCHANTS.map(function (merchant) {
      var owned = Object.prototype.hasOwnProperty.call(progress.awards, merchant.id);
      return '<article class="merchant' + (owned ? " is-visited" : "") + '"><h3>' + TAS.esc(merchant.name) + "</h3>"
        + "<p>" + TAS.esc(merchant.place) + "</p>"
        + '<button type="button" class="btn" data-puzzle="visit" data-merchant="' + merchant.id + '">'
        + (owned ? "Already visited" : "Simulate QR Visit") + "</button></article>";
    }).join("");
    var finale = complete
      ? '<div class="puzzle-finale"><p>The adventure is complete.</p><button type="button" class="btn btn-primary" data-puzzle="collect">Collect Your Adventure</button></div>'
      : "";
    return '<div class="puzzle-app puzzle-play"><div class="puzzle-phone">'
      + boardMarkup({ href: puzzle.image, width: puzzle.width, height: puzzle.height }, unlocked, -1, complete)
      + finale
      + "</div><aside class=\"puzzle-merchants\"><p class=\"puzzle-kicker\">Test visits</p><h1>" + TAS.esc(puzzle.title) + "</h1>"
      + '<p class="puzzle-progress" data-puzzle-progress>' + count + " / " + MERCHANTS.length + "</p>"
      + '<div class="merchant-list">' + merchants + "</div>"
      + '<div class="puzzle-actions"><button type="button" class="btn" data-puzzle="reset">Reset Adventure</button>'
      + '<button type="button" class="btn" data-puzzle="builder">Puzzle Builder</button>'
      + '<button type="button" class="btn" data-puzzle="collection">My Collection</button></div>'
      + '<p class="puzzle-status" data-puzzle-status>Each merchant can award one piece, in any order. The center piece is saved for the last visit.</p></aside></div>';
  }

  function collectionHtml() {
    var store = loadStore();
    var cards = store.collection.length
      ? store.collection.map(function (item) {
        var when = new Date(item.completedAt).toLocaleDateString();
        var character = item.characterName ? "<p>" + TAS.esc(item.characterName) + "</p>" : "";
        return '<article class="collection-card"><img alt="" src="' + item.image + '"><div><h2>' + TAS.esc(item.title) + "</h2>"
          + character + "<p>" + TAS.esc(item.location) + "</p><p>" + TAS.esc(when) + "</p></div></article>";
      }).join("")
      : '<p class="puzzle-empty">Completed adventures will be kept in this browser.</p>';
    return '<div class="puzzle-app"><header class="puzzle-head"><p class="puzzle-kicker">My Collection</p><h1>Collected adventures</h1></header>'
      + '<div class="collection-list">' + cards + "</div>"
      + '<button type="button" class="btn" data-puzzle="builder">Puzzle Builder</button></div>';
  }

  function readForm() {
    var form = host.querySelector("[data-puzzle-form]");
    if (!form) return;
    draft.title = form.elements.title.value;
    draft.characterName = form.elements.characterName.value;
    draft.location = form.elements.location.value;
  }

  function usePacked(packed, sourceName, title) {
    draft.image = packed.href;
    draft.width = packed.width;
    draft.height = packed.height;
    draft.sourceName = sourceName;
    if (!draft.title) draft.title = title || sourceName || "Untitled adventure";
    paint();
  }

  function createPuzzle() {
    readForm();
    if (!draft.image) {
      setStatus("Choose a picture first.");
      return;
    }
    var store = loadStore();
    var puzzle = {
      id: TAS.uid(),
      title: (draft.title || "Untitled adventure").trim(),
      characterName: (draft.characterName || "").trim(),
      location: (draft.location || "Test location").trim(),
      image: draft.image,
      width: draft.width,
      height: draft.height,
      pieces: defaultPieces(),
      created: Date.now()
    };
    try {
      store.definitions.unshift(puzzle);
      store.activeId = puzzle.id;
      store.progress[puzzle.id] = { awards: {} };
      saveStore(store);
    } catch (error) {
      store.definitions.shift();
      paint();
      setStatus("This browser could not store the picture. Try one smaller image.");
      return;
    }
    paint();
    setStatus("Puzzle created. Test Adventure is ready.");
  }

  function onClick(event) {
    var button = event.target.closest("[data-puzzle]");
    if (!button || !host.contains(button)) return;
    var action = button.dataset.puzzle;
    if (action === "builder") { screen = "builder"; paint(); return; }
    if (action === "collection") { screen = "collection"; paint(); return; }
    if (action === "use-scene") {
      readForm();
      var scene = TAS.completedScenes.find(function (item) { return item.id === button.dataset.id; });
      if (!scene) return;
      loadImage(TAS.fileUrl(scene.file)).then(function (image) {
        var packed = packImage(image);
        if (!draft.title) draft.title = scene.name;
        if (!draft.characterName) draft.characterName = "Turbo";
        usePacked(packed, scene.name, scene.name);
      }).catch(function () {
        setStatus("That picture could not be opened.");
      });
      return;
    }
    if (action === "create") createPuzzle();
    if (action === "test") {
      if (!activePuzzle(loadStore())) {
        setStatus("Create a puzzle before testing it.");
        return;
      }
      screen = "adventure";
      paint();
      return;
    }
    if (action === "visit") {
      var result = awardVisit(button.dataset.merchant);
      var named = MERCHANTS.find(function (item) { return item.id === button.dataset.merchant; });
      paint();
      if (!result.ok && result.reason === "repeat") {
        setStatus((named ? named.name : "This merchant") + " was already visited. The piece stays unlocked.");
        return;
      }
      if (!result.ok) {
        setStatus("Create a puzzle before simulating a visit.");
        return;
      }
      var piece = host.querySelectorAll(".puzzle-piece")[result.pieceIndex];
      if (piece) piece.classList.add("is-new");
      setStatus((named ? named.name : "A merchant") + " awarded a piece. " + result.count + " / " + MERCHANTS.length);
      return;
    }
    if (action === "reset") {
      resetAdventure();
      paint();
      setStatus("Visit progress for this puzzle was cleared. Collected adventures were kept.");
      return;
    }
    if (action === "collect") {
      var saved = collectAdventure();
      if (!saved.ok) {
        setStatus("Collect the five pieces first.");
        return;
      }
      screen = "collection";
      paint();
    }
  }

  function onInput(event) {
    if (event.target.name === "file" && event.target.files && event.target.files[0]) {
      readForm();
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function () {
        loadImage(String(reader.result)).then(function (image) {
          usePacked(packImage(image), file.name, file.name.replace(/\.[^.]+$/, ""));
        }).catch(function () {
          setStatus("That file could not be read as an image.");
        });
      };
      reader.readAsDataURL(file);
      return;
    }
    if (event.target.form && event.target.form.dataset.puzzleForm) readForm();
  }

  function mount(root) {
    host = root;
    if (!listening) {
      root.addEventListener("click", onClick);
      root.addEventListener("input", onInput);
      root.addEventListener("change", onInput);
      listening = true;
    }
    paint();
  }

  window.TASPuzzle = { mount: mount };
})();

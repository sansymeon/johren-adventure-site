# Turbo Adventures Japan

The public website lives in `site/`. Japanese is the default. English is under `/en/`, `/map/index-en.html`, and `/create/index-en.html`.

The older Johren pages remain in this repository and are not part of `site/`. They are not the public homepage.

The live site is `site/`. Deploy only with `netlify --dir=site`. Pin WebP files are a separate untracked issue.

`site/` is the authoritative website directory. The obsolete repository-root Johren homepage (`index.html`) is archived at `archive/johren-homepage/`. It is not served as `/`.

## Local development

From this directory:

```
./dev.sh
```

Open http://127.0.0.1:8765/

Stop the server with Ctrl+C in that terminal. Start it again with the same command.

This is a static site. There is no build step. Save a file and refresh the browser to see the change.

GPS check-in needs HTTPS on a phone. On this computer, `http://127.0.0.1:8765/` is a secure-enough context for the browser’s location prompt.

## Pages

- `/` homepage
- `/map/?map=turbo` discovery map
- `/map/?map=turbo#collection` collection and railway puzzle
- `/create/` picture-making entry

Station coordinates are `site/data/japan/map-data.js`. Check-in places, radii, and puzzle sizes are in `site/map/js/config/`.

## Turbo image formats

Japanese is the default public site (`site/`). English pages are alternates. Files outside `site/` — including `img/map/` pin masters — are source artwork, not the files the website delivers.

- Scenic photographs, station pictures, castle illustrations, backgrounds, and other ordinary rectangles: JPEG or WebP. Prefer WebP when it stays sharp and smaller. Do not use PNG unless the picture needs transparency or another technical reason.
- Turbo Turtle, collectible characters, and other foreground art: transparent PNG or lossless WebP. Keep the edges clean.
- Icons and simple vectors: SVG.
- Map pins in `site/img/map/` are 128×128 lossless WebP with transparency, sized for the 26px markers. Full-size PNG masters stay in `img/map/` outside `site/`.
- Do not overwrite or recompress those masters. If a picture exists only as one transparent file, keep that file.
- Hero and opening-poster images load immediately. Images that are not in the first screen use `loading="lazy"`.
- `site/create/` is a stub. Game art, if it is added under `site/`, keeps its transparency. Do not copy the picture studio into this site.

## Not included

The Creative Game picture editor is not in `site/`. It lives with the studio tools and a large artwork library. `/create/` is the navigation place for it.

British merchant pages and Frega material are not in `site/`.

Picture masters for local use live in `artwork/` (gitignored: ivory and transparent heroes, NPCs, backgrounds, full scenes, Turbo poses, and pins). The public site keeps serving the web images in `site/`. Originals outside this repository are left untouched. Rebuild the thumbnail index with `python3 tools/build-artwork-index.py`.

## Artwork

Full-resolution masters belong under `artwork/`, which `.gitignore` excludes with `/artwork/`. GitHub is not a backup of those files. Do not commit `artwork/`. Website images stay in `site/media` and `site/img/map`.

Stage 1 added these folders beside the existing `artwork/heroes/`, `artwork/turbo/`, and other directories. Existing art was not moved. Each new folder has a one-line `README.txt` that Git will not track:

```
artwork/characters/transparent/
artwork/characters/ivory/
artwork/backgrounds/
artwork/puzzles/
artwork/castles/
artwork/pins/
```

Japanese, international, and Victorian characters share `artwork/characters/transparent/` and stay distinct by catalogue category (`character-japanese`, `character-international`, `character-victorian`). Turbo is `character-turbo`. The 33 Japanese historical illustrations are `puzzle-historical-japanese` under `artwork/puzzles/`, separate from the 19 transparent Japanese animal heroes.

`artwork/catalogue.json` (466 entries) is gitignored and not in Git. The tracked plan is `docs/artwork-catalogue.md`, `docs/artwork-catalogue.schema.json`, and `docs/artwork-future-paths.json`. The future-paths file lists the 19 PNG animal heroes and the 33 historical PNGs that were read from disk, all with status `planned`. `nishiki_carp.png` is on disk and is missing from `catalogue.json`. Pixels were not copied.

Manual process for new art, including before old files are migrated:

1. Put the full-resolution original in the matching `artwork/` folder. Any character PNG goes in `artwork/characters/transparent/`.
2. Add one JSON object: `id` (filename stem), `category`, `role` (`transparent-png`, `ivory-jpg`, or `web-webp`), `masterPath` (planned path under `artwork/`), `sourcePath` (absolute path today), `sitePath` (public path or null), `status` (`planned` or `present`).
3. Export WebP into `site/` only when the website should show it.
4. If it is a playable character, add the id in `site/data/heroes.js`.
5. A later import will do steps 2–4. The intended command is `python3 tools/import-artwork.py`. That script is not built.

After this layout, new Turbo art does not go into `japanese.jp` or the older Johren directories. Stage 1 has not moved existing files.

Do not delete `japanese.jp` or `artwork/heroes` until you have a verified backup: a dated copy of `artwork/` on a disk path you choose (`rsync -a`), then matching file counts and `sha256sum` of `artwork/catalogue.json` and of the 19 Japanese animal PNG names. Details are in `docs/artwork-catalogue.md`.

## Puzzle admin

The puzzle admin is local only: `python3 tools/puzzle-admin/server.py`, then http://127.0.0.1:8770/. It is not in the Netlify site. Maintenance steps are in `docs/puzzle-admin.md`. Postcard Studio and the QR registry are on that same admin. Their steps are in `docs/postcard-studio.md`.

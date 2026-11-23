# Turbo Adventures Japan

The public website lives in `site/`. Japanese is the default. English is under `/en/`, `/map/index-en.html`, and `/create/index-en.html`.

The older Johren pages remain in this repository and are not part of `site/`. They are not the public homepage.

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

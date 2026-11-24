# Artwork catalogue

Stage 1 documents where full-resolution masters will live and the fields a future import will use. It does not move pixels. Existing files under `artwork/heroes/`, `artwork/turbo/`, and the other folders that were already there stay where they are.

`artwork/` is listed in `.gitignore` as `/artwork/`. GitHub is not a backup of the masters. `artwork/catalogue.json` is inside that ignore rule, so it is not tracked. `git check-ignore` matches it, and `git ls-files` does not list it. The tracked backup of this plan is `docs/`. The 466-entry `catalogue.json` stays only on this disk until a later stage. Leave that file in `artwork/`; `tools/build-artwork-index.py` writes it there.

## Folders

New folders sit next to the existing ones. They start empty apart from a one-line `README.txt` (`Full-resolution masters only. Not published.`). Git does not keep those READMEs, because `artwork/` is gitignored.

```
artwork/characters/transparent/
artwork/characters/ivory/
artwork/backgrounds/
artwork/puzzles/
artwork/castles/
artwork/pins/
```

Website images stay in `site/media` and `site/img/map`. Do not commit `artwork/`.

Japanese historical characters, international characters, and Victorian characters stay identifiable by **category**, even when their transparent PNG masters share `artwork/characters/transparent/`.

| Set | Category | Planned master folder |
| --- | --- | --- |
| 19 transparent Japanese animal heroes | `character-japanese` | `artwork/characters/transparent/` |
| International transparent heroes | `character-international` | `artwork/characters/transparent/` |
| Victorian animal heroes | `character-victorian` | `artwork/characters/transparent/` |
| Turbo mascot | `character-turbo` | `artwork/characters/transparent/` |
| 33 `japaneseheroes.png` historical illustrations | `puzzle-historical-japanese` | `artwork/puzzles/` |
| Backgrounds | `background` | `artwork/backgrounds/` |
| Other puzzle images | `puzzle` | `artwork/puzzles/` |
| Castles | `castle` | `artwork/castles/` |
| Pins | `pin` | `artwork/pins/` |

`character-historical-japanese` is available if a later set is a character rather than a full illustration. The 33 historical scenes are puzzle images, not the 19 transparent collectible heroes.

`docs/artwork-future-paths.json` lists planned paths for the two directories that were read from disk: 19 files in `/home/sjnelson/japanese.jp/data/archive/japanese_animal_heroes_png` and 33 files in `/home/sjnelson/japanese.jp/data/archive/japaneseheroes.png`. Every item has `"status": "planned"` and a note that pixels were not copied. `nishiki_carp` is in the 19-file PNG directory and is absent from `artwork/catalogue.json`. The other 18 animal-hero stems are already in that catalogue as ivory JPEGs.

## Entry fields

The schema is `docs/artwork-catalogue.schema.json` (tracked). The same JSON is copied to `artwork/catalogue.schema.json` for local tools. That copy is gitignored with the rest of `artwork/`.

A future entry:

```json
{
  "id": "filename-stem",
  "category": "character-japanese",
  "role": "transparent-png",
  "masterPath": "artwork/characters/transparent/filename.png",
  "sourcePath": "/absolute/path/where/the/file/lives/today/filename.png",
  "sitePath": null,
  "status": "planned"
}
```

- `id` — filename stem.
- `category` — one of `character-japanese`, `character-international`, `character-victorian`, `character-turbo`, `character-historical-japanese`, `background`, `puzzle`, `puzzle-historical-japanese`, `castle`, `pin`.
- `role` — `transparent-png`, `ivory-jpg`, or `web-webp`.
- `masterPath` — planned path under `artwork/`. While `status` is `planned`, the file is not there yet.
- `sourcePath` — absolute path where the file lives today. Do not change it because of this layout.
- `sitePath` — public path under `site/`, or `null`.
- `status` — `planned` or `present`.

The current on-disk catalogue is still an array of `{dest, category, filename, source, thumb, site_matches}`. Those 466 `source` paths stay as they are. This schema is the shape for new work and for the import that is not built yet.

## Add artwork by hand

Use this even before existing pixels are copied. New Turbo art does not go into `japanese.jp` or the older Johren directories.

1. Put the full-resolution original in the matching `artwork/` subfolder. Any character PNG, Japanese or international or Victorian, goes in `artwork/characters/transparent/`. Ivory character JPEGs go in `artwork/characters/ivory/`.
2. Add one JSON object with the fields above and the right category. Until the import exists, append it in the local catalogue you are maintaining, using these field names.
3. Export WebP into `site/` only when the website should show it (`site/media` or `site/img/map`).
4. If it is a playable character, add its id in `site/data/heroes.js`.
5. Later, one import will do steps 2–4 from the file drop plus the category. That command is not built. The intended command is `python3 tools/import-artwork.py`. It will read this schema. Do not expect that script to exist yet.

## Backup

`artwork/` is gitignored, so GitHub is not a backup of masters. `catalogue.json` is gitignored. The tracked copy of the plan is this file, `docs/artwork-catalogue.schema.json`, and `docs/artwork-future-paths.json`.

Do not remove `japanese.jp` or the copies under `artwork/heroes` until a verified backup exists. This stage did not make a second full copy of the art.

On this machine, copy `artwork/` to a dated directory on a disk you choose, for example with `rsync -a artwork/ /path/you/choose/johren-artwork-YYYY-MM-DD/`. No backup tool for this library is documented in the repository. Verify the backup before deleting anything elsewhere:

- file count of the backup matches `artwork/`
- `sha256sum artwork/catalogue.json` matches the backup copy
- `sha256sum` of the 19 PNG names in `japanese_animal_heroes_png` matches (including `nishiki_carp.png`)

## Stage 1 boundary

No image was copied, moved, deleted, or renamed. `site/` HTML, JavaScript, map data, pins, and deploy config were not changed. Stage 2 has not started.

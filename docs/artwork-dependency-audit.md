# Artwork dependency audit

Checked 24 November 2026 (Asia/Tokyo) by SHA-256. Nothing was moved or deleted.

There is no folder named `sansymeon.jp`. The related site is `/home/sjnelson/sansymeon-site`.

## Copies that match the Johren library

| Location | Images | Same bytes as `artwork/` | Not in `artwork/` |
| --- | --- | --- | --- |
| `japanese.jp/turbo_adventure` | 677 | 677 | 0 |
| `japanese.jp/data/archive/animal_heroes` | 218 | 89 | 129 |
| `japanese.jp/data/archive/japanese_animal_heroes_png` | 19 | 2 | 17 |
| `japanese.jp/data/archive/japaneseheroes.png` | 33 | 0 | 33 |
| `japanese.jp/turbo-adventures-studio` | 6 | 0 | 6 |
| `sansymeon-site/sansymeon-british-collection/assets` | 17 | 7 | 10 |
| `sansymeon-site/assets` | 3 | 0 | 3 |

## What still depends on the old files

Johren Creator Studio, served at `/studio/` by the local admin, reads `/masters/`, which is `johren-adventure-site/artwork/`. The permanent admin port is 8770. The admin server does not open `japanese.jp`.

The old studio inside `japanese.jp/turbo-adventures-studio` still loads `../turbo_adventure/`. Its scripts `build_catalogue_thumbs.py` and `build_scene_previews.py` write into that folder. That studio is not used by the Johren admin.

`site/create/engine/catalogue-data.js` still contains a `turbo_adventure/` path for when the page is not on port 8770. The public player site does not ship `artwork/` and does not read `japanese.jp` at runtime. Published web images are the separate files under `site/media` and `site/img`.

`site/media/source-map.json` records old source paths as notes. The site serves the files next to that map, not the paths in `japanese.jp`.

No page under `sansymeon-site` refers to `sansymeon-british-collection`.

## Git

`johren-adventure-site/artwork/` is gitignored. Git tracks 0 files there.

`japanese.jp` tracks 75 images under `turbo_adventure/` (backgrounds, Turbo poses, NPC sheets, a few heroes, and four `full_scenes` pictures). About 623 other images in that folder are not tracked. A publish of the `japanese.jp` repository could still include the 75 tracked images.

`sansymeon-site` tracks the 17 files in `sansymeon-british-collection/assets`, including the 7 that match Johren masters.

## Safe to archive later, outside either website repo

The whole of `japanese.jp/turbo_adventure` matches the Johren library. The untracked majority can leave the website tree without a Git change. The 75 tracked files should leave Git at the same time, otherwise a Japanese-site update can still publish them.

Do not archive yet:

- `data/archive/japaneseheroes.png` (33 files not in the Johren library)
- 129 files in `data/archive/animal_heroes` and 17 transparent PNGs that are not in `artwork/`
- The 10 British-collection images that are not duplicates
- The 6 small images inside `turbo-adventures-studio`

Those sets are not redundant copies of the current master library.

## Cleanup on 24 November 2026

After a byte-for-byte `diff -rq` match, both folders were copied to `/home/sjnelson/turbo-legacy-archive/2026-11-24/japanese.jp/` and then removed from `japanese.jp`. Their sibling layout is unchanged, so the archived studio still points at `../turbo_adventure/`. Git in `japanese.jp` has the removal staged (84 paths) and has not been committed or pushed.

A separate copy of `johren-adventure-site/artwork/` is at `/home/sjnelson/turbo-artwork-backups/johren-artwork-2026-11-24`. `data/archive`, `sansymeon-site`, and the British collection were not changed. The only remaining mentions in `japanese.jp` are two `.gitignore` lines for the old studio’s private folders.

`freds-adventure/` was copied into the same archive after `diff -rq` matched, then removed. Nothing else on the Japanese site linked to it. `netlify.toml` still has a comment that names the folder and does not publish it. Git has the 12 tracked files staged for deletion. The theme MP3 was not in Git; it is in the archive. SBC was not changed.

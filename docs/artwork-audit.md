# Artwork audit

Compared on 24 November 2026 (Asia/Tokyo) by SHA-256. Nothing was deleted. `/home/sjnelson/japanese.jp/turbo_adventure` was not modified.

The Johren library is `artwork/`. Creator Studio reads it through the local admin at `/masters/`. Every source image hash is present in `artwork/`. Paths that exist in both trees have the same hash.

| | Images |
| --- | --- |
| `japanese.jp/turbo_adventure` | 677 |
| `artwork/` | 1554 |
| Identical groups inside `artwork/` | 383 (404 extra copies) |
| Hashes only in `artwork/` | 475 (mostly generated thumbs) |
| Source hashes missing from `artwork/` | 0 |

## Authoritative folders

These are the original categories. Official Turbo, historical heroes, and Victorian characters do not share a single file hash.

| Folder | Role |
| --- | --- |
| `artwork/turbo/` | Official Turbo cast |
| `artwork/npc/` | Standard child characters |
| `artwork/victorian_npc/` | Victorian characters |
| `artwork/heroes/japanese_heroes/` | Japanese historical heroes |
| `artwork/heroes/international_heroes/` | International heroes, including their transparent and ivory originals |
| `artwork/heroes/victorian_celebrities/` | Victorian celebrity heroes |
| `artwork/heroes/full_background_scenes/` | Full-background hero scenes |
| `artwork/backgrounds/` | Scene backgrounds, including `landscapes/` |
| `artwork/pins/` | Pin masters |
| `artwork/completed_scenes/` | Finished scenes used by the studio catalogue |

Transparent, ivory, and full-background files that differ by hash stay separate. Turbo does not match any hero file.

## Duplicates to review before any deletion

Same bytes, more than one path:

- 112 international transparent heroes are also in `artwork/heroes/transparent/`.
- 46 Victorian celebrity files are also in `artwork/heroes/transparent/`.
- 130 international ivory files are also in `artwork/heroes/ivory/`.
- 48 Japanese hero files are also in `artwork/heroes/ivory/`.
- 17 loose files in `artwork/heroes/` match a file already filed under `international_heroes/transparent_backgrounds/` or `transparent/`.
- 17 full-background scenes are in both `artwork/heroes/full_background_scenes/` and `artwork/full_scenes/`.
- 10 finished pictures are in both `artwork/completed_scenes/` and `artwork/full_scenes/`.
- Two studio uploads match existing hero files: `studio_library/studio_ch_cd808f8b-97619c.png` is `christmas_carolers.png`, and `studio_library/studio_ch_9129448b-1f8dfa.png` is `christmas_carolers_fullview.png`.

Proposed keep, once you approve a cleanup: the categorised original (`international_heroes`, `japanese_heroes`, `victorian_celebrities`, `full_background_scenes`, `completed_scenes`). Proposed removal only after that approval: the extra copy in `heroes/transparent/`, `heroes/ivory/`, the loose `heroes/` files, and the matching `full_scenes/` copies.

`artwork/characters/transparent/` and `artwork/characters/ivory/` contain only README notes. They are not the master library.

## Files that are not duplicates

These hashes are not in `japanese.jp/turbo_adventure`. Keep them.

- `backgrounds/landscapes/thatched_roof_christmas.png` and `.jpg`
- `heroes/tanukicoon.png`
- Seven files only under `heroes/ivory/`: `qrcode_samples.jpg`, `marketing_desk.jpg`, `2027_january_calendar_prototype.png`, `custom_qrcode.jpg`, `collection-overview.jpg`, `phone_image.jpg`, `marketing_demo.jpg`
- 466 files under `artwork/thumbs/`. They are smaller previews, not second masters.

## Cleanup completed

401 byte-identical extra copies were removed from `artwork/` after catalogue paths were pointed at the organised original. Asset ids in the studio catalogue were not changed. `full_scenes/turbo_champion.png` and the other four studio scenes now use `completed_scenes/` with the same ids.

Kept: Turbo, NPCs, Victorian characters, Japanese and international heroes, full-background scenes, backgrounds, pins, thumbnails, `heroes/tanukicoon.png`, the seven ivory marketing and QR samples, and both thatched-roof landscapes.

`japanese.jp/turbo_adventure` was not modified. Transparent, ivory, and full-background files that are not the same bytes remain in their category folders.

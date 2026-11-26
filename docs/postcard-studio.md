# Postcard Studio

Postcard Studio and the QR registry run on the local admin at http://127.0.0.1:8770/. They are not a separate website and they do not need Cursor.

```sh
python3 tools/puzzle-admin/server.py
```

Sign in, then open **Postcard Studio** or **QR Registry**.

## What stays on this computer

Designs, uploaded pictures, and the full registry (merchant, place, notes, status) are stored in `tools/postcard-studio/data/`. That folder is gitignored and is not part of the Netlify publish. `tools/publish-site.sh` still sends only `site/`.

Routine work is: design the card, save it, export PNG, JPEG, or PDF, and update the registry. None of those steps changes johrenadventure.com.

The postcard page uses the same `artwork/` library as Creator Studio. Choose a background and add character layers on the front or the back. Text, characters, and the QR code share the millimetre arrows. Dragging the QR code does not change its ID. PNG and JPEG export the side on screen. PDF exports the front and the back at 300 dpi. A saved photograph is still optional.

## Printed QR codes

Every card encodes a permanent address:

`https://johrenadventure.com/q/TA-000001`

The number is allocated once, from `TA-000001` upward. Duplicate IDs are rejected. Duplicating a design allocates a new ID. The printed code does not change when a merchant is assigned.

The code uses error correction M and a quiet zone. The studio keeps the mark between 18 mm and 48 mm so the modules stay large enough to scan at 300 dpi.

Export is 100 × 148 mm (portrait) or 148 × 100 mm (landscape) at 300 dpi. PNG, JPEG, and PDF use that same pixel size. JPEG is high quality. PDF is one page at the postcard size.

## Statuses

| Status | Public destination |
| --- | --- |
| unassigned | `/shops/` merchant introduction |
| distributed | `/shops/` merchant introduction |
| assigned | the path or https URL saved on that record |
| inactive | `/q/inactive.html` |

An assigned record must have a destination. A site path starts with `/`. Any other destination must be `https://`.

## How the public site learns a new destination

Local edits do not update the live site.

1. In the QR registry, save the merchant, place, status, and destination.
2. Press **Write site/data/qr/destinations.json**. That writes a small public lookup: QR id, status, and path. Merchant names and notes stay in the local registry.
3. Review the local site.
4. From Admin home, type `PUBLISH` and publish. That runs `tools/publish-site.sh`, which deploys `site/` only after the player-data test passes.

Until step 4, a printed code still opens whatever lookup was in the last publish. A code that has never been in a published file shows a short “not in the public list yet” message.

`/q/TA-######` is a static page, `site/q/index.html`. Netlify rewrites unknown `/q/` addresses to that page (`site/_redirects` and `netlify.toml`). The page reads `site/data/qr/destinations.json`. Those two files are cached for about a minute. No Netlify Function, Identity, or paid add-on is involved.

## Backup

The registry page downloads a JSON backup of records and designs, and a zip of `tools/postcard-studio/data/` including pictures. Restoring a JSON backup refuses duplicate IDs. Restore the zip by unpacking it back into `tools/postcard-studio/data/` while the admin is stopped, if you also need the image files.

## Files

- `tools/postcard-studio/studio.html` — editor
- `tools/postcard-studio/registry.html` — registry
- `tools/postcard-studio/store.py` — IDs, records, public file
- `tools/postcard-studio/render.py` — preview and print files
- `tools/postcard-studio/vendor/segno/` — QR encoder (BSD licence in `vendor/SEGNO-LICENSE`)
- `site/q/index.html` — public redirect
- `site/data/qr/destinations.json` — public lookup, updated only by the registry button

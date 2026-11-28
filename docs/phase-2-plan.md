# Phase 2 — operational independence

27 November 2026. Admin restart and the map and merchant manager are implemented locally and are not published. The later modules in this file are not started. Phase 1 is the local puzzle and wording work described in `docs/player-data.md`. Do not start Phase 2 until Phase 1 has been reviewed and, if accepted, published.

The aim is that map pins, public Create assets, frequent page text, the local server, and a full backup can be handled without Cursor. Existing files stay the source of truth. No new hosted service.

## 1. Map and merchant manager — first

Today the public pins are `site/data/japan/map-data.js` (`window.MAP_DATA`, on the order of 4,800 records, about 1.1 MB) and a small Sabah demo in `site/data/malaysia/map-data.js`. Check-in rules for those pins are resolved in the map scripts. A player’s visit is stored by place id in `turbo.locationCollection.v1`. Changing an id orphans that visit. Adding a pin does not.

Build this on the existing local admin (`tools/puzzle-admin/server.py`, started by `tools/start.sh`):

- List, add, edit, and remove a pin.
- Country, region, prefecture, and category chosen from the lists the map already uses.
- Latitude and longitude typed, or picked on a small Leaflet map in the admin page.
- GPS on or off, radius, and accuracy limit, using the same fields check-in already reads.
- QR on or off only where a postcard destination already exists. Do not invent a second QR system. Gameplay QR check-in stays unavailable.
- Japanese and English name and description.
- Optional public website, image path, and other fields the public pin popup already shows.
- Preview the pin with the same popup fields.
- Save into the existing map-data file, or into a JSON file the public page loads if that is a smaller change than rewriting the large script by hand. Keep the published shape the map already reads.
- Publish with the current Admin button (`tools/publish-site.sh`). The pin is not live until that publish.

Removing a pin must not delete player collections. The id simply stops appearing. Editing must keep the id. A new place gets a new id.

Merchant applications still arrive by LINE or email. This screen is how a reviewed application becomes a pin. It does not read LINE automatically.

Verify: add a local test pin, see it on `http://127.0.0.1:8765/map/`, edit its name without changing the id, confirm a seeded `localStorage` visit for that id still counts, remove the test pin, and confirm the visit record is still in storage. Run `node tools/player-data/persistence-test.js` before any publish.

## 2. Public asset manager

Creator Studio already catalogues master files under `artwork/`, which is not deployed. The public Create page uses a separate catalogue under `site/`.

Extend the studio, or a page next to it, to:

- Choose a master image already in `artwork/`.
- Write a Japanese and English name, category, and description.
- Preview it.
- Enable or disable it on the public catalogue.
- Write a resized WebP or JPEG into `site/media/` and a catalogue record the public Create page already loads.

Masters stay in `artwork/`. Publish still uploads only `site/`.

Verify: enable one existing character, see it on local Create, disable it, confirm it leaves the public catalogue and the master file is still in `artwork/`.

## 3. Website content

Frequently changed sentences are still inside HTML: home, guide, about, shops, and announcements if any are added.

Prefer one JSON or Markdown file per language for those blocks, included by a small script the pages already share (`site/js/nav.js` is the pattern for shared behaviour). An admin form can edit that file. A full CMS is not needed.

Leave long legal pages as HTML until the short blocks are proven.

Verify: change one Japanese and one English home sentence locally, reload, and confirm the other pages did not lose their layout.

## 4. One admin server

Canonical address: `http://127.0.0.1:8770/` from `tools/start.sh`. Public preview: `http://127.0.0.1:8765/`.

Port 8791 was an extra process. It served old Python and produced a 404 for a route that existed only in the newer process. Phase 2 should:

- Document 8770 as the only admin URL.
- Make restart stop the old listener before starting a new one.
- Refuse to start a second admin if 8770 is already open, and say which command is running.
- Show on the admin home the start time and a version string from the repo (git commit, or a file written at start).
- Add a short troubleshooting note to `docs/local-admin.md`: 404 after a code change means the open process is old; restart it. Do not open another port.

Verify: start, restart, and confirm the admin home shows the new start time. Confirm a second start does not leave two listeners.

## 5. Backup and recovery

Not in Git, and required on another computer:

- `artwork/`
- `tools/puzzle-admin/admin.secret` (or the path the server actually reads)
- `tools/postcard-studio/data/` (registry, designs, private merchant notes)
- the Netlify login on `/usr/bin/netlify`

Git already has `site/`, `tools/`, and `docs/`.

Write a checklist in `docs/local-admin.md`: what to copy, what must not be uploaded to the public site, and the order to restore (clone, copy those folders back, `tools/start.sh`, log in to `/usr/bin/netlify`). Postcard registry download and zip remain the in-admin backup for that one dataset. They do not include artwork or the admin password.

Verify the checklist by listing each path and confirming the publish script’s directory is still `site/` only.

## Order of work

1. Server restart and the single admin URL, because every later screen depends on it.
2. Map and merchant manager.
3. Backup checklist, written alongside the manager so the new pin file is included.
4. Public asset manager.
5. Short website content files.

Each step is local until you ask to publish. Player collection keys are not migrated or cleared.

# Turbo Adventures — Version 1.0 readiness audit

27 November 2026. This file is the audit. Priorities were revised the same day. Phase 1 (repeatable 50-piece puzzles, public wording, the mobile header, and a link check) is implemented locally and is not published. The plan for Phase 2 is `docs/phase-2-plan.md`. The findings below are the audit as written, before those local changes.

The question is whether a limited public Version 1.0 can be enjoyed and operated without Cursor for ordinary work. It can, for a small audience, if the known copy mismatches and the local-server confusion are accepted or fixed first. It is not yet a hands-off system for adding places, rewriting pages, or recovering the project on another computer.

## Executive summary

What a new player can do today is coherent: open the map, look around without GPS, check in at a real place, keep that visit on the device, fill a 5-piece puzzle, and later make and share a picture. A shop that scans a postcard reaches a welcoming page, sees the same postcard picture, and can send the postcard number by email or into a LINE draft.

What is not ready for wider promotion is smaller and more specific. The home page says a finished ladder starts again from one piece. The puzzle code does not do that. After 5 + 10 + 25 + 50 unique places, the category is marked complete. Several public sentences still say shop listings and QR play are “in preparation”, while `/shops/` already invites a free listing. Collection lives only in that browser, which the privacy policy explains and the map itself does not say up front. Map tiles come from the public OpenStreetMap servers. That is fine for a quiet launch and is not a plan for heavy traffic.

No launch-blocking security or data-loss bug was confirmed. Admin passwords, the postcard registry, and master artwork are outside the published `site/` folder. The batch PDF failure on 27 November was an old process on port 8791, not a missing feature. After that process was restarted, a PDF for the existing cards TA-000001 and TA-000010 was generated and the registry files were unchanged.

## What is already working well

- Japanese is the default. English pages exist for the home, map, shops, about, operator, terms, and privacy routes. The shared header in `site/js/nav.js` carries the same links and the language switch.
- The map can be used without a location reading. GPS is a separate button. Refusal and poor accuracy have clear Japanese and English messages in `site/map/js/i18n.js` (`gpsDenied`, `gpsUncertain`, `resultFar`).
- A public place is collected once per browser. Merchant check-ins are counted separately from the four public puzzles.
- Puzzle piece counts come from unique places in that category. Assigned puzzle art is kept when the seasonal default changes. The publish script refuses to upload if that persistence test fails (`docs/player-data.md`).
- Create can save or share a picture without an account. The public Create screen does not upload the picture.
- Postcard QR addresses stay `https://johrenadventure.com/q/TA-######`. Unassigned cards open `/shops/`. Assignment changes only the destination record.
- The shop landing page continues the physical postcard, says the listing is free, and keeps LINE follow optional. Email and the LINE draft include the postcard number.
- Publishing uploads only `site/`, compares hashes, and does not run a Netlify build (`docs/local-admin.md`).

## What was tested successfully

These were exercised on the local or live site during recent work, or rechecked in code and with a local HTTP call on 27 November.

| Check | Result |
| --- | --- |
| Shop page, Japanese and English, with `?card=TA-000001` | Postcard number fills and locks. Welcome text changes. |
| Email application | Builds a mailto body from the form. Confirmed by the operator. |
| LINE application | Official account chat URL with the form text. Confirmed by the operator on a second phone. |
| Batch PDF for TA-000001 and TA-000010 | POST `/api/postcards/export-batch` on port 8791 returned a two-page PDF. Registry and design files were not modified. |
| Header at 320, 375, 390, and 430 px | Japanese shops, English home, and the map: two button rows, 44 px targets, no overlap and no horizontal scroll. Desktop stayed one row. This header change is in the working tree and is not necessarily the live site. |
| Player-data gate | `tools/publish-site.sh` runs the persistence test before Netlify. Recent publishes stopped when the test would have failed and continued when it passed. |

## What could not be verified

- A real outdoor check-in, a refused GPS prompt on an iPhone, or a poor-accuracy reading. The messages exist. They were not walked through on a device for this audit.
- Completing a real 5-piece, then 10, 25, and 50 on a phone, including the next-day return. Storage is `localStorage`, so a return on the same browser should still show the collection. Another phone, a private tab, or cleared site data starts empty. That return was not timed overnight.
- Map frame rate with the full Japan file on a low-end phone. The file is about 1.1 MB and contains on the order of 4,800 id fields (`site/data/japan/map-data.js`). Pins are clustered. Performance was not measured.
- Every public link and image. Spot checks only.
- Netlify bandwidth and build-minute counters on the Legacy Free plan. The publish command uses `--no-build`. Bandwidth use depends on how many changed files are uploaded.
- Whether OpenStreetMap will keep serving tiles if traffic grows. Not tested.

## Player journey

A first visitor who opens the home page sees Turbo, a short explanation, and one clear button to the map. The purpose is understandable: explore, check in, finish puzzle pictures, make a scene. It is less obvious that airports, cultural places, and scenic places are separate ladders, and that a shop QR is not yet a way to collect a piece.

The map does not require location permission to pan and search. If permission is refused, the status line asks the player to allow location and try again. If the reading is too coarse, it asks them to try in a more open place and shows the accuracy. A success records the place id, time, distance, and accuracy, not the raw coordinates (`site/privacy/index.html`).

The puzzle ladder in code is 5, then 10, then 25, then 50 (`site/map/js/config/puzzle.js`). Unique places already collected are not collected again, so a new puzzle does not wipe earlier visits. After the four sizes are finished (90 unique places in that category), further check-ins say the ladder is complete (`puzzleFinished` / `railwayDone`). They do not open another 50-piece board. The home page says that after a finish the count starts again from one (`site/index.html`). That sentence does not match the code. This is the main hole in the promised puzzle journey. It will not matter on day one. It will matter if the home page is believed literally.

Completed pictures stay in the collection view for sizes the player has finished. There is no account, so nothing follows the player to a new device. The privacy policy says this. The map’s first screen does not.

Returning the next day works only as well as the browser keeps site data. iOS can drop `localStorage` in some private or storage-pressure cases. That was not reproduced.

Navigation back to home, map, collection, and Create is the shared header. The mobile overlap that showed on iPhone has a local fix in `site/js/nav.js`. Publish it before relying on it in the field.

## Merchant journey

A shop owner who scans a postcard does not need an account. An unassigned code opens `/shops/` with the postcard number. The page shows the exported postcard, says the listing is free and that paid services are optional, and offers LINE and email. The number is included in both. Operator, terms, and privacy pages are linked from the header.

Before assignment, the public lookup sends the card to the default path (`/shops/`). After a destination is saved and the public file is published, the same QR opens that path. The printed number does not change.

What can confuse a merchant who reads the rest of the site:

- `site/about/index.html` still says shop listings and QR are in preparation.
- The home description meta text says shop QR is in preparation.
- `site/terms/index.html` says QR check-in is in preparation.

Those sentences are true about gameplay check-in. They read as if the shop page itself is not ready. The shop page is ready as an invitation, not as an automatic map pin. Nothing on the shop page creates a listing by itself. Someone still has to add the place in the map data and publish. A merchant who expects the pin to appear after the LINE message will be disappointed unless that is said in the reply.

Merchant contact details in the registry stay on this computer (`tools/postcard-studio/data/` is gitignored). The public destination file does not include the private note.

## Design and usability

The shared header is the right place for the mobile fix, and that fix is in the working tree. Legal links wrap. Language switching keeps the postcard query on the shop pages.

Japanese line wrapping was corrected for 「いただき」 on the shop welcome. Other long lines were not exhaustively reviewed.

Sabah remains a small prototype dataset (`site/data/malaysia/map-data.js`, described in the English map copy as a prototype place). It is not a second finished country.

`site/` is about 145 MB, mostly media. Artwork masters (about 1.1 GB) are not deployed.

Desktop shop layout and the postcard studio were reviewed earlier and were acceptable. A full pass of every info page at tablet width was not repeated for this audit.

## Functional notes

| System | Where it lives | Note |
| --- | --- | --- |
| Japan map pins | `site/data/japan/map-data.js` | Large script loaded with the map. Not an admin form. |
| GPS check-in | `site/map/js/gps-checkin.js` | On-device. No coordinate upload. |
| Collection | `turbo.locationCollection.v1` and related keys | See `docs/player-data.md`. |
| Puzzles | `site/map/js/railway-puzzle.js`, mosaic scripts, Admin puzzle manager | Ladder stops after 50. |
| Create / share | `site/create/`, `site/map/js/image-share.js` | Device only. |
| QR lookup | `site/q/`, `site/data/qr/destinations.json` | Public file. |
| Postcard admin | `http://127.0.0.1:8770/` and, when started, port 8791 | Same code. A stale 8791 process caused the batch 404. |
| Publish | `tools/publish-site.sh` | `/usr/bin/netlify`, `--no-build`, `site/` only. |

Private material that must stay off the public site is already excluded: `admin.secret`, `artwork/`, `tools/postcard-studio/data/`, puzzle-admin backups. Confirmed in `.gitignore` and in the publish script’s `--dir=site`.

Edge case already hit: two admin processes. Port 8770 is what `tools/start.sh` starts. Port 8791 was an extra copy. The browser that showed the 404 was on 8791. Restarting that process loaded the batch route. This will happen again if an old process is left running.

## Independence from Cursor

| Task | Class | How it works today |
| --- | --- | --- |
| Publish `site/` after a local review | A | Admin home, type PUBLISH. Needs `/usr/bin/netlify` still logged in. |
| Change a puzzle image or seasonal default | A | Puzzle manager on the admin server, then publish. |
| Design, save, and export one postcard PDF | A | Postcard Studio. Scale and preview are in the studio. |
| Export selected cards to an A4 duplex PDF | A | QR registry, after the admin process that is actually open has the current code. |
| Assign a QR destination | A | Registry, then “write the public file”, then publish. |
| Add a character or background to the local studio | A | Creator Studio, Manage Images, under `artwork/`. |
| Show that new character on the public Create page | C | Public catalogue is a separate copy under `site/`. |
| Add or move a map pin, or add a region | C | Edit `site/data/japan/map-data.js` or the import tools. |
| Add a country | D | Sabah is a small demo file, not a general importer in the admin UI. |
| Change home, about, shop, terms, or privacy sentences | C | Edit the HTML files. |
| Change GPS radii or puzzle level list | B | `site/map/js/config/`. Still a code edit, but the shape is data. |
| Preview the public site | A | `tools/start.sh` serves `site/` on port 8765. Other ports in use (8788, 8789) are extra static servers. |
| Restart admin | B | `tools/start.sh` starts 8765 and 8770 if those ports are free. It will not restart a stale process, and it does not know about 8791. |
| Back up postcard registry and designs | A | Registry page: download JSON and the zip. |
| Restore postcard backup | A | Registry restore. Still local until the public file is written and published. |
| Roll back the live site | B | Netlify keeps earlier deploys. The admin button always publishes the current `site/` folder. Choosing an old deploy is done in Netlify, not in Admin. |
| Diagnose “Export 404” | C until documented | It means the open admin port is an old process. |

GitHub access for this repository is SSH (`git@github.com:sansymeon/johren-adventure-site.git`). A saved HTTPS token that GitHub reports as unused is not what publish or git push uses.

## Documentation and recovery

`docs/local-admin.md`, `docs/player-data.md`, `docs/puzzle-admin.md`, and `docs/postcard-studio.md` are enough to publish and to avoid wiping a collection. They do not yet explain:

- Why both 8770 and 8791 exist, and which one the browser is using.
- That `start.sh` only starts a server when the port is free, so an old process keeps serving old Python.
- The Japan pin file, the Sabah demo, and how a new station gets into the map.
- How to put a merchant who applied on LINE onto the map.
- How to move the project to another computer: copy the repo, `artwork/`, `admin.secret`, and `tools/postcard-studio/data/`, install `/usr/bin/netlify`, and log it in. Those folders are not in Git.

Critical knowledge that has lived in conversation more than in docs: the Netlify CLI must be `/usr/bin/netlify` (the keychain login), not the older binary that appears first on `PATH`; postcard text and QR rules; the shop page is an invitation, not automatic listing; player progress must never be reset on deploy.

## Operating costs

- Netlify Legacy Free: 100 GB bandwidth and 300 build minutes. Publishes from Admin do not spend build minutes. A normal text publish uploads a handful of files. Replacing many files under `site/media/`, or a hash mismatch, can upload a large part of the 145 MB site.
- The Japan map script is about 1.1 MB on each full map load, plus OpenStreetMap tiles. Tile use is the limit most likely to matter before Netlify bandwidth does. The public OSM tile servers are not a commercial plan. A quiet launch can use them. A promoted launch should move to a tile host with a known quota before the map is advertised widely.
- Browser storage holds the collection. It does not grow on the server as players join. Losing a phone loses that player’s progress. That is acceptable for Version 1.0 if it is said in the product, not only in the privacy policy.
- Postcard PDFs are generated on this computer. They do not use Netlify build time.

No new hosted database or account system is justified for the first public season.

## Recommendations

### P0 — Launch blockers

None confirmed. Do not treat that as “tested on a phone in the field.” The unverified GPS and puzzle-completion walks above are the checks that could still reveal a blocker.

### P1 — Before wider promotion

1. **Make the puzzle promise match the code.** Either change the home sentence that says the count starts again after 50, or implement another 50-piece round without deleting earlier visits. Verify by collecting enough test places, or by a small fixture, that the screen and the sentence agree. Files: `site/index.html`, `site/map/js/railway-puzzle.js`.
2. **Align “in preparation” copy with the live shop invitation.** Say clearly that applying does not itself put a pin on the map, and that QR play check-in is not the same as the shop enquiry. Verify by reading home, about, terms, and `/shops/` in both languages. Files: `site/index.html`, `site/about/index.html`, `site/terms/index.html`, and the English twins.
3. **Say on the map that progress stays on this device.** One sentence near the collection, not only in the privacy policy. Verify with a clean profile and again after reload.
4. **Publish the mobile header** after a phone check at 320 px. Verify the five buttons and the language control do not overlap on the shop page and the map.
5. **Field-check GPS** once: allow, deny, and a coarse reading. Verify the status text matches `gpsDenied` and `gpsUncertain`.
6. **Plan a tile host before any wide announcement.** Not required for a small circle of players. Verify by naming the provider and a monthly tile budget before a public campaign.

### P2 — Independence from Cursor

1. **One admin port.** Document that the working admin is whichever process was started last, and make `tools/start.sh` the only supported start. Restart means stop the old process first. Verify by opening the registry and exporting one known card without a 404.
2. **A short operator sheet** in `docs/` covering: folder map, ports 8765 and 8770, what is not in Git, publish, rollback via the previous Netlify deploy, and how a LINE application becomes a map pin (today that last step is still a data edit).
3. **Keep map pins in data, but describe the file.** Even before an Admin map editor, a documented record shape in `site/data/japan/map-data.js` lets a careful edit happen without a conversation. Verify by adding one test pin locally and seeing it on the map.
4. **Recovery copy.** A checklist to copy `artwork/`, `admin.secret`, and `tools/postcard-studio/data/` with the Git repo. Verify by listing those paths in the doc and confirming they are the ones Admin reads.

### P3 — Later

- Another 50-piece round after the ladder, if players actually finish 90 places.
- Admin screens for pins, page copy, and public Create characters.
- Accounts or cloud save, only if players are really losing devices and asking for recovery.
- Automatic merchant pins from the LINE form. Not for Version 1.0.

## Implementation plan

1. Publish the header fix after one phone look, if that local change is accepted. Small, shared file, no data migration.
2. Correct the home, about, and terms sentences so they match check-in and shop behaviour. Copy only.
3. Decide whether “after 50, start again” is a promise to keep. If not, change the sentence. If yes, schedule it as P1 work that must not clear `turbo.locationCollection.v1`.
4. Add the operator notes in `docs/` for ports, backups, and the LINE-to-map gap. No new service.
5. Use the site with a few real players. Revisit tiles, repeated 50-piece play, and Admin editors only when those players hit the limit.

Version 1.0 is ready for a controlled start: people you can talk to, shops you answer yourself, and publishes through the Admin button. It is not ready for a campaign that assumes new countries, automatic shop pins, or progress that survives a new phone.

# Local Turbo admin

One project folder: `johren-adventure-site`.

Start both local servers:

```sh
sh tools/start.sh
```

- Player site: http://127.0.0.1:8765/
- Admin: http://127.0.0.1:8770/

The admin password is `admin.secret` in the project root. It is not in Git and not on the public site.

## Master artwork

Creator Studio and the admin read only `artwork/` inside this project. They do not open `japanese.jp` or `turbo-adventure-studio-repo`.

The permanent admin address is http://127.0.0.1:8770/, started by `tools/start.sh`. Studio pages under `/studio/` load every character, background, and thumbnail through `/masters/`, which is this `artwork/` folder. That mapping follows the page path, so it still works if the same admin process is opened on another local port.

```
artwork/turbo/                                  official Turbo cast
artwork/npc/                                    child characters
artwork/victorian_npc/                          Victorian characters
artwork/heroes/japanese_heroes/                 Japanese historical heroes
artwork/heroes/international_heroes/            international heroes
artwork/heroes/victorian_celebrities/           Victorian celebrity heroes
artwork/heroes/full_background_scenes/          full-background scenes
artwork/backgrounds/                            photographs
artwork/pins/
artwork/completed_scenes/
artwork/thumbs/                                 small previews
artwork/studio_library/                         images added from Manage Images
```

New pictures are added in Creator Studio → Catalogue → Manage Images. That keeps the catalogue id stable for saved scenes. The Artwork Library page lists these folders.

`artwork/`, `admin.secret`, and `tools/puzzle-admin/backups/` are listed in `.gitignore`. Netlify publishes only `site/` (`netlify.toml` and `tools/publish-site.sh`).

## Admin pages

After sign-in, the home page links to Creator Studio, Puzzle Manager, Postcard Studio, the QR Registry, Artwork Library, Map Manager, Merchant Manager, Settings, and Backup / Restore.

Postcard designs and the QR registry stay in `tools/postcard-studio/data/`, which is not deployed. How a printed code reaches a merchant page is in `docs/postcard-studio.md`.

## Publish button

Admin home asks for the word `PUBLISH`, then runs `tools/publish-site.sh`. The script uses `/usr/bin/netlify`, the CLI whose login is stored in the system keychain, and deploys only to site id `71c8b581-dddf-4a87-9365-d84c37559d55` (johrenadventure.com). Review the local site before publishing.

### What is uploaded

The deploy directory is `site/` and nothing else. That includes the public pages, `site/map/`, `site/create/`, `site/shops/`, `site/media/`, `site/data/`, `site/q/`, and `site/_redirects`.

These stay on this computer:

- `artwork/` and Creator Studio masters
- `tools/`, including the admin, Postcard Studio, and `tools/postcard-studio/data/`
- `admin.secret`
- `docs/`
- the repo `netlify.toml` (the live QR rewrite is the copy in `site/_redirects`)

### How Netlify receives it

The command is `netlify deploy --prod --no-build --dir=site`. `--no-build` means this button does not run a build, so it does not spend the 300 build minutes. The CLI compares file hashes with the current production deploy and uploads new or modified files. On 26 November 2026 it listed 573 files in `site/` and uploaded 13 that had changed. Unchanged files are not sent again.

`site/` is about 145 MB. A publish that changes many images under `site/media/`, or a run that cannot match the previous hashes, can upload much more of that folder and use the 100 GB bandwidth allowance. Replacing a large media file costs the size of the new file. Ordinary text and script edits stay small.

A Git-connected build on Netlify is a different path. This button does not push Git and does not start one. The account is the Legacy Free plan; keep publishes on this script so the build-minute quota stays unused.

### Player data

Progress is in the browser, not on Netlify. Before any upload, the script runs `node tools/player-data/persistence-test.js`. If that fails, Netlify is not called. The test loads the collection, mosaic, and reward scripts with a saved store, changes the seasonal picture, and checks that visits, assigned puzzle art, celebrations, inventory, and the Create draft are still there. It also checks that the control which clears a collection is limited to a URL containing `test=1`. The full key list, including `turbo.gpsCheckin.v1`, is in `docs/player-data.md`. Do not run `netlify deploy` yourself. That would skip the test.

## Player site

Map check-in, collections, and puzzles still use `site/`. They do not read `artwork/`.

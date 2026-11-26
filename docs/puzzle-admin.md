# Puzzle Admin

The admin runs on this computer. It is not part of johrenadventure.com.

Netlify still publishes only `site/`. The legacy Free plan is unchanged. Identity is not used.

## Start

```sh
python3 tools/puzzle-admin/server.py
```

Open http://127.0.0.1:8770/

The first start creates `admin.secret` in the project root and prints the password. That file is gitignored. Do not commit it and do not deploy it.

The public game at http://127.0.0.1:8765/ does not ask anyone to sign in.

## Puzzle Manager

- **Default** keeps the current puzzle image.
- **Choose Image** browses `site/media/puzzles/` and `site/media/scenes/`, or uploads a new file.
- Upload JPG for ordinary pictures. Upload PNG only when the picture needs transparency.
- The preview is not live until you press **この画像を既定にする**.
- That save writes `site/data/puzzle/config.json` and regenerates `site/data/puzzle/active.js`.
- There is one active default. Puzzle sizes stay in `site/map/js/config/puzzle.js` (5, 10, 25, 50).

A puzzle level keeps the picture that was current when the player collected its first piece. That record is stored in the browser under `turbo.railwayMosaic.v1`, in `scenes`, and it is not rewritten when the seasonal default changes. A level the player has not started still shows the current default. An existing saved scene is left as it is, including when it has no wallpaper.

Each level has a 9:16 wallpaper reward (`wallpaper`, `wallpaperWidth`, `wallpaperHeight`). It is a separate portrait file, not a crop of the puzzle. Puzzle Manager uploads it with **Upload Image**, which writes the file into `site/media/puzzles/` and lists it in the image library. The preview is shown in a 9:16 frame with the filename and pixel size. Saving a level that has no wallpaper shows a warning and still saves, so older levels keep working. The wallpaper is copied into the same scene record on that first piece. A later change to the default wallpaper does not replace one already assigned.

Puzzle Test uses the same celebration, final reveal, wallpaper, save, and share flow as the map. Its check-ins stay in separate test storage and are not written into a player collection.

Completion and wallpaper viewing live in `site/map/js/puzzle-reward.js` (`TURBO_PUZZLE_REWARD`). Saving and sharing a picture go through `site/map/js/image-share.js` (`TURBO_IMAGE_SHARE`), which draws the brand line only on the exported file. Railway calls the reward module today. Airport, cultural, scenic, and merchant puzzles should call `enqueue`, `present`, `save`, and `share` with the picture already assigned to that player when that category has a completed image, instead of adding another share implementation. Pending celebrations are stored in `turbo.pendingCelebrations.v1` and are marked viewed when dismissed. The stored celebration copies the assigned picture and wallpaper. It does not read the current seasonal files again. If a completed level has no saved scene yet, that one completion writes the scene and then copies it. A scene that is already saved is not changed.

Set `celebration` to `fireworks` or `merchantSponsored` to `true` for a merchant-sponsored puzzle. `merchantWebsite` is optional. When set, the completion screen shows it as a link that opens in a new tab. A value without `https://` is treated as an https address. The test-data reset appears only when the map URL contains `test=1`.

## Publish without Cursor

From the project folder:

```sh
git add site/data/puzzle site/media/puzzles
git commit -m "Update the default puzzle image"
git push
```

Then, from `/tmp` so Netlify does not pack anything outside `site/`:

```sh
tools/publish-site.sh
```

That script runs `node tools/player-data/persistence-test.js` first. If the test fails, it does not deploy. The rules it protects are in `docs/player-data.md`. Do not call `netlify deploy` yourself. That would skip the check.

## Backup and restore

The admin can download the current config JSON. Choosing that file in **復元** writes it back, if the image path still exists under `site/media/`. Each activation also copies the previous config to `tools/puzzle-admin/backups/`, which is not deployed.

## Final reveal image

The puzzle image section has an optional **クリア後の画像**. Choose Image, then **この画像をクリア後にする**. **クリア後の画像を外す** clears it. Upload uses the same JPG/PNG field as the main picture. Changing the main default to a different file clears the reveal, because that reveal belonged to the previous picture.

On the site, finishing the 5-piece mosaic still shows that base image and the confetti. The **クリア後の画像を見る** button appears only when a reveal image is set. One tap swaps the picture and stores it on this device under `turbo.finalReveal.v1`. Leaving without tapping keeps the button on the completed 5-piece in the collection. Puzzles with no reveal image stay as they are.

## Creative Game

One editor is shared by both modes. The files are `site/create/engine/` (`catalogue-data.js`, `editor.js`, `cutout.js`, `play.js`). `prototype/create.html` and `prototype/create-en.html` are the same pages as `site/create/`. The public site serves `site/create/` at `/create/`.

Player mode reads `turbo.playerInventory.v1` only. It does not read the station collection and it does not list the whole catalogue. Creator test is available only at `http://127.0.0.1:8770/creator/` after admin login. That flag is ignored on any other host, including johrenadventure.com.

A landscape **Save JPG** in Creator test is 1600×900 and is also written to `site/media/puzzles/`. Puzzle Manager lists that folder. PNG save stays a transparent download and is not copied into the puzzle folder.

## Creator test

After signing in, open Creator test. It uses the shared editor and the master files under `turbo_adventure`. The private route is not a separate public deploy.

The test scene is stored in the browser as `tas.creatorTestScene.v1`. Player collections stay in `turbo.locationCollection.v1`. Reload Creator test after new catalogue files are added. Landscape JPG export is 1600×900. PNG export stays transparent.

The public `/create/` page does not list every asset and does not unlock the catalogue.

## Later online admin

The public site only reads `active.js`. A future server can write the same JSON and JS after it checks an admin login. The player pages do not need to change.

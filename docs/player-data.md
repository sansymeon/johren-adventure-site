# Player data

Player progress lives in the browser on that device. It is not on the Netlify server. A deploy, a new map pin, a new puzzle picture, a wallpaper, a language switch, or a CSS or JavaScript update must leave it in place.

## Keys

| Key | Contents |
|---|---|
| `turbo.locationCollection.v1` | Visited stations, airports, and scenic places. Puzzle progress is the count of railway ids. |
| `turbo.gpsCheckin.v1` | Older check-in list. It is copied once into the collection and then left alone. |
| `turbo.railwayMosaic.v1` | Tile order and the picture, reveal, and wallpaper assigned to a level. |
| `turbo.finalReveal.v1` | Completed levels whose final reveal the player has opened. |
| `turbo.pendingCelebrations.v1` | Celebrations not yet dismissed, including the assigned picture and wallpaper. |
| `turbo.playerInventory.v1` | Collected characters and creative assets. |
| `tas.playScene.v1` | The public Create draft. |

Japanese and English pages on the same host share these keys. A different host, including a local preview, an in-app browser, or another phone, has its own empty store. That is a separate copy, not a reset of the original.

## Rules

- Keep the keys above. Do not rename one and start empty.
- Keep location ids stable. A new station gets a new id. An existing pin keeps its id so a past visit still counts.
- If a stored shape has to change, read the old value and write the new shape with the same visits, pictures, and progress. Do not replace a readable store with an empty one.
- A level’s assigned picture and wallpaper stay in `scenes` inside `turbo.railwayMosaic.v1`. Changing the seasonal files must not rewrite a scene that already has an image.
- The test reset button is rendered only when the map URL contains `test=1`. It is the only public control that deletes the collection. It must not run on a normal visit, and it must not be the way a new release starts.
- Puzzle Test on the local admin uses separate keys. It must not write the keys in the table above.

## Check before every deploy

`docs/player-data.md` is the authority for these rules. `tools/publish-site.sh` runs this test and does not call Netlify when it fails:

```sh
node tools/player-data/persistence-test.js
```

The test loads the collection, mosaic, and reward scripts against a saved store, changes the seasonal picture, loads the scripts again, and checks that the visits, assigned art, celebration, inventory, and Create draft are still there. The admin publish button uses the same script, so a failing test stops that deploy too. Do not run `netlify deploy` directly. That skips the check.

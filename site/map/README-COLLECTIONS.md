# Discovery map collections

Pin artwork is `js/config/pins.js`. Cultural spots use the green Turbo pin (`/img/map/turbo/turbo_green_pin.webp`). Scenic spots use the blue Turbo pin (`/img/map/turbo/turbo_blue_pin.webp`). Merchant gold is `/img/map/turbo/turbo_gold_pin.webp` and is not a paid tier; no merchant pins are placed yet. Railway stations keep `/img/map/station.webp`. Airports keep the airplane marker.

Japanese is the default (`index.html`). English is the same map at `index-en.html`. Browser language is not used.

Check-in is a button tap. Nothing is sent to a server.

## Add a railway station

1. The station must already be a pin in `data/japan/map-data.js`. Copy its `id`. Do not add a second pin.
2. Open `js/config/locations.js`.
3. Add `{ id: "that_pin_id" }` to `railway.places`.

The station then offers GPS check-in. The first success is kept for the life of this device and awards one railway-puzzle piece. No picture is required.

A special station sets `special: true` and, when artwork exists, `rewards`. 糸島高校前 (`chikuhi_itoshimakoko_mae`) is `special: true` with `role: "turbo_home"`. It has no rewards yet, and it still awards one puzzle piece. Do not add a stage image for an ordinary station.

## Add an airport

In `js/config/locations.js`, add an object to `airport.places`:

```js
{
  id: "my_airport",
  name: "空港名",
  nameEn: "Airport name",
  points: [
    { id: "my_airport_terminal", name: "旅客ターミナル", nameEn: "Passenger terminal", lat: 0, lng: 0 }
  ]
}
```

Use a publicly accessible terminal, not the runway centre. The place `id` is the lifetime collection id. A place may set its own `radiusMeters`. The category value is the default.

福岡空港 国内線ターミナル (`fukuoka_airport_domestic`) and 福岡空港 国際線ターミナル (`fukuoka_airport_international`) are two discoveries. Each has its own pin, radius, and check-in. 佐賀空港 (`saga_airport`) is a third.

To treat several doors as one discovery, put those coordinates in `points` under a single place `id`. Checking in at any of those points records that one id. Use separate places when each terminal should add its own count.

Airports do not award railway-puzzle pieces.

The Fukuoka Airport subway station (`airport_fukuoka_airport` in the map data) is a railway pin. It is not an airport check-in.

## Change a GPS radius

In `js/config/locations.js`:

- `railway.radiusMeters` — stations, currently 150
- `airport.radiusMeters` — airports, currently 250
- `maxAccuracyMeters` on the same category — readings less precise than this are refused, currently 150

## Puzzle

`js/config/puzzle.js` lists the levels: 5, then 10, then 25, then 50. The same file sets the first-level picture (`firstLevel.image`).

Each new railway station reveals one mosaic tile of the current level. A finished level opens the next at zero tiles. Stations already collected do not reveal another tile. The count is stored only as the station list in `localStorage` key `turbo.locationCollection.v1`. Which tiles are open is a shuffle saved once per level in `turbo.railwayMosaic.v1`. The picture is the Christmas village scene at `/media/scenes/christmas_in_the_village.webp`. The same picture is used for the 5, 10, 25, and 50 grids. `js/jigsaw.js` is a separate centre-last plan for a future character puzzle and is not tied to GPS.

## Reset test progress

On the collection screen, **テストデータを消す** / **Clear test data** removes `turbo.locationCollection.v1`. It leaves the mosaic tile order in `turbo.railwayMosaic.v1`.

Or, in the phone's Safari settings, delete website data for the draft host.

An older daily check-in, if present under `turbo.gpsCheckin.v1`, is copied into the railway list the first time the new collection loads. Clearing only the new key lets that copy happen again on the next visit. To forget the phone test completely, remove both keys.

## Diagnostics

`js/gps-checkin.js` has `showDiagnostics: true`. Set it to `false` before a public release.

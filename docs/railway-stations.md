# Railway stations on the discovery map

`piuccio/open-data-jp-railway-stations` (`stations.json`) is not a source for this map. Nothing in the site, tools, or docs reads that file. Do not treat it as the primary list unless a later import adopts it on purpose.

Station pins live in one shared file, `site/data/japan/map-data.js` (`window.MAP_DATA.pins`). Japanese and English maps both load that file. A pin with `type: "station"` is a one-time railway check-in. Do not add a second pin for a junction, and do not add the same station again under another id.

## What was used

For Shikoku, Hiroshima, and Okayama the list of passenger stations came from the Japanese Wikipedia route articles for the requested JR lines. Coordinates came from OpenStreetMap, read through the public Overpass, Nominatim, and Photon services. A station was kept only when its coordinate falls in the requested prefecture.

Closed sections were removed when the route article marks them closed. The Kabe Line is included only through あき亀山. Private railways, trams, freight-only stations, and temporary stations were left out.

English names came from the English Wikipedia title when that page exists. Otherwise the name is a romanization of the Japanese station name. The Japanese name is always stored in `name`.

## Licences

These are the upstream licences for material consulted while building the pins. The map file stores names and coordinates, not copied Wikipedia text.

- Japanese and English Wikipedia: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- OpenStreetMap data, including results from Overpass, Nominatim, and Photon: [ODbL](https://www.openstreetmap.org/copyright).

Keep those attributions if a future export republishes the coordinates as a separate dataset.

## Add another prefecture

1. Open the Japanese Wikipedia article for each JR line in that prefecture and use its current passenger-station list. Skip rows marked closed, freight-only, or temporary. Skip private railways and trams.
2. Look up each station in OpenStreetMap. Prefer the railway station node. A station-front stop is acceptable only when it is the public entrance and the railway node cannot be found. Do not use a coordinate on a bridge deck, in the water, or at a different station of the same short name.
3. Keep the station only if the coordinate is inside the prefecture. One pin per station, even where lines meet.
4. Search `site/data/japan/map-data.js` for the same `name` in the same `area` before adding. Reuse the existing pin.
5. Add a pin in the same shape as the current JR West and JR Shikoku pins: `id`, `line`, `area`, `name`, `nameEn`, `type: "station"`, `lat`, `lng`.
6. Do not edit the check-in engine. `site/map/js/config/locations.js` already treats every `type: "station"` pin as one railway check-in per device.

Airports, temples, and scenic places are separate records. They are not part of this station list.

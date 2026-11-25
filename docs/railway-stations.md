# Railway stations on the discovery map

The map was not built from `piuccio/open-data-jp-railway-stations`. Do not replace `site/data/japan/map-data.js` with that file. A local audit script can compare the map with the ekidata CSV that repository publishes. See “Audit against a structured list” below.

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

## Hokkaido

The JR Hokkaido passenger stations were compared with the ekidata snapshot of 30 March 2018, then reduced to stations still open on 25 November 2026. Closed sections are omitted: the Rumoi Line (the last section closed on 1 April 2026), the Sassho Line beyond Hokkaido-Iryodaigaku, the Hidaka Line beyond Mukawa, the Sekisho Yubari branch, and the Nemuro Line between Furano and Shintoku. Individual stations closed through the 14 March 2026 timetable, including Niyama and Futamata, are omitted. Royce' Town, opened in 2022, is included. Coordinates for the 2018 stations come from that ekidata file. The Royce' Town coordinate is the station coordinate published with its opening record. One existing pin was kept for each station already on the map, including Sapporo. Churches and other cultural sites were not changed.

## Aomori

The JR East and JR Hokkaido passenger stations in Aomori were taken from the same 30 March 2018 ekidata snapshot, then checked against the lines still open on 25 November 2026. Private railways, including Aoimori Railway, Tsugaru Railway, and Konan Railway, are not included. A station served by both JR and a private railway, such as Noheji, is included once. The existing Aomori station pin and Hirosaki Castle were not changed.

Shichinohe-Towada was missing from the snapshot and was added from its published station coordinate. Tsugaru-Imabetsu in the snapshot is the current Okutsugaru-Imabetsu Shinkansen station. The Tsugaru Line stations north of Kanita have had no passenger trains since August 2022 and are agreed to close on 1 April 2027, so they are not included. Kanita remains the passenger terminus.

## Iwate

JR East passenger stations in Iwate were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. IGR Iwate Galaxy Railway and Sanriku Railway are not included. Kōma is included once because the JR Hanawa Line uses it. The existing Morioka pin was not changed.

The Ōfunato Line railway now ends at Kesennuma. The former stations from Rikuzen-Yahagi to Sakari lost their railway on 1 April 2020 and are not included. The Yamada Line now ends at Miyako. The stations from Miyako to Kamaishi were transferred to Sanriku Railway in 2019, and Hiraitsuto closed on 18 March 2023. Kamaishi remains because the Kamaishi Line still serves it. Mizusawa-Esashi was missing from the snapshot and was added from its published station coordinate.

## Akita

JR East passenger stations in Akita were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. Akita Nairiku Jukan Railway and Yuri Kogen Railway are not included. The existing Akita station pin and Hokuroku Orthodox Church were not changed.

Hiraishi and Yamitsu on the Kitakami Line closed on 12 March 2022 and are not included. Izumi-Sotoasahikawa opened on 13 March 2021 and was added from its published station coordinate. Akita Shinkansen stops in the prefecture are Tazawako, Kakunodate, Omagari, and Akita.

## Miyagi

JR East passenger stations in Miyagi were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. Sendai Subway, Sendai Airport Transit, and Abukuma Express are not included. The existing Sendai station pin and the churches were not changed.

The Kesennuma Line railway now ends at Yanaizu. The stations from Rikuzen-Yokoyama to Fudonosawa lost their railway on 1 April 2020 and are not included. Kesennuma remains as the terminus of the Ofunato Line. Shishiori-Karakuwa and Kami-Shishiori are on the abolished Ofunato coastal section and are not included. Shiroishi-Zao and Kurikoma-Kogen were missing from the snapshot and were added from their published station coordinates. Tohoku Shinkansen stops in the prefecture are Shiroishi-Zao, Sendai, Furukawa, and Kurikoma-Kogen.

## Yamagata

JR East passenger stations in Yamagata were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Flower Nagai Line is not included. Imaizumi and Akayu are included once because JR trains still use them. The existing Yamagata station pin was not changed.

Akaiwa, closed on 12 March 2021, is in Fukushima and was not part of this list. Since the Rikuu West Line resumed on 16 January 2026, every train passes Uzen-Zennami and Takaya, so those two stations are not included. Yamagata Shinkansen stops in the prefecture are Yonezawa, Takahata, Akayu, Kaminoyama-Onsen, Yamagata, Tendo, Sakuranbo-Higashine, Murayama, Oishida, and Shinjo.

## Fukushima

JR East passenger stations in Fukushima were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Suigun Line stations in the prefecture are included. Abukuma Express, Aizu Railway, and the Fukushima Kotsu Iizaka Line are not included. The existing Iwaki station pin was not changed.

Akaiwa on the Ou Main Line closed on 12 March 2021 and is not included. J-Village opened on 20 April 2019 and became a permanent Joban Line station on 14 March 2020. The Joban Line stations between Tomioka and Namie are included because passenger service there resumed on 14 March 2020. The Tadami Line is included in full because it reopened on 1 October 2022. Tohoku Shinkansen stops in the prefecture are Shin-Shirakawa, Koriyama, and Fukushima. Fukushima is also the Yamagata Shinkansen stop.

## Niigata

JR passenger stations in Niigata were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Ōito Line stations in the prefecture are JR West and are included. Echigo Tokimeki Railway, Hokuetsu Express, and the Shinano Railway are not included. Jōetsumyōkō is included once because the Hokuriku Shinkansen stops there. The existing Niigata station pin was not changed.

The Yonesaka Line has had no trains between Imaizumi and Sakamachi since August 2022, so Echigo-Kanamaru, Echigo-Katakai, Echigo-Shimoseki, and Echigo-Ōshima are not included. Sakamachi remains as a Uetsu Main Line station. Gala-Yuzawa is the seasonal Jōetsu Shinkansen station and is included. Jōetsu Shinkansen stops in the prefecture are Echigo-Yuzawa, Gala-Yuzawa, Urasa, Nagaoka, Tsubame-Sanjō, and Niigata. Hokuriku Shinkansen stops are Jōetsumyōkō and Itoigawa.

## Toyama

JR passenger stations in Toyama were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Takayama Main Line, Johana Line, and Himi Line are JR West and are included. Ainokaze Toyama Railway and Toyama Chiho Railway are not included. The existing Toyama station pin was not changed.

Kurobe-Unazukionsen was not in the snapshot as a conventional station. It is included from its published Hokuriku Shinkansen coordinates. Hokuriku Shinkansen stops in the prefecture are Kurobe-Unazukionsen, Toyama, and Shin-Takaoka.

## Ishikawa

JR passenger stations in Ishikawa were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Nanao Line remains JR West. The Hokuriku Main Line stations in the prefecture transferred to IR Ishikawa Railway on 16 March 2024 and are not included, except where a Hokuriku Shinkansen train still stops. Noto Railway and the Hokuriku Railroad are not included. The existing Kanazawa pins were not changed.

Hokuriku Shinkansen stops in the prefecture are Kanazawa, Komatsu, and Kagaonsen.

## Fukui

JR passenger stations in Fukui were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Obama Line, Kuzuryū Line, and the Kosei Line stations in the prefecture are JR West and are included. Hapi-Line Fukui, Echizen Railway, and Fukui Railway are not included. Echizen-Hanandō stays once because Kuzuryū Line trains still use it. The existing Fukui station pin was not changed.

Echizen-Takefu opened with the Hokuriku Shinkansen on 16 March 2024 and is included from its published coordinates. Hokuriku Shinkansen stops in the prefecture are Tsuruga, Echizen-Takefu, Fukui, and Awaraonsen.

## Nagano

JR East and JR Central passenger stations in Nagano were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Chūō West Line and the Iida Line are JR Central. The other JR lines in the prefecture are JR East. Shinano Railway, Nagano Electric Railway, Ueda Electric Railway, and Alpico are not included. Karuizawa and Ueda are included once because the Hokuriku Shinkansen stops there. The existing Nagano station pin was not changed.

Hokuriku Shinkansen stops in the prefecture are Karuizawa, Sakudaira, Ueda, Nagano, and Iiyama.

## Yamanashi

JR East and JR Central passenger stations in Yamanashi were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Chūō East Line and the Koumi Line stations in the prefecture are JR East. The Minobu Line is JR Central. Fujikyu Railway is not included. Ōtsuki stays once because Chūō Line trains still use it. The existing Kofu station pin was not changed.

## Gifu

JR Central passenger stations in Gifu were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Tōkaidō Main Line, Takayama Main Line, Chūō West Line, and Taita Line are included. Meitetsu, Akechi Railway, Nagaragawa Railway, Tarumi Railway, and Yōrō Railway are not included. Tajimi, Mino-Ōta, Ena, and Ōgaki stay once because JR trains still use them. The existing Gifu and Gifu-Hashima pins were not changed.

Gifu-Hashima is the Tōkaidō Shinkansen stop in the prefecture.

## Shiga

JR passenger stations in Shiga were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Biwako Line, Kosei Line, Kusatsu Line, and Hokuriku Main Line are JR West. Kashiwara, Ōmi-Nagaoka, and Samegai are on the JR Central section of the Tōkaidō Main Line east of Maibara and are included. Ohmi Railway, Shigaraki Kōgen Railway, and Keihan are not included. Kibukawa, Ōmi-Shiotsu, and Kusatsu stay once because JR trains still use them. The existing Otsu and Maibara pins were not changed.

Maibara is the Tōkaidō Shinkansen stop in the prefecture.

## Mie

JR Central and JR West passenger stations in Mie were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Kansai Main Line west of Kameyama is JR West. The Kansai Main Line from Kameyama east, and the Kisei Main Line, Sangū Line, and Meishō Line in the prefecture, are JR Central. Tsuge is the Mie station on the JR West Kusatsu Line. Kintetsu, Ise Railway, Sangi Railway, and Iga Railway are not included. Kawarada, Tsu, and Iga-Ueno stay once because JR trains still use them. The existing Yokkaichi station pin was not changed.

## Nara

JR West passenger stations in Nara were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Yamatoji Line, Nara Line, Sakurai Line, and Wakayama Line are included. Kintetsu is not included. Ōji, Takada, Narayama, and Yoshinoguchi stay once because JR trains still use them. The existing Nara station pin was not changed.

## Shizuoka

JR Central and JR East passenger stations in Shizuoka were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Tōkaidō Main Line from Atami west, the Gotemba Line from Gotemba to Numazu, the Minobu Line, and the Iida Line are JR Central. Atami, the Itō Line, and the Gotemba Line stations Suruga-Oyama and Ashigara are JR East. Tōkaidō Shinkansen stops in the prefecture are Atami, Mishima, Shin-Fuji, Shizuoka, Kakegawa, and Hamamatsu. Those six pins were already on the map and were not changed. Izuhakone, Izukyu, Gakunan, Shizuoka Railway, Enshu Railway, Tenryu Hamanako, and the Oigawa Railway are not included.

## Wakayama

JR West and JR Central passenger stations in Wakayama were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Kisei Main Line from Shingū west, the Wakayama Line, and the Hanwa Line stations in the prefecture are JR West. Shingū is the JR Central boundary station on the Kisei Main Line. Nankai, Kishu Railway, and Wakayama Electric Railway are not included. Wakayama, Hashimoto, Gobō, and Wakayamashi stay once because JR trains still use them. The existing Wakayama station pin was not changed.

## Ibaraki

JR East passenger stations in Ibaraki were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Jōban Line, Mito Line, Suigun Line, Kashima Line, and the Utsunomiya Line are included. Koga is the only Utsunomiya Line station in the prefecture. Kairakuen and Kashima Soccer Stadium have limited service and remain open. Tsukuba Express, Kantō Railway, Kashima Rinkai Railway, Hitachinaka Seaside Railway, and Moka Railway are not included. Toride, Tomobe, Shimodate, Sanuki, Katsuta, Mito, Kashima-Jingū, and Kashima Soccer Stadium stay once because JR trains still use them. The existing Mito station pin was not changed. Yamato uses `jr_east_yamato_2` because `jr_east_yamato` was already used.

## Tochigi

JR East passenger stations in Tochigi were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Utsunomiya Line, the Tōhoku Main Line north of Kuroiso, the Nikkō Line, the Ryōmō Line, and the Karasuyama Line are included. Tōhoku Shinkansen stops in the prefecture are Oyama, Utsunomiya, and Nasushiobara. Oyama is also the Mito Line station in the prefecture. Tobu, Moka Railway, Watarase Keikoku Railway, and Yagan Railway are not included. The existing Utsunomiya station pin was not changed.

## Gunma

JR East passenger stations in Gunma were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Takasaki Line, Jōetsu Line, Shinetsu Main Line, Agatsuma Line, Ryōmō Line, and Hachikō Line are included. Jōmō-Kōgen and Annaka-Haruna were missing from the snapshot and were added from their published coordinates. Jōetsu Shinkansen stops in the prefecture are Takasaki and Jōmō-Kōgen. Hokuriku Shinkansen stops are Takasaki and Annaka-Haruna. Tobu, Joshin Electric Railway, Jomo Electric Railway, and Watarase Keikoku Railway are not included. The existing Takasaki station pin was not changed.

## Saitama

JR East passenger stations in Saitama were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Musashino, Saikyō, Keihin-Tōhoku, Hachikō, Kawagoe, Takasaki, and Utsunomiya lines are included. Shōnan-Shinjuku Line stops are Ōmiya and the Utsunomiya and Takasaki stations north of it. Urawa and Saitama-Shintoshin are not Shōnan-Shinjuku stops. Honjō-Waseda was missing from the snapshot and was added from its published coordinates. Tōhoku Shinkansen stops at Ōmiya. Jōetsu and Hokuriku Shinkansen stops are Ōmiya, Kumagaya, and Honjō-Waseda. Tobu, Seibu, Chichibu Railway, Saitama New Urban Transit, and Tsukuba Express are not included. Misato uses `jr_east_misato_2` because `jr_east_misato` was already used. The Kobe pin `jr_west_kobe` is now area `hyogo`, and the Tokuyama pin `sanyo_shinkansen_tokuyama` is now area `yamaguchi`. Their IDs were not changed.

## Chiba

JR East passenger stations in Chiba were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Sōbu Main Line, Chūō-Sōbu Line, Jōban Line, Narita Line, Keiyō Line, Musashino Line, Uchibō Line, Sotobō Line, Tōgane Line, Kururi Line, and the Kashima Line stations in the prefecture are included. Narita Airport Terminal 1 and Narita Airport Terminal 2·3 are the JR airport stations. Namegawa-Island remains open. Keisei, Tobu, Tokyo Metro, and Chiba Urban Monorail are not included. The existing Chiba station pin was not changed. Tateyama uses `jr_east_tateyama_2` and Omigawa uses `jr_east_omigawa_2` because those IDs were already used.

## Kanagawa

JR East and JR Central passenger stations in Kanagawa were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Tōkaidō Main Line, Yokosuka Line, Keihin-Tōhoku Line, Negishi Line, Yokohama Line, Nambu Line, Tsurumi Line, Sagami Line, Gotemba Line, and Chūō Main Line stations in the prefecture are JR East. Tōkaidō Shinkansen stops are Shin-Yokohama and Odawara, operated by JR Central. Shōnan-Shinjuku Line stops in the prefecture are Musashi-Kosugi, Shin-Kawasaki, Yokohama, Hodogaya, Higashi-Totsuka, Totsuka, and Ōfuna. Odakyu, Keikyu, Tokyu, Sotetsu, Enoden, and Yokohama Municipal Subway are not included. The existing Odawara and Shin-Yokohama pins were not changed. Kuji uses `jr_east_kuji_2` and Negishi uses `jr_east_negishi_2` because those IDs were already used.

## Aichi

JR Central passenger stations in Aichi were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Tōkaidō Main Line, Chūō Main Line, Kansai Main Line, Iida Line, and Taketoyo Line are included. Tōkaidō Shinkansen stops in the prefecture are Toyohashi, Mikawa-Anjo, and Nagoya. Meitetsu, Kintetsu, Nagoya subway, Aonami, and Linimo are not included. The existing Nagoya, Mikawa-Anjo, and Toyohashi pins were not changed.

## Hyogo

JR West passenger stations in Hyogo were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Tōkaidō Main Line, San'yō Main Line, JR Kōbe Line, Fukuchiyama Line, JR Tōzai Line, Bantan Line, Kishin Line, Kakogawa Line, San'in Main Line, Akō Line, and Wadamisaki Line are included. The JR Kōbe Line count is the branded section from Amagasaki to Himeji. San'yō Shinkansen stops are Shin-Kobe, Nishi-Akashi, Himeji, and Aioi. Hankyu, Hanshin, Sanyo Electric Railway, Kobe Electric Railway, and Kobe subway are not included. The existing Kobe pin remains `jr_west_kobe` with area `hyogo`. The existing Aioi, Nishi-Akashi, Shin-Kobe, and Himeji pins were not changed.

## Kyoto

JR West passenger stations in Kyoto were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The JR Kyōto Line and Biwako Line are the branded parts of the Tōkaidō Main Line in the prefecture. The Sagano Line is the Kyōto–Sonobe section of the San'in Main Line. The Nara Line, Gakkentoshi Line, Kansai Main Line, Fukuchiyama Line, Maizuru Line, Kosei Line, and Obama Line stations in the prefecture are included. Kyōto is the Tōkaidō Shinkansen stop. Kintetsu, Hankyu, Keihan, Kyoto subway, Randen, Eizan Railway, and Kyoto Tango Railway are not included. The existing Kyoto station pin was not changed. Shinkyū-Daigakumae keeps that name.

## Osaka

JR West passenger stations in Osaka were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Osaka Loop Line, JR Kyōto Line, JR Kōbe Line, JR Takarazuka Line, JR Tōzai Line, Gakkentoshi Line, Yamatoji Line, Hanwa Line, Kansai Airport Line, JR Yumesaki Line, and Osaka Higashi Line are included. Higashi-Hagoromo is the Hanwa branch. Kansai Airport is included. Minami-Suita, JR-Awaji, Shirokitakōendōri, and JR-Noe opened on the Osaka Higashi Line on 16 March 2019 and were added from their published coordinates. Shin-Ōsaka is the Tōkaidō and San'yō Shinkansen stop. Osaka Metro, Hankyu, Hanshin, Kintetsu, Keihan, Nankai, and Osaka Monorail are not included. The existing Osaka and Shin-Ōsaka pins were not changed. Takatsuki uses `jr_west_takatsuki_2` because `jr_west_takatsuki` was already used.

## Tokyo

JR East passenger stations in Tokyo were taken from the 30 March 2018 ekidata snapshot and checked against the lines still open on 25 November 2026. The Yamanote, Chūō, Chūō-Sōbu, Keihin-Tōhoku, Tōkaidō, Yokosuka, Sōbu, Jōban, Saikyō, Shōnan-Shinjuku, Utsunomiya, Takasaki, Keiyō, Musashino, Nambu, Yokohama, Ōme, Itsukaichi, and Hachikō lines are included. The Chūō Rapid count and the Chūō Main count are the same 24 stations from Tokyo to Takao. Takanawa Gateway opened on 14 March 2020 and was added from its published coordinates. Shinkansen stops are Tokyo, Ueno, and Shinagawa. Tokyo Metro, Toei, Tokyo Monorail, and Yurikamome are not included. The 13 existing JR station pins were not given new IDs. Ōkubo uses `jr_east_okubo_2`, Kawai uses `jr_east_kawai_2`, and Kori uses `jr_east_kori_2`.

## Add another prefecture

1. Open the Japanese Wikipedia article for each JR line in that prefecture and use its current passenger-station list. Skip rows marked closed, freight-only, or temporary. Skip private railways and trams.
2. Look up each station in OpenStreetMap. Prefer the railway station node. A station-front stop is acceptable only when it is the public entrance and the railway node cannot be found. Do not use a coordinate on a bridge deck, in the water, or at a different station of the same short name.
3. Keep the station only if the coordinate is inside the prefecture. One pin per station, even where lines meet.
4. Search `site/data/japan/map-data.js` for the same `name` in the same `area` before adding. Reuse the existing pin.
5. Add a pin in the same shape as the current JR West and JR Shikoku pins: `id`, `line`, `area`, `name`, `nameEn`, `type: "station"`, `lat`, `lng`.
6. Do not edit the check-in engine. `site/map/js/config/locations.js` already treats every `type: "station"` pin as one railway check-in per device.

Airports, temples, and scenic places are separate records. They are not part of this station list.

## Audit against a structured list

`tools/railway-import/audit_stations.py` compares one prefecture with a structured station list. It does not rebuild the map. An apply step only appends approved stations and does not change an existing id.

```
python3 tools/railway-import/audit_stations.py --prefecture yamaguchi
python3 tools/railway-import/audit_stations.py --apply tools/railway-import/preview/yamaguchi.json
```

The preview JSON has `matched`, `missing`, `conflicts`, `closedInSnapshot`, and `onMapButNotInSnapshot`. `approve` starts as a copy of `missing`. Delete any row that should not be added, then run `--apply`.

The input is `tools/railway-import/cache/station20180330free.csv`, the ekidata export dated 2018-03-30 from `piuccio/open-data-jp-railway-stations` (`input/station20180330free.csv`). JR lines are the `11xxx` line codes. `e_status` `0` is treated as operating in that snapshot and `2` as closed. The cache and preview folders are gitignored.

Why this file, and not the other two candidates:

- `stations.json` in the same repository groups stations and is useful for Kanto line codes, but most `line_code` values are empty. It cannot select JR West, JR Shikoku, or JR Kyushu stations.
- MLIT’s railway GIS (国土数値情報 N02) is the official national dataset. It is a shapefile of every operator, updated on MLIT’s own schedule, and it has no English names. It is the right official reference for a later converter. It is not the input of this script.

The 2018 snapshot cannot show a later suspension. 美祢線 is still “operating” in that file even though rail service has since been abandoned. Read `missing` before approving. The Admin Centre does not call this script yet. The command above is what a later local admin action should run.

# Historical puzzle artwork

Location mosaics use historically inspired animal illustrations as the principal artwork. The pictures should be respectful, visually credible, and lightly humorous. Turbo is the guide. Turbo may appear in celebrations. Turbo is not the subject of every puzzle.

Railway and airport mosaics may use Japanese historical animal illustrations and other complete historical scenes. Nationally recognizable figures, including Sakamoto Ryōma, Oda Nobunaga, Tokugawa Ieyasu, and figures of similar standing, may be used anywhere in Japan. A home prefecture is not required.

Castles and cultural discoveries use a locally associated figure only when that connection is well established. If the link is uncertain or disputed, do not invent it. Use a national figure or a castle illustration instead.

Interlocking jigsaw puzzles stay separate. Those puzzles keep Turbo characters, collectible heroes, and merchant art. The Japanese animal heroes already listed in `site/data/heroes.js` stay in that collectible set. They are not repeated in the historical puzzle catalogue.

Historical figures are complete illustrations with backgrounds. Web delivery is an optimized JPEG or WebP. A transparent PNG is used only if it is later chosen for the Creative Game.

Which puzzle image is shown stays in config. It does not belong inside GPS logic.

This is not a reward system. Do not deploy it without approval.

## What is already on file

The active catalogue is `site/data/historical-puzzle-art.json`. It is separate from `site/data/heroes.js`. It does not add collectibles, change map pins, or choose a puzzle image.

Thirty-two historical animal illustrations were found as masters in `artwork/heroes/ivory/` (the same files also sit under `japanese.jp/turbo_adventure/heroes/japanese_heroes/japanese_historical_heroes_jpg/`). Each one is an animal in a complete scene, with a background. None of them has a web copy, so every one is `master-only`. No new image files were copied.

National figures present as distinct animal scenes: Sakamoto Ryōma, Tokugawa Ieyasu, and Toyotomi Hideyoshi, plus Takeda Shingen, Uesugi Kenshin, Date Masamune, Miyamoto Musashi, Himiko, Saigō Takamori, Murasaki Shikibu, Sei Shōnagon, Fukuzawa Yukichi, Katsushika Hokusai, Matsuo Bashō, Sen no Rikyū, and Natsume Sōseki. Those are proposed for railway or airport use, not for a named castle.

No distinct Oda Nobunaga illustration was found. The file named `oda_nobunaga.jpg` is byte-identical to `sakamoto_ryoma.jpg`, which is the Shiba scene labeled Sakamoto Ryōma. It is not catalogued as Nobunaga. No file named for a Shōhekiga screen, or any other complete historical scene without a named animal figure, was found.

Other animal scenes (Kuroda Kanbei, Katō Kiyomasa, Nabeshima Naomasa, Tachibana Muneshige, Amakusa Shirō, and the remaining regional or foreign figures in the same folder) are left `unassigned`. A castle in the background of a portrait is not treated as permission to attach that figure to a castle.

Thirty-nine castle WebP illustrations are already in `site/img/map/castles/` and are listed as available castle art. Four further files in `japanese.jp/turbo_adventure/japanese_castles/` have no web copy (Goryōkaku fort, Katsuyama date, Nemuro peninsula chashi sites, Shinori date) and stay master-only. No figure is assigned to any of these castles.

Victorian human celebrity portraits under `japanese.jp/turbo_adventure/heroes/victorian_celebrities/` stay future and inactive. They are not puzzle art. Japanese historical human portraits were not added; the historical files inspected for this catalogue are animal illustrations, and any future human portrait stays inactive until a separate decision says otherwise.

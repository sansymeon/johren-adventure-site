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

After sign-in, the home page links to Creator Studio, Puzzle Manager, Artwork Library, Map Manager, Merchant Manager, Settings, and Backup / Restore.

Publishing asks you to type `PUBLISH`, then runs `tools/publish-site.sh`. That sends only `site/` to johrenadventure.com. Do not publish until the local site has been reviewed.

## Player site

Map check-in, collections, and puzzles still use `site/`. They do not read `artwork/`.

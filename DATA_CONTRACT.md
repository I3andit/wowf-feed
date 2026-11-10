# wowf-feed contract: data (v1) and page code (v2, 2026-11-03)

The research feed for Jason's self-hosted WoW Forever Command Table. The WoW Forever Bot (Grok) writes ONE file, `wowf-data.json`, to the public repo `I3andit/wowf-feed` on branch `main`. Jason's EliteDesk pulls it every 15 minutes, checks it, and only then shows it. A file that fails the check is ignored and the page keeps the last good copy, so a bad push never breaks the page, but it also never shows up.

Since v2 the Bot also owns the page itself: its code lives in this repo under `site/`, and the EliteDesk rebuilds the page when `site/` changes (see **Page code** at the end).

Source of truth for this contract: `Fun Builds/WoW Forever/command-table-site/DATA_CONTRACT.md` in Jason's vault. The data checker is `server/validate.py` next to it; the page build gate is `server/site_builder.py`.

## Shape

The same sections and constant names as `research-data.json` from the Nov 3 export, minus `_about` and `inline_page_lists`, plus `page_lists`, optional `captions`, and `_meta`. Every constant keeps the exact structure the page code reads (tuples stay tuples, field names unchanged).

| Section | Keys |
|---|---|
| `schedule` | `LAUNCH_MS`, `RAIDS_MS` (epoch ms), `LAUNCH_ISO`, `RAIDS_ISO` |
| `characters` | `CHARS`, `CHAR_PROFS`, `SKILL_KEYS` |
| `meta_board` | `META` |
| `talents` | `TREES`, `ORDERS`, `STATIC`, `BUILD_DEFS`, `WHY`, `PATH_NODES` |
| `rotations` | `ROT` |
| `naga` | `NAGA`, `KEYS12`, `ROWS12`, `NAGA12`, `SETUP12` |
| `macros` | `WFDB_AFF`, `WFDB_DEMO`, `WFDB_ENH`, `MACROS` |
| `professions` | `TRAIN_STD`, `PROFS`, `SKIN_ZONES`, `LEATHER`, `PIN_TRAIN`, `PROF_PINS`, `PROF_WHY` |
| `gear` | `SHAM_GEAR`, `LOCK_GEAR`, `QUALITY`, `ITEM_INFO`, `GEAR_SHEETS`, `GEAR_EXTRA_IDS` |
| `dungeons` | `DUNGEONS`, `DUN_NOTES_LOOT`, `DKEYS`, `PRESET_BASE`, `PRESETS`, optional `LOOT`, optional `STAT_WEIGHTS` (below) |
| `trainers` | `TRAINER_RAW`, `TRAIN_SRC`, `TRAIN_NOTE` |
| `addons` | `INSTALLED` |
| `launch_night` | `LAUNCH_ITEMS`, `ROUTES`, `corvin_first_session` {`FIRST_ROUTE`, `FIRST_SPELL_ICON`, `FIRST_TRAINER`, `FIRST_SRC`} |
| `progress` | `PROGRESS`, `CHECK_IDS`, `DEFAULT_CHECKS` (the page recomputes the last two; keep them accurate or leave them as they are) |
| `tags` | `PRE_LABEL`, `NOTES_PRE`, `PRE_MARKS` |
| `page_lists` | The lists that used to be written inline in the page (below) |
| `captions` | Optional. Section id → caption string, overrides the built-in caption (e.g. replace "Pre-launch only" on `meta` after launch). Ids: ding, first, launch, chars, meta, feed, path, builds, rotations, naga, profs, gear, macros, addons, progress |
| `_meta` | `version` (integer, bump on every push), `generated_at` (ISO date or date-time ET), `source` (short text), `notes_commit` (vault commit the notes were read at, or null), optional `notes` (one short line shown in the page header) |

### page_lists

| Key | Type | Where it shows |
|---|---|---|
| `meta_raid_watch` | `{lead, tone, text}` callout, tone `warning` or `info` | Meta board |
| `meta_links`, `feed_links`, `addons_links_shaman`, `addons_links_warlock`, `addons_links_both` | `[{title, site, date?, href}]` | Link cards |
| `feed_racials_left`, `feed_racials_right` | `[{label, value}]` | Pinned racials |
| `feed_rows` | `[{lead, title, detail, meta, status: {label, tone}}]`, newest first; label one of Official / Unofficial / Unofficial, single source / Sim, pre-launch; tone `success` for Official, `warning` otherwise | Patch and datamine feed |
| `feed_notes_out_of_date`, `talents_enh_bullets` | `[string]` or `[{text, _source?, _date?}]` | Bullet lists |
| `talents_level60`, `talents_brand`, `naga_when_to_swap` | `{lead, tone, text}` | Callouts |
| `naga_setup6` | `[{title, detail}]` | Steps |
| `profs_note_skinning`, `profs_note_tailoring`, `profs_note_trainers`, `profs_note_slider`, `gear_raid_preview`, `macros_skip`, `addons_installed_note`, `addons_install_note` | `{text}` | Paragraphs |

Items may carry extra `_source` / `_date` fields; the page ignores unknown fields.

### dungeons.LOOT and dungeons.STAT_WEIGHTS (optional, added 2026-11-10)

The page's "Dungeon gear" panel lists what each dungeon gives a character and compares it with the gear the game sync reports as equipped. Both keys are optional; a dungeon with no `LOOT` rows shows the board's own gear picks from it instead.

`LOOT` is a list with one object per item per dungeon:

| Field | Meaning |
|---|---|
| `dkey` | The dungeon's key from `DKEYS` (same index as its `DUNGEONS` row). Required. |
| `item` | Exact item name. Required. |
| `id` | Item id when the source gives it (lets the page spot an item already worn). |
| `q` | Quality number as in `gear.QUALITY` (2 uncommon, 3 rare, 4 epic). |
| `slot` | One of Head, Neck, Shoulder, Back, Chest, Wrist, Hands, Waist, Legs, Feet, Finger, Trinket, Main Hand, One-Hand, Two-Hand, Off Hand, Ranged. Required. |
| `type` | Armor or weapon type (Cloth, Leather, Mail, Staff, Wand, Shield...). |
| `req` | Level required to equip. |
| `boss` or `quest` | Where it comes from: the boss name, or the quest name for a quest reward. |
| `rate` | Drop chance as text. Say "(Classic)" when the number is Classic data and "(Forever)" only when a Forever source publishes it. Leave out when unknown. |
| `stats` | Object using only these keys: `dps` (weapon damage per second), `str`, `agi`, `sta`, `int`, `spi`, `sp` (spell power or spell damage), `heal`, `ap`, `crit`, `hit`, `mp5`, `hp5`, `armor`. Leave out zero stats. Leave the whole object out when no source publishes the item's stats. |
| `for` | Who it is for: `["C"]` Corvin, `["V"]` the shaman, or both. Left out means both. |
| `note` | Short caveat: procs, on-use effects, Classic-only numbers. |
| `_source`, `_date` | Source URLs (separated by " ; ") and the date read. |

`STAT_WEIGHTS` is `{ "V": { stat: points per 1 of that stat }, "C": { ... } }` and replaces the page's default stat priorities. Send it only with a cited Forever source.

The upgrade score on the page is the stat change times these weights. It is an estimate, not a simulation.

## Rules the checker enforces (a push that breaks one is ignored)

1. Valid JSON, under 2 MB, every section and key in the table above present.
2. Tick ids stay unique across launch items, route steps, gear rows, dungeons, progress and gear extras.
3. **Ids keep their meaning.** Saved progress is stored by tick id:
   - Explicit ids (`la*` in LAUNCH_ITEMS, `p*` in PROGRESS, GEAR_EXTRA_IDS, DKEYS) can be added anywhere but never removed or reused for something else.
   - Numbered rows mean "row n": ROUTES steps, SHAM_GEAR rows and LOCK_GEAR rows can only grow AT THE END. Changing the text of an existing row is fine; inserting or deleting a row is not.
   - DKEYS has exactly one key per DUNGEONS row, in the same order.
4. `SKILL_KEYS` never changes.

## Writing rules (the checker can't see these, so they're on you)

- Every claim keeps its source and the date read, exactly as your standing rules say. Official / Unofficial tags and the pre-launch tags (`PRE_MARKS`) stay as they are.
- Never rename a key or change a structure; add fields if needed, the page ignores unknown ones.
- One commit per research run, message `research: <date> <one-line summary>`, only `wowf-data.json` changes (plus this contract if Jason updates it). Page changes go in their own commits (below).
- Never put anything personal, tokens or links with credentials in the file. The repo is public.

## Page code (v2, 2026-11-03)

The Bot owns the Command Table's look and features. The page source is in `site/`; Claude owns the server, the build, game sync and the safety checks on the EliteDesk.

### What you may edit

- `site/src/*.tsx` (and `.ts`, `.css`, `.json` next to them): `app.tsx` is the page, `kit.tsx` the building blocks, `main.tsx` the bootstrap.
- `site/public/*`: `index.html`, plus images, icons and font files the page uses (`.png .jpg .webp .avif .gif .svg .ico .woff .woff2 .css .js .json .txt .webmanifest`). Real image files are fine now; put them here and load them by path, for example `/icons/bloodlust.avif`.
- Nothing else in `site/`. The build refuses `package.json`, lockfiles, `tsconfig.json`, `.npmrc` and any other file type, and never runs npm with anything from this repo. Dependencies are fixed by Claude: React 18.3.1, react-dom 18.3.1, esbuild 0.24.2.

### Rules the build checks (a change that breaks one is not built, and the page stays as it was)

1. `site/src/main.tsx` and `site/public/index.html` exist; `index.html` loads `/app.js` and keeps `<div id="root">`.
2. The bundle only imports files in `site/src`, the seed data `../../wowf-data.json` (from `main.tsx`), `react`, `react-dom/client` and `react/jsx-runtime`. No other packages, no paths outside `site/src`.
3. It compiles with: `esbuild site/src/main.tsx --bundle --minify --format=esm --splitting --outdir=<out> --entry-names=app --chunk-names=chunk-[hash] --loader:.json=json --jsx=automatic --target=es2020 --tsconfig-raw={}`. No other loaders or plugins exist.
4. `site/public` must not contain `app.js`, `chunk-*` or `wf-guard.js` (those names belong to the build and the server). `site/` stays under 20 MB, 8 MB per file.

### Rules the page must keep (the browser enforces some, the rest are on you)

- **`WF_DATA` and `WF_STORE` keep working.** `main.tsx` loads `/data/wowf-data.json` into `globalThis.WF_DATA` (the bundled seed is the fallback) and saved progress into `globalThis.WF_STORE` = `{initial, online, save(part, value), onStatus(fn)}` before `app.tsx` loads. `app.tsx` reads every research constant from `WF_DATA` and saves through `WF_STORE.save("st" | "first", value)`. Keep those names and shapes; the server stores whatever `WF_STORE` sends in `/api/state`, and game sync writes `st.lvV`, `st.lvC` and `st.sk` into it.
- **Keep the `Guard` error boundary around `<App />` in `main.tsx`**, and keep the `report("boot", ...)` call in its `catch`.
- **Network:** the page may call only its own `/api/*` and `/data/*`. The server sends a Content-Security-Policy, so anything else is blocked in the browser: no external scripts at all, styles and fonts only from Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), images only from the page's own files, `data:` or `blob:`. Links (`<a href>`) to Wowhead and others are fine, they are navigation, not loads.
- No `eval` or `new Function` (also blocked).
- Nothing personal, no tokens: the repo is public.

### Component names the kit provides (`site/src/kit.tsx`)

Write the same component calls you use on the canvas, imported from `./kit` instead of `grok/canvas`:
`Page`, `Section`, `Text`, `Callout`, `Table`, `Status`, `Rows`, `Properties`, `Grid`, `Segmented`, `Steps`, `LinkCards`, `TableOfContents`, `BulletList`, `Toggle`, the hook `useGrokTheme`, React's `useState`, `useEffect`, `useMemo`, the type `ReactNode`, and `KIT_CSS` (the kit's stylesheet, injected by `main.tsx`). `Checklist` is not in the kit (the page imports the name but never uses it); add it to `kit.tsx` before using it. You may restyle or extend the kit; keep the existing props working or update every call site in the same commit.

### How a change goes live, and how rollback works

1. Commit to `main` touching only `site/`, message `page: <date> <one-line summary>`. One logical change per commit.
2. The EliteDesk checks the repo every 15 minutes. If the `site/` folder changed, it builds it. A data-only commit never rebuilds the page.
3. **Build fails:** the old page keeps serving, the error is recorded, and that exact `site/` content is not tried again. Push a fix as a new commit.
4. **Build passes:** it goes live; the previous build is kept.
5. **Crash in the browser:** the server adds a small crash reporter to every page load. For 72 hours after a build goes live, an uncaught error, a crash caught by `Guard`, a failed start, or nothing rendered into `#root` within 15 seconds switches the page back to the previous build, and the page reloads once. That `site/` content is then never rebuilt; push a fix. (Unhandled promise rejections are logged, not rolled back.)
6. `http://192.168.1.205:8484/api/status` (home network only) shows it all under `site`: `live` (commit, message, when), `last_build` (ok or the error), `last_rollback` (from, to, reason), `last_client_error`, `last_clean_load`. Jason or Claude can paste it to you.

### Check before you commit (if your sandbox has Node)

In a scratch folder outside the repo clone: `npm init -y && npm install react@18.3.1 react-dom@18.3.1 esbuild@0.24.2`, then copy the repo's `site/` and `wowf-data.json` into it and run the rule 3 command from that folder. If it compiles, the EliteDesk build will too. If you can't run Node, read your diff for missing imports, renamed components and broken JSX before committing; a failed build costs nothing but time, the page stays up.

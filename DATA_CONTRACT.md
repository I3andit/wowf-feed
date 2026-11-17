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
| `gear` | `SHAM_GEAR`, `LOCK_GEAR`, `QUALITY`, `ITEM_INFO`, `GEAR_SHEETS` (`sham`, `lock`, optional `K`), `GEAR_EXTRA_IDS` |
| `dungeons` | `DUNGEONS`, `DUN_NOTES_LOOT`, `DKEYS`, `PRESET_BASE`, `PRESETS`, optional `LOOT`, optional `STAT_WEIGHTS` (below), optional `DUN_NOTES_K` (Kestrik, at the end) |
| `trainers` | `TRAINER_RAW`, `TRAIN_SRC`, `TRAIN_NOTE` |
| `addons` | `INSTALLED` |
| `launch_night` | `LAUNCH_ITEMS`, `ROUTES`, `corvin_first_session` {`FIRST_ROUTE`, `FIRST_SPELL_ICON`, `FIRST_TRAINER`, `FIRST_SRC`} |
| `progress` | `PROGRESS`, `CHECK_IDS`, `DEFAULT_CHECKS` (the page recomputes the last two; keep them accurate or leave them as they are) |
| `tags` | `PRE_LABEL`, `NOTES_PRE`, `PRE_MARKS` |
| `page_lists` | The lists that used to be written inline in the page (below) |
| `captions` | Optional. Section id → caption string, overrides the built-in caption (e.g. replace "Pre-launch only" on `meta` after launch). Ids: ding, first, launch, chars, meta, feed, path, builds, rotations, naga, profs, gear, macros, addons, progress |
| `_meta` | `version` (integer, bump on every push), `generated_at` (ISO date or date-time ET), `source` (short text), `notes_commit` (vault commit the notes were read at, or null), optional `notes` (one short line shown in the page header) |

**Profession trainer ranks (2026-11-17).** Every `professions.PROFS[].train` list keeps exactly three rows in rank order: Journeyman, Expert, Artisan, each `[skill it opens at, text]`. The page picks the row from the cap the game sync reports (75 means Journeyman is still untrained, 150 Expert, 225 Artisan) and shows "Train now" when the skill has reached that row's number. A missing or reordered row would point the hint at the wrong rank. Every list already has this shape, so nothing changes. Without a game sync the page still guesses the rank from the skill number.

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
| `stats` | Object using only these keys: `dps` (weapon damage per second; for a wand in the Ranged slot it is scored with the `wand` weight), `str`, `agi`, `sta`, `int`, `spi`, `sp` (spell power or spell damage, all schools), `shadow`, `fire`, `frost`, `nature` (spell damage for that one school only, added 2026-11-10), `heal`, `ap`, `crit`, `hit`, `mp5`, `hp5`, `armor`. Leave out zero stats. Leave the whole object out when no source publishes the item's stats. |
| `for` | Who it is for: a list of `"C"` Corvin, `"V"` the shaman, `"K"` Kestrik. Left out means Corvin and the shaman only; Kestrik sees a row only when `"K"` is listed. |
| `note` | Short caveat: procs, on-use effects, Classic-only numbers. |
| `_source`, `_date` | Source URLs (separated by " ; ") and the date read. |

`STAT_WEIGHTS` is `{ "V": { stat: points per 1 of that stat }, "C": { ... }, "K": { ... } }` and replaces the page's default stat priorities, one character at a time (a character you leave out keeps the defaults). A full set replaces the defaults for that character, so include every stat that should count. `wand` is the weight for wand DPS in the Ranged slot. Send it only with a cited Forever source.

The upgrade score on the page is the stat change times these weights. It is an estimate, not a simulation.

### Gear pick extras: `alts` and `stats` (optional, added 2026-11-10)

Each pick in `gear.GEAR_SHEETS` may carry two more optional fields.

- `alts`: a list of alternates, `[{ "item": "Exact Item Name", "label": "Alt — short reason", "how": "how to get it", "stats": { ... } }]`. When present it replaces the single `alt` / `alt_label` / `alt_acquisition` trio for display, so put every alternate in it, the old one included. Leave the old trio in place too if you like; the page ignores it once `alts` exists.
- `stats`: the pick's own stats, same keys as `dungeons.LOOT`. Only needed for picks that have no `LOOT` row (crafted items, world quests, vendor items). Picks and alternates that match a `LOOT` row by exact item name take their stats, slot and item id from that row.

The sheet shows "Score N" on every pick and alternate that has stats, plus the change against the item worn in game when the game sync has that item's stats. Keep any score you write into how-to text in step with these stats, because the page number is computed and yours is typed.

### Respec plans and reference copies (optional, added 2026-11-10)

A class's leveling plan can change talent order part way up. The page reads these optional fields on `talents.BUILD_DEFS` entries:

| Field | Meaning |
|---|---|
| `primary` | `true` on the one warlock build Corvin follows. Its `seq` becomes the default guide for Next ding, Rotations, Naga and the path. A guide pick saved before this build was primary resets to it once. Only one build per class. |
| `respec_at` | The level of the respec. Put it on both halves of the plan. |
| `before` | On the main build: the `key` of the build that is in force below `respec_at`. |
| `then` | On the first-half build: the `key` of the main build. A build with `then` is not offered as a guide of its own. |

What the page does with a respec plan: the talent planner, Next ding and the launch card use the first-half order below `respec_at` and the main order from it on (all points re-spent from the main order's first point). The planner shows a "Respec at N" banner, a marker in the level strip and on the slider. Next ding shows the countdown, and one level before the respec it prints the body of the `PATH_NODES` entry whose `at` equals `respec_at`, so keep the respec instructions in that node. A rotation step or unlock that names a `talent` from the main order never shows a level below `respec_at`.

Reference copies. When Corvin's picked guide is not the primary plan, the page swaps to the kept copies when they exist, so keep them complete:

- `rotations.ROT.aff` and `.demo`: `quest_icy` and `dungeon_icy` (same shape as `quest` / `dungeon`). The Rotations card also has a reference button that shows them on request.
- `naga.NAGA.aff` and `.demo`: `auto_icy` (same shape as `auto`).
- `talents.PATH_NODES_ICY` (same shape as `PATH_NODES`). The old hardcoded path cards (Soul Link respec, respec cost, Spec 2 at 40) only show with these.

On the primary plan the path header is built from the main build (short name plus its final split) and the two cards under the timeline are the two builds' `label`, `blurb`, `src`, `date` and `tag`. A `PATH_NODES` entry's `_tag` shows as a chip under its text.

Names the page derives, so word them with that in mind: the guide picker and the path header call a respec plan "<first word of the main build's label> respec <level>" (for example "Mobalytics respec 26"). Corvin's first Rotations and Naga tab is called "Leveling (<first word of ROT.aff.quest.src[0].label>)" on a primary plan and "Affliction" otherwise. From `respec_at` the Demonology tab is the one opened by default. The hero line under Corvin's name is `characters.CHARS[1].line`.

Section captions were already data: `captions.path`, `captions.builds`, `captions.rotations`, `captions.naga` and `captions.macros` replace the built-in captions (see the `captions` row in the table above).

### Naga keys and the priority strip (page behaviour since 2026-11-10)

- Plate slots map to buttons in order on both plates: slot 1 is Naga 1, slot 6 is Naga 6, then Shift+1 to Shift+6 (6-button plate) or buttons 7 to 12 and then Shift (12-button plate). The old back-column remap (6, 5, 4) is gone. The drawing still shows the physical columns.
- Slot order is: learned rotation entries in the order of the first rotation step they cover, then learned utility entries in pool order, then everything not learned yet.
- The number on a step in the Rotations priority strip is the Naga key that step sits on ("S2" is Shift+Naga 2). It is looked up by step name in `naga.NAGA[spec].auto.pool[].covers`, or the step's own slot when no pool entry covers it.
- A step shows no number when it is not learned yet at the character's level, when it is listed in `auto.skip`, or when no pool entry covers its name. So to give a Dungeon step a number, add its exact step name to the `covers` of the pool entry it is pressed with (for example "Shadow Bolt filler" on the Shadow Bolt entry). Steps with their own button that only exist in the Dungeon list need a pool entry that covers them.
- Two steps covered by one pool entry show the same number, and a locked step that will share a live key says so in its hover text.

## Rules the checker enforces (a push that breaks one is ignored)

1. Valid JSON, under 2 MB, every section and key in the table above present.
2. Tick ids stay unique across launch items, route steps, gear rows, dungeons, progress and gear extras. Since 2026-11-17 the page also builds `dk<DKEYS key>` for Kestrik's dungeon clears, so no other id may start with `dk`.
3. **Ids keep their meaning.** Saved progress is stored by tick id:
   - Explicit ids (`la*` in LAUNCH_ITEMS, `p*` in PROGRESS, GEAR_EXTRA_IDS, DKEYS) can be added anywhere but never removed or reused for something else.
   - Numbered rows mean "row n": ROUTES steps, SHAM_GEAR rows and LOCK_GEAR rows can only grow AT THE END. Changing the text of an existing row is fine; inserting or deleting a row is not.
   - DKEYS has exactly one key per DUNGEONS row, in the same order.
4. `SKILL_KEYS` never changes.
5. **Kestrik's optional keys, when present, have the shape in "Kestrik's talents, professions, gear and dungeons".** Checked: `talents.TREES.druid` is 3 well-formed trees and every prerequisite names a druid talent; every `BUILD_DEFS` entry with `cls: "druid"` has a key, a label and an order that exists, spends only talents from `TREES.druid`, never more points than a talent has ranks and never more than 51; `gear.GEAR_SHEETS.K` has `left`, `right`, `bottom`, every pick has its required fields and a `gk` id that is unique and listed in `GEAR_EXTRA_IDS`; `dungeons.DUN_NOTES_K` is an object whose keys are all in `DKEYS`; `dungeons.STAT_WEIGHTS` is `{character: {stat: number}}`; every `LOOT[].for` is a list made of `"C"`, `"V"`, `"K"`; `characters.CHAR_PROFS.K` lists only `PROFS` keys. The reason for a rejected feed is in `/api/status` under `feed.last_error`.

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

## Third character: Kestrik (added 2026-11-17)

Kestrik Galecrest is a Feral druid. His internal key is `K` (Corvin is `C`, Zanjiro is `V`). The page shows him only when all of these exist, so never remove or rename them:

- `characters.CHARS[2]` (his card; `CHARS[0]` stays Zanjiro and `CHARS[1]` stays Corvin) and `characters.CHAR_PROFS.K` (a list, may be empty).
- `trainers.TRAINER_RAW.druid` and `trainers.TRAIN_SRC.druid`.
- `rotations.ROT.cat`, `.bear`, `.caster`, each with `quest` and `dungeon`.
- `naga.NAGA.cat`, `.bear`, `.caster` and `naga.NAGA12.cat`, `.bear`, `.caster`.

His forms are his specs. Each form has its own main bar in game, so each has its own rotation and Naga plate. The spec keys are `cat`, `bear` and `caster`.

**Fixed plates.** A druid plate does not follow rotation order. `naga.NAGA[form].auto` has `"fixed": true` and every `pool` entry has a `slot`: 1 to 6 are Naga 1 to 6, 7 to 12 are Shift+Naga 1 to 6 (Naga 7 to 12 on the 12-button plate), 13 to 18 are the 12-button plate's Shift layer. Two entries may share a slot: the newest one he has learned shows (`lvl`), and a slot with nothing learned shows its first entry greyed with its level. Keep the same job in the same slot across the three forms (heal on 6, Bear key on 7, Cat key on 8, travel on 12). `covers` works as on the other plates: it gives a rotation step its key number.

**Macros.** `spec` is `cat`, `bear` or `caster` for one form, or `druid` for a macro that sits on every bar. `bind` names pool keys, as for the other characters.

**Talent trees, professions, gear and dungeons.** The page reads them since 2026-11-17, all from optional keys: see "Kestrik's talents, professions, gear and dungeons" below for the exact keys and shapes. A section whose keys are missing shows one line. `SKILL_KEYS` still never changes.

**State.** His level is `st.lvK` (game sync writes it, like `lvV` and `lvC`), his profession skills are `st.sk["K:<PROFS key>"]`. The view name is `K`, the link is `#kestrik`, and `#all` is the same as `#both`.

**Trainer source tag (optional, added 2026-11-17).** `trainers.TRAIN_SRC[cls].tag` is a short source line shown under trainer levels above 30, for example "talentsforever, read Nov 17". Without it Kestrik's card shows the full `label` and the other two keep "wowforever.one, read Oct 30".

## Kestrik's talents, professions, gear and dungeons (page side added 2026-11-17)

Every key in this section is optional. Each of these four sections of his view shows its content when its keys exist and one line ("not on the table yet") when they do not. Nothing here changes a key for Corvin or Zanjiro. The checker rejects a feed where one of these keys is present in the wrong shape (rule 5), and the page ignores a broken key on top of that.

### Talent trees and Next ding

| Key | Shape |
|---|---|
| `talents.TREES.druid` | Exactly 3 trees, in the order Balance, Feral Combat, Restoration. Same shape as the other classes: `{name, icon, t}`, each talent in `t` is `[name, row, col, max, icon, need, isNew, rank 1 text, max rank text]`. `row` and `col` start at 0. `need` is the exact name of a prerequisite talent of the same class, or `""`. `isNew` is 1 for a talent new in Forever, else 0. The grid grows when a tree has more than 7 rows or 4 columns. An icon that is not in the page's embedded sprite shows as two letters. |
| `talents.ORDERS.<name>` | A leveling order, `[[talent, points], ...]`; the first point is level 10. You choose the names, for example `feral_moba` and `feral_iv`. Every talent is spelled exactly as in `TREES.druid`, never more points than the talent has ranks, 51 points at most. |
| `talents.STATIC.<name>` | Same shape, for a level 60 final build (all points shown, no slider). |
| `talents.BUILD_DEFS` entries | `{key, label, cls: "druid", seq or fixed, src, date, url, blurb}`, optional `tag`, `short`, `primary`. `seq` names an `ORDERS` entry, `fixed` a `STATIC` entry. `short` is the name in the Next ding guide picker ("Mobalytics"); without it the label up to its first " (" is used. `primary: true` marks the order Kestrik follows; without it the first druid leveling build in the list is his default. Respec plans (`respec_at`, `before`, `then`) work as for the warlock. `path` is not supported on a druid build. |
| `talents.WHY["druid:<talent>"]` | One line shown under his next talent point. The `druid:` prefix is required, because talent names repeat across classes (Nature's Swiftness). Without an entry the talent's own text shows. |
| `talents.TREE_SRC.druid` | Short source line in the planner header, for example "talentsforever calculator, client 70755, read Nov 17". |
| `page_lists.talents_druid_bullets` | `[string]` or `[{text, _source?, _date?}]`, folded under the planner as "Feral notes". |

What the page does with them: Kestrik gets his own class button and build pills in Talent trees, and the slider follows `st.lvK`. Next ding shows his next talent point from the picked guide; two or more druid leveling builds give him a guide picker like the other two. His rotation steps may use `talent` (and `at`) in place of `lvl`, with `ROT.<form>.<mode>.seq` naming the druid order, exactly as the other classes do; a step with a plain `lvl` keeps working.

`PATH_NODES` is Corvin's leveling path only. Do not add entries for Kestrik.

### Professions

- Game sync saves his skills as `st.sk["K:lw"]`, `st.sk["K:skin"]`, `st.sk["K:fa"]`, `st.sk["K:cook"]`. They sit outside `SKILL_KEYS`, which still never changes. For Kestrik the server saves every profession the game reports that has a `professions.PROFS` entry.
- `characters.CHAR_PROFS.K`: a list of `PROFS` keys in display order. While it is empty the page shows every profession he has a synced skill for, so the section works without it. `["lw", "skin", "fa", "cook"]` fixes the order.
- `characters.CHARS[2].profs`: optional, `[{name, icon, skill, next}]` as for the other two (`name` must equal a `PROFS` name). While it is empty his character card builds the list from `PROFS`.
- His Leatherworking, Skinning, First Aid and Cooking use the existing `PROFS` routes, pins and notes, the same data Zanjiro's use. There is no per-character route yet. If one of those texts is wrong for a druid, report it and Claude adds a per-character field first.
- A profession without a `PROFS` entry (Fishing, Herbalism) is neither saved nor shown.

WF2 backup codes carry skills outside `SKILL_KEYS` in an optional `x` object, for example `{"K:lw": 63}`. Codes without it import as before.

### Gear sheet

`gear.GEAR_SHEETS.K` is `{left: [slot, ...], right: [slot, ...], bottom: [slot, ...]}` with the same slot and pick shape as `GEAR_SHEETS.sham`. Use these slot names, so the scores line up with what he wears:

- `left`: Head, Neck, Shoulder, Back, Chest, Shirt / Tabard, Wrist
- `right`: Hands, Waist, Legs, Feet, Ring 1, Ring 2, Trinket 1, Trinket 2
- `bottom`: Main hand (2H), Off hand, Idol

A slot is `{slot, picks: [...], none?}`; `none` is the short text of an empty slot. A pick needs `id`, `lv` (text such as "20-29" or "30+"), `from` and `to` (numbers), `name`, `item` (the exact item name) and `src` (short source text). Everything optional on the other sheets works here too: `how`, `faction`, `faction_basis`, `_source` (list), `_date`, `source_type`, `confirmation`, `alts`, `stats`, `classic_drop_estimate` and the rest.

Tick ids: every pick id on his sheet starts with `gk` (`gk1`, `gk2`, ...), is used by one pick only, and is listed in `gear.GEAR_EXTRA_IDS`. Like every gear extra id it can be added but never removed or reused: when a pick leaves the sheet, its id stays in `GEAR_EXTRA_IDS`. There is no `DRUID_GEAR` row list; the sheet is the only place his picks live.

`gear.ITEM_INFO["Item Name"] = [icon, quality]` for each new item, added at the end. Without an entry the pick shows two letters and "Quality not listed".

`page_lists.gear_note_druid` `{text}`: one sentence under his sheet saying where the picks come from. The page adds the sentences about the how-to panel and the score itself. His sheet shows no pre-launch tags; those mark picks that came from the Oct 22 notes.

### Dungeon gear and dungeon notes

- `dungeons.LOOT[].for`: list `"K"` to show a row for Kestrik, for example `["K"]` or `["V", "K"]`. A row with no `for` means Corvin and Zanjiro only, so an existing leather row needs `"K"` added before he sees it. The value must be a list.
- `dungeons.STAT_WEIGHTS.K`: `{stat: points}` as for the other two; it replaces the page's defaults for him. The defaults are placeholders, not sourced: `dps` 10, `str` 2, `agi` 2, `ap` 1, `sta` 1, `crit` 20, `hit` 12, `int` 0.2, `spi` 0.2, `mp5` 0.3, `hp5` 0.3, `armor` 0.02. Send a full set with a cited Forever source. Sending `STAT_WEIGHTS` with only `K` in it leaves the other two on their defaults.
- `dungeons.DUN_NOTES_K`: `{"<DKEYS key>": "note text"}`, his one-line note per dungeon. `DUNGEONS` rows keep exactly their four columns (name, levels, Zanjiro's note, Corvin's note); never add a fifth. A dungeon without an entry shows no note.
- Tick ids: his "Cleared" ticks are `dk<DKEYS key>` (`dk0`, `dkgnomer`). The page builds them from `DKEYS`, so there is nothing to add, but no other tick id may start with `dk`.
- Slot names: `Idol` and `Relic` count as the Ranged slot, `Polearm` as Two-Hand.
- `PRESETS` and `PRESET_BASE` are Zanjiro's totem presets. Nothing for Kestrik goes there.

### When each section shows for him

| Section | Shows when |
|---|---|
| Talent trees, and the talent point in Next ding | At least one druid leveling build (`seq`) is usable |
| Professions | `CHAR_PROFS.K` has entries, or game sync has saved a skill for him |
| Dungeon gear | At least one `LOOT` row lists `"K"`, or `DUN_NOTES_K` has an entry |
| Gear and dungeons | `GEAR_SHEETS.K` is valid, or `DUN_NOTES_K` has an entry |

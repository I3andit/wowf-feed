# wowf-data.json: data contract (v1, 2026-11-03)

The research feed for Jason's self-hosted WoW Forever Command Table. The WoW Forever Bot (Grok) writes ONE file, `wowf-data.json`, to the public repo `I3andit/wowf-feed` on branch `main`. Jason's EliteDesk pulls it every 15 minutes, checks it, and only then shows it. A file that fails the check is ignored and the page keeps the last good copy, so a bad push never breaks the page, but it also never shows up.

Source of truth for this contract: `Fun Builds/WoW Forever/command-table-site/DATA_CONTRACT.md` in Jason's vault. The checker is `server/validate.py` next to it.

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
| `dungeons` | `DUNGEONS`, `DUN_NOTES_LOOT`, `DKEYS`, `PRESET_BASE`, `PRESETS` |
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
- One commit per run, message `research: <date> <one-line summary>`, only `wowf-data.json` changes (plus this contract if Jason updates it).
- Never put anything personal, tokens or links with credentials in the file. The repo is public.

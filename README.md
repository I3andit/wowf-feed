# wowf-feed

Research data and page code for a personal WoW Forever dashboard (Vorgash, Orc Enhancement Shaman, and Corvin, Undead Warlock), written by a research bot and served by a small server on a home network.

- `wowf-data.json`: the research data. Every claim carries its source and the date it was read; unofficial items stay tagged until Blizzard confirms them.
- `site/`: the dashboard page (React, built on the home server with pinned tools; only `site/src` and `site/public` are ever used).

Format and rules for both: [DATA_CONTRACT.md](DATA_CONTRACT.md).

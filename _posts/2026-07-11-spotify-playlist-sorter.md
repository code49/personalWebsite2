---
layout: post
title: spotify playlist sorter
subtitle: "<b>ai-powered playlist classifier & syncing engine</b>"
categories: random
tags: python nix random
---

**tools: python, spotipy, nix shell, openai/antigravity cli**<br>
**[project repository](https://github.com/code49/spotifySorter)**

---

### problem statement

Organizing large Spotify playlists by vibe, genre, or release decade manually is tedious. Manual sorting makes incremental updates difficult: adding new tracks to a master playlist requires hunting down where they belong in sub-playlists, causing duplicates or out-of-sync states.

### solution

This utility uses Python, `spotipy`, and the **Antigravity CLI (`agy`)** to process a source playlist, send track metadata to an LLM for categorization, and automatically create and sync sub-playlists on Spotify.

The project features a **stateful local sync engine** that tracks playlist state in JSON files under `states/`. On subsequent runs, it performs diffs to handle:
1. **Incremental Additions:** Sorting only new tracks added since the last run.
2. **Cleanups:** Removing tracks from sub-playlists if deleted from the master list.
3. **Spotify Reconciliation:** Detecting direct playlist edits on Spotify to resolve configuration drift.

### implementation

#### 1. api compliance
The utility targets `/v1/playlists/{id}/items` and `/v1/me/playlists` endpoints, handling pagination automatically:

```python
# excerpt from get_playlist_tracks in spotify_sorter.py
results = sp._get(
    f"playlists/{playlist_id}/items",
    limit=100,
    fields="items(track(id,name,artists(name),album(name))),next"
)
```

#### 2. nix environment
Dependency management uses a native `shell.nix` pinning Python packages and system dependencies:

```nix
{ pkgs ? import <nixos> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    (python3.withPackages (ps: with ps; [
      spotipy
      python-dotenv
    ]))
  ];
}
```

### usage

1. **Scan & Cache:** Initial run pulls playlist track data into `playlist_tracks.json`.
2. **AI Categorization Query:** Direct sorting by passing custom queries:
   ```bash
   python spotify_sorter.py --query "separate into high-energy gym beats, chill lo-fi, and acoustic pop"
   ```
3. **Interactive Confirmation:** Displays a preview of proposed sub-playlists before creating private Spotify playlists.
4. **Timestamping:** Appends `(Last sorted: YYYY-MM-DD HH:MM)` to playlist descriptions to verify sync status.

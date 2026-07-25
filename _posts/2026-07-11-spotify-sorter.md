---
layout: post
title: spotify playlist sorter
subtitle: "<b>ai-powered playlist classifier & syncing engine</b>"
categories: random
tags: python nix
---

**tools: python, spotipy, nix shell, openai/antigravity cli**<br>
**[project repository](https://github.com/code49/spotifySorter)**

---

### the problem
Keeping track of large Spotify playlists and sorting them by vibe, genre, or release decade is usually a tedious, manual task. When done manually, you lose the ability to perform **incremental updates**—so adding five new songs to your main list requires hunting down where they belong in your sub-playlists, leading to duplicates or out-of-sync states.

### solution
This utility leverages Python, `spotipy`, and the **Antigravity CLI (`agy`)** to read a source playlist, send track metadata to a large language model for categorization recommendations, and automatically create and sync sub-playlists on Spotify.

What sets this project apart is its **stateful local sync engine**. It tracks the exact state of your playlists in local JSON files under a `states/` directory. On subsequent runs, it performs a diff to handle:
1. **incremental additions:** Sorting only the *new* tracks added since the last run.
2. **cleanups:** Removing tracks from sub-playlists if they were deleted from the source list.
3. **spotify reconciliation:** Identifying if you manually modified playlists on Spotify directly, giving you the choice to overwrite local configuration or sync back to Spotify.


### implementation

#### 1. api compliance
The utility targets the newer `/v1/playlists/{id}/items` and `/v1/me/playlists` endpoints, bypassing deprecated endpoints to future-proof operations and handle pagination automatically:

```python
# excerpt from get_playlist_tracks in spotify_sorter.py
results = sp._get(
    f"playlists/{playlist_id}/items",
    limit=100,
    fields="items(track(id,name,artists(name),album(name))),next"
)
```

#### 2. nix environments
To ensure dependency management is seamless and reproducible, the project defines a native `shell.nix` pinning Python version, package setups, and certificates:

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

1. **scan & cache:** First-run pulls your playlist track data, storing it in `playlist_tracks.json`.
2. **ai vibes query:** You can direct the sorting by passing custom queries, e.g.:
   ```bash
   python spotify_sorter.py --query "separate into high-energy gym beats, chill lo-fi, and acoustic pop"
   ```
3. **interactive confirmation:** A preview of the proposed sub-playlists is displayed. Once approved, the script programmatically creates private playlists on Spotify.
4. **automatic timestamps:** Writes a custom `(Last sorted: YYYY-MM-DD HH:MM)` tag into the playlist descriptions to verify sync times.

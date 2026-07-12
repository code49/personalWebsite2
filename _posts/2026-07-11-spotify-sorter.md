---
layout: post
title: spotify playlist sorter
subtitle: "<b>ai-powered playlist classifier & syncing engine</b>"
categories: random
banner: "/assets/images/banners/spotify_sorter.jpg"
tags: python spotify ai automation nix
---

**spotify playlist sorter // personal project**<br>
**technologies: python, spotipy, nix shell, openai/antigravity cli**

---

### the problem
keeping track of large spotify playlists and sorting them by vibe, genre, or release decade is usually a tedious, manual task. when done manually, you lose the ability to perform **incremental updates**—so adding five new songs to your main list requires hunting down where they belong in your sub-playlists, leading to duplicates or out-of-sync states.

### solution
this utility leverages python, `spotipy`, and the **antigravity cli (`agy`)** to read a source playlist, send track metadata to a large language model for categorization recommendations, and automatically create and sync sub-playlists on spotify.

what sets this project apart is its **stateful local sync engine**. it tracks the exact state of your playlists in local json files under a `states/` directory. on subsequent runs, it performs a diff to handle:
1. **incremental additions:** sorting only the *new* tracks added since the last run.
2. **cleanups:** removing tracks from sub-playlists if they were deleted from the source list.
3. **spotify reconciliation:** identifying if you manually modified playlists on spotify directly, giving you the choice to overwrite local configuration or sync back to spotify.


### implementation

#### 1. api compliance
the utility targets the newer `/v1/playlists/{id}/items` and `/v1/me/playlists` endpoints, bypassing deprecated endpoints to future-proof operations and handle pagination automatically:

```python
# excerpt from get_playlist_tracks in spotify_sorter.py
results = sp._get(
    f"playlists/{playlist_id}/items",
    limit=100,
    fields="items(track(id,name,artists(name),album(name))),next"
)
```

#### 2. nix environments
to ensure dependency management is seamless and reproducible, the project defines a native `shell.nix` pinning python version, package setups, and certificates:

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

1. **scan & cache:** first-run pulls your playlist track data, storing it in `playlist_tracks.json`.
2. **ai vibes query:** you can direct the sorting by passing custom queries, e.g.:
   ```bash
   python spotify_sorter.py --query "separate into high-energy gym beats, chill lo-fi, and acoustic pop"
   ```
3. **interactive confirmation:** a preview of the proposed sub-playlists is displayed. once approved, the script programmatically creates private playlists on spotify.
4. **automatic timestamps:** writes a custom `(Last sorted: YYYY-MM-DD HH:MM)` tag into the playlist descriptions to verify sync times.

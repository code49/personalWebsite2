---
layout: post
title: display thingy
subtitle: "<b>ambient smart dashboard widget</b>"
categories: random
tags: python raspberry-pi nix
---

**displayThingy &#124; Personal Project**<br>
**technologies: Python, Pygame, Spotipy, pytz, Nix Shell, Raspberry Pi**

---

### overview
`displayThingy` is an aesthetic, real-time smart dashboard designed for ambient desktop screens or wall-mounted displays (such as a Raspberry Pi). Built using **Pygame**, it integrates Spotify tracking, cyclical world timezone clocks, and real-time weather metrics in a dark-mode UI.

<p align="center">
  <kbd>
    <img src="/assets/images/banners/display_thingy.png" alt="displayThingy interface screenshot" style="display: block; margin: 0 auto; border: 1px solid black;" />
  </kbd>
  <br><i>Interface dashboard layout displaying Spotify track progress, clock, and weather.</i>
</p>

### features

1. **real-time spotify player:**
   Tracks song names, artist details, album art, and progress tracks. To keep API requests low and avoid rate limits, the player interpolates playback progress locally, only querying the Spotify Web API during track transitions or updates.
2. **timezone clock cycles:**
   A cycling list of timezones (configured in `configs.json`) displaying current times, date formats, and offset calculations relative to your designated home timezone.
3. **asynchronous weather fetches:**
   Queries the `wttr.in` API in a background thread to prevent the dashboard's rendering loops from stuttering or blocking during network latency.
4. **ambient click-to-dim:**
   Tapping or clicking the center of the display toggles a dim overlay, making it comfortable to use as a bedside clock or ambient display at night.


### architecture

The project splits configurations, data collection widgets, and rendering views:

```
displayThingy/
├── configs.json                # Screen resolutions and view profiles
├── main.py                     # App setup & primary Pygame drawing loop
├── widgets/                    # Data retrievers
│   ├── world_clock/clock.py    # Timezone cycling maths
│   ├── weather/weather.py      # Async wttr.in updates
│   └── spotify/spotify.py      # Spotify API authentication & local tracking
└── views/                      # Drawing & layout managers
    ├── base_view.py            # Base layout definition
    └── spotify_clock_weather_view.py # Double-line layout subclass
```


### deployment

Designed to auto-launch on startup on a Raspberry Pi running **Raspberry Pi OS** with the **labwc** compositor:

```bash
# inside ~/.config/labwc/autostart
lxterminal -e ~/Documents/displayThingy/run_display.sh &
```

The launch script loads the environment variables, activates the local Python virtual environment, and executes the Pygame application in fullscreen mode:

```bash
#!/bin/bash
# ~/Documents/displayThingy/run_display.sh
cd ~/Documents/displayThingy
source .dt_venv/bin/activate
python main.py --width 1024 --height 600 --fullscreen
```

---
layout: post
title: vestaboard
# author: 
categories: experience
tags: php javascript startup
# top: 0
# sidebar: []
hidden:
  - header
---

<style>
  .vestaboard-banner {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(128, 128, 128, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
    cursor: default;
  }
</style>

<div class="vestaboard-header" style="text-align: center; margin-bottom: 24px; margin-top: 12px;">
  <img src="/assets/images/banners/vestaboard.jpg" alt="vestaboard" class="vestaboard-banner no-lightbox">
  <h1 style="margin-top: 16px; margin-bottom: 8px; font-weight: 700; text-transform: lowercase;">vestaboard</h1>
  <p class="vestaboard-subtitle" style="font-size: 1.05rem; opacity: 0.85; line-height: 1.6; margin: 0 auto; max-width: 600px;">
    <b>programming intern</b><br>
    june - august 2021 &bull; south san francisco, ca
  </p>
</div>

**web applications programming team**<br>
**mentors: sully syed, dorrian porter**

**tools: php, javascript**<br>
**[company website](https://www.vestaboard.com/)**

---

### intro

Vestaboard is a South San Francisco-based startup that designs and builds smart split-flap display boards. These displays combine the nostalgic aesthetic and mechanical sounds of vintage train stations with modern internet connectivity, allowing users to send remote messages, track live sports scores, or display automated daily content.

### my work

<p align="center">
  <kbd>
    <img src="/assets/images/vestaboard/feature-summary.png" alt="feature-summary" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>Visual summary of features I added to the Vestaboard software ecosystem.</i>
</p>

I developed the **Word-of-the-Day channel**—an installable application plugin for the Vestaboard software ecosystem. Built using PHP and JavaScript, the plugin automatically polls the [Oxford English Dictionary's Word of the Day API](https://www.oed.com/) and formats it for split-flap rendering. Creating this installable required developing several key software features: integrating RSS feeds to fetch and parse daily content, building a server-side queuing and pagination system to sequentially cycle through definitions that exceeded the board's single-frame character limit, and designing progress bars to indicate the status of multi-frame messages.

### other learnings

This role introduced me to full-stack web development on the LAMP stack and gave me my first exposure to small-scale startup operations. Beyond coding, I experienced the dynamic, fast-paced environment of an early-stage business, observing how leadership coordinates partnerships and drives product strategy. I also learned the value of taking initiative—specifically how building quick proof-of-concepts is the most effective way to pitch and validate new features.

_Thank you also to Sully Syed for his many web development teachings as well as to_
_Dorrian Porter and the rest of the Vestaboard team!_

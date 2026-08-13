---
layout: post
title: vestaboard
subtitle: "<b>programming intern</b><br>june - august 2021 &#124; south san francisco, ca"
# author: 
categories: experience
banner: "/assets/images/banners/vestaboard.jpg"
tags: experience php javascript
# top: 0
# sidebar: []
---

**web applications programming team**<br>
**mentors: sully syed, dorrian porter**

**tools: php, javascript**<br>
**[company website](https://www.vestaboard.com/)**

---

<div class="practical-applications-box">
  <div class="box-title">💡 practical application</div>
  <p>Vestaboard is a modern, physical split-flap display board (inspired by vintage train station arrival boards) that displays messages sent over the internet. This project built automated channel plugins—like a daily vocabulary builder—that format and schedule dynamic, engaging content onto smart physical displays in homes and offices without requiring daily manual input.</p>
</div>

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

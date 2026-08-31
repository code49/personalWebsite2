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

Vestaboard builds physical split-flap display boards inspired by vintage train station arrival boards, updated with modern internet connectivity. Users send remote messages, track live scores, or automate daily content displays.

### my work

<p align="center">
  <kbd>
    <img src="/assets/images/vestaboard/feature-summary.png" alt="feature-summary" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>Visual summary of software features added to the Vestaboard ecosystem.</i>
</p>

I built the **Word-of-the-Day channel**, an installable plugin for the Vestaboard software ecosystem using PHP and JavaScript:

*   **API Integration:** Automated daily polling and parsing of the Oxford English Dictionary's Word of the Day API, formatting definitions for split-flap grid rendering.
*   **Queuing & Pagination:** Built a server-side queuing system to paginate definitions that exceeded the single-frame character limit, cycling multi-frame messages sequentially.
*   **Progress Tracking:** Added UI progress bars to display real-time status as multi-frame messages were sent to physical boards.

### acknowledgements

Thank you to Sully Syed for web development guidance, and to Dorrian Porter and the Vestaboard team for a great summer learning LAMP stack development and startup operations.

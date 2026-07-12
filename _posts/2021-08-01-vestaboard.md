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
  <img src="/assets/images/banners/vestaboard.png" alt="vestaboard" class="vestaboard-banner no-lightbox">
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

Vestaboard is a startup based in South San Francisco building smart split-flap 
display boards, combining the looks and sounds of a cruicial element of old-timey 
train station while integrating all the smarts of modern day technology. Users 
can use their Vestaboard to write a message to their kids when away on business,
see live sports scores, even be inspired by quotes from celebrities and influencers.

### my work

<p align="center">
  <kbd>
    <img src="/assets/images/vestaboard/feature-summary.png" alt="feature-summary" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>Visual summary of features I added to the Vestaboard software ecosystem.</i>
</p>

I worked at Vestaboard to implement Word-Of-The-Day, a "channel" (plugins that 
control the board, automatically collecting data from the internet to generate messages)
that polled the [Oxford English Dictionary's word of the day](https://www.oed.com/) to display 
to the board using a combination of PHP and JavaScript. Creating my installable required 
that I write many new features, including RSS feeds, pagination (getting the server to queue 
and send a group of messages in order, since definitions took more space than a single 'frame'
on the board), and progress bars.

### other learnings

At Vestaboard, I not only got to learn web development concepts (using a LAMP stack) 
and a new programming language, but also got my first taste of small-scale
startup culture. I got to experience the ups and downs of early
businesses, see how executives manage a team and find other companies to work together
with, and learn the importance of taking initiative to create proof of concepts of my
ideas in order to more easily convince others.

_Thank you also to Sully Syed for his many web development teachings as well as to_
_Dorrian Porter and the rest of the Vestaboard team!_

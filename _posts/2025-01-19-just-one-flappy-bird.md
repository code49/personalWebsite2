---
layout: post
title: just one flappy bird
subtitle: "<b>one-instruction CPU video game</b><br>january 2025<br>pittsburgh, pa"
# author: 
categories: projects
banner: "/assets/images/banners/just_one_flappy_bird.jpg"
tags: cmu projects rtl fpga verilog
# top: 0
# sidebar: []
---

**build18 hackathon 2025**<br>
**teammates: kody liang, jaehyun lim\*, john alacce**


**tools: systemverilog, vcs, vivado**<br>
**[project repository](https://github.com/jobitaki/JustOneFlappyBird)**

*_Thanks to Jaehyun for writing the original project description (which this article is largely_
 _based on) and for making such pretty graphics!_

---

<div class="practical-applications-box">
  <div class="box-title">💡 practical application</div>
  <p>Computer processors usually rely on complex instruction sets with hundreds of distinct commands (like ADD, MULTIPLY, and JUMP) to execute software. This hackathon project built an ultra-minimalist CPU that operates using only a single mathematical instruction (<code>SUBLEQ</code>: subtract and branch if less than or equal to zero). Despite having just one command, the hardware processor is fully functional and capable of running a complete Flappy Bird video game on a monitor.</p>
</div>

<!-- <p align="center">
  <img src="media/logo.jpg" alt="logo" width="300" align="center"/>
</p> -->

JustOneFlappyBird is a Turing-complete, one-instruction-set processor that executes the SUBLEQ esoteric programming language. To demonstrate hardware functionality, we animated Flappy Bird via VGA display on an AMD/Xilinx Spartan-7 FPGA (Boolean Board) using SystemVerilog RTL, Synopsys VCS simulation, and AMD Vivado synthesis. Built as part of CMU ECE's [Build18](https://www.build18.org/) 2025 hardware hackathon.

### subleq, briefly

[SUBLEQ](https://esolangs.org/wiki/Subleq) is an esoteric programming language consisting of a single instruction: **SUB**tract and branch if **L**ess-than or **EQ**ual to zero. Instructions take the form `A B C` where `A`, `B`, and `C` are memory addresses. The processor computes `*B - *A` (dereferencing memory) and stores the result back into `B`. If the result is $\le 0$, the program counter jumps to `C`.

### uniprocessor design

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/datapath.jpg" alt="uniprocessor-datapath" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

The processor contains a program counter register, two operand registers (`A` and `B`), and a destination address register for storing the subtraction result. The datapath includes 2-read-1-write memory, a subtractor (`*B - *A`), and a comparator (`*B - *A <= 0`).

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/fsm.jpg" alt="uniprocessor-fsm"  style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

The processor executes each SUBLEQ instruction in 8 clock cycles across 5 execution steps:
1. Fetch addresses `A` and `B` using `PC` and `PC+1`.
2. Latch address `B` into the `B` address register.
3. Read memory at `A` and `B` to retrieve `*A` and `*B`.
4. Latch `*A` and `*B` into operand registers, fetching address `C` using `PC+2`.
5. Store `*B - *A` back to address `B`, branching to `C` if the result is $\le 0$.

### graphics & vga

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/vga.jpg" alt="vga"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

Bird and pipe sprites render via combinational logic. Sprites are partitioned into column groups with shared row color assignments, avoiding individual pixel logic overhead.

Once color assignments are generated, the frame renders via a VGA engine adapted from our [18-240 Pong project]({% link _posts/2023-11-09-pong.md %}). Because the Boolean Board uses an HDMI output port, Xilinx IP converts raw VGA signals to HDMI streams.

### system architecture

The processor connects to the "Draw Bird" graphics module and VGA controller via MMIO. When SUBLEQ instructions write to MMIO-mapped addresses, the Draw Bird module updates screen coordinates and triggers render updates in the VGA engine.

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/system.jpg" alt="system"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

### photos

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/group1.jpeg" alt="group-photo-1"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>Left to right: John Alacce, David Chan, Kody Liang, Jaehyun Lim</i>
</p>

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/group2.jpeg" alt="group-photo-2" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>"You guys are goofballs" - Professor Bill Nace</i>
</p>

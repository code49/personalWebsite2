---
layout: post
title: Just One Flappy Bird
subtitle: One-Instruction CPU Video Game
# author: 
categories: projects
banner: "/assets/images/banners/just-one-flappy-bird.png"
tags: cmu projects rtl fpga
# top: 0
# sidebar: []
---

**January 2025 \| Pittsburgh, PA** 

**Build18 Hackathon 2025**<br>
**Teammates: Kody Liang, Jaehyun Lim\*, John Alacce**


**Tools: SystemVerilog, VCS, Xilinx Vivado**<br>
**Project Link: [https://github.com/jobitaki/JustOneFlappyBird](https://github.com/jobitaki/JustOneFlappyBird)**

*_Thanks to Jaehyun for writing the original project description (which this article is largely_
 _based on) and for making such pretty graphics!_

---

<!-- <p align="center">
  <img src="media/logo.jpg" alt="logo" width="300" align="center"/>
</p> -->

JustOneFlappyBird is a turing complete, one instruction set processor that can run the programming langugae SUBLEQ. As a demonstration of its functionality, we animated the video game Flappy Bird via VGA display. We targeted a [Boolean Board](https://www.amd.com/en/corporate/university-program/aup-boards/realdigital-boolean-board.html) Xilinx Spartan 7 FPGA using SystemVerilog RTL, Synopsys VCS simulation, and Vivado synthesis. Our team of 4 built JustOneFlappyBird as a part of [Build18](https://www.build18.org/) 2025, CMU ECE's annual week-long hardware hackathon. 

## SUBLEQ, Briefly

[SUBLEQ](https://esolangs.org/wiki/Subleq) is an esoteric programming language consisting of a single instruction, **SUB**tract and branch if **L**ess-than or **EQ**ual to zero. Instructions are of the form `A B C` where A, B, and C are all memory addresses. The processor computes the value of `*B - *A` (* representing memory dereferences) and stores it back into B. If the result was less than or equal to 0, the PC jumps to C. That's it! 

## Uniprocessor Design

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/datapath.jpg" alt="uniprocessor-datapath" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

Our processor consists of a PC register, two "general purpose" registers for collecting the value of operand A and operand B, and a register for saving the value of the memory address B for storing the result of the subtraction later. We used a 2-read-1-write memory (reading/writing B, as well as reading A or C), as well as a subtractor (calculating `*B - *A`) and comparator (checking `*B - *A <= 0`).


<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/fsm.jpg" alt="uniprocessor-fsm"  align="center" border="1"/>
  </kbd>
</p>

Our processor executes each SUBLEQ instruction in 8 cycles, or 5 primary steps (non-await-memory stages):
1. Use PC and PC+1 to fetch addresses A and B
2. Store address B into the B address register
3. Read from addresses A and B to get *A and *B
4. Store *A and *B into their respective registers, use PC+2 to fetch address C
5. Save `*B - *A` into address B, jump to address C if result is less than or equal to 0

## Graphics & VGA

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/vga.jpg" alt="vga"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

Bird and pipe sprites where drawn via combinational logic. Each sprite was divided into "column 
groups" (sets of columns where each row had the same colors), which was then used in conjunction with
the current row to save us from having to write logic to set the color for each pixel individually!

Once we had a row/col --> color assignment, we rendered it via a VGA engine we previously designed for
18-240's Pong lab. Because the Boolean Board ultimately used a HDMI output, we used Xilinx IP to
convert our VGA into HDMI for display.

## System Architecture

Our processor (and corresponding program memory) is connected via MMIO to the graphics modules "Draw Bird" 
and VGA. When the processor writes a value to a MMIO-reserved addreses, the Draw Bird module intercepts to
update the bird's position on the screen and output to the VGA graphics engine. 

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/system.jpg" alt="system"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

## Group Photos!

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/group1.jpeg" alt="group-photo-1"
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

<p align="center">(above) left to right: John Alacce, David Chan, Kody Liang, Jaehyun Lim</p>

<p align="center">
  <kbd>
    <img src="/assets/images/just-one-flappy-bird/group2.jpeg" alt="group-photo-2" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
</p>

<p align="center"><i> "You guys are goofballs" - Professor Bill Nace</i></p>

---
layout: post
title: terminal tools
subtitle: "<b>portable shell utilities & command line productivity hacks</b>"
categories: random
tags: bash nix
---

**tools: bash, git, python, fzf**<br>
**[project repository](https://github.com/code49/terminalTools)**

---

### overview
`terminalTools` is a collection of system-agnostic, portable shell scripts and utilities designed to boost terminal productivity. Built using standard Bash scripting with zero heavy dependencies (such as Nix or Homebrew), these utilities are fully portable across macOS and any Linux distribution.

---

### the utilities

#### 1. `sls` — Smart LS
An improved `ls` wrapper that automatically groups directory contents by type and displays them in a columnar side-by-side layout.

*   **Split View:** Groups entries into labeled sections (directories, hidden directories, files, hidden files, symlinks) and renders them in side-by-side columns to fit the terminal width.
*   **Git Status:** Appends a quick `git status` summary at the bottom when run with the `-g` flag inside a git repository.
*   **Tree Mode:** Wraps the standard `tree` command with sensible defaults (hidden files, directories-first grouping, classification symbols) and prints the absolute path on the first line.

```bash
# split view with git status
sls -g

# tree view with custom depth
sls -t 2
```

#### 2. `ff` — Firefox Launcher
An interactive bookmark and shortcut launcher that integrates with `fzf` for keyboard-driven browser control.

*   **Fuzzy Search:** Prompts an interactive fuzzy-search dropdown list of all browser shortcuts when run without arguments.
*   **Direct Launch:** Instantly opens a named bookmark (e.g. `ff github` or `ff calendar`) in a new browser tab.

#### 3. `gitac` — Git Add & Commit
A quick Git helper that stages all untracked/modified files and commits them in a single command, reducing keystrokes during rapid coding iterations.

```bash
gitac "refactor helper functions"
```

---

### installation
The repository features a self-managing installer (`install.sh`) that symlinks individual utilities from the local clone to a directory on your shell's search path (defaulting to `~/.local/bin`).

This allows updates to files inside the local repository clone to propagate instantly to terminal sessions without requiring manual reinstallation.

```bash
# clone and install
git clone https://github.com/code49/terminalTools.git
cd terminalTools
./install.sh
```

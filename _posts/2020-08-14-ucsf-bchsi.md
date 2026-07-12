---
layout: post
title: ucsf bakar computational health sciences institute
subtitle: "<b>data science intern</b><br>june - august 2020 &#124; san francisco, ca"
# author: 
categories: experience
banner: "/assets/images/banners/ucsf.jpg"
tags: python
# top: 0
# sidebar: []
---

**PHIlter (protected health information filter) team**<br>
**managers: hunter mills, lakshmi radhakrishnan**

**tools: python (pandas, numpy, spacy)**<br>
**[institute website](https://bakarinstitute.ucsf.edu/) &#124; [project repository](https://github.com/BCHSI/philter-ucsf)**

---

### intro

The Bakar Computational Health Sciences Institute (BCHSI) at the University of California, San Francisco (UCSF) applies advanced computational tools to solve complex medical challenges. Work at the institute ranges from processing cardiac acoustic data for imaging to building genomic models that analyze how genetics influence common diseases.

During my internship, I worked on **PHIlter**, an open-source tool designed to de-identify clinical notes—the unstructured text documents doctors write during patient visits. By removing Protected Health Information (PHI) like names, dates, and locations, the tool enables these rich clinical datasets to be safely shared for medical research while maintaining strict patient privacy.

### my work

My project focused on designing a post-processing pseudonymization algorithm for PHIlter's output. Originally, the tool redacted PHI by replacing it with static placeholder tags (e.g., `[***NAME***]`). While secure in theory, this method presents privacy risks if the parser misses a piece of PHI (a false negative, which occurs in roughly 1% of cases). In these scenarios, the remaining un-redacted PHI stands out starkly against the placeholders, making the patient's identity easier to reconstruct.

<p align="center">
  <kbd>
    <img src="/assets/images/ucsf-bchsi/example-replacement.png" alt="example-PHI-replacement" 
    style="display: block; margin: 0 auto; border: 1px solid black;"/>
  </kbd>
  <br><i>Sample PHI replacement made by my algorithm! Dates were already de-identified in a way that preserved the relative timing of events.</i>
</p>

To address this, I developed software that replaces these static redaction tags with synthetic, context-aware surrogates. By swapping placeholders with realistic but fake data (e.g., replacing `[***NAME***]` with a random name like 'Sarah'), any missed PHI (false negatives) is camouflaged "in plain sight" among the synthetic entries. To maintain the medical utility of the notes, the algorithm ensures that the synthetic data matches the grammatical and semantic context of the original text.

The algorithm handles a wide array of PHI categories—including names, phone numbers, relative dates, and geographical locations (using a database of Bay Area locations). Scaling the solution was a major engineering challenge. I optimized the pipeline to run efficiently over the **i2b2 clinical notes dataset**, which contains nearly two million notes. Ensuring low computational overhead was critical, as the tool was designed to eventually process the massive stream of daily clinical documentation generated across the entire UCSF Health system.

### other learnings

This experience provided my first opportunity to apply data libraries like `pandas`, `NumPy`, and `spaCy` to large-scale datasets. It also offered a firsthand look at the intersection of medicine and data science at a world-class research institution. Collaborating with developers, clinical researchers, and physicians showed me how interdisciplinary teams unite to translate theoretical algorithms into impactful, real-world privacy solutions.

_Thank you also to Hunter Mills and Lakshmi Radhakrishnan, as well as the rest of the PHIlter_
_team, whose mentorship over the summer taught me many life lessons and technical skills!_

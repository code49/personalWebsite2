---
layout: post
title: ucsf bakar institute
subtitle: "<b>data science intern</b><br>june - august 2020 &#124; san francisco, ca"
# author: 
categories: experience
banner: "/assets/images/banners/ucsf.jpg"
tags: experience python
# top: 0
# sidebar: []
---

**PHIlter (protected health information filter) team**<br>
**managers: hunter mills, lakshmi radhakrishnan**

**tools: python (pandas, numpy, spacy)**<br>
**[institute website](https://bakarinstitute.ucsf.edu/) &#124; [project repository](https://github.com/BCHSI/philter-ucsf)**

---

<div class="practical-applications-box">
  <div class="box-title">💡 practical application</div>
  <p>Medical records contain rich clinical details that researchers need to discover new disease treatments, but sharing them poses privacy risks if patient identities are exposed. This project built automated software that replaces real names and dates in medical notes with realistic fake ones. If a name is accidentally missed during filtering, it blends in naturally with the fake names rather than standing out, allowing medical scientists to safely analyze thousands of health records while protecting patient confidentiality.</p>
</div>

### intro

The Bakar Computational Health Sciences Institute (BCHSI) at UCSF builds data pipelines and machine learning models for clinical research.

I worked on **PHIlter**, an open-source tool that de-identifies clinical notes—the unstructured text doctors type during patient visits. Removing Protected Health Information (PHI) like names, dates, and locations allows researchers to analyze patient records while protecting patient confidentiality.

### my work

Static redaction tools replace sensitive names with placeholder tags like `[***NAME***]`. If a parser misses a name (a false negative, occurring in roughly 1% of notes), that un-redacted name stands out against the static placeholders.

To fix this, I built a post-processing pseudonymization pipeline that swaps static tags for realistic synthetic data:

*   **Context-Aware Pseudonymization:** Swapped static placeholders with realistic fake names, Bay Area locations, and relative dates. If a parser misses a name, it blends in naturally with the synthetic names rather than standing out.
*   **Dataset Scaling:** Optimized the Python processing pipeline (`pandas`, `NumPy`, `spaCy`) to run across the **i2b2 clinical notes dataset** (nearly two million notes) with low memory overhead.

### acknowledgements

Thank you to Hunter Mills, Lakshmi Radhakrishnan, and the rest of the PHIlter team for an incredible summer of mentorship, technical guidance, and life lessons.

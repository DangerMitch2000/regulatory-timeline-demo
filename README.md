# Regulatory timeline demo

A generic interactive Vega timeline using **entirely fictional data**. No organizational data or source-system mapping is included.

Expand applications and objectives, inspect milestone tooltips, filter the fictional manufacturers, and page through submission rows. Grey, blue and teal tracks represent original plan, latest estimate and actual dates. Intentional blanks and a conflicting sample date demonstrate data-quality handling.

## Run
Serve this directory with any static web server, or publish its root on GitHub Pages. No build step is required. In repository Settings → Pages, choose Deploy from a branch and select the main branch / root folder.

## Contents
- index.html and app.js: demo interface
- timeline.json: generic Vega specification
- sample.json: generated fictional records
- vega.js: Vega 5.33.0 runtime
- VEGA-LICENSE.txt: Vega BSD-3-Clause license

The app performs no data uploads, analytics or external data fetches; its scripts and sample files are served locally with the page. This is a visualization demonstration, not a regulatory decision system. Desktop viewing is recommended; smaller screens can scroll horizontally.

Vega: https://vega.github.io/vega/


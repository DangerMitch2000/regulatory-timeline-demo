# Regulatory timeline demo — version 1.1

An interactive **real Vega** chart using entirely fictional data. No organizational data or source-system mapping is included.

- One indented Application → RO → Submission hierarchy, plus Site and Product. Site means legal manufacturer.
- Click group labels, boxed controls or summary bars to expand/collapse.
- Searchable checkbox filters: multiple choices are OR within Site or Product, AND across the two lists. Empty selection means all; Clear selection and Reset filters restore all. Search narrows options only. Escape closes a filter panel.
- Duplicate membership rows consolidate into one submission. Parent and submission cells summarize distinct known values; hover gives every value and discloses missing memberships.
- Purple original plan, amber latest estimate, teal actual and pink registration-start markers. Conflicting dates are withheld and disclosed. No expiry dates.
- Fit all uses filtered lifecycle dates, never creation dates. Year, Quarter, Month, Earlier/Later and Ctrl+wheel provide calendar navigation. Expansion and paging preserve the time window; changing filters resets it to Fit all.
- Two-level calendar headers and graded grid adapt to the visible date span. Today appears only when inside the window.
- Width mainly enlarges the timeline. Height adds visible rows, capped at 60. Minimum chart size is 480 × 260; narrower screens scroll horizontally.

## Run / deploy
Serve this directory with a static web server. No build step. GitHub Pages can publish the main branch root.

The page uses local assets only: index.html, style.css, app.js, timeline.json, sample.json, vega.js and VEGA-LICENSE.txt. The bundled Vega 5.33.0 runtime retains its BSD-3-Clause license. No uploads, tracking or analytics.

The browser wrapper updates a host-size signal using ResizeObserver. This demonstrates responsive Vega layout; it is not a live Power BI test. Bounded rendering does not avoid processing all incoming records. This demo is not a regulatory decision system.

Vega: https://vega.github.io/vega/

## Vega / Deneb specifications

The browser loads timeline.json, which includes a host-size signal updated by the page. deneb.vega.json omits that stub and uses Deneb 2.x host sizing; deneb-legacy.vega.json uses legacy host-size signal names. Both accept generic column aliases visible in the specifications and contain no embedded data. Native Power BI slicers should filter the incoming membership rows. Browser validation is not a live Power BI report test.

Live demo: https://dangermitch2000.github.io/regulatory-timeline-demo/

See CHANGELOG.md for version history.

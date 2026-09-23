# Regulatory timeline — version 1.2

An interactive Vega timeline using entirely fictional records. No organizational records or private source-field mapping are included.

[Live demo](https://dangermitch2000.github.io/regulatory-timeline-demo/)

## Changes in 1.2

- Fixed-header row viewport with wheel scrolling, draggable scrollbar, row buttons and keyboard navigation.
- Group expansion preserves the clicked anchor and reveals the first child at the bottom of the viewport. Calendar zoom stays unchanged.
- Select a submission or a membership count for persistent, collapsible details below the chart. Full products, countries, sites and context/milestone fields are searchable and paged. Hover stays compact.
- Optional Country alias, distinct membership counts, missing-value disclosure and separate lists without invented product-country pairings.
- Searchable multi-select Site and Product filters retained. Choices are OR within a list and AND on actual delivered rows across lists.

## Use

Click an Application/RO label, boxed control or summary bar to expand. Click a submission or membership count for details. Use the right scrollbar, wheel, or row buttons to move rows. After clicking a row/control, Arrow Up/Down, Page Up/Down and Home/End navigate. Ctrl+wheel zooms the calendar; presets and earlier/later buttons also navigate dates. Dragging the calendar itself does not pan.

The detail search inside Vega supports typing, Backspace, clear and Escape. The browser also provides a normal search input below the chart with standard editing/paste. Change tabs for Products, Countries, Sites or Context. Long text wraps and may continue onto another page. An asterisk marks missing memberships.

Serve this folder with any static server; no build step. GitHub Pages publishes the main branch root. All runtime assets and fictional records are local to the page; no analytics or data uploads. Recommended chart size: at least 720 × 750. Minimum footprint: 480 × 480; narrow screens scroll horizontally. Collapse Details for more row space.

## Deneb

Use deneb.vega.json for current host-size signals, or deneb-legacy.vega.json for legacy host signals. Both contain no embedded data and accept generic aliases. Country is optional for backward compatibility. timeline.json supplies a browser-only host stub and should not be pasted into Deneb.

Native Power BI slicers need verified model relationships. Keep genuine delivered memberships; do not manufacture a cross-product of product and country tables. The chart aggregates each membership dimension independently.

Internal navigation preserves state; an external Deneb rebuild cannot. Deneb 2.x optional patching has a default 500-row threshold and a hard 5,000-row ceiling. Do not expect state retention through a 30,000-row host rebuild. No host setting is changed by these files. See [Deneb dataset documentation](https://deneb.guide/docs/dataset).

## Validation and limits

Real Vega tests cover anchors, bottom-child reveal, selection, resizing, fresh in-place data replacement, optional Country, missing/duplicate memberships, 97 products and 8 countries, and 30,000 fictional source rows. Drawn rows are capped at 60, while all delivered records still require aggregation. Browser checks cover clicks, drag/wheel/keyboard row navigation, both search inputs, country paging, combined filters and narrow-screen overflow. Installed Power BI has not been tested; Ctrl+wheel was not browser-injected in automation. This is a visualization demonstration, not a regulatory decision system.

Vega 5.33.0 is bundled with its BSD-3-Clause license in VEGA-LICENSE.txt. See CHANGELOG.md for version history.

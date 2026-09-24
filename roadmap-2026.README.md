# Roadmap 1.1

Separate from Regulatory Tracker. The release workflow publishes the installable preview only after calculation tests, host lifecycle tests, browser checks, type checking and Microsoft's package build succeed. Actual Power BI Desktop/Service import and tenant compatibility still require verification.

[Interactive synthetic demo](https://DangerMitch2000.github.io/regulatory-timeline-demo/roadmap-preview.html) · [Roadmap 1.1 release](https://github.com/DangerMitch2000/regulatory-timeline-demo/releases/tag/roadmap-2026-v1.1.0)

Import `roadmap-2026-1.1.0.0.pbiviz` through **Visualizations → … → Import a visual from a file**. The visual GUID matches Roadmap 1.0 so it retains upgrade identity. Map the additional fields below after import.

## Fields

Map existing source columns to these field wells; renaming source columns is unnecessary. Use raw dates, not date hierarchies.

| Role | Meaning |
|---|---|
| SubID | Unique submission identifier; required |
| OriginalDispatch | Baseline planned dispatch |
| LatestDispatch | Latest planned dispatch |
| ActualDispatch | Recorded actual dispatch |
| ActualSubmission | Recorded actual submission; inference evidence |
| ActualApproval | Recorded actual approval; inference evidence |
| Site | Explicit site association; confirm the correct source with the data owner |
| BusinessUnit | Business unit column; source name must be confirmed |

Site is not automatically legal manufacturer. Business unit options come from delivered data, not a hardcoded list. All is the default. Blank units appear as Unassigned. A selected unit matches submissions with that membership, and all delivered rows for those matched SubIDs are retained so other site associations or contradictory dates are not silently lost. Each submission counts once. A submission belonging to multiple units can appear in each separate unit view; those views must not be added together. Report filters apply before this local filter. Inference, unit selection and expanded sites survive ordinary updates/resizing, but are not saved as report settings across reloads.

## Counting rules

- Current year and as-of date follow the viewer's local calendar. The title, chart and annual total roll forward together. The date is checked every minute while open and on update. No extra data refresh scheduler is added.
- Actual dispatch has priority. Otherwise use latest plan, falling back to original plan only if latest is blank.
- Blue: Dispatched. Orange: In Progress / Expected, planned today or later. Green: Unconfirmed, plan in the past without an actual dispatch.
- **Include inferred dispatches** is off initially. When enabled, a blank actual dispatch plus valid actual submission or approval evidence moves the record into purple Inferred. Its month still comes from the planned dispatch, including future plans. It is not added a second time. Evidence dates appear in a collapsible list and the bar tooltip explains their use.
- Inferred records without a usable plan remain outside the chart and annual total. Their separate undated count spans all filtered years.
- **Missing Dates — current year** counts distinct submissions with blank actual dispatch and no usable plan, where actual submission OR actual approval falls in the current year. OR counts once. Creation dates are not used. This count is independent of the inference toggle. It may overlap undated inferred records and date issues; do not add these counts.
- Percentages use the annual total; monthly average uses annual total / 12, including zero months.
- Site table totals reconcile with the chart. Multiple nonblank sites are counted once under Multiple sites (unallocated); no site is Unassigned. Expand a site to show all twelve months. Ambiguous memberships are listed in Data checks.
- Invalid or contradictory dates are flagged. A problem in a date needed for classification excludes the submission rather than guessing. An actual date can still classify a record with an issue in an unused planned field. Invalid/conflicting actual dispatch is not treated as blank for inference.
- Dates use calendar days: ISO text uses its written date; Power BI Date values use UTC calendar parts. Only delivered rows are counted; incomplete delivery produces a warning.

## Local review and build

Open `roadmap-preview.html` in a browser for synthetic data only. `node test-next.cjs` runs calculation tests. `node test-render.cjs` runs DOM construction and event-callback tests (not a real browser).

Run `node roadmap-2026.build.cjs` and `node roadmap-2026.verify.cjs` to generate the Power BI project, tests and browser harness. In the generated `roadmap-2026` folder: `npm install`, `npm test`, `npx tsc --noEmit`, then `npm run package`. Compile the harness with `npx esbuild verify/harness.ts --bundle --outfile=verify/harness.js --loader:.less=css`. Once Playwright Chromium is installed, run `node verify/run.cjs`. The GitHub workflow also compiles the actual Visual and runs `test-host.cjs` to verify update/resize state handling. With pnpm, use the hoisted dependency layout required by Microsoft's packager (`--shamefully-hoist`).

The package version is 1.1.0.0. No work records or screenshots are embedded in the demo. Regulatory Tracker's files and release remain unchanged. The standalone demo exercises the shared UI; it is not a substitute for Power BI import testing. Local filter choices are not persisted across reopening and do not cross-filter other report visuals.

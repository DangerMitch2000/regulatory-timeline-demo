# 2026 Roadmap — version 1.0 preview

A separate Power BI custom visual for a second page in your existing report. Regulatory Tracker and its package/demo are unchanged.

Import `roadmap-2026-1.0.0.0.pbiviz` through **Visualizations → … → Import a visual from a file**. Use your existing dataset. Map `SubID`, `OriginalDispatch`, `LatestDispatch`, and `ActualDispatch` to the corresponding field wells. Native source names need no renaming. Use raw Date/DateTime columns, not automatic Date hierarchies. SubID must identify a submission uniquely across the supplied data. Repeated membership rows are counted once per SubID.

- **Dispatched (blue):** actual dispatch date exists; use its month.
- Otherwise use LatestDispatch, falling back to OriginalDispatch only when LatestDispatch is blank.
- **Unconfirmed (green):** planned calendar day has passed and actual dispatch is absent. This does not prove physical delay.
- **In Progress / Expected (orange):** planned day is today or later.
- Only chosen dates in **2026** enter the 12 monthly bars, annual total, percentages and average. Average = annual total / 12, including empty months.
- **Missing Dates:** distinct submissions with blank actual/latest/original dispatch, across all supplied/filtered records. Kept outside the chart/year total because their year is unknown.

Contradictory nonblank dates or invalid values are flagged in Data checks. If they affect the date needed for classification, the submission is excluded rather than guessed. Valid actual dispatch can still classify a record with issues in unused plan fields; those issues remain visible. Blank and one consistent valid date across duplicate rows use the valid date. Rows without SubID are reported separately and cannot be counted distinctly. Submission/approval dates are never used as fallbacks.

Dates are calendar days. ISO strings use their written YYYY-MM-DD; Power BI Date objects use their UTC calendar components. As-of day uses the viewer's local calendar, recalculated on render and checked each minute while open. No data refresh time is invented. Daily semantic-model refreshes feed the visual normally; no extra scheduler is used.

Report filters and slicers feed the visual normally. Internal Regulatory Tracker controls do not sync across report pages. Counts reflect delivered rows; a warning remains when Power BI truncates data. The chart is readable around 850 × 650; narrower visuals allow horizontal chart scrolling. Native report page tabs are not recreated.

Build from repository root: `node roadmap-2026.build.cjs`, `node roadmap-2026.verify.cjs`; then in `roadmap-2026`, run `npm install`, `npm test`, `npx tsc --noEmit`, and `npm run package`. The separate GitHub workflow performs browser-host tests before packaging and publishing. No work records, source mappings, or screenshots are embedded. This is an uncertified preview; actual Power BI Desktop/Service import and tenant compatibility require verification.

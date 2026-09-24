# Key Submissions — 2026

A separate installable Power BI visual with ten records per page, native search and selectable record details. It does not replace Regulatory Tracker, Roadmap or IVDR Registration Overview.

## Import

Download `key-submissions-2026-1.0.0.0.pbiviz`, choose **Import a visual from a file** in Power BI, and add the new visual to your report. Map these field wells; your source columns do not need renaming.

| Field | Source |
|---|---|
| SubID (required) | Unique submission ID |
| KeySubmission (required) | Regulatory Objective “Top ten Key Submissions” field, containing Key Submission / Non-Key Submission |
| BusinessUnit (required) | Business unit containing ID |
| OriginalDispatch / LatestDispatch / ActualDispatch | Original planned, latest planned and actual dispatch dates; map at least one, preferably all three |
| ROID | Regulatory objective ID |
| Product | Product name; repeated membership rows supported |
| Country | Country name; repeated membership rows supported |
| Site | Site / legal manufacturer used in your report |
| SubStatus | Submission state |
| LatestSubmission / ActualSubmission | Latest planned and actual submission dates |
| LatestApproval / ActualApproval | Latest planned and actual approval dates |

Use raw date columns, not date hierarchies. Optional unmapped values say “Not provided.” Exact physical source names are not assumed. Map every actual milestone date to make next-milestone selection reliable.

## Scope and display

- Fixed to **2026** and business unit **ID**; does not roll forward in January. Matching ignores case/outer spaces.
- Requires an explicit **Key Submission** flag. Non-Key Submission and blanks are not key; it never uses a substring match that would include Non-Key.
- Year uses the same date priority as Roadmap: ActualDispatch, otherwise LatestDispatch, otherwise OriginalDispatch. Only a selected dispatch date in 2026 qualifies. This is a dispatch-year list, not all submissions whose creation or approval happened in 2026.
- Required mapping missing: show a setup prompt rather than misleading empty totals.
- Count once per SubID. Any key-flagged delivered association qualifies the ID; any ID business-unit association qualifies it. Retain all delivered associations of matching IDs so products/countries and date conflicts are not hidden.
- Conflicting or invalid date values are flagged. A conflicting higher-priority dispatch date excludes the record; no fallback guesses. No dispatch date means a separate undated count, not a fabricated 2026 date.
- Ten rows per page when at least ten match. Further pages expose every qualifying record; fewer than ten matching records remain fewer than ten. The total reflects delivered records, not invented padding.
- Rows show status dots, selectable submission IDs, product, country and next milestone/date. Multiple products or countries show the first plus a count; full lists are available in hover text and details. No product names are rewritten or abbreviated into potentially misleading names.
- Next milestone uses the first incomplete step (dispatch, submission, approval). Approval actual overrides to Approved. Missing targets say Not provided. Actual date issues say Check dates. This depends on mapped, complete dates, not a guess from a state label.
- Sort pending milestones by target date (earliest first; missing targets last), then approved records, then ID for ties. Completed/withdrawn states are not silently excluded.
- Search IDs, products, countries, sites or states. Search deliberately resets to page one; opening/closing details and resizing preserve the page. Report filters can reduce available pages; the displayed page clamps to the valid range.
- Compact design intended for a title-slide panel. Approximately 500×650 pixels gives ten readable rows with controls; smaller heights scroll instead of shrinking text. Validate readability at the final PowerPoint size. The visual does not create or modify PowerPoint slides.
- Click a submission ID for the details overlay. Full text is selectable and copyable. Close to return to the same list page. Search and pagination operate inside this visual; they do not cross-filter other visuals.

## Build / checks

From source, run `node key-submissions.build.cjs` and `node key-demo.cjs`. Install dependencies in `key-submissions`, then type-check and package with its pinned tools. `node key-test.cjs` covers scope, dates, duplicates and paging. The release workflow runs actual compiled host and browser checks before packaging. Public demo data is fictional.

Uncertified custom visual: actual Power BI import, tenant permissions and source relationships still require verification. Counts always reflect delivered rows; partial deliveries are visibly warned. No external service or network permission is used by the visual.

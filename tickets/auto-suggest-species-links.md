# Ticket: Auto-suggest Wikipedia / TSO links from scientific name

## Summary

`Wikipedia link` and `TSO link` (Trees and Shrubs Online) are currently
sheet-only columns — there's no field for either in the Add Tree or Edit Tree
form, so every one has to be found and pasted in manually via the spreadsheet.
This ticket explores auto-suggesting both from the scientific name, filled
into the form the same way **Common name** is already auto-filled when the
scientific name matches an existing tree (`index.html`, around :3822-3827).

Low priority / not important — this is a convenience feature for a manual
step that already works, not a bug. Written up so the thinking isn't lost,
not because it needs doing soon.

---

## Why it's only a partial solution

Scientific names aren't reliably convertible into a URL by pattern-matching
alone — naming is inconsistent (synonyms, old names, hybrid notation like
`× Hesperotropsis leylandii` written various ways), so a guessed URL risks
landing on a search page or a 404. The two target sites differ a lot in how
well this can be automated:

- **Wikipedia** has a real search API (`action=opensearch`, or the REST
  summary endpoint) that resolves a name to its actual page, following
  Wikipedia's own redirect graph — which already absorbs a lot of synonym and
  naming-variant noise for free. This can be called directly from the browser
  (CORS-friendly, no Apps Script involved).
- **TSO (treesandshrubsonline.org)** has no public API. There's no reliable
  way to predict *or verify* a direct article URL. The honest fallback is
  linking to TSO's own search-results page for the name instead of guessing
  an article — that always resolves, just one extra click.

Neither path is "always correct." Both are suggestions, not facts — the
contributor should see and can clear/edit them before saving.

## Where this fits in the existing UI

There's currently no in-app moment for these fields at all, so this requires
adding one, not hooking into something that exists:

1. Add optional `Wikipedia link` / `TSO link` fields to the Add Tree and Edit
   Tree forms. To avoid bloating the form for something most contributors
   won't touch, tuck them under a collapsed section — same pattern as the
   existing "Unsure?" scientific-name help panel (`.sci-name-help-toggle` /
   `.sci-name-help-panel`, `index.html` ~:296-315).
2. On blur of the Scientific name field (or when a datalist suggestion is
   picked), fire off the Wikipedia lookup client-side. If it resolves
   confidently, drop the result straight into the Wikipedia link field — no
   popup, no separate confirmation step, just a pre-filled text input exactly
   like the Common name autofill behaves today.
3. Same trigger for TSO, but prefill with the search-results URL rather than
   a guessed article URL (see above).
4. **Never overwrite a value the contributor already typed** — only fill when
   the field is still empty at the moment the lookup resolves. This mirrors
   the implicit rule the Common name autofill already follows.

The suggestion is reviewed the same way the rest of the form already is: it
sits in a normal editable field, visible before Submit — no new UI concept
needed.

## Open questions / things to figure out before building this

- What counts as "confident enough" for the Wikipedia API result to be worth
  auto-filling vs. leaving blank? (e.g. exact title match vs. a fuzzy/partial
  match that's more likely wrong.)
- Whether to also run the lookup on existing trees that are missing one of
  these links (e.g. a "Suggest" button in the edit form, on demand) rather
  than only at tree-creation time.
- Whether TSO's search results page is a good enough landing experience to be
  worth adding at all, versus just leaving TSO out and doing Wikipedia only.
- Rate limiting / caching if this ends up running on every blur of the
  scientific name field while someone is still typing/adjusting it.

## Files likely touched (if built)

- **`index.html`**: Add/Edit Tree form markup (new collapsed links section),
  new `suggestSpeciesLinks(sciName)`-type function wired to the scientific
  name field's blur/change, Wikipedia API fetch + confidence check, TSO
  search-URL construction.
- No Apps Script changes expected — both lookups are client-side reads, and
  the links are saved through the existing tree save/edit path.

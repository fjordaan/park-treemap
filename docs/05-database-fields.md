# Database fields

Every tree is one row in the `Trees` worksheet of your Google Sheet. Each row
has a set of columns — most are optional. You can edit them directly in the
spreadsheet at any time, and the map will pick up your changes within a
minute or two (after a refresh).

## Columns

| Column                  | What it's for                                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------------------------|
| **Ref**                 | Unique reference for each tree. **Auto-filled by a sheet formula** — don't type into this column.                   |
| **Number**              | A human-friendly number you assign to trees (e.g. an inventory number). Optional.                                   |
| **Photos**              | Comma-separated photo references. See *Photos* below.                                                               |
| **Scientific name**     | e.g. `Quercus robur`. The first word is the *genus*; the map colours each genus distinctly.                         |
| **Common name**         | e.g. `English oak`.                                                                                                 |
| **Short name**          | A shorter alternative for filtering, e.g. `Oak`.                                                                    |
| **Other names**         | Any other names by which this tree is known you want to show in the popup.                                          |
| **Latitude**            | A decimal latitude. The "Add a tree" flow fills this in for you.                                                    |
| **Longitude**           | A decimal longitude. Same.                                                                                          |
| **Notes**               | Free-text observations.                                                                                             |
| **Tags**                | Comma-separated tags. See *Special tags* below.                                                                     |
| **Year planted**        | Used to display the tree's age.                                                                                     |
| **Est. year planted**   | Estimated planting year, when the actual year isn't known.                                                          |
| **Year died**           | If set, the age calculation uses this as the end year instead of the current year.                                  |
| **Form**                | e.g. *Standard*, *Multi-stem*, *Shrub*. Drives the *Form* filter.                                                   |
| **Condition**           | e.g. *Good*, *Fair*, *Poor*, *Dead*. Drives the *Condition* filter.                                                 |
| **Months (Seasonal interest)** | Comma-separated month names when this tree has visible seasonal interest (e.g. `Apr, May` for blossom).        |
| **TSO link**            | Full URL to the species' page on [Trees and Shrubs Online](https://www.treesandshrubsonline.org).                   |
| **Wikipedia link**      | Full URL to the species' Wikipedia page. Shown as a link in the popup.                                              |
| **Identification link** | One or more comma-separated URLs that helped identify the tree, if different. E.g. [TreeGuideUK](https://www.treeguideuk.co.uk/) |
| **Google Maps link**    | A link to the location on Google Maps. **Auto-filled by a sheet formula** — don't type into this column.            |

## Special tags

The `Tags` and `Condition` columns understand a few values specially:

- **`New`** — any tag containing the word "New" (e.g. `New`, `New 2025`,
  `New 2026`) gives the tree a distinctive diamond-shaped marker and gets it
  its own filter group called *New trees*. The year suffix is optional but
  recommended — it lets you filter and celebrate new plantings by year.
- **`Native`** — if any tree in your sheet has this tag, the *Other* filter
  group gets an extra *"Non-native (hide)"* option that hides trees with the
  `Native` tag. Useful for groups documenting non-native pressure.
- **`Self-sown`** — same idea: adds a *"Hide self-sown"* option to the
  *Other* filters.
- **`TBC`** — the tree's marker becomes a question mark (still working out
  what species it is).
- **`Highlight`** — the marker becomes a star (a tree you want visitors to
  notice).
- **`Dead`** condition — if the tree's `Condition` is `Dead`, the marker
  becomes a grey square regardless of any other tags.

All of these are case-insensitive and based on whole-word matching, so
`Renewed` won't accidentally match `New`.

## Case-insensitive merging

The `Tags`, `Condition`, and `Form` columns are compared case-insensitively
throughout the app:

- `Native`, `native`, and `NATIVE` count as the **same tag**. The filter
  panel shows one row using the **first capitalisation it sees** in the
  spreadsheet.
- Same for `Good` / `good`, `Standard` / `standard`, and so on.
- The original casing is preserved in the spreadsheet and in the popup pill
  for each tree — so a tree typed as `native` still shows `native` in its
  popup; only the filter row merges them.
- The `Ref`, `Scientific name`, `Common name`, `Short name`, and `Photos`
  columns are **not** case-folded — they're matched exactly. (Scientific
  names in particular should always use the standard capitalisation, e.g.
  `Quercus robur`, never `quercus robur`.)

## Photos

The `Photos` column accepts a comma-separated list of values. Two forms work:

- **A full URL** — `https://example.com/my-tree.jpg`. Useful if you already
  host photos somewhere (e.g. Google Photos shared links).
- **A repo-hosted path** — `photos/t-abc123-1.jpg`. The map resolves this
  against your repository. Photos uploaded via the *"Add a tree"* form
  produce values in this form automatically — you don't usually need to type
  them yourself.

You can mix both kinds in one cell.

## "Don't touch these"

The `Ref` and `Google Maps link` columns are powered by formulas baked into
the template spreadsheet. They use `Latitude` and `Longitude` and update
themselves.

If you ever see new rows appearing **without** a Ref or Google Maps link,
the formula has been overwritten somewhere. Fix:

1. Find the topmost row that still has the formula working.
2. Click the cell, copy it, and paste it down across the broken rows.

If even row 2 is broken, copy the formula from the original template sheet.

## Keeping the sheet sorted

The sheet is much easier to read when it's sorted by Scientific name. The
Apps Script does this automatically every time a tree is added via the
map's *"+ Add a tree"* button. If you ever paste rows or edit names
**directly in the spreadsheet**, click any data cell and use **Data → Sort
sheet → Sort sheet by column C (Scientific name) → A → Z** to tidy it up.

## Adding columns of your own

If you want to track something the template doesn't have — say, *Sponsor* or
*Memorial dedication* — just add a new column. The map ignores columns it
doesn't recognise, so it won't break anything. You can also display them in
your own way later by editing the popup logic in `index.html` (see
`buildPopup` near the middle of the file).

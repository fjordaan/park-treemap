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
- **`Native`** — if any tree in your sheet has this tag, it creates an extra *"Non-native"* option that hides trees with the
  `Native` tag. Useful for groups documenting non-native pressure.
- **`Self-sown`** — same idea: adds a *"Hide self-sown"* option.
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

The `Photos` column accepts a comma-separated list of values. You can mix
and match **two kinds**:

### Option 1 — Upload a photo via the map

Tap the *+ Add a tree* or *+📷 Add photo* button on the map and pick a
photo. It's stored in your repository's `photos/` folder and the cell
automatically gets a reference like `photos/t-abc123-1.jpg`.

### Option 2 — Paste a URL to a photo hosted somewhere else

Just paste any publicly-accessible image URL into the `Photos` cell, for
example a photo from Flickr, Wikimedia Commons, your group's own
website, or a Google Photos shared album. The map fetches and displays
it directly. **No GitHub upload is involved**, so adopters who plan to
use this method only can skip the `GITHUB_TOKEN` step in
[docs/03](03-apps-script.md).

> 💡 Using Google Photos? It works, but the photo has to be in a
> **shared album** for the URL to be public — see
> [docs/13](13-google-photos.md) for the step-by-step.

### Mixing the two

You can put both kinds in the same cell, comma-separated:

```
https://lh3.googleusercontent.com/…, photos/t-abc123-1.jpg
```

The map displays them in the order you list them.

## "Don't touch these"

The `Ref` and `Google Maps link` columns are powered by a single
`ARRAYFORMULA` cell at the top of each column (row 2). One cell projects
the computed value into every row of that column, so as you add trees the
Ref and Google Maps link fields fill in automatically.

**Row 2 is reserved for these formula cells.** Tree data starts at
**row 3**. Don't:

- paste over the two ARRAYFORMULA cells in row 2,
- type a tree's Scientific name or Common name into row 2 (it would
  cause that row to sort away from the top and break the array
  projection),
- insert blank rows below row 2 to "pad" the sheet (they count as
  "used" for the Apps Script's last-row check, so new trees end up
  appended far below where you expect).

If a row appears **without** a Ref or Google Maps link, the
ARRAYFORMULA cell at the top of one of the columns has been
overwritten. Fix:

1. Open the [template spreadsheet](https://docs.google.com/spreadsheets/d/1PVzp_l5RKAYZDWJrBaZ0418P7LMPQKsEIBxTov6Znd0/edit).
2. Click cell A2 (Ref) or the corresponding cell in the Google Maps link
   column. Copy the formula from the formula bar at the top.
3. Paste it into the same cell in your own sheet.

Only the **single cell at row 2** holds the formula — don't paste it
down into other rows; that breaks the array projection.

## Keeping the sheet sorted

The sheet is much easier to read when it's sorted by Scientific name. The
Apps Script does this automatically every time a tree is added via the
map's *"+ Add a tree"* button. If you paste rows or edit names **directly
in the spreadsheet** and want to re-tidy, click any cell and use
**Data → Sort sheet → Sort sheet by column C (Scientific name) → A → Z**.

## Adding columns of your own

If you want to track something the template doesn't have — say, *Sponsor* or
*Memorial dedication* — just add a new column. The map ignores columns it
doesn't recognise, so it won't break anything. You can also display them in
your own way later by editing the popup logic in `index.html` (see
`buildPopup` near the middle of the file).

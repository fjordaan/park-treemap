# Tag suggestions

The template spreadsheet starts empty. Below are useful values you can copy
into your sheet's `Tags`, `Form`, and `Condition` columns. None of them are
required — pick what suits your park.

## Tags (multi-value, comma-separated)

These are values you might find yourself typing repeatedly. The map will
auto-detect any tag you use and add it to the filter panel — no need to
declare them anywhere.

| Tag             | Meaning                                                    |
|-----------------|------------------------------------------------------------|
| `New`           | A recently-planted tree (changes marker shape; see below). |
| `New 2025`      | Newly planted in a specific year.                          |
| `Native`        | A native species (enables the "Non-native (hide)" filter). |
| `Self-sown`     | Grew naturally rather than being planted by people.        |
| `Highlight`     | Star marker — for the most notable trees in the park.      |
| `TBC`           | Species not yet confirmed. Marker becomes a question mark. |
| `Tree Register` | For trees listed as Champions in the [Tree Register](https://www.treeregister.org/) |
| `Memorial`      | Planted in someone's memory.                               |
| `Sponsored`     | Has a named sponsor or donor.                              |
| `Veteran`       | Especially old trees, or those showing [veteran features](https://ati.woodlandtrust.org.uk/what-we-record-and-why/what-we-record/veteran-trees/). |
| `Avenue`        | Part of an avenue planting.                                |
| `Hedge`         | Part of a hedge rather than a free-standing tree.          |
| `Bird box`      | Has a bird nesting box affixed.                            |
| `Bat box`       | Has a bat nesting box affixed.                             |

> **Tip:** The `Native` and `Self-sown` tags are special — using them
> automatically adds inverse filters to the *Other* section so visitors can
> hide them. The `New` family is also special — they get a diamond marker shape.
> The year suffix is optional, but lets you group new plantings by year.

## Form (single value)

The general shape / style of the tree. The map auto-detects whatever you use,
but consistency makes filtering more useful.

- `Standard` (single trunk, with the canopy raised above head height)
- `Feathered` (single trunk, canopy reaches the ground)
- `Multi-stem` (several trunks from ground level)
- `Coppiced`
- `Pollarded`
- `Shrub`
- `Hedge`
- `Topiary`
- `Espalier` / `Cordon` / `Fan` (trained forms)

## Condition (single value)

Roughly *how healthy is this tree?* Useful for tracking decline or
flagging trees for action.

- `Excellent`
- `Good`
- `Fair`
- `Poor`
- `Dying`
- `Dead` (gives the tree a grey square marker)

A more compact 3-value scheme (`Good` / `Fair` / `Poor`) is easier to apply
consistently if multiple people add trees. Pick whichever you can sustain.

## Months (Seasonal interest)

Comma-separated values that drive the *"Seasonal interest"* filter — when
is this tree at its visual best? The column header is fixed, but the
values are free-text. The convention is the standard three-letter month
abbreviation:

`Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec`

Examples:

- A cherry that flowers in April: `Apr`
- A tree with autumn colour: `Oct, Nov`
- A holly with winter berries: `Nov, Dec, Jan`

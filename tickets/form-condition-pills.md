# Ticket: Show Form and Condition as pills in the tree popup

## Summary

The tree popup already shows Tags as coloured pills. Show **Form** and
**Condition** as pills too:

- **Form** uses the same word-based colours as Tags (`tagPill`), so each
  value always gets the same colour.
- **Condition** is coloured by meaning: Dead grey, Poor amber, Fair yellow,
  Good and Excellent green. Any value not in that list falls back to
  `tagPill`.

This is already implemented in fc-treemap (commit `4832413`, "Show Form and
Condition as pills in the tree popup"). Port it as-is. It reuses the existing
`.tag-pills` / `.tag-pill` CSS, so no CSS changes are needed.

---

## Implementation

### 1. Add `conditionPill` after `tagPill` (index.html:2188)

```js
  // Condition pills are coloured by meaning (worst = grey/red, best = green)
  // rather than by hashing the word. Unknown values fall back to tagPill.
  const CONDITION_PILL_COLOURS = {
    dead:      { bg: '#e4e4e4', fg: '#444' },
    poor:      { bg: '#fde3c4', fg: '#8a4a00' },
    fair:      { bg: '#fbf1b8', fg: '#6b5800' },
    good:      { bg: '#d9f2d9', fg: '#1d6b1d' },
    excellent: { bg: '#c8ecd4', fg: '#0d5a2c' },
  };
  function conditionPill(cond) {
    const c = CONDITION_PILL_COLOURS[cond.toLowerCase()];
    if (!c) return tagPill(cond);
    return `<span class="tag-pill" style="background:${c.bg};color:${c.fg}">${esc(cond)}</span>`;
  }
```

The lookup is case-insensitive. If this park's sheet uses other condition
words (for example "Moderate" or "Very poor"), add them to the map.

### 2. Replace the Form and Condition rows in the popup builder (index.html:2349–2350)

Replace:

```js
    html += row('Form',             tree['Form']);
    html += row('Condition',        tree['Condition']);
```

with:

```js
    const pillRow = (label, val, pill) => {
      const v = (val || '').trim();
      return v ? `<div class="prop"><b>${label}:</b><div class="tag-pills">${pill(v)}</div></div>` : '';
    };
    html += pillRow('Form',         tree['Form'],      tagPill);
    html += pillRow('Condition',    tree['Condition'], conditionPill);
```

An empty value shows no row, which matches the existing `row()` behaviour.

## Testing

1. Open the popup of a tree that has a Form and a Condition. Both show as
   pills on the same line as their label, styled like the Tags pills.
2. Dead is grey and Poor is amber. A Form value is the same colour on every
   tree.
3. A tree with no Form or Condition shows no row for it.

# Ticket: "Refine tree count" modal

## Summary

The Filters panel shows a count like "463 trees shown" at the top. Add the
ability to click that count to open a modal listing optional exclusion rules
(e.g. "exclude dead trees") with live before/after counts, so the user can
tune what counts as "shown" without touching the main filter dropdowns.

This was implemented and tested in fc-treemap (commit `dbb33fe`), then
refined with a bug fix and a small UX addition (see **Follow-up** at the
bottom of this ticket) — the behaviour and code snippets throughout this
ticket already reflect the final, current state. Replicate it, adapting
field names/CSS to park-treemap's own schema and modal conventions. If
park-treemap already implemented the original version of this ticket, only
the **Follow-up** section's changes are new.

---

## Behaviour

- The tree-count number gets a dashed underline and a pointer cursor.
  **Use `border-bottom: 1px dashed currentColor` on a wrapping span, not
  `text-decoration: underline dotted/dashed`** — the latter renders too
  faintly to be noticeable; this was tried first and rejected.
- Clicking it opens a modal (bottom sheet on mobile / centered on desktop —
  reuse whatever modal pattern park-treemap already has for this).
- The modal lists one checkbox row per exclusion rule, each rendered as:

  `{Label} ({X}): {Y}`

  e.g. "Exclude Condition: Dead (10): 463"

  - **X** = count of trees passing every *other* active filter/exclude-rule
    (i.e. ignoring this rule's own effect) that match this rule's specific
    criterion — see **Follow-up** below for why it's computed this way.
  - **When unchecked:** show `{Label} ({X}): {Y}`, where **Y** = that same
    "every other filter" total minus X — i.e. what the count would become
    if this rule were also switched on.
  - **When checked:** show `{Label} ({X})` only — no `Y`. (Originally this
    ticket said showing 0/current-total here was "intentional, not a bug."
    It was in fact a bug — see **Follow-up**.)
  - The modal's `<h3>` title is **"Refine tree count (currently {N})"**,
    where N is the live shown-tree count — same value as the header's own
    `#tree-count-number`, kept in sync on every toggle.

- **Live recompute:** toggling any checkbox immediately re-filters the map
  markers, updates the header count, and recomputes X/Y for *every* row
  (not just the one toggled), since excluding one thing changes the base
  "currently shown" set the other rows measure against.
- **Persistence:** each rule's checked state is a boolean saved under one
  localStorage key (a single JSON object). This is a standing preference,
  not a session filter — it must NOT be cleared by the app's "reset
  filters" action.
- **Defaults:** at least one rule (excluding dead trees) defaults to
  checked for first-time visitors, while others default unchecked. Anyone
  who already made an explicit choice keeps it — see implementation notes.
- The same predicate must gate both the *displayed count* and the *actual
  marker visibility on the map* — don't let these drift into two separate
  code paths.

---

## Implementation details (fc-treemap reference)

### Rule definitions + persisted state

Data-driven list so adding a new rule is a one-line addition. Adapt
`match()` to park-treemap's actual field names (fc-treemap's tree objects
use `tree['Condition']` / `tree['Form']`, exact string equality):

```js
const EXCLUDE_OPTIONS = [
  { key: 'deadCondition', label: 'Exclude Condition: Dead', match: tree => tree['Condition'] === 'Dead' },
  { key: 'shrubForm',     label: 'Exclude Form: Shrub',     match: tree => tree['Form'] === 'Shrub' },
  { key: 'bushForm',      label: 'Exclude Form: Bush',      match: tree => tree['Form'] === 'Bush' },
  { key: 'hedgeForm',     label: 'Exclude Form: Hedge',     match: tree => tree['Form'] === 'Hedge' },
];
const excludeFilters = { deadCondition: true, shrubForm: false, bushForm: false, hedgeForm: false };
try {
  Object.assign(excludeFilters, JSON.parse(localStorage.getItem('fc-treemap-exclude-filters') || '{}'));
} catch (e) {}
```

Note the pattern: hardcoded defaults object, then `Object.assign` over it
with whatever's in localStorage. A first-time visitor gets your defaults;
anyone with a saved value keeps their own explicit choice, because their
stored keys overwrite the defaults.

### Filter integration

Give `matchesFilters` a second, optional parameter — `skipExcludeKey` — used
only by the modal's own count calculations (see **Follow-up** below for why).
Add this at the end of the function, right before the final `return true`:

```js
function matchesFilters(tree, skipExcludeKey) {
  // ...existing filter checks...
  if (EXCLUDE_OPTIONS.some(opt => opt.key !== skipExcludeKey && excludeFilters[opt.key] && opt.match(tree))) return false;
  return true;
}
```

(Every other existing call site — `applyFilters`, URL-sharing, etc. — keeps
calling `matchesFilters(tree)` with no second argument, which behaves
exactly as before.)

### Count + marker visibility (existing `applyFilters`-equivalent function)

```js
function applyFilters() {
  let count = 0;
  markers.forEach((marker, tree) => {
    const show = matchesFilters(tree);
    if (show) count++;
    const visible = show && !hideMarkers; // hideMarkers is unrelated to this feature, ignore if you don't have it
    if (visible) {
      if (!map.hasLayer(marker)) marker.addTo(map);
    } else {
      if (map.hasLayer(marker)) marker.remove();
    }
  });
  document.getElementById('tree-count').innerHTML =
    `<span id="tree-count-number">${count}</span> tree${count !== 1 ? 's' : ''} shown`;
  if (document.getElementById('tree-count-modal')?.classList.contains('open')) updateTreeCountModal();
}
```

### Modal build + live update

```js
function buildTreeCountModal() {
  const container = document.getElementById('tree-count-options');
  EXCLUDE_OPTIONS.forEach(opt => {
    const row = document.createElement('label');
    row.className = 'exclude-opt';
    row.innerHTML =
      `<input type="checkbox" id="exclude-opt-${opt.key}"${excludeFilters[opt.key] ? ' checked' : ''}>` +
      `<span id="exclude-text-${opt.key}"></span>`;
    row.querySelector('input').onchange = (e) => {
      excludeFilters[opt.key] = e.target.checked;
      localStorage.setItem('fc-treemap-exclude-filters', JSON.stringify(excludeFilters));
      applyFilters();
    };
    container.appendChild(row);
  });
}

function updateTreeCountModal() {
  document.getElementById('tree-count-modal-total').textContent =
    document.getElementById('tree-count-number')?.textContent ?? '0';
  EXCLUDE_OPTIONS.forEach(opt => {
    // Trees matching every OTHER active filter/exclude-option, ignoring this rule's own
    // effect — so X means "how many trees this rule excludes" whether it's checked or not,
    // instead of reading 0 once its own exclusion has already removed them from the count.
    const otherTrees = [];
    markers.forEach((marker, tree) => { if (matchesFilters(tree, opt.key)) otherTrees.push(tree); });
    const x = otherTrees.filter(opt.match).length;
    const textEl = document.getElementById(`exclude-text-${opt.key}`);
    if (excludeFilters[opt.key]) {
      textEl.textContent = `${opt.label} (${x})`;
    } else {
      const y = otherTrees.length - x;
      textEl.textContent = `${opt.label} (${x}): ${y}`;
    }
  });
}

function openTreeCountModal() {
  if (!markers.size) return; // don't open before data has loaded
  document.getElementById('tree-count-backdrop').classList.add('open');
  document.getElementById('tree-count-modal').classList.add('open');
  updateTreeCountModal();
}

function closeTreeCountModal() {
  document.getElementById('tree-count-backdrop').classList.remove('open');
  document.getElementById('tree-count-modal').classList.remove('open');
}
```

Call `buildTreeCountModal()` once at init (alongside wherever other one-time
UI-building calls happen).

### HTML

```html
<span id="tree-count" onclick="openTreeCountModal()">Loading…</span>
```

```html
<div id="tree-count-backdrop" onclick="closeTreeCountModal()"></div>
<div id="tree-count-modal">
  <div id="tree-count-handle"></div>
  <h3>Refine tree count (currently <span id="tree-count-modal-total">0</span>)</h3>
  <div id="tree-count-options"></div>
  <div class="tree-count-modal-actions">
    <button type="button" class="btn-cancel-modal" onclick="closeTreeCountModal()">Done</button>
  </div>
</div>
```

(`tree-count-handle` is the mobile bottom-sheet drag handle bar, and
`btn-cancel-modal` is fc-treemap's shared modal-button style — reuse
whatever park-treemap's equivalents are instead of copying these class
names verbatim.)

### CSS

```css
#tree-count-number {
  border-bottom: 1px dashed currentColor;
}

#tree-count-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0,0,0,0.4);
}
#tree-count-backdrop.open { display: block; }
#tree-count-modal {
  position: fixed;
  z-index: 3001;
  background: white;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
@media (min-width: 768px) {
  #tree-count-modal {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 10px;
    width: 340px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
@media (max-width: 767px) {
  #tree-count-modal {
    bottom: 0; left: 0; right: 0;
    border-radius: 14px 14px 0 0;
    max-height: 85vh;
    overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    padding-bottom: 28px;
  }
  #tree-count-modal.open { transform: translateY(0); }
}
@media (min-width: 768px) {
  #tree-count-modal { display: none; }
  #tree-count-modal.open { display: block; }
}
#tree-count-handle { width: 40px; height: 4px; background: #ddd; border-radius: 2px; margin: 0 auto 16px; }
@media (min-width: 768px) {
  #tree-count-handle { display: none; }
}
#tree-count-modal h3 { margin: 0 0 14px; font-size: 15px; color: #1a1a1a; }
.exclude-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border-top: 1px solid #eee;
}
.exclude-opt:first-child { border-top: none; }
.tree-count-modal-actions { margin-top: 14px; text-align: right; }
```

If park-treemap's z-index stack differs from fc-treemap's (backdrop 3000 /
modal 3001), adjust so this modal still sits above the map and any other
floating UI, same as its other modals.

---

## Testing notes

- Verify the header count and map markers both update immediately when
  toggling a checkbox — not just the modal's own X/Y numbers.
- Reload the page and confirm checkbox states persist.
- Clear the localStorage key (simulating a first-time visitor) and confirm
  the "exclude dead trees" default comes back checked while others don't.
- Confirm "reset filters" does NOT clear these exclude toggles.
- Check a rule, then check a *second* rule too, and confirm the first rule's
  X stays correct (i.e. unaffected by the second rule being toggled) — this
  is the case the original bug (see **Follow-up**) got wrong.
- Open the modal and confirm the title reads "Refine tree count (currently
  N)" where N matches the header count, and updates live as you toggle rows.

---

## Follow-up (fc-treemap, post-`dbb33fe`)

After using the feature for real, two problems turned up with the original
implementation above — both already fixed in fc-treemap and folded into the
snippets earlier in this ticket, but called out separately here in case
park-treemap already implemented the original version and just needs the
delta.

**Bug: X read 0 for any checked rule.** The original `updateTreeCountModal`
computed X by filtering `shownTrees`, which came from plain
`matchesFilters(tree)` — and that function *already* excludes trees matching
any checked rule (that's the whole point of the feature). So for a checked
rule, its own matching trees were never in `shownTrees` to begin with, and X
mechanically came out to 0 every time. The ticket's original text called
this "intentional, not a bug" — it was wrong; a checked rule's count is
exactly the number a user most wants to see (e.g. "you're currently hiding
10 dead trees"), not a permanent 0.

**Fix:** give `matchesFilters` an optional `skipExcludeKey` parameter that
excludes one specific rule from its own internal exclude-check. Each row's X
is then computed by calling `matchesFilters(tree, opt.key)` — i.e. "apply
every filter and every *other* exclude rule, but not this one" — so X always
means "how many trees this specific rule is responsible for excluding,"
correct whether the checkbox is on or off. This is a superset behaviour
change: unchecked rows compute identically to before (skipping an
already-inactive rule is a no-op), only checked rows change.

**UX change: hide Y when checked.** Once X was fixed, showing `{X}: {Y}` for
a checked rule became genuinely redundant — Y is always just the current
total, since the rule is already applied. Checked rows now render as
`{Label} ({X})` with no trailing `: {Y}`.

**Addition: live total in the modal title.** Small UX nicety requested
alongside the bug report — the modal's `<h3>` now reads "Refine tree count
(currently {N})" instead of a bare "Refine tree count", where N mirrors
`#tree-count-number` and updates on every toggle (see `updateTreeCountModal`
above, and the `<h3>` in the HTML block above).

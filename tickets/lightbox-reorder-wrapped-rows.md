# Ticket: Lightbox reorder — dragging breaks when thumbnails wrap onto several rows

## Summary

The lightbox's drag-to-reorder strip (added in `299d613`) works out the drop position from the pointer's horizontal position alone. Once a tree has enough photos for `#lightbox-thumbs` to wrap onto a second row, dragging a photo to or from that row drops it in the wrong place.

This was found and fixed while porting the feature to fc-treemap. Replicate the fix here.

---

## When it happens

`#lightbox-thumbs` is `flex-wrap: wrap`, and on desktop each thumbnail is 240px wide (`@media (min-width: 768px)`). At 1280px wide, only 5 fit on a row, so the 6th photo goes onto a second row. On mobile (48px thumbnails) it takes many more photos, but it can still happen.

## Cause

In `lbThumbPointerDown` (`index.html`, the `onMove` handler):

```js
const firstRect = strip.children[0].getBoundingClientRect();
const step = firstRect.width + 6; // thumb width + the strip's gap (CSS)
let targetIndex = Math.floor((ev.clientX - firstRect.left) / step);
targetIndex = Math.max(0, Math.min(lbPhotos.length - 1, targetIndex));
```

This assumes a single row. On a wrapped strip:

- the pointer's vertical position is ignored, so a photo on row 2 is treated as if it were on row 1 at the same x position
- nothing past the end of row 1 can be reached, because the index is calculated from the left edge of row 1 only

Example with 6 photos at 1280px: dragging the 6th photo (centred under the 3rd one on row 2) calculates index 2. It jumps to position 3 straight away, before the pointer has moved anywhere meaningful.

The 8px dead zone has the same problem: it only measures horizontal movement (`Math.abs(dx) < 8`), so a purely vertical drag never counts as a drag.

## Fix

Choose the thumbnail whose centre is nearest the pointer, measuring in both directions. This works however many rows there are and needs no knowledge of the thumbnail size or the CSS gap. The dead zone also measures movement in both directions.

Replace the start of `onMove` (and add `startY` next to `startX`):

```js
const startY = e.clientY;
const onMove = ev => {
  if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
  moved = true;
  // Target is the thumbnail whose centre is nearest the pointer, so it
  // works when the strip wraps onto several rows, and stays correct
  // even though the thumbnails are re-rendered on each reorder.
  let targetIndex = 0, best = Infinity;
  [...strip.children].forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const d = Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height / 2));
    if (d < best) { best = d; targetIndex = i; }
  });
  const currentIndex = lbPhotos.indexOf(path);
  // ...rest unchanged
```

The rest of `onMove`, and all of `onUp` and `saveLightboxPhotoOrder`, stay as they are. The `dx` variable is no longer used once this change is made.

## Testing

1. Desktop, about 1280px wide: open the lightbox for a tree with 6 or more photos as an enrolled contributor, and turn on reorder mode. The strip should wrap onto two rows.
2. Drag the photo on row 2 to the first position on row 1. It should land first, and nothing should move until the pointer has travelled about 8px.
3. Drag a row 1 photo onto row 2. It should land where it's dropped.
4. Check the new order is saved to the Photos cell, and that a failed save still puts the original order back.
5. Mobile: reordering within one row should work exactly as before.

In fc-treemap, step 2 was checked by calling the handler with simulated pointer events: dragging the 6th photo to row 1, position 1 gave index 0, and the failed save restored the original order.

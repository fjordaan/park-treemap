# Ticket: Lightbox — native-resolution zoom with pan

## Summary

Implement a click/tap-to-zoom lightbox that zooms a photo to its native pixel resolution and allows the user to pan in all directions (mouse drag on desktop, touch scroll on mobile). A second click/tap zooms back out.

This was implemented and tested in fc-treemap (commit `a027637`). Replicate it exactly.

---

## Behaviour

- **Default view**: photo fits within the lightbox (`max-width: 100%`, `max-height: calc(100dvh - 80px)`)
- **Zoomed view**: photo displays at `naturalWidth × naturalHeight` pixels, centered in the lightbox. If the image is smaller than the viewport it is centered via padding; if larger, the user can scroll/pan to see all of it
- **Zoom in**: single click or tap on the photo
- **Zoom out**: single click or tap again
- **Pan (desktop)**: click-drag anywhere on the photo; also works with trackpad two-finger scroll
- **Pan (mobile)**: native touch scroll in all directions

---

## Implementation details

### CSS changes

Remove any mobile-only zoom restrictions. The base image style:

```css
#lightbox-img {
  max-width: 100%;
  max-height: calc(100dvh - 80px);
  object-fit: contain;
  display: block;
  cursor: zoom-in;
}
```

Add gradient overlays (always fixed, always visible in lightbox):

```css
#lightbox-grad-top, #lightbox-grad-bottom {
  position: fixed;
  left: 0; right: 0;
  height: 90px;
  pointer-events: none;
}
#lightbox-grad-top    { top: 0;    background: linear-gradient(to bottom, rgba(0,0,0,0.55), transparent); }
#lightbox-grad-bottom { bottom: 0; background: linear-gradient(to top,   rgba(0,0,0,0.55), transparent); }
```

Add these two divs as the first children of `#lightbox`:
```html
<div id="lightbox-grad-top"></div>
<div id="lightbox-grad-bottom"></div>
```

The zoom hint element should be visible on all devices (not mobile-only):
```css
#lightbox-zoom-hint {
  position: absolute;
  top: 24px; left: 16px;
  font-size: 11px;
  color: rgba(255,255,255,0.6);
  pointer-events: none;
}
```

### JS: helper functions

```javascript
function lbSetOverlaysFixed(fixed) {
  const closeBtn = document.getElementById('lightbox-close-top');
  const hint     = document.getElementById('lightbox-zoom-hint');
  const bar      = document.getElementById('lightbox-bar');
  if (fixed) {
    closeBtn.style.position = 'fixed';
    hint.style.position     = 'fixed';
    bar.style.position = 'fixed';
    bar.style.bottom = '0';
    bar.style.left   = '0';
    bar.style.right  = '0';
  } else {
    closeBtn.style.position = hint.style.position = '';
    bar.style.position = bar.style.bottom = bar.style.left = bar.style.right = '';
  }
}

function lbResetZoom() {
  const img = document.getElementById('lightbox-img');
  const lb  = document.getElementById('lightbox');
  img.classList.remove('zoomed');
  img.style.width = img.style.height = img.style.maxWidth = img.style.maxHeight = img.style.cursor = '';
  lb.classList.remove('zoomed');
  lb.style.overflow = lb.style.alignItems = lb.style.justifyContent = lb.style.padding = '';
  document.getElementById('lightbox-zoom-hint').textContent = 'Click or tap photo to zoom';
  lbSetOverlaysFixed(false);
}
```

Call `lbResetZoom()` in `showLightboxPhoto()` (when navigating between photos) and in `closeLightbox()`.

### JS: zoom toggle

Add `draggable="false"` to the `<img>` element to prevent browser native image drag.

```javascript
function toggleLightboxZoom(e) {
  e.stopPropagation();
  if (lbDragDist > 5) return; // was a pan gesture, not a click
  const img = document.getElementById('lightbox-img');
  const lb  = document.getElementById('lightbox');
  if (img.classList.contains('zoomed')) {
    lbResetZoom();
  } else {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (!nw) return; // image not loaded yet
    img.style.width     = nw + 'px';
    img.style.height    = nh + 'px';
    img.style.maxWidth  = 'none';
    img.style.maxHeight = 'none';
    img.style.cursor    = 'grab';
    lb.style.overflow       = 'auto';
    lb.style.alignItems     = 'flex-start';
    lb.style.justifyContent = 'flex-start';
    img.classList.add('zoomed');
    lb.classList.add('zoomed');
    lbSetOverlaysFixed(true);
    document.getElementById('lightbox-zoom-hint').textContent = 'Click or tap to zoom out, drag to pan';
    // Centre via padding when image is smaller than viewport
    const padH = Math.max(0, (lb.clientWidth  - nw) / 2);
    const padV = Math.max(0, (lb.clientHeight - nh) / 2);
    lb.style.padding = `${padV}px ${padH}px`;
    // Centre scroll when image is larger than viewport
    lb.scrollLeft = Math.max(0, (nw - lb.clientWidth)  / 2);
    lb.scrollTop  = Math.max(0, (nh - lb.clientHeight) / 2);
  }
}
```

### JS: drag-to-pan + pan detection

```javascript
let lbDragDist = 0, lbPointerOrigin = null;
let lbDragging = false, lbDragStart = null, lbScrollStart = null;

(function () {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');

  img.addEventListener('pointerdown', e => {
    lbPointerOrigin = { x: e.clientX, y: e.clientY };
    lbDragDist = 0;
    if (img.classList.contains('zoomed')) {
      lbDragging    = true;
      lbDragStart   = { x: e.clientX, y: e.clientY };
      lbScrollStart = { left: lb.scrollLeft, top: lb.scrollTop };
      img.setPointerCapture(e.pointerId);
      lb.style.cursor     = 'grabbing';
      lb.style.userSelect = 'none';
    }
  });

  img.addEventListener('pointermove', e => {
    if (!lbPointerOrigin) return;
    const dx = e.clientX - lbPointerOrigin.x;
    const dy = e.clientY - lbPointerOrigin.y;
    lbDragDist = Math.sqrt(dx * dx + dy * dy);
    if (lbDragging && lbDragStart) {
      lb.scrollLeft = lbScrollStart.left - (e.clientX - lbDragStart.x);
      lb.scrollTop  = lbScrollStart.top  - (e.clientY - lbDragStart.y);
    }
  });

  img.addEventListener('pointerup', () => {
    lbDragging = false;
    lbDragStart = lbScrollStart = null;
    lb.style.cursor = lb.style.userSelect = '';
  });

  img.addEventListener('pointercancel', () => {
    lbDragging = false;
    lbDragStart = lbScrollStart = null;
    lb.style.cursor = lb.style.userSelect = '';
  });
}());
```

Note: `lbDragDist` must be declared before `toggleLightboxZoom` and the pointer listeners, as both reference it.

---

## Key gotchas

1. **`draggable="false"` is essential** — without it, clicking the image on desktop triggers the browser's native image drag (ghost image under cursor), which breaks the drag-to-pan behaviour entirely.

2. **UI overlays must switch to `position: fixed` when zoomed** — `#lightbox-close-top`, `#lightbox-zoom-hint`, and `#lightbox-bar` are `position: absolute` inside `#lightbox`. When `#lightbox` gets `overflow: auto` and is scrolled, absolutely-positioned children scroll away with it. Switching them to `position: fixed` keeps them anchored to the viewport. Since `#lightbox` is always `inset: 0`, the pixel coordinates are identical.

3. **Gradient z-index** — do NOT give the gradient divs an explicit `z-index`. If you do, they will stack above the UI elements (close button, nav bar) which have no explicit z-index. Let DOM order handle stacking: gradients first in the DOM, UI elements after → UI elements win.

4. **Centering a possibly-oversized image in a scrollable flex container** — the standard `margin: auto` trick breaks scrolling. Instead, add `padding` to the container equal to `Math.max(0, (containerSize - imageSize) / 2)`. When the image is smaller than the container this centers it; when larger, padding is 0 and scrolling takes over.

5. **Pan vs tap distinction** — `lbDragDist` tracks pointer travel distance from `pointerdown` to `click`. If > 5px, `toggleLightboxZoom` returns early. This prevents a pan gesture from accidentally toggling zoom.

# Ticket: Make double-tap zoom work on mobile (iOS Safari)

## Summary

Double-clicking the map zooms in on desktop, but double-tapping does nothing
on an iPhone. Nothing in our code disables it. Leaflet 1.9.4's
`DoubleClickZoom` relies on the browser's native `dblclick`, or on a fallback
that watches `click` events with `detail === 1`. iOS Safari doesn't reliably
trigger either one for touch on the map, so double-taps never reach Leaflet.

The fix is to detect double-taps ourselves from pointer events. Mouse
double-clicks are handled in the same place, so a double-tap can never zoom
twice even on browsers where Leaflet's version would have worked too.

This is already implemented in fc-treemap (commit `32c7594`, "Add double-tap
zoom that works on mobile Safari"). It has been checked on a real iPhone and
in Chrome's mobile emulation. Port it as-is.

---

## Implementation

Add this block to `index.html` straight after the map is created and the
base layer added (currently `index.html:2979–2984`, after the
`L.control.layers(...)` line). It only needs `map` to exist:

```js
  // ── Double-tap zoom ──────────────────────────────────────────────────────────
  // Leaflet's double-click zoom relies on the browser's dblclick (or a click
  // `detail` heuristic), which some mobile browsers, notably iOS Safari, don't
  // provide for touch. Detect double-taps from pointer events instead, and
  // handle mouse double-clicks ourselves so the two never both zoom.
  map.doubleClickZoom.disable();
  (() => {
    const container = map.getContainer();
    const TAP_MS = 300, GAP_MS = 350, MOVE_PX = 12, APART_PX = 40;
    const active = new Set();
    let down = null, lastTap = null, multi = false, lastTouchZoom = 0;
    const onUi = (e) => e.target.closest('.leaflet-control, .leaflet-popup');

    container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      active.add(e.pointerId);
      if (active.size > 1) { multi = true; lastTap = null; }
      down = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    const release = (e) => {
      if (e.pointerType === 'mouse') return;
      active.delete(e.pointerId);
      const wasMulti = multi;
      if (active.size === 0) multi = false;
      if (e.type !== 'pointerup' || wasMulti || !down || onUi(e)) { down = null; return; }
      const now = Date.now();
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const isTap = moved < MOVE_PX && now - down.t < TAP_MS;
      down = null;
      if (!isTap) { lastTap = null; return; }
      if (lastTap && now - lastTap.t < GAP_MS &&
          Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < APART_PX) {
        lastTap = null;
        lastTouchZoom = now;
        const pt = map.mouseEventToContainerPoint(e);
        map.setZoomAround(pt, map.getZoom() + 1);
      } else {
        lastTap = { x: e.clientX, y: e.clientY, t: now };
      }
    };
    container.addEventListener('pointerup', release);
    container.addEventListener('pointercancel', release);

    // Mouse (and any browser-generated dblclick not already handled above).
    map.on('dblclick', (e) => {
      if (Date.now() - lastTouchZoom < 800) return;
      const oe = e.originalEvent;
      map.setZoomAround(e.containerPoint, map.getZoom() + (oe && oe.shiftKey ? -1 : 1));
    });
  })();
```

### How it behaves

- **Double-tap:** two taps, each under 300 ms with less than 12 px of
  movement, no more than 350 ms apart and within 40 px of each other. It zooms
  in one level, keeping the tapped point fixed.
- **Ignored:** pinches (more than one finger down), drags, and taps on map
  controls (layers control, zoom buttons) or popups.
- **Mouse double-click:** still zooms in one level, and Shift-double-click
  zooms out, matching Leaflet's default.
- **No double zoom:** a `dblclick` that arrives within 800 ms of a touch zoom
  is ignored. That covers Android Chrome, which fires native `dblclick` on
  touch as well.
- **Single taps are unaffected:** single taps still reach the existing
  `map.on('click', ...)` handler (add-tree click-map mode, reposition, and so
  on), because the handler never calls `preventDefault` on pointer events.

## Testing

1. On an iPhone (Safari), double-tap the map. It zooms in one level, centred
   on the tap.
2. Two slow taps don't zoom. Pinch and drag still work normally.
3. On desktop, double-click zooms in and Shift-double-click zooms out.
4. On Android Chrome, a double-tap zooms in exactly one level, not two.
5. Add-tree "click on map" mode still places the crosshair on a single tap.

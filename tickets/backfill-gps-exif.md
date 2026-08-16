# Ticket: Backfill GPS EXIF into existing repo photos

## Summary

Existing photos in the bayonne-trees repo were uploaded before the EXIF
preservation feature was added. They have no GPS metadata. This ticket adds a
one-off Node.js script that injects GPS coordinates (from the tree's
Latitude/Longitude) into the EXIF of every photo already committed to the repo.

`DateTimeOriginal` is deliberately left empty — the git commit date is when the
photo was uploaded, not when it was taken, so writing it would be misleading.

---

## How to run

The script is run once inside a local checkout of the target fork (e.g.
`bayonne-trees`). It modifies the files in `photos/` in-place, after which you
commit and push the changes.

Prerequisites:
- Node.js installed
- `npm install piexifjs` (or the script can install it inline)
- The repo checked out locally
- Internet access (to fetch the spreadsheet CSV)

```
node backfill-gps-exif.js
```

---

## Implementation notes

### Inputs

1. The published Google Sheets CSV (fetched from the `CSV_URL` used by the
   map). This gives us the `Photos` and `Latitude`/`Longitude` fields for every
   tree.
2. The `photos/` directory in the repo checkout. All `.jpg` files there are
   candidates.

### Logic

1. Fetch and parse the CSV.
2. Build a map: `filename → { lat, lng }` by iterating every tree's `Photos`
   cell (comma-separated paths like `photos/t-abc123-1.jpg`) and pairing each
   path with that tree's coordinates.
3. For each `.jpg` in `photos/`:
   - Skip any file that already has GPS EXIF (so the script is safe to re-run).
   - Look up coordinates from the map. If not found (orphaned file), skip with
     a warning.
   - Read the file, inject GPS using `piexifjs`, write back.
4. Print a summary: how many files updated, skipped (already had GPS), skipped
   (not found in sheet).

### GPS injection with piexifjs

`piexifjs` operates on base64 / data URLs. Read each file as a Buffer, convert
to a data URL, insert EXIF, convert back to a Buffer, write.

```js
const fs = require('fs');
const piexif = require('piexifjs');

function decimalToDMS(decimal) {
  const deg = Math.floor(decimal);
  const minFloat = (decimal - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 100);
  return [[deg, 1], [min, 1], [sec, 100]];
}

function injectGPS(jpegBuffer, lat, lng) {
  const dataUrl = 'data:image/jpeg;base64,' + jpegBuffer.toString('base64');
  const exifObj = { '0th': {}, 'Exif': {}, 'GPS': {
    [piexif.GPSIFD.GPSLatitudeRef]:  lat >= 0 ? 'N' : 'S',
    [piexif.GPSIFD.GPSLatitude]:     decimalToDMS(Math.abs(lat)),
    [piexif.GPSIFD.GPSLongitudeRef]: lng >= 0 ? 'E' : 'W',
    [piexif.GPSIFD.GPSLongitude]:    decimalToDMS(Math.abs(lng)),
  }};
  const inserted = piexif.insert(piexif.dump(exifObj), dataUrl);
  return Buffer.from(inserted.split(',')[1], 'base64');
}
```

### Checking for existing GPS

```js
function hasGPS(jpegBuffer) {
  try {
    const dataUrl = 'data:image/jpeg;base64,' + jpegBuffer.toString('base64');
    const exif = piexif.load(dataUrl);
    return Object.keys(exif['GPS'] || {}).length > 0;
  } catch (e) { return false; }
}
```

### CSV fetch and parse

The script needs the `SHEET_ID` and `SHEET_NAME` from the fork's `config.js`.
Simplest approach: require the user to paste them at the top of the script as
constants, or read `config.js` with a regex. The CSV URL is:

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&sheet={SHEET_NAME}
```

Use Node's built-in `fetch` (Node 18+) or `https` module to download it.
Parse with a minimal CSV parser (handle quoted fields with commas).

---

## After running

```
git add photos/
git commit -m "Backfill GPS EXIF into existing photos"
git push
```

No Apps Script changes needed. No config changes needed.

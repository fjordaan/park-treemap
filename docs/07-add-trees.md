# Adding & managing trees

There are two ways to add trees to your map:

1. **From the map** — click *"+ Add a tree"* and pick a location. Best for
   adding trees in the field on your phone, or visually placing them.
2. **Directly in the spreadsheet** — open your Google Sheet and type a new
   row. Best for bulk-importing or pasting from another source.

Both are fine. Both feed the same sheet.

## Adding from the map

> 💡 The *"+ Add a tree"* button only appears on devices you've
> [enrolled as a contributor](12-trusted-contributors.md#enrolling-devices).
> If you don't see it, open the magic link your map admin gave you
> once on each device. (Unless your map is configured as fully open
> — see [docs/12](12-trusted-contributors.md) — in which case the
> button is visible to everyone.)

1. Open your map (`https://your-username.github.io/your-repo/`).
2. Click **"+ Add a tree"** in the filter panel (or on the welcome card if
   the sheet is empty). A small dialog appears with two ways to place the
   tree:
   - **📍 Current location** — uses your phone's GPS. Best when standing
     next to the tree.
   - **🗺️ Click on map** — places the tree wherever you tap. A reminder
     bar at the bottom of the screen tells you what to do next; tap
     **Cancel** there if you change your mind. Tip: switch to
     *Satellite* in the bottom-left layer control to see the canopy and
     place accurately.
4. Fill in the form. **Scientific name** is the most important field; the
   rest are optional and can be added later.
5. Optionally attach up to **4 photos**. Two ways:
   - **📁 Choose photos** — pick from your camera roll or files.
   - **📷 Take photo** — opens your camera (on mobile devices). After taking,
     it goes into the same row.
6. Click **Submit**. The form shows the upload progress. You'll see a
   *"Submitted! Thank you."* message when the row lands in the sheet.

The new tree won't appear on the map immediately — the map only loads from
the sheet at page-load. Refresh after a few seconds and your tree will be
there.

> 💡 Prefer to host photos elsewhere (Google Photos, Flickr, your group's
> website, …)? You can paste any public image URL straight into the
> `Photos` cell of the spreadsheet — see
> [docs/05 Photos](05-database-fields.md#photos) for the two-options
> overview and [docs/13](13-google-photos.md) for the Google Photos
> specifics.

## Adding photos to an existing tree

Forgot to attach photos when you first added the tree? Want to add another
photo a few months later? Open the tree's popup and look for the **+📷
Add photo** button in the photo area:

- If the tree has **no photos** yet, you'll see a single dashed slot
  reading *"+📷 Add photo"*.
- If the tree has 1, 2 or 3 photos, the *"+📷 Add photo"* slot sits
  beside them.
- If the tree already has 4 photos (the maximum), no slot is shown.

Tap the slot, choose *📁 Choose photo* or *📷 Take photo*, pick or take
your picture, and the new photo appears in the popup once the upload
finishes.

> 💡 The *"+📷 Add photo"* slot only appears on devices
> [enrolled as contributors](12-trusted-contributors.md#enrolling-devices),
> or on any device if your map is configured as fully open. Other
> visitors only see existing photos.

## Removing a photo from a tree

If you're enrolled as a contributor, each uploaded photo in the popup
has a small **trash icon** in its top-right corner. Tapping it opens
that photo's **Delete file** page on GitHub in a new tab — click
**Commit changes** there to remove it. (The trash icon only appears on
photos hosted in your repo; photos linked from elsewhere, like Google
Photos, don't show it — remove those at their original home.)

Two things to know:

- Deleting the file doesn't remove its reference from the spreadsheet.
  After deleting, also clear that photo's path from the tree's `Photos`
  cell, or the map will show a broken thumbnail until you do.
- The file stays in your repository's history even after deletion (this
  is just how git works). For ordinary tidying that's fine; for
  genuinely sensitive content the only complete removal is to delete
  the whole repository.

## Adding from the spreadsheet

1. Open your sheet.
2. Type values into a new row. The `Ref` and `Google Maps link` columns will
   fill in automatically thanks to the template formulas — leave them alone.
3. At minimum, fill `Latitude`, `Longitude`, and `Scientific name`.

> 💡 **Tip:** to grab coordinates from the map, click the **"Copy coords"**
> button in the filter panel, then click the tree's location on the map. The
> latitude and longitude are copied to your clipboard, ready to paste into
> the two cells.

## Keeping the sheet sorted

The Apps Script re-sorts the sheet by Scientific name automatically every
time someone adds a tree via the **"+ Add a tree"** button in the map.

If you add or edit rows **directly in the spreadsheet**, the sort won't
update on its own. To put everything back in order:

1. Click any cell in the data.
2. **Data → Sort sheet → Sort sheet by column C (Scientific name) → A → Z.**

Row 2 stays put even though it's included in the sort, because its
Scientific name and Common name are empty (and so it sorts to the top).
Just don't type a tree's name into row 2.

## Editing trees

Just edit the spreadsheet. There's no "edit" mode in the map itself.

The Ref column won't change as long as you don't move the tree (it's
derived from Latitude/Longitude).

## Removing trees

Either delete the row from the sheet, or — to keep history — set the tree's
`Condition` to `Dead`. Dead trees stay on the map as grey squares so you can
track losses over time.

> ⚠️ If you delete a tree row that has uploaded photos, those photo files
> stay in your `photos/` folder in the repo, taking up space. They're not
> visible anywhere but they're not free either. Clean them up via the
> trash icon on each photo in the popup *before* deleting the row, or
> later in the GitHub web UI (open the file → delete → commit). See
> [Removing a photo from a tree](#removing-a-photo-from-a-tree) above.

## Mobile-specific tips

- **Camera shortcuts**: on iOS Safari, the *"Take photo"* button opens the
  camera directly. You may need to grant Safari camera permission the first
  time. On Android, the same button works the same way in Chrome.
- **Install as an app**: a banner appears at the bottom of the map after a
  few visits. Installing it (or *Add to Home Screen* on iOS) removes the
  browser bars and gives you a real app icon.

## Photo upload tips

- Photos are automatically resized to a max 1600px on the longest edge and
  re-encoded as JPEG. A typical phone photo (8 MB) ends up around 400 KB.
- The upload is invisible to most adopters: photos are committed to your
  GitHub repository via the Apps Script behind the scenes. If you ever need
  to check, look in `photos/` in your repo — files are named like
  `t-abc123-1.jpg`.
- If a photo upload fails (network drop, expired token, etc.), the form
  continues and submits the tree without that photo. You can re-upload later
  by editing the spreadsheet's `Photos` cell directly.

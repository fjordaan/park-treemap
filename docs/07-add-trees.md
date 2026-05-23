# Adding & managing trees

There are two ways to add trees to your map:

1. **From the map** — click *"+ Add a tree"* and pick a location. Best for
   adding trees in the field on your phone, or visually placing them.
2. **Directly in the spreadsheet** — open your Google Sheet and type a new
   row. Best for bulk-importing or pasting from another source.

Both are fine. Both feed the same sheet.

## Adding from the map

> 💡 If your map is set up with
> [trusted contributors](12-trusted-contributors.md), the *"+ Add a tree"*
> button is hidden until you've enrolled your device — open the magic
> link your map admin gave you, once on each device.

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

> 💡 The *"+📷 Add photo"* slot only appears if your map has
> [trusted contributors](12-trusted-contributors.md) switched on and
> your device is enrolled — or if the map is in open mode (any visitor
> can add). Other visitors only see existing photos.

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

That's it — two clicks and the sheet is tidy again.

## Editing trees

Just edit the spreadsheet. There's no "edit" mode in the map itself.

The Ref column won't change as long as you don't move the tree (it's
derived from Latitude/Longitude).

## Removing trees

Either delete the row from the sheet, or — to keep history — set the tree's
`Condition` to `Dead`. Dead trees stay on the map as grey squares so you can
track losses over time.

> ⚠️ If you delete a tree row that has uploaded photos, those photo files
> will still be sitting in your `photos/` folder in the repo, taking up
> space. They're not visible anywhere but they're not free either. To clean
> them up, delete them in the GitHub web UI (open the file → trash icon →
> commit).

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

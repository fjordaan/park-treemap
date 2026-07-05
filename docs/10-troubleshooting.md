# Troubleshooting

If something isn't working, try the checks below before asking for help.

## The map page loads but says "Failed to load data"

Most often: the sheet isn't actually published to the web.

1. Open the spreadsheet.
2. **File → Share → Publish to web** — confirm there's an *Embed* / *Link*
   panel showing a published URL.
3. If the *Publish* button still says "Publish" (not "Republish"), publish it
   now.

Other causes:

- The `SHEET_ID` in your `config.js` is wrong. Double-check it's the long
  string between `/d/` and `/edit` in the sheet URL.
- The worksheet isn't called `Trees`. Either rename it back to `Trees`, or
  update `SHEET_NAME` in `config.js` to match.

## The map shows the world view and an empty welcome card

Your spreadsheet has zero rows of tree data. That's expected — add your
first tree (in the spreadsheet or via the Add Tree button) and refresh.

## I don't see the "+ Add a tree" button

By default the button only appears on devices you've
[enrolled as a contributor](12-trusted-contributors.md#enrolling-devices) —
visit the magic enrolment link your map admin gave you, once on this
device.

If you're the admin and you've forgotten the link, look up the
`CONTRIBUTOR_TOKEN` value in your Apps Script's Script Properties.

If you'd rather have an open map where anyone can add trees, see
[docs/12 → Turning gating off](12-trusted-contributors.md#turning-gating-off-fully-open-map).

## I don't see the "+📷 Add photo" slot in tree popups

Same reason as above — the slot is only shown to enrolled contributors.
Visit your enrolment link once on this device.

If the tree already has 4 photos (the maximum), the slot is hidden
even for enrolled contributors — remove one in the spreadsheet's
`Photos` column to make room.

## I added a tree using my phone and its position isn't correct

When you add a tree with the **Use current location** button, it's placed using the phone's GPS positioning. Unfortunately, this isn't always accurate.

Fortunately, this is a very easy problem to fix: 
- On your computer (not your phone), view the map and click the incorrectly placed tree.
- Copy its Ref (looks like `48344.21842`) to the clipboard. (Just click on the numbers to select it and `Ctrl / Cmd + C` 
- Open the Google Sheet - there is a link to it in the map's About popup.
- `Ctrl / Cmd + F` and paste in the Ref to find the right tree.
- Go back to the map, and click the **Copy coords** button (it's next to the **Add a tree** button).
- Click on the map in the correct location where the tree should be, to copy its coordinates to the clipboard. (You can turn on the Satellite view layer to help see the right location.)
- Go back to the spreadsheet, and on the **Latitude** cell, `Ctrl / Cmd + V` Paste the coordinates - it will replace both Latitude and Longitude.
- That's it! You've repositioned the tree.

## Submitted a tree but nothing happens

Because of how Google Apps Script handles cross-origin requests, the browser
can't see the script's response — so submission errors are silent. To
diagnose:

1. **Check the spreadsheet.** Is the new row there? If yes, the submission
   worked; you just need to refresh the map to see it.
2. **Check the Apps Script logs.** Open <https://script.google.com>, open
   your project, click **Executions** in the left sidebar. Failed runs are
   marked in red with the error message.
3. **Visit the Apps Script URL directly** in a browser. You should see
   `{"status":"ok","message":"Park Tree Map Apps Script is running."}`. If
   not, the script isn't deployed or *Who has access* isn't set to *Anyone*
   (see step 3.4).

## Photos uploaded but don't appear on the map

1. **Are they in the repo?** Open `photos/` in your GitHub repo. Each upload
   should produce a `t-…-N.jpg` file.
2. **Are they in the Photos cell?** Check the spreadsheet row — the `Photos`
   column should contain `photos/t-…-1.jpg` etc.
3. **Has the page reloaded since the upload?** The map only fetches data on
   load. Refresh.
4. **Is `GITHUB_REPO` in CONFIG correct?** It must exactly match
   `owner/repo`. A typo here means the map looks for photos at the wrong
   URL.

## Photo upload fails silently every time

The most common cause is an expired or wrong GitHub token.

1. Open <https://script.google.com>, open your project, **Executions**, and
   look at the most recent `handleUploadPhoto` run. If the error mentions
   `Bad credentials` or `401`, your token has expired.
2. Generate a new fine-grained PAT (see [step 3.1](03-apps-script.md#31-create-a-fine-grained-github-personal-access-token)).
3. Update the `GITHUB_TOKEN` Script Property with the new token.
4. **You don't need to redeploy** the Apps Script — script properties take
   effect immediately.

Other causes:

- `GITHUB_REPO` script property is wrong (typo, missing slash).
- The token doesn't have *Contents: Read and write* on the right repository.
- The repository is private and you've used the wrong token type. Use the
  fine-grained PAT scoped to that specific repo.

## "Add a tree" submits but rows appear without Ref or Google Maps link

The ARRAYFORMULA cell at the top of the `Ref` or `Google Maps link`
column has been overwritten. Those single cells (row 2 of each column)
populate the whole column — if one of them is gone, no row gets a value.

To fix it, open the [template spreadsheet](https://docs.google.com/spreadsheets/d/1PVzp_l5RKAYZDWJrBaZ0418P7LMPQKsEIBxTov6Znd0/edit),
click cell A2 of the `Ref` column or the equivalent in `Google Maps
link`, copy the formula from the formula bar, and paste it back into
the same cell in your own sheet. See
[docs/05 → Don't touch these](05-database-fields.md#dont-touch-these)
for the longer version.

## The install banner doesn't appear / app won't install

PWA installation requires HTTPS. The default `*.github.io` URL is HTTPS by
default. If you've set up a custom domain (see
[step 8](08-custom-domain.md)), make sure **Enforce HTTPS** is ticked in
GitHub Pages settings.

On iOS Safari, install is via the *Share → Add to Home Screen* button, not
the bottom-of-page banner.

## The colour palette looks odd / too similar

Tree marker colours are assigned automatically based on genus. With a small
number of genera (say 3–4), colours are far apart and obvious. With many
genera (50+), neighbouring colours start to look similar — that's a feature
of having a finite colour wheel.

If you absolutely need manual colour control, you'll need to modify the
`buildColourMap` function in `index.html`. The current implementation lives
near the top of the script (search for `// ── COLOUR MAP ──`).

## Need more help?

Open an issue on the upstream park-treemap repository on GitHub.

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

Your map probably has
[trusted contributors](12-trusted-contributors.md) switched on. The
button is hidden until you've enrolled this specific device by visiting
the magic link your map admin gave you. Each device needs to be
enrolled separately — your phone, your laptop, etc.

If you're the admin and you've forgotten the link, look up the
`CONTRIBUTOR_TOKEN` value in your Apps Script's Script Properties.

## I don't see the "+📷 Add photo" slot in tree popups

Same reason as above — the slot is only shown to enrolled contributors
when your map uses trusted-contributor mode. Visit your enrolment link
once on this device.

If the tree already has 4 photos (the maximum), the slot is hidden
even for enrolled contributors — remove one in the spreadsheet's
`Photos` column to make room.

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

Your template's formula has been overwritten somewhere.

1. Find the topmost row that *does* still have a Ref.
2. Click that row's `Ref` cell, copy it.
3. Paste it into the affected rows below.
4. Same for `Google Maps link`.

If even row 2 is broken: open the template spreadsheet again, copy the
formula from row 2 of *Trees*, paste it into your sheet.

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

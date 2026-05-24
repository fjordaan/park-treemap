# 4. Configure the app

This is where you tell the web page about your park, your spreadsheet, and
your Apps Script. **You only need to edit one file: `config.js`.**

Everything in this step happens in the GitHub web UI — no downloads, no
terminal.

## 4.1 Open `config.js` for editing

1. In your forked repository on GitHub, click **`config.js`** in the file list.
2. Click the **pencil icon** (top right of the file viewer) to edit.

You'll see a short file that looks like this:

```js
// — Your park —
const PARK_NAME        = 'My Park';
const PARK_DESCRIPTION = 'A short sentence about your park and your group.';
const CONTACT_EMAIL    = 'friends@example.org';

// — Your Google Sheet —
const SHEET_ID         = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME       = 'Trees';

// — Your Apps Script Web App —
const APPS_SCRIPT_URL  = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

// — Your GitHub repository —
const GITHUB_REPO      = 'owner/repo';
const GITHUB_BRANCH    = 'main';

// — Fallback map view —
const MAP_CENTER       = [51.5074, -0.1278];
const MAP_ZOOM         = 17;
```

## 4.2 Fill in your values

Replace the placeholder text to the right of each `=` sign. **Keep the
quotes (`'…'`) exactly where they are** — they tell the computer that the
value is text.

| Field                | What to put                                                 |
|----------------------|-------------------------------------------------------------|
| `PARK_NAME`          | Just the park's name, e.g. `'Lillie Park'`. The app adds *"tree map"* itself where it needs the full title. |
| `PARK_DESCRIPTION`   | One sentence about your park and group — shown in the Info panel that anyone can open from the top of the map. |
| `CONTACT_EMAIL`      | Where feedback emails should go.                            |
| `SHEET_ID`           | The long ID from step 1.3.                                  |
| `SHEET_NAME`         | Leave as `'Trees'` unless you renamed the worksheet.        |
| `APPS_SCRIPT_URL`    | The `/exec` URL from step 3.4.                              |
| `GITHUB_REPO`        | `'your-username/my-park-trees'` from step 2.4.              |
| `GITHUB_BRANCH`      | Almost always leave as `'main'`.                            |
| `MAP_CENTER`         | Only matters before you add your first tree. See below.     |
| `MAP_ZOOM`           | 17 is a sensible default for a park.                        |

> 💡 **Tip about `CONTACT_EMAIL`:** this address is shown in the map
> and so will be visible to anyone — including spam bots that scrape
> for email addresses. It's worth using a group or forwarding address
> (e.g. `treemap@your-friends-group.org`) rather than someone's
> personal email.

### About `MAP_CENTER`

`MAP_CENTER` is **only used when the spreadsheet has no trees yet**. As soon
as you've added one tree, the map auto-fits to your data and `MAP_CENTER`
is ignored.

If you don't know your park's coordinates, you can leave the default for
now, add your first tree using the *"Current location"* button (or by
clicking on a satellite view of your park), then come back and update
`MAP_CENTER` later if you want a specific framing.

If you do want to set it now: open <https://www.openstreetmap.org>, find
your park, right-click in the centre and choose *Centre map here*. The URL
bar will then show `…?mlat=51.4807&mlon=-0.2158…` — those are your latitude
and longitude. Use them as `[51.4807, -0.2158]`.

## 4.3 Save your changes

Scroll to the bottom of the file editor:

- **Commit message**: e.g. *"Configure for My Park"*.
- Leave **"Commit directly to the `main` branch"** selected.
- Click **Commit changes**.

GitHub Pages will rebuild your site within about 30 seconds.

## 4.4 Update `manifest.json` (optional)

`manifest.json` controls how the app appears when someone installs it on
their phone. Open it in GitHub, click the pencil, and update:

- `"name"` and `"short_name"` — your park name.
- `"description"` — one sentence about the map.
- `"background_color"` and `"theme_color"` — colours shown on the install
  splash screen. Pick whatever fits your park's branding, or leave the
  defaults.

> ⚠️ Leave `"start_url"` and `"scope"` set to `"./"`.

## 4.5 Replace the icons (optional)

The `icons/` folder ships with a generic tree silhouette so the map works
straight away. Most adopters will want to replace it with something that
reflects their park — for example a logo, or a photo of a notable tree.

To swap them out:

1. Make a square PNG at **512×512** (this is the source image).
2. Use a free tool like [favicon.io](https://favicon.io/) to resize it into
   the four files listed below.
3. In GitHub, navigate to `icons/`, click **Add file → Upload files**, and
   drop in the new files, replacing the existing ones.

The four files:

| Filename                | Size     | Used for                         |
|-------------------------|----------|----------------------------------|
| `icon-512.png`          | 512×512  | PWA install on Android (large)   |
| `icon-192.png`          | 192×192  | PWA install on Android (small)   |
| `apple-touch-icon.png`  | 180×180  | "Add to Home Screen" on iOS      |
| `favicon-32.png`        | 32×32    | Browser tab                      |

## 4.6 Visit your map

Open your live URL (`https://your-username.github.io/my-park-trees/`).
You should see your park's name in the welcome panel.

## Next

→ [Step 5: Add your first tree](07-add-trees.md)

When future improvements are released, you can pull them into your fork in
one click — see [Keeping your map up to date](11-keeping-up-to-date.md).

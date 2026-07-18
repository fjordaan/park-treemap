# Keeping your map up to date

When improvements are released to the original park-treemap project — bug
fixes, new features — you can pull them into your fork in **one click**,
without losing any of your own settings.

## How updates work

Your fork is a copy of the original project. The two are independent: when
the original gets an update, your fork doesn't change automatically. GitHub
gives every fork a *"Sync fork"* button that pulls the latest improvements
in for you.

Because all of your settings live in **`config.js`**, and that file isn't
changed by the original project, your settings are safe.

## How to sync

1. Open your forked repository on GitHub.
2. Just below the top bar, you'll see a notice like:
   *"This branch is N commits behind park-treemap:main."*
3. Click the **"Sync fork"** button next to it.
4. In the small panel that appears, click **"Update branch"**.

GitHub will copy the latest improvements into your repository. GitHub Pages
will rebuild your live site within about 30 seconds, and the update is
live.

**You don't need to re-publish the spreadsheet or change anything else.**
Most updates also leave the Apps Script untouched. When one does change it,
the description in the Sync Fork panel will mention it — follow the steps
in [Updating the Apps Script](#updating-the-apps-script) below.

## Updating the Apps Script

When a sync includes a change to `apps-script.gs`, you need to paste the
new code into your Apps Script project and redeploy. Your Script Properties
(passwords, tokens) are untouched — you don't need to re-enter them.

1. Open your forked repo on GitHub and go to `apps-script.gs`. Click
   **Raw** (top-right of the file viewer), then *Select All → Copy*.
2. Go to [script.google.com](https://script.google.com) and open your
   project.
3. Select all the existing code in the editor, delete it, paste the new
   code, and save (Ctrl+S / Cmd+S).
4. Click **Deploy → Manage deployments**.
5. Click the **✏️** (pencil) icon next to your existing deployment.
6. Set **Version** to **New version**. You'll also see a description field
   — enter something like *v2*, *v3*, etc. (or anything you like; it's
   just a label for your own reference).
7. Click **Deploy**.

The Web app URL stays the same — no need to update `config.js`.

## How often should I check?

Whenever you remember. There's no harm in being behind by a few months — the
app keeps working. You might check in:

- When you hear about a new feature you'd like.
- Once or twice a year, just to stay current.
- If you notice a bug — it might already be fixed upstream.

## What if Sync Fork says there's a conflict?

This means you've edited a file that has also been changed upstream. In the
day-to-day case this **shouldn't happen** — your edits live in `config.js`
(plus `manifest.json` and `icons/`), and the original project doesn't
usually change those.

If you do get a conflict:

1. Read the message — GitHub will tell you which file is in conflict.
2. If it's a file you don't remember editing, the safest option is to use
   GitHub's **"Discard X commits"** option to throw away your fork's
   changes and accept upstream.
3. If you did edit it on purpose, you'll need to resolve the conflict
   manually. Open an issue on the upstream project and someone can help
   you through it.

## What's changed?

You can see what's new in any update by looking at the **commits** view on
the original project. GitHub also shows a summary of changes in the Sync
Fork panel before you confirm.

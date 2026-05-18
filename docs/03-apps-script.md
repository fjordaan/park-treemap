# 3. Create the Apps Script

Apps Script is a tiny program that lives next to your Google Sheet. It does
three things:

1. Adds a new row when someone clicks *"Add a tree"* on the map.
2. Adds a new row to a *Feedback* sheet when someone sends feedback.
3. Uploads photos to your GitHub repository so they appear in the map popups.

This is the most fiddly step. Take it slowly, and you only do it once.

## 3.1 Create a fine-grained GitHub Personal Access Token

The Apps Script needs permission to write photo files into your GitHub repo.
We give it permission via a *fine-grained* Personal Access Token (PAT) that
can **only** touch the one repository — much safer than a classic token.

1. Go to <https://github.com/settings/personal-access-tokens/new>.
2. **Token name**: e.g. *park-treemap photo upload*.
3. **Expiration**: 1 year is reasonable. Set a calendar reminder for the
   day before it expires (see [Troubleshooting](10-troubleshooting.md) for
   what happens if you forget).
4. **Resource owner**: choose your account (the one that owns the fork).
5. **Repository access**: *Only select repositories* → pick your forked repo.
6. **Permissions** → *Repository permissions*:
   - **Contents**: **Read and write**
   - (Everything else: leave as "No access".)
7. Click **Generate token**, then copy the long string starting with
   `github_pat_…`. **You won't be able to see it again** — copy it somewhere
   safe while you complete this step.

## 3.2 Create the Apps Script project

1. Go to <https://script.google.com> and click **New project**.
2. Replace the placeholder `myFunction` code with the entire contents of
   [`apps-script.gs`](../apps-script.gs) from your forked repo.
3. Rename the project (top-left, *"Untitled project"*) to e.g.
   *"Park Tree Map backend"*.
4. Save (Ctrl+S / Cmd+S).

## 3.3 Set the Script Properties

The script reads three secrets from *Script Properties* — never paste them
into the script body itself, where they'd be readable by anyone who can
view the project.

1. Click the **gear icon** (Project Settings) in the left sidebar.
2. Scroll to **Script Properties** and click **Edit script properties**.
3. Add three properties:

   | Property      | Value                                                |
   |---------------|------------------------------------------------------|
   | `SHEET_ID`    | The Sheet ID you copied in step 1.3.                 |
   | `GITHUB_REPO` | `your-username/my-park-trees` (the owner/repo pair). |
   | `GITHUB_TOKEN`| The `github_pat_…` token from step 3.1.              |

4. **Save script properties**.

## 3.4 Deploy as a Web App

1. Click **Deploy → New deployment** (top right).
2. Click the **gear icon** next to *Select type* and choose **Web app**.
3. Fill in:
   - **Description**: e.g. *v1*.
   - **Execute as**: *Me* (your account).
   - **Who has access**: *Anyone*.
4. Click **Deploy**.
5. The first time, Google will ask you to authorise the script. Click
   **Authorize access**, choose your account, and click *Advanced → Go to
   (project name) (unsafe)* (this warning is normal for your own scripts) →
   **Allow**.
6. After deployment, copy the **Web app URL** that ends in `/exec`. You'll
   paste this into `config.js` in step 4.

## 3.5 Sanity check

Open the **Web app URL** in a browser tab. You should see:

```json
{"status":"ok","message":"Park Tree Map Apps Script is running."}
```

If you see an HTML error page instead, double-check that *Who has access* is
set to *Anyone* (step 3.4).

## Next

→ [Step 4: Configure the app](04-configure-app.md)

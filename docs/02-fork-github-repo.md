# 2. Fork the GitHub repository

GitHub will host your map for free and store any photos you upload. This step
takes about 5 minutes.

## 2.1 Create a GitHub account

If you don't already have one, sign up at <https://github.com/signup>. The
free plan is fine.

## 2.2 Fork this repository

On the park-treemap repository page, click the **Fork** button (top right).
GitHub will copy the project to your own account.

You can name the fork whatever you like, e.g. `my-park-trees`. Leave the
*"Copy the main branch only"* checkbox **ticked**.

Click **Create fork**.

## 2.3 Turn on GitHub Pages

GitHub Pages is the free hosting service that serves your map.

In your forked repository, click:

```
Settings → Pages
```

Under **Build and deployment**:

- **Source**: *Deploy from a branch*
- **Branch**: `main` and `/ (root)`

Click **Save**.

Within a minute or two, the *Pages* page will show your live URL — something
like `https://your-username.github.io/my-park-trees/`. Open it. You should
see the welcome screen — the configuration isn't filled in yet, so it can't
load any data, but that's expected. We'll fix that in step 4.

## 2.4 Note your repository name

Make a note of the **owner/repo** pair, e.g. `your-username/my-park-trees`.
You'll need it twice: once in step 3 (as a Script Property), once in step 4
(in `config.js`).

## Next

→ [Step 3: Create the Apps Script](03-apps-script.md)

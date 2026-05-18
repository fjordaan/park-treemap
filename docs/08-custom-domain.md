# Use a custom domain

By default your map lives at a `github.io` URL, e.g.
`https://your-username.github.io/my-park-trees/`. You can swap this for your
own domain (e.g. `trees.myparkfriends.org`) for free.

You will need:

- **A domain name** you control (purchased through Namecheap, Gandi, GoDaddy,
  etc.).
- **Access to DNS settings** for that domain.

## 1. Tell GitHub Pages about your domain

1. In your forked repo, click **Settings → Pages**.
2. Under **Custom domain**, type your domain (e.g. `trees.myparkfriends.org`
   for a subdomain, or `myparkfriends.org` for an apex domain).
3. Click **Save**.

GitHub will create a `CNAME` file in your repository containing that
hostname. The map will start expecting to be served from that URL.

## 2. Configure DNS at your domain registrar

In your registrar's DNS panel, **for a subdomain** like
`trees.myparkfriends.org`:

| Type    | Host (or Name)      | Value                                  |
|---------|---------------------|----------------------------------------|
| `CNAME` | `trees`             | `your-username.github.io.`             |

**For an apex domain** like `myparkfriends.org` you need four `A` records
pointing at GitHub's IP addresses. Check the current list at
[GitHub's apex domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).

It usually takes 5–60 minutes for DNS to propagate. After that, GitHub Pages
will automatically provision a free HTTPS certificate (give it another few
minutes).

## 3. Force HTTPS

Back in **Settings → Pages**, tick **Enforce HTTPS**. This makes the map
work as an installable PWA on iOS Safari, which requires HTTPS.

## Troubleshooting

- **"Domain does not resolve to a valid IP address"** — DNS hasn't propagated
  yet. Wait 10–60 minutes and try again.
- **HTTPS not available** — GitHub is still issuing the certificate. Untick
  *Enforce HTTPS*, wait 10 minutes, tick it again.
- **The site loads but the map is missing** — your `config.js` still
  references the old URL somewhere, or your service worker is caching
  aggressively. Hard refresh (Cmd-Shift-R / Ctrl-F5).

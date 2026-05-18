# Park Tree Map

A simple, self-hosted map of the trees in your park, for "Friends of" groups
and other volunteer organisations to catalogue and share.

- **Data** lives in a Google Sheet you control.
- **The map** is a single web page hosted free of charge on GitHub Pages.
- **Photos** can be uploaded straight from your phone — they're stored in
  your GitHub repository.
- **No coding** required. No terminal. Five steps and you're live.

![Screenshot](docs/treemap-screenshot.png)

## What you'll need

- A **Google account** (for the spreadsheet and the Apps Script).
- A **GitHub account** (free — for the website and photo storage).
- About **30 minutes** for the first-time setup.

## Five steps to your own map

Each step has its own page with screenshots and exact clicks. Follow them in
order:

1. **[Set up your Google Sheet](docs/01-setup-google-sheet.md)** — make a
   copy of the template, publish it, and copy the Sheet ID.
2. **[Fork the GitHub repository](docs/02-fork-github-repo.md)** — fork this
   project and turn on GitHub Pages.
3. **[Create the Apps Script](docs/03-apps-script.md)** — paste a small
   script, set three secrets, and copy the deployment URL.
4. **[Configure the app](docs/04-configure-app.md)** — edit `config.js`
   with your park name, Sheet ID, and Apps Script URL.
5. **[Add your first tree](docs/07-add-trees.md)** — open your live map and
   tap the *Add a tree* button.

That's it. Your map is live.

## Reference

- **[Database fields](docs/05-database-fields.md)** — what each column in the
  spreadsheet means.
- **[Tag suggestions](docs/06-tag-suggestions.md)** — useful values to copy
  into your sheet.
- **[Adding & managing trees](docs/07-add-trees.md)** — how to use the in-app
  Add Tree flow, photo upload tips.
- **[Custom domain](docs/08-custom-domain.md)** — point your own domain at the
  map instead of using a `github.io` URL.
- **[Improve the base map](docs/09-improve-basemap.md)** — edit OpenStreetMap
  so paths and amenities in your park are mapped properly.
- **[Troubleshooting](docs/10-troubleshooting.md)** — common problems and
  fixes.
- **[Keeping your map up to date](docs/11-keeping-up-to-date.md)** — pull in
  improvements from the original project in one click.

## Credits

park-treemap is forked from the Fulham Cemetery tree map and stripped down to
the essential, park-agnostic features. It uses
[Leaflet](https://leafletjs.com/) for the map,
[Tagify](https://yaireo.github.io/tagify/) for the tag inputs, and
[OpenStreetMap](https://www.openstreetmap.org/) for the base map tiles.

Released under the [MIT License](LICENSE).

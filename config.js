// ─────────────────────────────────────────────────────────────────────────────
//  Park Tree Map — configuration
//
//  This is the ONLY file you need to edit when setting up your map.
//  Replace the placeholder values below with the ones for your park.
//
//  See docs/04-configure-app.md for step-by-step instructions.
// ─────────────────────────────────────────────────────────────────────────────

// — Your park —
// PARK_NAME is just the park's name (e.g. 'Lillie Park'). The app appends
// " tree map" where it needs the full title.
const PARK_NAME        = 'Bayonne Park';
const PARK_DESCRIPTION = 'Also known as Bayonne Road Open Space, it lies between the Bayonne Road estate and Greyhound Road. Created during the 1980s after a resident-led campaign.';
// Optional. Leave as '' to hide the email contact from the Info panel
// and the feedback "Send email instead" link.
const CONTACT_EMAIL    = 'info@twynholmtra.co.uk';

// Optional. Your park or Friends-group website. Shown as a link in the
// Info panel. Leave as '' to hide.
const WEBSITE_URL      = 'https://www.twynholmtra.co.uk/';

// — Your Google Sheet —
// The long ID between /d/ and /edit in the spreadsheet URL.
const SHEET_ID         = '1PWh7HCAGLxX_5pFyVdmlJHWvIiIYiOEF8P_BjZ9odew';
const SHEET_NAME       = 'Trees';

// — Your Apps Script Web App —
// The "/exec" URL you got after deploying the Apps Script.
const APPS_SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbx2Pz3uzNHWE3KoI8--E_sThX6IAnIWgmhg0D-c6zUJUsTX8OvSUvqkZgUcDn-CFJyByw/exec';

// — Your GitHub repository —
// "owner/repo" — used to fetch uploaded photos.
const GITHUB_REPO      = 'twynholmtra/bayonne-trees';
const GITHUB_BRANCH    = 'main';

// — Fallback map view —
// Only used until your sheet has at least one tree. Once it does, the map
// auto-fits to your trees and these values are ignored.
const MAP_CENTER       = [51.485142, -0.215255]; // [latitude, longitude]
const MAP_ZOOM         = 17;

// — Trusted contributors —
// When true (default), the "+ Add a tree" button is hidden until a visitor
// enrols their device via a magic link — the standard recommended setup,
// so random visitors can't add trees or upload photos. Set to false if you
// instead want the map fully open (anyone with the URL can add trees).
// See docs/12-trusted-contributors.md.
const ENABLE_CONTRIBUTOR_GATE = true;

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
const PARK_DESCRIPTION = 'Also known as Bayonne Road open space, it lies between the Bayonne Road estate and Greyhound Road. Created during the 1980s after a resident-led campaign.';
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
const GITHUB_REPO      = 'fulhamcemeteryfriends-dev/bayonne-trees';
const GITHUB_BRANCH    = 'main';

// — Fallback map view —
// Only used until your sheet has at least one tree. Once it does, the map
// auto-fits to your trees and these values are ignored.
const MAP_CENTER       = [51.5074, -0.1278]; // [latitude, longitude]
const MAP_ZOOM         = 17;

// — Trusted contributors —
// When false (default), anyone with the map URL can use "+ Add a tree".
// When true, the button is hidden until the visitor enrols their device
// via a magic link. See docs/12-trusted-contributors.md for setup.
const ENABLE_CONTRIBUTOR_GATE = false;

// ─────────────────────────────────────────────────────────────────────────────
//  Park Tree Map — configuration
//
//  This is the ONLY file you need to edit when setting up your map.
//  Replace the placeholder values below with the ones for your park.
//
//  See docs/04-configure-app.md for step-by-step instructions.
// ─────────────────────────────────────────────────────────────────────────────

// — Your park —
const PARK_NAME        = 'Park Tree Map';
const PARK_SHORT_NAME  = 'Park Trees';
const PARK_DESCRIPTION = 'A map of the trees in our park.';
const CONTACT_EMAIL    = 'friends@example.org';

// — Your Google Sheet —
// The long ID between /d/ and /edit in the spreadsheet URL.
const SHEET_ID         = 'PASTE_YOUR_SHEET_ID_HERE';
const SHEET_NAME       = 'Trees';

// — Your Apps Script Web App —
// The "/exec" URL you got after deploying the Apps Script.
const APPS_SCRIPT_URL  = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

// — Your GitHub repository —
// "owner/repo" — used to fetch uploaded photos.
const GITHUB_REPO      = 'owner/repo';
const GITHUB_BRANCH    = 'main';

// — Fallback map view —
// Only used until your sheet has at least one tree. Once it does, the map
// auto-fits to your trees and these values are ignored.
const MAP_CENTER       = [51.5074, -0.1278]; // [latitude, longitude]
const MAP_ZOOM         = 17;

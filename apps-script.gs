/**
 * Park Tree Map — combined Apps Script Web App
 *
 * Handles three browser actions via a single Web App URL:
 *   1. action: 'feedback'    → appends a row to the Feedback sheet
 *   2. action: 'addTree'     → appends a row to the Trees sheet and sorts by Scientific name
 *   3. action: 'uploadPhoto' → writes a base64-encoded image into the GitHub repo
 *
 * SETUP
 * -----
 * 1. In script.google.com create a new project and paste this entire file.
 * 2. Project Settings → Script Properties — add the following keys:
 *      SHEET_ID       (the long ID of your Google Sheet)
 *      GITHUB_TOKEN   (a fine-grained Personal Access Token with
 *                      "Contents: Read and write" permission on the repo)
 *      GITHUB_REPO    (e.g. "your-org/your-repo")
 * 3. Deploy → New deployment → type "Web app":
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the deployment URL and paste it into APPS_SCRIPT_URL in index.html.
 *
 * NOTE: The browser fetches this script with mode:'no-cors', so it cannot read
 *       the response. Errors are logged here (View → Logs) but invisible to
 *       end users. If photo uploads stop working, check the script logs and
 *       PAT expiry first.
 */

const TREES_SHEET    = 'Trees';
const FEEDBACK_SHEET = 'Feedback';
const GITHUB_BRANCH  = 'main';
const PHOTOS_DIR     = 'photos';

function sheetId()      { return PropertiesService.getScriptProperties().getProperty('SHEET_ID'); }
function githubToken()  { return PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN'); }
function githubRepo()   { return PropertiesService.getScriptProperties().getProperty('GITHUB_REPO'); }

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Trusted-contributor check. Returns a response to return early, or null
// when the request is allowed to proceed.
//   • If the CONTRIBUTOR_TOKEN Script Property is unset → all submissions
//     are accepted (back-compat / open mode).
//   • If it is set → the request's `token` field must match exactly.
function requireContributorToken(data) {
  const expected = PropertiesService.getScriptProperties()
    .getProperty('CONTRIBUTOR_TOKEN');
  if (!expected) return null;
  if (!data.token || data.token !== expected) {
    return jsonResponse({ status: 'error', message: 'Not authorised' });
  }
  return null;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    switch (data.action) {
      case 'feedback':      return handleFeedback(data);
      case 'addTree':       return requireContributorToken(data) || handleAddTree(data);
      case 'uploadPhoto':   return requireContributorToken(data) || handleUploadPhoto(data);
      case 'appendPhotos':  return requireContributorToken(data) || handleAppendPhotos(data);
      default:              return jsonResponse({ status: 'error', message: 'Unknown action: ' + data.action });
    }
  } catch (err) {
    Logger.log('doPost error: ' + err);
    return jsonResponse({ status: 'error', message: String(err && err.message || err) });
  }
}

// Optional: visiting the Web App URL in a browser returns a simple OK so
// adopters can sanity-check that the deployment is reachable.
function doGet() {
  return jsonResponse({ status: 'ok', message: 'Park Tree Map Apps Script is running.' });
}

// ── Feedback ──────────────────────────────────────────────────────────────────
function handleFeedback(data) {
  const ss = SpreadsheetApp.openById(sheetId());
  let sheet = ss.getSheetByName(FEEDBACK_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(FEEDBACK_SHEET);
    sheet.appendRow(['Timestamp', 'Ref', 'Tree', 'Comment']);
  }
  sheet.appendRow([new Date(), data.ref || '', data.tree || '', data.comment || '']);
  return jsonResponse({ status: 'ok' });
}

// ── Add tree ──────────────────────────────────────────────────────────────────
function handleAddTree(data) {
  const ss    = SpreadsheetApp.openById(sheetId());
  const sheet = ss.getSheetByName(TREES_SHEET);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const col = name => headers.indexOf(name); // 0-based; -1 if missing

  // Map JSON payload keys to spreadsheet column names. Any column the sheet has
  // but the browser didn't fill is left blank; the Ref and Google Maps link
  // columns are typically populated by sheet formulas, so do not write them.
  const row = new Array(headers.length).fill('');
  const set = (colName, value) => {
    const i = col(colName);
    if (i >= 0) row[i] = value || '';
  };

  set('Latitude',          data.lat);
  set('Longitude',         data.lng);
  set('Scientific name',   data.sci);
  set('Common name',       data.common);
  set('Tags',              data.tags);
  set('Notes',             data.notes);
  set('Year planted',      data.year_planted);
  set('Est. year planted', data.est_year_planted);
  set('Form',              data.form_field);
  set('Condition',         data.condition);
  set('Photos',            data.photos);

  sheet.appendRow(row);

  // Sort the data range by Scientific name (ascending) so the sheet stays
  // tidy even after the formula columns fill in.
  const sciCol = col('Scientific name');
  if (sciCol >= 0 && sheet.getLastRow() > 2) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
         .sort({ column: sciCol + 1, ascending: true });
  }
  return jsonResponse({ status: 'ok' });
}

// ── Upload photo ──────────────────────────────────────────────────────────────
function handleUploadPhoto(data) {
  if (!data.filename || !data.base64) {
    return jsonResponse({ status: 'error', message: 'Missing filename or base64' });
  }
  // Reject anything that tries to escape the photos/ directory.
  if (/[\\/]/.test(data.filename) || data.filename.indexOf('..') !== -1) {
    return jsonResponse({ status: 'error', message: 'Invalid filename' });
  }
  const path  = PHOTOS_DIR + '/' + data.filename;
  const repo  = githubRepo();
  const token = githubToken();
  if (!repo || !token) {
    return jsonResponse({ status: 'error', message: 'GITHUB_REPO and/or GITHUB_TOKEN script properties not set' });
  }
  const url  = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  const body = {
    message: 'Add photo ' + data.filename + ' via park-treemap',
    content: data.base64,
    branch:  GITHUB_BRANCH
  };
  const resp = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept:        'application/vnd.github+json'
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });
  const code = resp.getResponseCode();
  if (code < 200 || code >= 300) {
    Logger.log('GitHub upload failed (' + code + '): ' + resp.getContentText());
    return jsonResponse({ status: 'error', code: code, message: resp.getContentText() });
  }
  return jsonResponse({ status: 'ok', path: path });
}

// ── Append photos to an existing tree ─────────────────────────────────────────
// Used when a contributor adds a photo to a tree from inside its popup.
// Identifies the row by Ref and appends the new paths to the Photos cell.
// Wrapped in a script lock so two simultaneous appends to the same tree
// can't lose data.
function handleAppendPhotos(data) {
  if (!data.ref || !Array.isArray(data.paths) || data.paths.length === 0) {
    return jsonResponse({ status: 'error', message: 'Missing ref or paths' });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss      = SpreadsheetApp.openById(sheetId());
    const sheet   = ss.getSheetByName(TREES_SHEET);
    if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const refCol    = headers.indexOf('Ref') + 1;
    const photosCol = headers.indexOf('Photos') + 1;
    if (!refCol || !photosCol) {
      return jsonResponse({ status: 'error', message: 'Ref or Photos column not found' });
    }
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonResponse({ status: 'error', message: 'Tree not found' });
    const refs = sheet.getRange(2, refCol, lastRow - 1, 1).getValues();
    let rowIdx = -1;
    for (let i = 0; i < refs.length; i++) {
      if (String(refs[i][0]) === String(data.ref)) { rowIdx = i; break; }
    }
    if (rowIdx < 0) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });
    const rowNum  = rowIdx + 2;
    const cell    = sheet.getRange(rowNum, photosCol);
    const current = String(cell.getValue() || '').trim();
    const existing = current ? current.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (existing.length + data.paths.length > 4) {
      return jsonResponse({ status: 'error', message: 'Photo cap of 4 would be exceeded' });
    }
    const next = existing.concat(data.paths).join(', ');
    cell.setValue(next);
    return jsonResponse({ status: 'ok', photos: next });
  } finally {
    lock.releaseLock();
  }
}

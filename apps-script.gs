/**
 * Park Tree Map — combined Apps Script Web App
 *
 * Handles these browser actions via a single Web App URL:
 *   1. action: 'feedback'      → appends a row to the Feedback sheet
 *   2. action: 'addTree'       → appends a row to the Trees sheet and sorts by Scientific name
 *   3. action: 'uploadPhoto'   → writes a base64-encoded image into the GitHub repo
 *   4. action: 'appendPhotos'  → adds photo paths to an existing tree's Photos cell
 *   5. action: 'deletePhoto'   → removes a photo from GitHub and strips it from the Photos cell
 *   6. action: 'editTree'        → updates editable fields of an existing tree row
 *   7. action: 'deleteTree'      → deletes a tree's repo photos and removes its spreadsheet row
 *   8. action: 'repositionTree'  → updates the Latitude and Longitude of an existing tree
 *
 * Every action above except 'uploadPhoto' and 'validateToken' also appends a
 * row to the History sheet (created on first use) — see appendHistory().
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
 * NOTE: The browser reads this script's JSON response directly (a plain
 *       fetch works fine against the deployed web app — no CORS issues), so
 *       every error returned here (e.g. jsonResponse({status:'error', ...}))
 *       is shown to the user, not just logged. Errors are still visible here
 *       too (View → Executions) if you need the full stack. If photo uploads
 *       stop working, check the script logs and PAT expiry first.
 */

const TREES_SHEET    = 'Trees';
const FEEDBACK_SHEET = 'Feedback';
const HISTORY_SHEET  = 'History';
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
      case 'validateToken': return requireContributorToken(data) || jsonResponse({ status: 'ok' });
      case 'addTree':       return requireContributorToken(data) || handleAddTree(data);
      case 'uploadPhoto':   return requireContributorToken(data) || handleUploadPhoto(data);
      case 'appendPhotos':  return requireContributorToken(data) || handleAppendPhotos(data);
      case 'deletePhoto':   return requireContributorToken(data) || handleDeletePhoto(data);
      case 'editTree':          return requireContributorToken(data) || handleEditTree(data);
      case 'deleteTree':        return requireContributorToken(data) || handleDeleteTree(data);
      case 'repositionTree':    return requireContributorToken(data) || handleRepositionTree(data);
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

// ── History log ───────────────────────────────────────────────────────────────
// A static, append-only log read by the map's History panel. Nothing reads
// git or re-derives past state — every mutation below writes its own row at
// the moment it happens. `count` is only meaningful for 'appendPhotos' (more
// than one photo can be added in a single call); leave it undefined elsewhere.
function appendHistory(action, ref, treeLabel, count) {
  const ss = SpreadsheetApp.openById(sheetId());
  let sheet = ss.getSheetByName(HISTORY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(HISTORY_SHEET);
    sheet.appendRow(['Timestamp', 'Action', 'Ref', 'Tree', 'Count']);
  }
  sheet.appendRow([new Date(), action, ref || '', treeLabel || '', count || '']);
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

  // Sort the data range by Scientific name (ascending), with Common name
  // as a tiebreaker so trees missing a Scientific name still order
  // sensibly. Row 2 is reserved for the ARRAYFORMULA cells (Ref + Google
  // Maps link) — moving that row would shift the array's relative
  // reference and break the projection — so it's explicitly excluded
  // from the sort range.
  const sciCol = col('Scientific name');
  const comCol = col('Common name');
  if (sciCol >= 0 && sheet.getLastRow() > 3) {
    const sortSpec = [{ column: sciCol + 1, ascending: true }];
    if (comCol >= 0) sortSpec.push({ column: comCol + 1, ascending: true });
    sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
         .sort(sortSpec);
  }

  // Ref is an ARRAYFORMULA column, so the new row's Ref doesn't exist as a
  // value until Sheets recalculates. Flush, then locate the new row by its
  // own Lat/Lng (stable regardless of where the sort above moved it) to
  // read the Ref the History entry should link to.
  SpreadsheetApp.flush();
  const newRow = findTreeRowByLatLng(sheet, data.lat, data.lng);
  const newRef = newRow ? sheet.getRange(newRow.rowNum, newRow.refCol).getValue() : '';
  appendHistory('addTree', newRef, data.tree);

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

// ── Locate a tree row by Ref ──────────────────────────────────────────────────
// Returns { rowNum, photosCol } if the tree is found, or null otherwise.
// Shared by handleAppendPhotos and handleDeletePhoto.
function findTreeRow(sheet, ref) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const refCol    = headers.indexOf('Ref') + 1;
  const photosCol = headers.indexOf('Photos') + 1;
  if (!refCol || !photosCol) return { error: 'Ref or Photos column not found' };
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const refs = sheet.getRange(2, refCol, lastRow - 1, 1).getValues();
  for (let i = 0; i < refs.length; i++) {
    if (String(refs[i][0]) === String(ref)) {
      return { rowNum: i + 2, photosCol: photosCol };
    }
  }
  return null;
}

// ── Locate a tree row by Latitude/Longitude ───────────────────────────────────
// Used only right after handleAddTree appends a row, to read back the Ref
// an ARRAYFORMULA has just computed for it (see handleAddTree). Matching on
// coordinates rather than re-implementing the Ref formula's own math here
// keeps this decoupled from whatever formula a given adopter's template uses.
function findTreeRowByLatLng(sheet, lat, lng) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const latCol = headers.indexOf('Latitude') + 1;
  const lngCol = headers.indexOf('Longitude') + 1;
  const refCol = headers.indexOf('Ref') + 1;
  if (!latCol || !lngCol || !refCol) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return null;
  const vals = sheet.getRange(3, 1, lastRow - 2, sheet.getLastColumn()).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (parseFloat(vals[i][latCol - 1]) === parseFloat(lat) &&
        parseFloat(vals[i][lngCol - 1]) === parseFloat(lng)) {
      return { rowNum: i + 3, refCol: refCol };
    }
  }
  return null;
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
    const sheet = SpreadsheetApp.openById(sheetId()).getSheetByName(TREES_SHEET);
    if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
    const row = findTreeRow(sheet, data.ref);
    if (row && row.error) return jsonResponse({ status: 'error', message: row.error });
    if (!row) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });
    const cell    = sheet.getRange(row.rowNum, row.photosCol);
    const current = String(cell.getValue() || '').trim();
    const existing = current ? current.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (existing.length + data.paths.length > 4) {
      return jsonResponse({ status: 'error', message: 'Photo cap of 4 would be exceeded' });
    }
    const next = existing.concat(data.paths).join(', ');
    cell.setValue(next);
    appendHistory('appendPhotos', data.ref, data.tree, data.paths.length);
    return jsonResponse({ status: 'ok', photos: next });
  } finally {
    lock.releaseLock();
  }
}

// ── Is a photo path referenced by any other tree? ─────────────────────────────
// Adopters sometimes reuse the same uploaded photo on more than one tree by
// copying its path into another row's Photos cell. Deleting the file from
// GitHub in that case would silently break it everywhere else it's used, so
// callers check this first and only delete from GitHub when nothing else
// references the path.
function photoPathUsedElsewhere(sheet, path, excludeRowNum) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const photosCol = headers.indexOf('Photos') + 1;
  if (!photosCol) return false;
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return false;
  const vals = sheet.getRange(3, photosCol, lastRow - 2, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    const rowNum = i + 3;
    if (rowNum === excludeRowNum) continue;
    const paths = String(vals[i][0] || '').split(',').map(s => s.trim());
    if (paths.indexOf(path) !== -1) return true;
  }
  return false;
}

// ── Delete a photo from an existing tree ──────────────────────────────────────
// Strips the path from the tree's Photos cell, and also deletes the file from
// the GitHub repo via the Contents API — but only if no other tree's Photos
// cell still references that same path (see photoPathUsedElsewhere above).
// Wrapped in a script lock so it can't race with handleAppendPhotos on the
// same row.
function handleDeletePhoto(data) {
  if (!data.ref || !data.path) {
    return jsonResponse({ status: 'error', message: 'Missing ref or path' });
  }
  // Reject anything that tries to escape the photos/ directory.
  if (data.path.indexOf('..') !== -1 || data.path.indexOf(PHOTOS_DIR + '/') !== 0) {
    return jsonResponse({ status: 'error', message: 'Invalid path' });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.openById(sheetId()).getSheetByName(TREES_SHEET);
    if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
    const row = findTreeRow(sheet, data.ref);
    if (row && row.error) return jsonResponse({ status: 'error', message: row.error });
    if (!row) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });

    // 1) Delete the file from GitHub — unless another tree still uses it.
    if (!photoPathUsedElsewhere(sheet, data.path, row.rowNum)) {
      const repo  = githubRepo();
      const token = githubToken();
      if (!repo || !token) {
        return jsonResponse({ status: 'error', message: 'GITHUB_REPO and/or GITHUB_TOKEN script properties not set' });
      }
      const apiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + data.path;
      const headers = {
        Authorization: 'Bearer ' + token,
        Accept:        'application/vnd.github+json'
      };
      const getResp = UrlFetchApp.fetch(apiUrl, {
        method: 'get',
        headers: headers,
        muteHttpExceptions: true
      });
      const getCode = getResp.getResponseCode();
      if (getCode === 404) {
        // File already gone in the repo — fall through and still tidy the sheet.
        Logger.log('Photo not in repo (already deleted?): ' + data.path);
      } else if (getCode < 200 || getCode >= 300) {
        Logger.log('GitHub GET failed (' + getCode + '): ' + getResp.getContentText());
        return jsonResponse({ status: 'error', code: getCode, message: getResp.getContentText() });
      } else {
        const sha = JSON.parse(getResp.getContentText()).sha;
        const delResp = UrlFetchApp.fetch(apiUrl, {
          method: 'delete',
          contentType: 'application/json',
          headers: headers,
          payload: JSON.stringify({
            message: 'Delete photo ' + data.path + ' via park-treemap',
            sha:     sha,
            branch:  GITHUB_BRANCH
          }),
          muteHttpExceptions: true
        });
        const delCode = delResp.getResponseCode();
        if (delCode < 200 || delCode >= 300) {
          Logger.log('GitHub DELETE failed (' + delCode + '): ' + delResp.getContentText());
          return jsonResponse({ status: 'error', code: delCode, message: delResp.getContentText() });
        }
      }
    } else {
      Logger.log('Photo still used by another tree, keeping file in repo: ' + data.path);
    }

    // 2) Strip the path from this tree's Photos cell.
    const cell    = sheet.getRange(row.rowNum, row.photosCol);
    const current = String(cell.getValue() || '').trim();
    const remaining = current
      ? current.split(',').map(s => s.trim()).filter(p => p && p !== data.path)
      : [];
    const next = remaining.join(', ');
    cell.setValue(next);
    appendHistory('deletePhoto', data.ref, data.tree);
    return jsonResponse({ status: 'ok', photos: next });
  } finally {
    lock.releaseLock();
  }
}

// ── Edit an existing tree ─────────────────────────────────────────────────────
// Updates the editable fields of a tree row identified by Ref.
// Never touches Ref, Latitude, Longitude, Photos, or the formula columns.
function handleEditTree(data) {
  if (!data.ref) {
    return jsonResponse({ status: 'error', message: 'Missing ref' });
  }
  const ss    = SpreadsheetApp.openById(sheetId());
  const sheet = ss.getSheetByName(TREES_SHEET);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = findTreeRow(sheet, data.ref);
  if (row && row.error) return jsonResponse({ status: 'error', message: row.error });
  if (!row) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });
  const set = (colName, value) => {
    const i = headers.indexOf(colName);
    if (i >= 0 && value !== undefined) sheet.getRange(row.rowNum, i + 1).setValue(value || '');
  };
  set('Scientific name',   data.sci);
  set('Common name',       data.common);
  set('Short name',        data.short_name);
  set('Other names',       data.other_names);
  set('Tags',              data.tags);
  set('Notes',             data.notes);
  set('Year planted',      data.year_planted);
  set('Est. year planted', data.est_year_planted);
  set('Year died',         data.year_died);
  set('Form',              data.form_field);
  set('Condition',         data.condition);
  appendHistory('editTree', data.ref, data.tree);
  return jsonResponse({ status: 'ok' });
}

// ── Reposition a tree (update Latitude / Longitude only) ─────────────────────
function handleRepositionTree(data) {
  if (!data.ref || data.lat === undefined || data.lng === undefined) {
    return jsonResponse({ status: 'error', message: 'Missing ref, lat, or lng' });
  }
  const lat = parseFloat(data.lat);
  const lng = parseFloat(data.lng);
  if (isNaN(lat) || isNaN(lng)) {
    return jsonResponse({ status: 'error', message: 'Invalid lat/lng' });
  }
  const ss    = SpreadsheetApp.openById(sheetId());
  const sheet = ss.getSheetByName(TREES_SHEET);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = findTreeRow(sheet, data.ref);
  if (row && row.error) return jsonResponse({ status: 'error', message: row.error });
  if (!row) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });
  const set = (colName, value) => {
    const i = headers.indexOf(colName);
    if (i >= 0) sheet.getRange(row.rowNum, i + 1).setValue(value);
  };
  set('Latitude',  lat);
  set('Longitude', lng);

  // Ref is derived from Lat/Lng (see appendHistory call below), so this
  // tree's Ref just changed. Flush, then re-read it at the same row — the
  // row itself hasn't moved, only the formula's output has.
  SpreadsheetApp.flush();
  const refCol = headers.indexOf('Ref') + 1;
  const newRef = refCol ? sheet.getRange(row.rowNum, refCol).getValue() : '';

  // Keep this tree's whole History chain pointing at wherever it currently
  // is: rewrite every existing History row that recorded the pre-move Ref
  // (data.ref) to the new one. Since this is the only code path that ever
  // changes a Ref, and each reposition advances everything currently
  // tagged with the immediately-preceding value, earlier entries (from
  // before an even earlier reposition) stay correctly linked too. This
  // doesn't self-heal if data.ref was already stale (e.g. two repositions
  // of the same tree from different unrefreshed sessions) — same
  // staleness limitation every findTreeRow-based handler already has.
  const historySheet = ss.getSheetByName(HISTORY_SHEET);
  if (historySheet && newRef) {
    const hLastRow = historySheet.getLastRow();
    if (hLastRow > 1) {
      const hHeaders = historySheet.getRange(1, 1, 1, historySheet.getLastColumn()).getValues()[0];
      const hRefCol = hHeaders.indexOf('Ref') + 1;
      if (hRefCol) {
        const hRefs = historySheet.getRange(2, hRefCol, hLastRow - 1, 1).getValues();
        for (let i = 0; i < hRefs.length; i++) {
          if (String(hRefs[i][0]) === String(data.ref)) {
            historySheet.getRange(i + 2, hRefCol).setValue(newRef);
          }
        }
      }
    }
  }

  appendHistory('repositionTree', newRef, data.tree);
  return jsonResponse({ status: 'ok' });
}

// ── Delete a tree and its repo-hosted photos ──────────────────────────────────
// Deletes each photo stored in the GitHub repo, then removes the row.
// External photo URLs (Google Photos, etc.) are left at their origin — only
// their reference in the sheet disappears along with the row.
function handleDeleteTree(data) {
  if (!data.ref) return jsonResponse({ status: 'error', message: 'Missing ref' });
  const ss    = SpreadsheetApp.openById(sheetId());
  const sheet = ss.getSheetByName(TREES_SHEET);
  if (!sheet) return jsonResponse({ status: 'error', message: 'Sheet "' + TREES_SHEET + '" not found' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const row = findTreeRow(sheet, data.ref);
    if (row && row.error) return jsonResponse({ status: 'error', message: row.error });
    if (!row) return jsonResponse({ status: 'error', message: 'Tree not found: ' + data.ref });
    // Delete each repo-hosted photo from GitHub — unless another tree's row
    // still references that same path (see photoPathUsedElsewhere above).
    const photosCell = String(sheet.getRange(row.rowNum, row.photosCol).getValue() || '').trim();
    const repoPaths  = photosCell
      .split(',').map(s => s.trim())
      .filter(p => p && p.indexOf('..') === -1 && p.indexOf(PHOTOS_DIR + '/') === 0)
      .filter(p => !photoPathUsedElsewhere(sheet, p, row.rowNum));
    const repo  = githubRepo();
    const token = githubToken();
    if (repo && token && repoPaths.length) {
      const ghHeaders = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' };
      for (const path of repoPaths) {
        const apiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + path;
        const getResp = UrlFetchApp.fetch(apiUrl, { method: 'get', headers: ghHeaders, muteHttpExceptions: true });
        if (getResp.getResponseCode() === 200) {
          const sha = JSON.parse(getResp.getContentText()).sha;
          UrlFetchApp.fetch(apiUrl, {
            method: 'delete', contentType: 'application/json', headers: ghHeaders,
            payload: JSON.stringify({ message: 'Delete photo ' + path + ' via park-treemap', sha, branch: GITHUB_BRANCH }),
            muteHttpExceptions: true
          });
        }
      }
    }
    // Delete the tree row.
    sheet.deleteRow(row.rowNum);
    appendHistory('deleteTree', data.ref, data.tree);
    return jsonResponse({ status: 'ok' });
  } finally {
    lock.releaseLock();
  }
}

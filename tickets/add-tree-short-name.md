# Ticket: Add "Short name" to the Add tree modal's More fields

## Summary

The Edit tree modal has a **Short name** field (the label shown on the map),
but the Add tree modal doesn't, so a new tree can only get a short name by
editing it afterwards. Add the field at the top of the Add tree modal's
"More fields" section, and make the Apps Script `addTree` handler write it.

This is already implemented in fc-treemap (commit `73032f5`, "Add Short name
to the Add tree modal's More fields"). It is a three-line change here.
park-treemap's Edit tree already sends `short_name` and `handleEditTree`
already writes it, so the column name and payload key match.

---

## Implementation

### 1. index.html: add the field (line 1539)

Put it first inside `#add-tree-extra-fields`, using the same markup as the
Edit tree field (line ~1580):

```html
      <div id="add-tree-extra-fields" style="display:none">
        <label>Short name
          <span class="field-hint">Label shown on the map (defaults to scientific name if blank)</span>
          <input name="short_name" type="text" placeholder="e.g. Oak">
        </label>
        <div class="add-tree-year-row">
```

The form is already reset when the modal opens, so the field starts empty
every time.

### 2. index.html: send it in the addTree payload (line ~4590)

```js
      common:           addComVal,
      short_name:       form.elements['short_name'].value.trim(),
      tags:             tagifyInstance  ? ...
```

### 3. apps-script.gs: write it in `handleAddTree` (line 160)

```js
  set('Common name',       data.common);
  set('Short name',        data.short_name);
  set('Tags',              data.tags);
```

**The Apps Script must be redeployed** (Deploy > Manage deployments > edit >
New version) for this part to take effect. Until then the field is sent but
ignored.

## Testing

1. Open Add tree. Short name is hidden until "More fields" is expanded, then
   shows at the top of that section with the hint text.
2. Add a tree with a short name. After the reload, the sheet row has it in
   the Short name column and the map label uses it.
3. Add a tree with the field left blank. The label falls back to the
   scientific name, as before.

# Trusted contributors

By default your map only accepts new trees and photo uploads from
**devices you've explicitly enrolled**. Random visitors can still
*view* the map, but they can't add anything. This is the standard
setup — it prevents spam and offensive content from appearing on the
public map.

This page explains how the system works, how to enrol volunteers'
devices, how to recover if your password leaks, and how to turn the
whole thing off if you'd rather have a fully open map.

> ⚠️ **Important to know**
> - It's a shared password, not real identity. Anyone you enrol could
>   pass the magic link on to someone else.
> - Once a photo or row is added to your map, deleting it from the
>   spreadsheet removes it from the map — but the photo file itself
>   stays in your GitHub repository's history. For genuinely
>   offensive content, the only complete cleanup is to delete the
>   whole repository. Worth thinking about before you decide whether
>   to leave the map open or to keep this default gating on.

## How it works in plain terms

1. You picked a memorable password (`CONTRIBUTOR_TOKEN`) when you set
   up the Apps Script in [step 3.3](03-apps-script.md). That password
   sits on Google's servers and never appears anywhere public.
2. When someone tries to add a tree from the map, the request only
   succeeds if it includes that exact password.
3. To give a device the password, you share a **magic link** —
   visiting it once is enough.

## Enrolling devices

To unlock the *"+ Add a tree"* button on a device, that device needs
to visit a special **magic link** once:

```
https://your-map.com/?enrol=YOUR-CONTRIBUTOR_TOKEN
```

For example, if your map is at `https://my-park-trees.example.com/`
and your password is `friends-2026-acorn`, the magic link is:

```
https://my-park-trees.example.com/?enrol=friends-2026-acorn
```

When a volunteer opens the link:

1. The map loads as normal.
2. Behind the scenes, the password is saved to that device's browser.
3. The password is stripped from the address bar (so it won't appear
   if they bookmark the page).
4. The *"+ Add a tree"* button is now visible to them.

**Each device must enrol separately** — visiting the magic link on
your phone doesn't enrol your laptop. This is intentional: only the
devices you explicitly enrolled can add trees.

> 💡 If a volunteer clears their browser data (or uses Private /
> Incognito mode), they'll need to visit the magic link again.

### Enrolling an installed app (iOS / Android home-screen)

On iOS, when you "Add to Home Screen", the installed app runs in its
own separate browsing context — with its own storage, completely
isolated from Safari's. So if you enrolled the device in Safari and
*then* added the app to your home screen, the home-screen app is
**not** enrolled. (Android Chrome has similar isolation in some
configurations.)

The fix: open the app from your home screen, tap the **ⓘ** button in
the top map header, and choose **"Enrol this device"**. Paste your
magic link (or just the contributor password) into the prompt that
appears. The *"+ Add a tree"* button will appear and stay enrolled
for that installed app from now on.

This same in-app enrolment works anywhere the magic link is awkward
— inside a PWA, in a browser without a URL bar, or just for
volunteers who'd rather paste a password than open a link.

## Sharing the magic link safely

The magic link **is your password** — anyone who has it can enrol any
device. Share it carefully:

✅ **Good** — one-to-one private channels:
- Email (to a specific person)
- WhatsApp (to a specific person or a small private group)
- Hand them the link in person

❌ **Don't** post the magic link anywhere a non-volunteer could see it:
- On your Friends group's public Facebook page
- On your group's website
- In a public newsletter
- On a shared notice board

## If the password leaks

If the magic link ends up somewhere public, rotate the password
straight away:

1. In Apps Script → Project Settings → Script Properties, change
   `CONTRIBUTOR_TOKEN` to a new value.
2. **Save script properties**.

The moment you save, the old password stops working — anyone who had
the old magic link can't add trees any more. Send the new magic link
to your volunteers and ask them to visit it once on each of their
devices.

## Turning gating off (fully open map)

If you'd rather let anyone with the map URL add trees (no enrolment
required), you can switch trusted-contributor mode off:

1. In `config.js`, change:
   ```js
   const ENABLE_CONTRIBUTOR_GATE = true;
   ```
   to:
   ```js
   const ENABLE_CONTRIBUTOR_GATE = false;
   ```
   Commit.
2. In Apps Script → Project Settings → Script Properties, delete the
   `CONTRIBUTOR_TOKEN` property (optional but tidy — without it the
   server accepts anything anyway when the gate is off).

The map is now fully open. Anyone visiting will see the *"+ Add a
tree"* button and can submit. If you change your mind, reverse both
steps and re-share the magic link with your volunteers.

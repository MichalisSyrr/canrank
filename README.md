# CanRank

Rate energy drinks (1 to 10, half steps, one updatable rating per drink) and compare with friends.
An installable web app (PWA): works on iPhone and Android from a link, offline after the first visit,
no accounts and no server. All data lives on the phone.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Put it on phones (free)

The app must be served over HTTPS for install, offline mode and the QR camera to work.
`dist/` is a plain static site with relative paths, so any static host works:

- **GitHub Pages**: push the repo, build, publish `dist/` (for example with the `gh-pages` package or a Pages workflow).
- **Cloudflare Pages / Netlify**: connect the repo, build command `npm run build`, output folder `dist`.

Then on each phone open the link and:

- iPhone (Safari): Share, then "Add to Home Screen".
- Android (Chrome): menu, then "Install app" / "Add to Home screen".

## Sharing with friends

Friends tab:

- **Share JSON file**: full export (ratings, notes, detailed scores, want-to-try, custom drinks). Send it in any chat app.
- **Show QR code**: scores and want-to-try only, for in-person exchange. Large lists cycle through several codes.
- **Import / Scan**: adds the friend, or updates them if they are already in the list (matched by a hidden profile id, so renaming is fine).
- Importing your own file restores your ratings: it doubles as a backup. iOS can clear the storage of web apps that go unused for weeks, so export now and then.

## The drink list

`src/data/catalogSource.ts` holds the catalog in a compact text format (see the header comment).
Drink ids come from the name, so if you rename a drink add the old id to `ID_ALIASES` in `src/data/catalog.ts`;
otherwise existing ratings for it are orphaned. Adding drinks is always safe.

Product photos are the brands' own can renders, linked (not copied) from their official sites and listed in
`src/data/images.json` (drink id to image URL). About 180 current drinks from Monster, Red Bull, Rockstar, Reign, NOS,
Bang, Burn, Relentless, Nocco, Alani Nu, Prime and Boost have one. Everything else, including most discontinued
drinks, shows a can drawn in the drink's colours. To add or fix a photo, add a line to that file. The images remain
the property of the brands; if a brand changes its site a link can break, and the drawn can takes over.

Later cloud sync can reuse the export format in `src/lib/share.ts` as the per-user document.

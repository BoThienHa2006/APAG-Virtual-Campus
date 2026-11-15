# Codex instructions — APAG Virtual Campus

You are working on a Vietnamese-language third-person 3D virtual campus prototype.

## Existing architecture
- Static site: `index.html`, ES module `main.js`, JSON in `data/campuses.json`.
- Three.js v0.160.1 is imported by browser import map from jsDelivr.
- No backend, accounts, multiplayer, CMS or production-auth system exists.
- Seven sites are listed in JSON using official APAG contact page as the source.
- All 3D buildings and layouts are **illustrative**, not verified exact campus reconstructions.
- 360 photos are **not included**; `panorama: null` by default.

## Preserve all previously tested features
1. Third-person avatar movement with WASD/arrows/touch.
2. Shift sprint; Space jump.
3. Drag camera rotation and wheel zoom.
4. Minimap and campus switching.
5. Simple building collision.
6. E / touch interaction with points of interest.
7. Panorama viewer and its missing-asset state.

## Coding rules
- Keep Vietnamese UI accessible for mobile and desktop.
- Avoid fabricated factual details about locations/buildings.
- Never embed credentials, tokens, personal information or unlicensed APAG imagery.
- Keep data in JSON; validate JSON and IDs; use relative URLs for GitHub Pages compatibility.
- Before every PR: run `npm test`, inspect UI on mobile and desktop when possible, document manual checks.
- Prefer small, reviewable commits. Do not replace or silently remove tested features.
- If modifying deployment, protect PR previews and never push secret tokens to public repo.
- For any claims about actual institutional sites, add official source URLs and verification notes.

## Suggested future milestones
- Campus-specific scene layouts from verified data.
- Import of user-owned/authorized 360° assets.
- Admin content editing backed by authenticated API, database and object storage.
- Multiplayer/text/voice with moderation, privacy and abuse prevention.

## Definition of done
- `npm test` succeeds.
- `npm run dev` serves without network errors (CDN requires Internet).
- Features above still work in a real browser.
- README is updated for behavior changes.
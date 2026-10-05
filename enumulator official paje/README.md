# Rwanda SafeNet Metrics — Enumerator Prototype

## Files

- `index.html` — dashboard + complete household data-collection form
- `style.css` — responsive UI
- `app.js` — application logic, localStorage, GPS, map, form validation, local records

## Run locally

Do not open `index.html` with `file://` when testing GPS.

Use VS Code Live Server, or any local web server, for example:

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

GPS generally requires a secure context (`https://`) or localhost.

## Map

The main dashboard uses Leaflet and OpenStreetMap tiles. Its blue marker follows the enumerator only after **Start live GPS** is clicked; click again to pause it. Browser GPS requires permission and works on `localhost` or HTTPS. Live tracking is held in page memory and stops when paused or the page closes; it is not saved as a location history.

The household coordinates are captured separately while the enumerator is at the household. The green household marker appears after the form is submitted. GPS coordinates locate a point; they do not provide a street address. The address field is for a landmark or locality description.

The map and location selectors read the public NISR 2022 village-boundary layer from:

`https://gh.space.gov.rw/server/rest/services/Admin_Boundaries/FeatureServer/4`

This read-only layer contains province, district, sector, cell and village names/IDs. Internet access is required for the NISR service, map tiles and CDN libraries. If the NISR service is unavailable, the dashboard reports the failure and prevents choosing an unverified demo location.

## Drafts and local data

There is one saved draft per browser/device. Use **Save draft**, then open **Continue draft** from the dashboard to resume it. The draft is removed after successful local submission. The app stores saved household records in localStorage as a prototype; localStorage is not encrypted and is not suitable for real sensitive household data.

## Data storage

Household records are stored in:

```text
localStorage["rsnm_enumerator_households_v1"]
```

Drafts are stored in:

```text
localStorage["rsnm_enumerator_draft_v1"]
```

Assignment is stored in:

```text
localStorage["rsnm_enumerator_assignment_v1"]
```

For a production-scale offline application, IndexedDB is a better browser storage technology than localStorage.

## Security warning

This is a frontend prototype, NOT an official Rwanda government system.

Do not enter real National ID numbers, real phone numbers, or other sensitive household data into a public demo.

For a real implementation:
- authentication and authorization must be enforced server-side and at the database layer;
- sensitive data must be encrypted in transit and appropriately protected at rest;
- audit logging, backup, retention, deletion and privacy controls are required;
- official API/data-access permissions must be obtained;
- eligibility rules must be approved by the responsible program;
- production deployment should not trust a browser-generated role or identity.

## Planned next stage

1. Split the prototype into a reusable frontend structure.
2. Add a real login and enumerator profile.
3. Replace localStorage with IndexedDB + sync queue.
4. Add Node.js/Express backend.
5. Add Supabase PostgreSQL + Row Level Security.
6. Add server-side validation, duplicate detection and audit logs.
7. Add supervisor/admin workflows.
8. Confirm service usage and data-access terms with the responsible government team.
9. Replace localStorage with IndexedDB + a robust offline sync queue.
10. Add secure backend synchronization and conflict handling.

## Project handoff — 2026-10-05

- The current app is a static HTML/CSS/JavaScript enumerator prototype. Run it with VS Code Live Server or `python -m http.server 5500` from this folder; GPS requires browser permission and localhost/HTTPS.
- The NISR 2022 administrative boundary layer is configured at `https://gh.space.gov.rw/server/rest/services/Admin_Boundaries/FeatureServer/4`. The location selectors read its hierarchy, and selected village boundaries are drawn on the dashboard map. `map.html` is a standalone national village-boundary view.
- Live enumerator GPS uses a blue marker and can be paused. Household coordinates are captured separately at the home, and the household is shown as a green marker after local submission.
- One explicit local draft can be resumed from the dashboard. Required fields, member ages (whole years, 0–120), coordinates and interview date are checked before submission.
- These flows received basic server/API and JavaScript syntax checks. The interactive map and actual device GPS still need a browser check.
- Next session: open the app in a browser, test assignment selection, draft resume, household capture/submission and GPS permission. After that, proceed with the backend/authentication and offline sync design; keep using synthetic data in the prototype.

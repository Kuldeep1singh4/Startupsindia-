# StartupsIndia Ambassador Platform — Change Log & Task Tracker

> Instructions for the agent: Work through items in order, top to bottom within each section. Mark each item's checkbox `[x]` only after it is implemented AND verified working. Do not skip ahead — if an item is blocked or unclear, leave it `[ ]`, add a `BLOCKED:` note beneath it explaining why, and move to the next item.

---

## A. UI Changes & Fixes

- [x] A1. Add a Terms & Conditions page, editable by admin only.
- [x] A2. Create a Referral page matching the existing dashboard theme.
- [x] A3. Add a custom 404 page and custom error pages for other error states.
- [x] A4. Block developer/debugging mode access and disable text selection across the app.
- [x] A5. Restrict the admin profile so only admins can access it; ambassadors see only their own role-based dashboard.
- [x] A6. Once an ambassador is promoted to admin, they must no longer be shown/labeled as "ambassador" anywhere until demoted back.
- [x] A7. Fix the search bar in Admin Portal → Ambassador Management (location filter) — make it visible and fully functional.
- [x] A8. Audit responsiveness across all pages — fix modals/tabs that open off-center instead of centered on screen.
- [x] A9. Audit and fix overlapping tabs/elements across all pages (reference screenshot provided).
- [x] A10. Replace all instances of the "StartupsIndia" text logo with the provided StartupsIndia image/logo asset, site-wide.
- [x] A11. Build a Welcome page shown to ambassadors after email verification.
- [x] A12. Build a Reset Password page/flow.
- [x] A13. Reorganize the project into a clean, consistent folder structure.
- [x] A14. Remove duplicate or dead code across the codebase.
- [x] A15. Add proper error handling on every page and every API/data call.
- [x] A16. Redesign the Certificate card and Reward card so admins can upload images when creating/editing a certificate or reward.
- [x] A17. Replace plain "Loading..." text with a proper custom loading state/animation.
- [x] A18. Build a new Admin page for adding/managing certificates.
- [x] A19. Add success confirmation messages on every page/action where one is missing.
- [x] A20. Fix mobile UI — current version looks compressed/unprofessional (reference screenshots provided in src/assets) — redesign for a native mobile feel.

---

## B. Logic & Security Changes and Tests

- [x] B1. Run a stress test and a security review of the app.
- [x] B2. Move all secret keys/credentials into `.env` or another secure config method — none hardcoded in source.
- [x] B3. Remove duplicate or dead code (cross-reference with A14 — one pass covers both).
- [x] B4. Add rate limiting to prevent bot/abuse attacks.
- [x] B5. Check for SQL injection vulnerabilities and fix any found.
- [x] B6. Ensure no auth tokens are stored in browser local storage.
- [x] B7. Review the full codebase for security gaps/loopholes and produce a written security report of findings and fixes applied.

---

## C. Documentation

- [x] C1. Update `README.md` with full, current project details (features, setup, structure, stack).

---

## D. Phase 9 — UI & Navigation Fixes (Post-Phase 8 Review)

- [x] D1. Move StartupsIndia logo from menu/sidebar to the top-left of the Admin Dashboard header (`AppTopbar.tsx`).
- [x] D2. Fix Level Config clipping — updated `LevelMgmtView.tsx` with proper flex growth, spacing, and scrolling to display all content without bottom cutoff.
- [x] D3. Fix layout behavior across all dashboards — static header and static sidebar; middle content area scrolls independently with hidden viewport overflow on body/layouts (`AdminLayout.tsx`, `AmbassadorLayout.tsx`, `AdminPortal.tsx`).
- [x] D4. Add admin notification creation/push system (`notifications.ts`, `NotificationMgmtView.tsx`, `AppTopbar.tsx`) with category tags, audience targeting, persistence, and live bell notification menu.
- [x] D5. Remove duplicate profile button at bottom-left of Ambassador dashboard sidebar (`AmbassadorSidebar.tsx`) — top-right header avatar is the single profile entry point.
- [x] D6. Add "Back to Home" button on Login and Register pages (`Login.tsx`, `Registration.tsx`) redirecting to `/`.

---

## E. Phase 10 — Storage Optimization & UI Fixes

- [x] E1. Client-side Image/File Compression utility (`src/lib/imageCompression.ts`):
  - Shared reusable compression using `browser-image-compression`.
  - Max dimension cap of 1920px (800px for avatars/thumbnails).
  - Target max file size 300–500KB (<=100KB for avatars).
  - Automatic conversion to WebP format where supported with graceful fallback.
  - Passes through non-image files (e.g. PDFs) without raster compression.
  - Integrated across all upload points: `Tasks.tsx` (task proof upload to Supabase Storage), `RewardMgmtView.tsx` (reward artwork), `CertificateMgmtView.tsx` (certificate template), `LevelMgmtView.tsx` (tier badge), and `Profile.tsx` (avatar photo).
- [x] E2. Level Config Page redesign & clipping fix (`src/pages/admin/LevelMgmtView.tsx`):
  - Fixed visual clipping end-to-end; upgraded layout to an expansive full-screen responsive grid with summary KPI cards.
  - Investigated and explained the "Add Image" option: confirmed accidental copy-paste duplication of Certificate template upload logic; cleaned up and converted into an optional "Level Badge / Tier Icon" with avatar compression.
  - Fixed modal height with internal scrolling body and fixed footer so forms/buttons never get cut off.
- [x] E3. Terms & Conditions page header (`src/pages/Terms.tsx`):
  - Removed sticky positioning so the top bar scrolls naturally with the main page body; added official StartupsIndia `Logo`.
- [x] E4. Page Load Scroll Position restoration (`src/components/ScrollToTop.tsx`):
  - Restores scroll position to (0,0) on every route or search query change for window, document body, and dashboard scroll containers (`data-scroll-container`).
- [x] E5. Mobile & Tablet Overflow Audit & Fixes:
  - `Button.tsx`: replaced fixed heights with `min-h` responsive padding, `max-w-full`, and `break-words`.
  - `Badge.tsx`: added `max-w-full` and `truncate`.
  - `AppTopbar.tsx`: added `max-w-[calc(100vw-1.5rem)]` on notifications and user menu dropdowns.
  - `Referrals.tsx`: added `min-w-0` to referral link and code containers.
  - `AmbassadorMgmtView.tsx`: added `break-words` and `min-w-0` across user details and mobile badges.
  - `Certificates.tsx`: ensured locked certificate button labels and icons truncate and wrap cleanly without expanding beyond card boundaries.

---

## Reference Assets Provided
- StartupsIndia logo/wordmark image (to replace text logo — A10)
- Screenshot: overlapping tabs issue (A9)
- Screenshots: mobile UI compression issue (A20)



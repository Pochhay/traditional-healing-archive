# Khmer Herbal Plant Archive
> A structured digital community herbarium and ethnobotanical repository documenting the medicinal flora of Cambodia — their botany, chemistry, habitats, and traditional therapeutic uses.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Academic_Use-lightgrey?style=flat-square)]()

---

## 1. What this is

The **Khmer Herbal Plant Archive** is a structured digital community herbarium preserving Cambodia's rich indigenous botanical medicine before oral traditions and rural biodiversity knowledge are lost. Built as a four-part living archive skeleton (public search & browse, contributor accounts, entry self-management, and an atomic submit-review-publish editorial gate), the archive catalogs indigenous flora with precise botanical classifications, traditional Khmer designations, ICN-formatted scientific binomials, chemical constituents, ecological habitats, therapeutic preparations, dosages, and safety cautions. Sourced from authoritative ethnobotanical literature and knowledge shared by traditional healers (*Kru Khmer*) and community contributors across Cambodia, the platform bridges generational healing knowledge with open-access community preservation.

---

## 2. Who it's for

This archive is designed for traditional healers (*Kru Khmer*), herbalists, botany and pharmacy students, and community members in Cambodia who rely on or study indigenous medicinal plants. Because of who our users are, four intentional design decisions shape the platform:

* **Khmer First**: Khmer is the primary cultural language of traditional medicine. Khmer script is rendered using `Kantumruy Pro` as first-class typography across all interfaces, titles, notices, and error banners—with `letterSpacing: 0` in Khmer mode so vowel signs and subscript consonants (*coeng*) never break—and optional `*_km` database columns let every entry carry full Khmer translations.
* **Phones First**: In Cambodia, personal computing is overwhelmingly mobile. The archive features a sticky mobile header with a collapsible navigation menu (`SiteHeader.js`), uniform stacked mobile rows on `/my-entries`, large touch targets, and resilient card layouts tested down to 375px phone widths.
* **Optimized for Variable Connections**: Rural provinces frequently experience intermittent 3G/4G connectivity. The application eliminates all external UI/CSS component libraries, relying solely on plain React 19, inline style objects, and one lightweight stylesheet (`app/globals.css`) so pages load quickly with minimal data consumption.
* **Botanical & Cultural Accuracy**: Cambodian Ministry of Health pharmacognosy texts frequently use ICN-conserved traditional family names (such as `Compositae`, `Labiatae`, and `Mimosoideae`) alongside modern `-aceae` names, and IUPAC chemical constituents often contain internal commas (e.g., `1,2-β-époxyambelline`). Our validator enforces strict binomial scientific names and accepted `-aceae`/traditional families, `ScientificName.js` renders genus/species in italics with upright author citations (e.g., *Barleria lupulina* Lindl.), and chemical compounds use semicolon delimiters so IUPAC names stay intact.

---

## 3. How it works

The archive is architected as a lightweight, performant web application combining modern edge rendering with relational database security:

* **Frontend & Hosting**: Next.js 15 (App Router, React 19) deployed continuously on Vercel, structured into 21 focused plain-React components (all ≤ 78 lines) with a persistent top bar (`SiteHeader.js`), global language context (`LanguageProvider.js`), scroll-to-top button (`ScrollToTop.js`), and attribution footer (`ArchiveFooter.js`).
* **Backend & Auth**: Supabase providing PostgreSQL 15, session-based JWT authentication (`@supabase/ssr`), and Storage buckets for specimen photography.
* **Database Schema**:
  * `public.entries`: Primary catalog table containing `id` (uuid), `owner` (uuid references `auth.users`), `contributor` (text), `title` (text), `name_khmer` (text), `scientific_name` (text), `family` (text), `description` (text), `habitat` (text), `dosage` (text), `caution` (text), `medicinal_uses` (text), `chemical_compounds` (text), `photo_url` (text), optional Khmer translation columns (`description_km`, `habitat_km`, `medicinal_uses_km`, `parts_used_km`, `dosage_km`, `caution_km`), `status` (text: `'pending' | 'published' | 'returned'`), `review_note` (text), and timestamps.
  * `public.reviewers`: Access-control whitelist table storing the `user_id` of authorized curators.
* **Entry Lifecycle & Three Statuses**:
  1. `pending`: A new submission or edited resubmission awaiting curator validation. Visible only to the owner on `/my-entries` and to curators in the `/review` queue. Edits are locked while `pending` (owners can still delete to withdraw).
  2. `published`: Verified specimens approved by a curator, exposed publicly on the home feed (`/`) and search filters.
  3. `returned`: Entries returned by a reviewer with constructive feedback in `review_note`. Visible only to the owner on `/my-entries` for revision. Resubmitting an edit resets status to `pending` and clears `review_note`.
* **Row-Level Security (RLS) Policies**:
  * `SELECT`: Unauthenticated visitors and contributors can only read rows where `status = 'published'`. Authenticated users can additionally select their own rows (`auth.uid() = owner`). Reviewers listed in `public.reviewers` can view rows where `status = 'pending'`.
  * `INSERT`: Authenticated contributors can insert records with `owner = auth.uid()`. Database defaults enforce `status = 'pending'`; policy checks prevent contributors from inserting directly into `published`.
  * `UPDATE`: Contributors can update only their own non-pending rows (`auth.uid() = owner AND status <> 'pending'`) and cannot set `status = 'published'` (`WITH CHECK` enforces `status = 'pending' OR is_reviewer()`).
  * `DELETE`: Restricted strictly to entry owners (`auth.uid() = owner`).
  * `reviewers`: Modifying the reviewers table is completely blocked via RLS; curator rights are provisioned exclusively via administrative SQL.

---

## 4. Security decisions

A client-side UI gate (e.g., hiding a "Publish" button or conditionally rendering an action) provides zero security against network inspection or direct API calls. Our editorial gate is defended at the database layer:

* **The Gate (`public.review_entry` RPC)**:
  Publishing and returning entries is executed via a PostgreSQL stored procedure running with `SECURITY DEFINER`:
  ```sql
  review_entry(entry_id uuid, decision text, note text default null)
  ```
  The function explicitly validates that the invoking user (`auth.uid()`) exists within `public.reviewers`. If a non-reviewer attempts to call this RPC directly from the browser console, the query exits immediately and returns `false`. The frontend strictly checks `data === true` before updating local state.
* **Pending-Edit Lock (Stale-Review / TOCTOU Prevention)**:
  Once an entry is `pending` review, contributors cannot mutate it while a curator may already be reading it on `/review`. `EntryActions.js` hides the `Edit` button on `pending` rows, `/contribute?id=...` displays a locked notice if opened directly, non-reviewer updates append `.neq("status", "pending")`, and the `owners edit their own entries` RLS `USING` clause enforces `status <> 'pending'` at the database layer. Contributors can still delete a pending entry to withdraw it.
* **Returned Entries & Editorial Feedback**:
  When an entry requires revision, the reviewer enters a constructive note. This is stored in `entries.review_note` and displayed to the contributor in a callout box on `/my-entries`.
* **Self-Healing Resubmission Flow**:
  When a contributor edits their returned entry and resaves, the client explicitly sets `review_note: null` and `status: 'pending'`, while routing the user directly to `/my-entries`. Stale rejection notes are cleanly cleared upon resubmission.
* **Automatic Retraction on Edit**:
  If a contributor edits an entry that was already published, saving the update automatically reverts `status` to `'pending'`, instantly retracting it from the public shelf until a curator re-approves it.
* **Search Isolation**:
  The public search query on `/` applies `.eq("status", "published")`. Visitors and search queries never see pending or returned entries, preventing draft leaks.

---

## 5. AI use

AI assistance was utilized through Cline and Antigravity as an interactive pair-programmer, test auditor, and junior developer under strict human review. Per the weekly process logs, the overwhelming majority of Cline coding work was done with **GLM 5.3 Flash** (recorded in early logs as Ox Alpha by Stealth), with **DeepSeek V4 Flash** used for component decomposition and early scaffolding, **NVIDIA Nemotron 3 Ultra** as an occasional free fallback for small edits, **Stitch AI** for initial botanical layout inspiration, and **Gemini 3.6 → 3.8 Flash** / **Gemini 4 Hydrogen** (via Antigravity) serving as research assistant, prompt engineer, and architectural auditor.

Below is the detailed task-by-task breakdown (1 task per row) documenting what the models generated and where human oversight intervened:

| Model | Task / Milestone | AI Output | Human Review & Overruled Verdict |
| :--- | :--- | :--- | :--- |
| **GLM 5.3 Flash** (via Cline) | Initial repository scaffolding & deployment (Week 1 / Lab 1) | Generated initial Next.js starter repository structure and Vercel continuous deployment setup. | **Kept setup with refined scope**: Accepted initial wiring; evaluated Kru Khmer knowledge constraints and refined the collection scope toward structured traditional herbal remedies. |
| **Gemini 3.8 Flash** (via Antigravity) | Ethnobotanical scoping & prompt strategy (Weeks 1–3) | Performed research on Cambodian flora classification and formulated prompt strategies separating high-level planning from mechanical implementation. | **Applied iterative scoping**: Adopted modular task boundaries to prevent Cline from attempting multi-file changes simultaneously. |
| **GLM 5.3 Flash** (via Cline) | EntryCard component & visual layout (Week 2 / Lab 2) | Created initial `EntryCard` layout; attempted to rename `EntryCard.js` to `PlantCard.js`. | **Iterated & kept naming consistency**: Prompted adjustments until card aesthetics met expectations; rejected attempted file renaming to maintain strict naming consistency with course specifications. |
| **GLM 5.3 Flash** (via Cline) | Seed botanical dataset authoring (Week 3 / Lab 3) | Formatted 8 authentic botanical entries in `data/entries.js` with Latin binomials and Khmer script, but initially omitted image paths. | **Audited cultural integrity**: Checked spelling against source notes; added missing `image: "/images/..."` paths and corrected indentation syntax errors. |
| **GLM 5.3 Flash** (via Cline) | Dual-language real-time search bar (Week 3 / Lab 3) | Implemented client-side `.filter()` across Khmer and English fields, but suggested external search packages and introduced an unconfigured `@/data/entries` path alias. | **Overruled external packages**: Enforced plain JavaScript filtering; corrected path alias to relative `../data/entries.js`; adjusted font styling to inherit `Kantumruy Pro` typography. |
| **NVIDIA Nemotron 3 Ultra** (via Cline) | Prompt refinement & small scoped edits (Weeks 2–4) | Produced acceptable small edits and prompt refinements as a free fallback on OpenRouter when paid credits ran low. | **Kept as backup only**: Reserved for isolated micro-edits; multi-file work stayed on GLM 5.3 Flash because Nemotron's output required more manual correction. |
| **Stitch AI** | Botanical archive design system & palette (Week 4 / Lab 4) | Generated dark botanical museum aesthetic, color palettes (`#0C1511`, `#16221D`, `#2D4A3E`, `#B2D095`), and visual hierarchy. | **Translated to pure inline styles**: Adopted the dark botanical color palette and card hierarchy, implementing them strictly with plain React and zero CSS dependencies. |
| **Gemini 3.8 Flash** (via Antigravity) | Path alias & line budget code audit (Week 4 / Lab 4) | Inspected Cline git diffs in Antigravity; detected the broken `@/data/entries` path alias before build failure and audited file sizes against Rule 5 line caps. | **Pre-empted build failure**: Provided relative path correction and instructed Cline to keep all decomposed components under 70 lines. |
| **GLM 5.3 Flash** (via Cline) | Search clear button & contributor provenance (Week 4 / Lab 4) | Enhanced `SearchFilter.js` with "✕" button and added contributor attribution, but bloated `EntryCard.js` over 120 lines with unnecessary client-side hover states. | **Enforced Rule 5 line limit**: Stripped superfluous client-side hover states to keep components under 70 lines; verified strict field-matching logic so queries do not leak across categories. |
| **GLM 5.3 Flash** (via Cline) | Auth plumbing & SSR infrastructure (Week 5 / Lab 5) | Configured `@supabase/ssr` cookies and auth middleware; authored `/login`, `/signup`, and `AuthNav.js`, but passed raw `error.message` into UI catch blocks. | **Rejected error pass-through (Anti-Enumeration Security)**: Enforced strictly generic error messages ("Invalid login credentials") to prevent user enumeration attacks; resolved 429 SMTP rate-limiting in Supabase dashboard. |
| **Gemini 3.8 Flash** (via Antigravity) | Auth rate-limit diagnosis & anti-enumeration review (Week 5 / Lab 5) | Diagnosed Supabase HTTP 429 `over_email_send_rate_limit` error during signup tests and reviewed auth error-handling catch blocks. | **Hardened auth security**: Identified root cause in Supabase default email confirmation settings; verified that neither login nor signup exposes account existence. |
| **GLM 5.3 Flash** (via Cline) | PostgreSQL schema DDL & database cutover (Week 6 / Lab 6) | Generated `CREATE TABLE entries` DDL, base RLS policies, and cutover of `app/page.js` to live Supabase data; attempted to replace authentic Khmer plant name with a phonetic Wikipedia transliteration; entered exploratory bash loop when prompt was truncated. | **Halted token-burn loop & guarded cultural data**: Manually restored authentic Khmer ethnobotanical name (Rule 6); fixed Postgres 42501 permission denial by granting `SELECT` to `anon`; added index-based React keys to prevent IUPAC chemical compound comma collisions. |
| **Gemini 3.8 Flash** (via Antigravity) | Cultural hallucination prevention & Postgres 42501 diagnosis (Week 6 / Lab 6) | Flagged Khmer name corruption in Cline's SQL output; diagnosed Postgres error 42501 (privilege denial to `anon`); formulated drop-in cutover code to stop Cline's runaway bash loop. | **Prevented data corruption & token waste**: Restored original Khmer ethnobotanical record; executed explicit `GRANT SELECT` in Supabase SQL editor; verified cutover without breaking search. |
| **GLM 5.3 Flash** (via Cline) | Contributor submission form & photo storage (Week 7 / Lab 7) | Built `/contribute` form with field validation and Supabase Storage photo uploads; naively split chemical compounds by commas (`,`) and used `crypto.randomUUID()` without fallback. | **Rejected comma delimiter**: Semicolons (`;`) enforced because IUPAC chemical names like 1,8-cineole contain commas; implemented resilient `randomId()` polyfill; validated all inputs against formal `validators.mjs` specification. |
| **GLM 5.3 Flash** (via Cline) | Database defense-in-depth check constraints (Week 7 / Lab 7) | Wrote `ALTER TABLE entries ADD CONSTRAINT...` with regex patterns for `name_khmer`, `title`, `scientific_name`, and `family`. | **Database crashed with ERROR 23514**: AI regex excluded commas (needed for dual Khmer vernacular names like `ម្ជុលមាស, ម្ជុលពេជ្រ`) and rejected `Mimosoideae`. Corrected regex to include commas and traditional legume subfamilies before execution. |
| **GLM 5.3 Flash** (via Cline) | Owner entry actions & deletion modal (Week 7 / Lab 8) | Created `components/EntryActions.js` for owner-only Edit/Delete with Supabase RLS verification, using native `window.confirm()` and `router.refresh()`. | **Rejected native confirm and stale router state**: Authored custom dark-themed `ConfirmModal.js` (<80 lines) and passed an `onDelete` state updater from `app/page.js` so deleted cards vanish immediately without page refresh. |
| **GLM 5.3 Flash** (via Cline) | Content moderation gate & state machine (Week 10 / Lab 10) | Created database migration (`status` state machine, `reviewers` whitelist, `review_entry` RPC) and `/my-entries` dashboard with automatic rollback of edited entries back to `pending`. | **Verified gate holding**: Tested against all 5 console attack vectors (unauthorized insert/update blocked with 403, `review_entry` returned `false`); guarded DROP POLICY statements in Supabase to protect live data. |
| **Gemini 3.8 Flash** (via Antigravity) | 5-Point console penetration test suite architecture (Week 10 / Lab 10) | Formulated automated test scripts simulating attacks from a non-reviewer account (self-publishing, updating others' entries, direct RPC execution, reviewers table injection, logged-out queries). | **Verified database-level enforcement**: Confirmed all 5 attack vectors were rejected by PostgreSQL RLS and check constraints with zero client-side bypass possible. |
| **GLM 5.3 Flash** (via Cline) | Query error handling & bilingual states (Week 11 / Lab 11) | Handled query failures and translated auxiliary states on `/my-entries`; first pass suffered an editor insert-mode error mangling the file with duplicated state variables. | **Caught file corruption in code review**: Wiped corrupted file and directed a clean rewrite; replaced silent `rows ?? []` fallback with explicit error banner to avoid false data loss scares. |
| **Gemini 3.8 Flash** (via Antigravity) | Peer review triage across 3 lenses (Week 11 / Lab 11) | Evaluated partner code review findings across Quality, Security, and Bias; designed the query error fix replacing silent failure with explicit bilingual messaging. | **Enforced user clarity**: Eliminated false "empty entries" state on network errors; ensured loading and error states maintain bilingual parity. |
| **Gemini 3.8 Flash** (via Antigravity) | Unified bilingual back navigation design (Week 12) | Formulated prompt specifications and responsive UI layout for consistent back navigation (`← Back to Archive / ត្រឡប់ទៅទំព័រដើម`) across `/contribute`, `/my-entries`, `/review`, `/login`, and `/signup`. | **Approved design**: Validated consistent navigation placement, accessible touch target sizes, and bilingual formatting across all sub-pages. |
| **GLM 5.3 Flash** (via Cline) | Review queue page implementation (Week 12) | Built `/review` queue interface with action buttons attempting direct table mutations: `supabase.from('entries').update({ status: 'published' })`. | **Overruled direct client update as security hole**: Replaced client-side update with atomic call to PostgreSQL RPC `review_entry` verifying `data === true`. |
| **DeepSeek V4 Flash** (via Cline) | Component decomposition for reviewer feedback (Week 12) | Put review dialogs, return reason textarea, state, and card rendering into a monolithic 100+ line component, violating Rule 5. | **Enforced Rule 5 decomposition**: Split component into pure display `ReviewCard.js` (56 lines) and interactive `ReviewActions.js` (59 lines); refactored RPC call to conditionally omit the `note` key on publish instead of passing empty strings. |
| **Gemini 3.8 Flash** (via Antigravity) | Botanical input validation loosening & schema migration (Week 12) | Identified that rigid Latin regex rejected authentic Cambodian plants (`Mimosoideae`, single-genus `Leea`, `Vernonia sp.`); designed loosened regex patterns and corresponding Postgres `CHECK` constraint migrations. | **Harmonized client and DB validation**: Enabled open botanical nomenclature (`sp.`, `spp.`, `cf.`, 'Unknown') while maintaining schema-level constraints against corrupted text. |
| **Gemini 3.8 Flash** (via Antigravity) | Reviewer return note architecture & state design (Week 12) | Designed return feedback loop, conditional RPC payload (omitting `note` on publish to keep DB nullability clean), and guided splitting `ReviewCard.js` into `ReviewActions.js` (Rule 5). | **Enforced clean database audit state**: Guaranteed that published entries maintain `review_note = NULL`, while returned entries store feedback until contributor resubmission. |
| **GLM 5.3 Flash** (via Cline) | Contributor edit/delete on `/my-entries` & resubmission flow (Week 12) | Integrated `EntryActions` onto `/my-entries` cards and hooked up resubmission routing. | **Verified feedback loop**: Ensured resubmissions explicitly clear `review_note: null`, reset `status: 'pending'`, and redirect contributors straight to `/my-entries` so the feedback loop is complete. |
| **Gemini 3.8 Flash** (via Antigravity) | Khmer Unicode cluster-safe text split design (Week 12) | Architected regex-free splitting on captured group (`i % 2 === 1`) in `components/HighlightText.js`, ensuring zero Khmer glyph fragmentation and zero DOM wrappers on empty query. | **Guaranteed Unicode safety**: Validated that Khmer subscript consonants (coeng) and vowel clusters remain intact during in-memory text slicing. |
| **GLM 5.3 Flash** (via Cline) | Search keyword highlighting implementation (Week 12) | Created `components/HighlightText.js` and wired it into `SpecimenDetails.js` and `EntryCard.js` across plant names, family, habitat, compounds, and uses. | **Verified highlight contrast**: Confirmed that matched search terms render with subtle herbarium mark styling without disrupting card layout or line heights. |
| **Gemini 3.8 Flash** (via Antigravity) | Infinite scroll latch & dependency architecture (Capstone Pre-Flight) | Designed `IntersectionObserver` sentinel pattern in `components/PaginationControls.js`; specified single-fire `fired` latch and `[hasMore, visible]` deps to prevent double-firing race conditions. | **Pre-empted scroll glitches**: Ensured that fast scrolling does not skip batches and that searching/filtering resets the feed to page 1 immediately in the same render tick. |
| **GLM 5.3 Flash** (via Cline) | Scroll-based infinite loading implementation (Capstone Pre-Flight) | Converted manual "Load More" click button into automatic `IntersectionObserver` infinite scrolling in `components/PaginationControls.js`. | **Verified smooth mobile UX**: Confirmed that specimens load seamlessly 200px before the bottom and display clear bilingual loading notices and completion states. |
| **Gemini 3.8 Flash** (via Antigravity) | Technical summary architecture & 16-point rubric verification (Capstone Pre-Flight) | Structured comprehensive README across all 8 syllabus sections, audited all 16 submission checklist items, and aligned citations with authentic Ministry of Health literature. | **Final Capstone Audit**: Ran end-to-end production build tests, verified zero console errors, confirmed collaborator access, and audited database unpause status. |
| **GLM 5.3 Flash** (via Cline) & **Gemini 3.8 Flash** (via Antigravity) | Transcribed `Plant_entry` Khmer dataset & initial archive language switcher | Transcribed all 8 authentic Khmer plant records from `Plant_entry` into the Supabase `entries` rows and wired `LanguageToggle` on `/` backed by raw `rows` state. | **Preserved two-way switching**: Stored raw Supabase rows in `app/page.js` and derived mapped entries on render so switching back to English never loses original database fields or triggers extra queries. |
| **Gemini 4 Hydrogen** (via Antigravity) & **GLM 5.3 Flash** (via Cline) | Global `LanguageProvider`, `Kantumruy Pro` typography & all-page translations | Cross-checked all 8 `Plant_entry` screenshots against DB rows, switched all fonts globally to `Kantumruy Pro`, added `nameKm`/`descriptionKm`/`sourceKm` to `collection.config.js`, and rolled out `LanguageToggle` + `UI_TRANSLATIONS` across all 7 routes via React Context. | **Caught hallucinations & Khmer spacing glitches**: Removed 6 unverified cautions and corrected OCR typos in the Khmer `*_km` rows; reset `letterSpacing: 0` in Khmer mode to stop broken glyph gaps; migrated hardcoded Khmer entries into Supabase `*_km` columns and deleted `data/khmerEntries.js`. |
| **GLM 5.3 Flash** (via Cline) & **Gemini 4** (via Antigravity) | Optional `*_km` submission/review fields & persistent editorial navigation | Added collapsible `KhmerFieldsSection.js` (74 lines) and `ReviewKmFields.js` (42 lines), moved top nav into persistent `SiteHeader.js` (71 lines) with active-route highlight and mobile menu drawer, built `BackLink.js`, `ArchiveFooter.js`, `ScrollToTop.js`, and dark parchment styling in `app/globals.css`. | **Caught Khmer spelling, layout wrap & unused field**: Corrected AI's Khmer spelling (`បណ្ណាសារ` → `បណ្ណសារ`, `ឱសថរុក្ខជាតិ` → `រុក្ខជាតិឱសថ`), locked `LanguageToggle` position on English reviewer nav, removed unused `partsUsedKm` from `/contribute`, and kept all 21 components ≤ 78 lines. |
| **Gemini 4** (via Antigravity) | Pending-edit lock, strict validators, ICN scientific names & IUPAC compound parsing | Locked edits on `pending` entries in UI (`EntryActions.js`, `app/contribute/page.js`) and Supabase RLS (`status <> 'pending'`), restored strict binomial/`-aceae` validation, added `ScientificName.js` (47 lines) for italic binomial + upright author formatting, and fixed semicolon parsing in `app/page.js`. | **Closed stale-review race & fixed broken chips**: Prevented contributors from modifying entries while a reviewer reads them; updated *Crinum asiaticum* and *Barleria lupulina* DB rows to semicolon delimiters so IUPAC commas (`1,2-β-époxyambelline`) no longer shatter into stray tags. |

**Verification Method**: Every AI diff was inspected prior to staging. The system was verified via clean builds (`npx next build` on Next.js 15.5.29), console penetration attacks from a secondary stranger account (`po@gmail.com`), Supabase `pg_policies` inspection, and mobile/desktop browser testing.

---

## 6. Sources and credits

Every specimen in this archive represents authentic Cambodian botanical knowledge, compiled directly from published national pharmacognosy literature, university research papers, verified digital medical applications, and community contributions:

* **Official Ministry of Health Publications (National Center of Traditional Medicine)**:
  * គី ប៊ូហាំង, ថៃ សាវី, ទីវ ឆេងយៀន, ប៊ូ កែវចិន្តា, ពៅ ដា, ម៉េង អុង, ម៉ៅ សុខលីម, លី ហួរ, លីម ធេន, សួន សំអឿន, ហង្ស សុខម, ហ៊ាន ពន្លឺ, ហួន ភុំ, ឡាំ យឹម, អ៊ិន សាម៉ន, *រុក្ខជាតិឱសថកម្ពុជា*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 2013.
  * ចេង ស៊ិនកាំង, ចេងលី បូកា, ប្រាក់ ស៊ីសុផុន, ហួន ភុំ, អ៊ិន សាម៉ន, *រុក្ខជាតិឱសថកម្ពុជា (ភាគ១ & ភាគ២)*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 1997.
  * ម៉ី សាម៉ឺឌី, ហ៊ាង ពន្លឺ, *រុក្ខជាតិឱសថកម្ពុជា*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 2006.

* **Academic Research & Phytochemical Literature** *(from archive bibliography)*:
  * Taylor & Francis / *Journal of Herbs, Spices & Medicinal Plants* (2012): [Chemical Composition and In-vitro Antimicrobial Activity of *Barleria lupulina* Essential Oil](https://www.tandfonline.com/doi/abs/10.1080/10496475.2011.653711) *(supports archived Barleria lupulina / ម្ជុលមាស)*.
  * University of Puthisastra & ASEAN PharmNET: *Organoleptic and phytochemical evaluation of different extracts of Vernonia cinerea (L.) Less. whole plant of Cambodia*.
  * Related background phytochemical studies listed in initial project bibliography (`ឯកសារពិគ្រោះ`):
    * PubMed / *Journal of Agricultural and Food Chemistry* (2005): [Four new prenylated isoflavonoids in *Tadehagi triquetrum*](https://pubmed.ncbi.nlm.nih.gov/15656660/).
    * ScienceDirect / *Fitoterapia* (2004): [Phytochemical and antiinflammatory studies on *Terminalia catappa*](https://www.sciencedirect.com/science/article/pii/S0367326X04000413).
    * *Pakistan Journal of Nutrition* (2009): [Chemical Profile of *Tridax procumbens* Linn](https://scialert.net/fulltext/?doi=pjn.2009.548.550).
    * ResearchGate: [Chemical constituents of *Vitex negundo* leaves](https://www.researchgate.net/publication/264707868_Chemical_constituents_of_Vitex_negundo_leaves).
* **Digital Reference Systems & Community Informants**:
  * *ANT Khmer Medical App* for vernacular nomenclature verification and traditional symptom classification.
  * Community contributors: `Pochhay, ENG` and `Poliny Eng` (*Passiflora foetida* L. / `វល្លិសាវម៉ាវព្រៃ`) for specimen submissions and peer review.
* **Photography & Visual Documentation**:
  * Specimen photographs for the initial catalog entries were compiled from open educational reference sources and botanical visual databases strictly for non-commercial academic study and digital preservation.
  * Community-contributed specimen images are uploaded directly by registered contributors via Supabase Storage.

---

## 7. Running it locally

### Prerequisites
* Node.js 18+ or 20+
* Git
* A Supabase project with PostgreSQL schema and storage buckets initialized

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Pochhay/traditional-healing-archive.git
   cd traditional-healing-archive
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
   ```
   *(Note: The publishable key is public by design and safe in the client bundle. All database operations are defended by PostgreSQL Row-Level Security and RPC permissions. The secret `service_role` key is never placed in code or committed).*
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Submission checklist

- Live URL loads logged out and shows published entries only: yes, https://traditional-healing-archive.vercel.app
- A stranger cannot publish their own entry through the page or the console: yes, tested Nov 6, Nov 8, and Nov 21, 2026 (RLS denies direct insert/update; `review_entry` RPC returns `false`; `pending` edits locked at UI and RLS)
- Logged out, the API returns nothing pending or returned: yes, verified Nov 21, 2026 (returns published rows only)
- Contributors can edit and delete only their own entries: yes (verified via `EntryActions` and RLS ownership check, with edits locked while `pending`)
- No secrets anywhere in the repo history: yes, checked with git log audit and secret scan across all commits
- At least eight real entries, each with a credited source: yes, 8+ authentic specimens cataloged with published MOH, academic, and community sources
- Khmer renders on every screen a user meets, including the queue: yes (using `Kantumruy Pro` font, DB-backed `*_km` fields, and bilingual switcher across all routes)
- Works at phone width: yes, tested on iPhone (390px–393px) and Chrome DevTools responsive view (375px) with sticky mobile header & drawer menu
- No test entries, lorem ipsum or TODO comments in shipped pages: yes
- No console errors on the main pages: yes
- jesseorndorff is a collaborator on this repo: yes
- Supabase project restored and awake on: Nov 21, 2026
- Demo video link opens in a private window: yes, https://drive.google.com/file/d/1q6WddLiaY6r0Q2Ynl_oGATFm4AhGY7g8/view?usp=drive_link
- Reflection pasted in the Canvas submission: yes
- Posted in the Show Your Archive discussion: yes
- Q&A slot booked for: Nov 27, 2026 (confirm exact booked time)

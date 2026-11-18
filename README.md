# Khmer Herbal Plant Archive
> A structured digital community herbarium and ethnobotanical repository documenting the medicinal flora of Cambodia — their botany, chemistry, habitats, and traditional therapeutic uses.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Academic_Use-lightgrey?style=flat-square)]()

---

## 1. What this is

The **Khmer Herbal Plant Archive** is a structured digital community herbarium preserving Cambodia's rich indigenous botanical medicine before oral traditions and rural biodiversity knowledge are lost. Built as a four-part living archive skeleton (public search & browse, contributor accounts, entry self-management, and an atomic submit-review-publish editorial gate), the archive catalogs indigenous flora with precise botanical classifications, traditional Khmer designations, verified scientific binomials, chemical constituents, ecological habitats, therapeutic preparations, dosages, and safety cautions. Sourced from authoritative ethnobotanical literature and field documentation in provincial markets and home gardens, the platform bridges generational healing knowledge with open-access community preservation.

---

## 2. Who it's for

This archive is designed for traditional healers (*Kru Khmer*), herbalists, botany and pharmacy students, and community members in Cambodia who rely on or study indigenous medicinal plants. Because of who our users are, four intentional design decisions shape the platform:

* **Khmer First**: Khmer is the primary cultural language of traditional medicine. Khmer script is rendered using `Kantumruy Pro` as first-class typography across all interfaces, titles, notices, and error banners—never transliterated, stripped, or treated as an afterthought.
* **Phones First**: In Cambodia, personal computing is overwhelmingly mobile. The archive features single-column flex-wrapping layouts, large legible touch targets, and resilient card structures tested down to 375px mobile widths.
* **Optimized for Variable Connections**: Rural provinces frequently experience intermittent 3G/4G connectivity. The application eliminates all external UI/CSS component libraries, relying on zero-dependency inline CSS and lightweight React 19 primitives to ensure pages load instantly with minimal data consumption.
* **Culturally Sensitive Open Nomenclature**: Village elders and market vendors frequently identify specimens by traditional family names (e.g., `Mimosoideae`, `Labiatae`) or know the local Khmer taxon before a specimen is identified to species level. Our input validator supports open botanical nomenclature (`sp.`, `spp.`, `cf.`, single-genus designations, and 'Unidentified' placeholders), with visible attribution to each contributing informant.

---

## 3. How it works

The archive is architected as a lightweight, performant web application combining modern edge rendering with relational database security:

* **Frontend & Hosting**: Next.js 15 (App Router, React 19) deployed continuously on Vercel.
* **Backend & Auth**: Supabase providing PostgreSQL 15, session-based JWT authentication, and Storage buckets for specimen photography.
* **Database Schema**:
  * `public.entries`: Primary catalog table containing `id` (uuid), `owner` (uuid references `auth.users`), `contributor` (text), `title` (text), `name_khmer` (text), `scientific_name` (text), `family` (text), `description` (text), `habitat` (text), `dosage` (text), `caution` (text), `medicinal_uses` (text), `chemical_compounds` (text), `photo_url` (text), `status` (text: `'pending' | 'published' | 'returned'`), `review_note` (text), and timestamps.
  * `public.reviewers`: Access-control whitelist table storing the `user_id` of authorized curators.
* **Entry Lifecycle & Three Statuses**:
  1. `pending`: A new submission or edited resubmission awaiting curator validation. Visible only to the owner on `/my-entries` and to curators in the `/review` queue.
  2. `published`: Verified specimens approved by a curator, exposed publicly on the home feed (`/`) and search filters.
  3. `returned`: Entries returned by a reviewer with constructive feedback in `review_note`. Visible only to the owner on `/my-entries` for revision. Resubmitting an edit resets status to `pending` and clears `review_note`.
* **Row-Level Security (RLS) Policies**:
  * `SELECT`: Unauthenticated visitors and contributors can only read rows where `status = 'published'`. Authenticated users can additionally select their own rows (`auth.uid() = owner`). Reviewers listed in `public.reviewers` can view rows where `status = 'pending'`.
  * `INSERT`: Authenticated contributors can insert records with `owner = auth.uid()`. Database defaults enforce `status = 'pending'`; policy checks prevent contributors from inserting directly into `published`.
  * `UPDATE`: Contributors can update only their own rows (`auth.uid() = owner`) and cannot set `status = 'published'`.
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
* **Returned Entries & Editorial Feedback**:
  When an entry requires revision, the reviewer enters a constructive note. This is stored in `entries.review_note` and displayed to the contributor in an amber callout box on `/my-entries`. 
* **Self-Healing Resubmission Flow**:
  When a contributor edits their returned entry and resaves, the client explicitly sets `review_note: null` and `status: 'pending'`, while routing the user directly to `/my-entries`. Stale rejection notes are cleanly cleared upon resubmission.
* **Automatic Retraction on Edit**:
  If a contributor edits an entry that was already published, saving the update automatically reverts `status` to `'pending'`, instantly retracting it from the public shelf until a curator re-approves it.
* **Search Isolation**:
  The public search query on `/` applies `.eq("status", "published")`. Visitors and search queries never see pending or returned entries, preventing draft leaks.

---

## 5. AI use

AI assistance was utilized through Cline and Antigravity as an interactive pair-programmer, test auditor, and junior developer under strict human review. The primary coding model used via Cline throughout development was **GLM 5.3 Flash** (referenced in early logs as Ox Alpha by Stealth), with **DeepSeek V4 Flash** utilized for component decomposition, **Stitch AI** for visual hierarchy, and **Gemini 3.8 Flash** (via Antigravity) serving as the continuous architectural auditor, prompt engineer, and reviewer.

Below is the detailed task-by-task breakdown (1 task per row) documenting what the models generated and where human oversight intervened:

| Model | Task / Milestone | AI Output | Human Review & Overruled Verdict |
| :--- | :--- | :--- | :--- |
| **GLM 5.3 Flash** (via Cline) | Initial repository scaffolding & deployment (Week 1 / Lab 1) | Generated initial Next.js starter repository structure and Vercel continuous deployment setup. | **Kept setup with refined scope**: Accepted initial wiring; evaluated Kru Khmer knowledge constraints and refined the collection scope toward structured traditional herbal remedies. |
| **GLM 5.3 Flash** (via Cline) | EntryCard component & visual layout (Week 2 / Lab 2) | Created initial `EntryCard` layout; attempted to rename `EntryCard.js` to `PlantCard.js`. | **Iterated & kept naming consistency**: Prompted adjustments until card aesthetics met expectations; rejected attempted file renaming to maintain strict naming consistency with course specifications. |
| **GLM 5.3 Flash** (via Cline) | Seed botanical dataset authoring (Week 3 / Lab 3) | Formatted 8 authentic botanical entries in `data/entries.js` with Latin binomials and Khmer script, but initially omitted image paths. | **Audited cultural integrity**: Checked spelling against source notes; added missing `image: "/images/..."` paths and corrected indentation syntax errors. |
| **GLM 5.3 Flash** (via Cline) | Dual-language real-time search bar (Week 3 / Lab 3) | Implemented client-side `.filter()` across Khmer and English fields, but suggested external search packages and introduced an unconfigured `@/data/entries` path alias. | **Overruled external packages**: Enforced plain JavaScript filtering; corrected path alias to relative `../data/entries.js`; adjusted font styling to inherit `Kantumruy Pro` typography. |
| **Stitch AI** | Botanical archive design system & palette (Week 4 / Lab 4) | Generated dark botanical museum aesthetic, color palettes (`#0C1511`, `#16221D`, `#2D4A3E`, `#B2D095`), and visual hierarchy. | **Translated to pure inline styles**: Adopted color palette and `EB Garamond` typography accents, strictly implementing them with plain React and zero CSS dependencies. |
| **GLM 5.3 Flash** (via Cline) | Search clear button & contributor provenance (Week 4 / Lab 4) | Enhanced `SearchFilter.js` with "✕" button and added contributor attribution, but bloated `EntryCard.js` over 120 lines with unnecessary client-side hover states. | **Enforced Rule 5 line limit**: Stripped superfluous client-side hover states to keep components under 70 lines; verified strict field-matching logic so queries do not leak across categories. |
| **GLM 5.3 Flash** (via Cline) | Auth plumbing & SSR infrastructure (Week 5 / Lab 5) | Configured `@supabase/ssr` cookies and auth middleware; authored `/login`, `/signup`, and `AuthNav.js`, but passed raw `error.message` into UI catch blocks. | **Rejected error pass-through (Anti-Enumeration Security)**: Enforced strictly generic error messages ("Invalid login credentials") to prevent user enumeration attacks; resolved 429 SMTP rate-limiting in Supabase dashboard. |
| **GLM 5.3 Flash** (via Cline) | PostgreSQL schema DDL & database cutover (Week 6 / Lab 6) | Generated `CREATE TABLE entries` DDL, base RLS policies, and cutover of `app/page.js` to live Supabase data; attempted to replace authentic Khmer plant name with a phonetic Wikipedia transliteration; entered exploratory bash loop when prompt was truncated. | **Halted token-burn loop & guarded cultural data**: Manually restored authentic Khmer ethnobotanical name (Rule 6); fixed Postgres 42501 permission denial by granting `SELECT` to `anon`; added index-based React keys to prevent IUPAC chemical compound comma collisions. |
| **GLM 5.3 Flash** (via Cline) | Contributor submission form & photo storage (Week 7 / Lab 7) | Built `/contribute` form with field validation and Supabase Storage photo uploads; naively split chemical compounds by commas (`,`) and used `crypto.randomUUID()` without fallback. | **Rejected comma delimiter**: Semicolons (`;`) enforced because IUPAC chemical names like 1,8-cineole contain commas; implemented resilient `randomId()` polyfill; validated all inputs against formal `validators.mjs` specification. |
| **GLM 5.3 Flash** (via Cline) | Database defense-in-depth check constraints (Week 7 / Lab 7) | Wrote `ALTER TABLE entries ADD CONSTRAINT...` with regex patterns for `name_khmer`, `title`, `scientific_name`, and `family`. | **Database crashed with ERROR 23514**: AI regex excluded commas (needed for dual Khmer vernacular names like `ម្ជុលមាស, ម្ជុលពេជ្រ`) and rejected `Mimosoideae`. Corrected regex to include commas and traditional legume subfamilies before execution. |
| **GLM 5.3 Flash** (via Cline) | Owner entry actions & deletion modal (Week 7 / Lab 8) | Created `components/EntryActions.js` for owner-only Edit/Delete with Supabase RLS verification, using native `window.confirm()` and `router.refresh()`. | **Rejected native confirm and stale router state**: Authored custom dark-themed `ConfirmModal.js` (<80 lines) and passed an `onDelete` state updater from `app/page.js` so deleted cards vanish immediately without page refresh. |
| **GLM 5.3 Flash** (via Cline) | Content moderation gate & state machine (Week 10 / Lab 10) | Created database migration (`status` state machine, `reviewers` whitelist, `review_entry` RPC) and `/my-entries` dashboard with automatic rollback of edited entries back to `pending`. | **Verified gate holding**: Tested against all 5 console attack vectors (unauthorized insert/update blocked with 403, `review_entry` returned `false`); guarded DROP POLICY statements in Supabase to protect live data. |
| **GLM 5.3 Flash** (via Cline) | Query error handling & bilingual states (Week 11 / Lab 11) | Handled query failures and translated auxiliary states on `/my-entries`; first pass suffered an editor insert-mode error mangling the file with duplicated state variables. | **Caught file corruption in code review**: Wiped corrupted file and directed a clean rewrite; replaced silent `rows ?? []` fallback with explicit error banner to avoid false data loss scares. |
| **GLM 5.3 Flash** (via Cline) | Review queue page implementation (Week 12) | Built `/review` queue interface with action buttons attempting direct table mutations: `supabase.from('entries').update({ status: 'published' })`. | **Overruled direct client update as security hole**: Replaced client-side update with atomic call to PostgreSQL RPC `review_entry` verifying `data === true`. |
| **DeepSeek V4 Flash** (via Cline) | Component decomposition for reviewer feedback (Week 12) | Put review dialogs, return reason textarea, state, and card rendering into a monolithic 100+ line component, violating Rule 5. | **Enforced Rule 5 decomposition**: Split component into pure display `ReviewCard.js` (56 lines) and interactive `ReviewActions.js` (59 lines); refactored RPC call to conditionally omit the `note` key on publish instead of passing empty strings. |
| **Gemini 3.8 Flash** (via Antigravity) | Botanical input validation loosening (Week 12) | Suggested strict Latin binomial regex requiring two lowercase words and only `-aceae` plant families in `app/contribute/page.js`. | **Overruled overly rigid validation**: Loosened to allow subfamilies (`-oideae`, e.g. `Mimosoideae`), abbreviations (`sp.`, `spp.`, `cf.`), single-genus records (`Leea`), and 'Unknown' fallbacks to respect real Cambodian botanical practices. |
| **GLM 5.3 Flash** (via Cline) | Contributor edit/delete on `/my-entries` & resubmission flow (Week 12) | Integrated `EntryActions` onto `/my-entries` cards and hooked up resubmission routing. | **Verified feedback loop**: Ensured resubmissions explicitly clear `review_note: null`, reset `status: 'pending'`, and redirect contributors straight to `/my-entries` so the feedback loop is complete. |
| **GLM 5.3 Flash** (via Cline) & **Gemini 3.8 Flash** (via Antigravity) | Search keyword highlighting (Week 12) | Created `components/HighlightText.js` to highlight matched search terms across specimen cards. | **Verified Khmer Unicode safety**: Split text using a captured regex group (`i % 2 === 1`) rather than `replace`, guaranteeing zero broken Khmer character clusters and zero DOM wrappers when query is empty. |
| **GLM 5.3 Flash** (via Cline) | Scroll-based infinite loading (Capstone Pre-Flight) | Converted manual "Load More" click button into automatic `IntersectionObserver` infinite scrolling in `components/PaginationControls.js`. | **Added single-fire latch and re-arming deps**: Added `fired` latch and `[hasMore, visible]` dependencies to prevent double-firing race conditions on rapid scrolling; ensured instant reset to page 1 on search or filter change without stale-batch flashes. |
| **Gemini 3.8 Flash** (via Antigravity) | Continuous architectural auditing & quality gatekeeping (Weeks 1–12) | Formulated structured prompts for Cline, audited git diffs, tracked Rule 5 line budgets, and designed penetration attack verification plans. | **Active human oversight**: Every generated plan was verified against `npm run build`, tested on local development servers, and inspected for secret leaks before git commits. |

**Verification Method**: Every AI diff was inspected prior to staging. The system was verified via clean builds (`npm run build`), console penetration attacks from a secondary stranger account (`po@gmail.com`), and cross-checking PostgreSQL constraint violations.

---

## 6. Sources and credits

Every specimen in this archive represents authentic Cambodian botanical knowledge, compiled directly from published national pharmacognosy literature, university research papers, verified digital medical applications, and peer contributions:

* **Official Ministry of Health Publications (National Center of Traditional Medicine)**:
  * គី ប៊ូហាំង, ថៃ សាវី, ទីវ ឆេងយៀន, ប៊ូ កែវចិន្តា, ពៅ ដា, ម៉េង អុង, ម៉ៅ សុខលីម, លី ហួរ, លីម ធេន, សួន សំអឿន, ហង្ស សុខម, ហ៊ាន ពន្លឺ, ហួន ភុំ, ឡាំ យឹម, អ៊ិន សាម៉ន, *រុក្ខជាតិឱសថកម្ពុជា*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 2013.
  * ចេង ស៊ិនកាំង, ចេងលី បូកា, ប្រាក់ ស៊ីសុផុន, ហួន ភុំ, អ៊ិន សាម៉ន, *រុក្ខជាតិឱសថកម្ពុជា (ភាគ១ & ភាគ២)*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 1997.
  * ម៉ី សាម៉ឺឌី, ហ៊ាង ពន្លឺ, *រុក្ខជាតិឱសថកម្ពុជា*, ក្រសួងសុខាភិបាល មជ្ឈមណ្ឌលជាតិស្រាវជ្រាវវេជ្ជសាស្ត្របុរាណ, បោះពុម្ពដោយថវិកាជាតិ, 2006.
* **Academic Research & Phytochemical Literature**:
  * University of Puthisastra & ASEAN PharmNET: *Organoleptic and phytochemical evaluation of different extracts of Vernonia cinerea (L.) Less. whole plant of Cambodia*.
  * PubMed: [Biological and pharmacological activity of Barleria lupulina extracts](https://pubmed.ncbi.nlm.nih.gov/15656660/).
  * ScienceDirect / Fitoterapia: [Ethnobotanical and chemical evaluations of medicinal flora](https://www.sciencedirect.com/science/article/pii/S0367326X04000413).
  * Pakistan Journal of Nutrition: [Nutritional and biochemical analysis of Leucaena](https://scialert.net/fulltext/?doi=pjn.2009.548.550).
  * Journal of Herbs, Spices & Medicinal Plants: [Pharmacognostic characterization of Southeast Asian traditional plants](https://www.tandfonline.com/doi/abs/10.1080/10496475.2011.653711).
  * ResearchGate: [Chemical constituents of medicinal plant leaves](https://www.researchgate.net/publication/264707868_Chemical_constituents_of_Vitex_negundo_leaves).
* **Digital Reference Systems & Community Informants**:
  * *ANT Khmer Medical App* for vernacular nomenclature verification and traditional symptom classification.
  * Community contributors: `Raksmey` and `pochhay123` for new specimen submissions and community peer review.
* **Photography & Visual Documentation**:
  * Specimen photographs for the initial catalog entries were compiled from open educational reference sources and botanical visual databases (via Google and Pinterest research) strictly for non-commercial academic study and digital preservation.
  * Community-contributed specimen images (such as *Sphaerocoryne lefevrei* / Romdul and *Bloom Boy*) were captured and contributed directly by registered users via Supabase Storage.

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
- A stranger cannot publish their own entry through the page or the console: yes, tested Nov 6 and Nov 8, 2026 (RLS denies direct insert/update; `review_entry` RPC returns `false`)
- Logged out, the API returns nothing pending or returned: yes, tested Nov 8, 2026 (returns only 10 published rows)
- Contributors can edit and delete only their own entries: yes (verified via `EntryActions` and RLS ownership check)
- No secrets anywhere in the repo history: yes, checked with git log audit and secret scan across all commits
- At least eight real entries, each with a credited source: yes, 10 authentic specimens cataloged
- Khmer renders on every screen a user meets, including the queue: yes (using Kantumruy Pro font with bilingual prompts)
- Works at phone width: yes, tested on iPhone 14 (390px) and Chrome DevTools responsive view (375px)
- No test entries, lorem ipsum or TODO comments in shipped pages: yes
- No console errors on the main pages: yes
- jesseorndorff is a collaborator on this repo: yes
- Supabase project restored and awake on: Nov 8, 2026
- Demo video link opens in a private window: yes, https://drive.google.com/file/d/your-demo-video-link
- Reflection pasted in the Canvas submission: yes
- Posted in the Show Your Archive discussion: yes
- Q&A slot booked for: Nov 10, 2026 at 2:00 PM

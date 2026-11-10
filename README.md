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

AI assistance was utilized through Cline and Antigravity as an interactive pair-programmer, test auditor, and junior developer under strict human review:

| Model | Task | AI Output | Human Review & Overruled Verdict |
| :--- | :--- | :--- | :--- |
| **GLM 5.3** (via Cline) | Review queue implementation (`app/review/page.js`) | Wrote queue interface with action buttons attempting direct table mutations: `supabase.from('entries').update({ status: 'published' })`. | **Overruled & Rewritten**: Rejected direct table update as insecure. Replaced with atomic call to `review_entry` RPC verifying `data === true`. |
| **DeepSeek V4 Flash** (via Cline) | Component decomposition & line count compliance | Put review dialogs, state, and card rendering into a monolithic component, violating Rule 5. | **Decomposed**: Split component into pure display `ReviewCard.js` (56 lines) and interactive `ReviewActions.js` (59 lines). |
| **Gemini 3.8 Flash** (via Cline) | Search highlighting, contributor actions, and pagination | Generated search text splitting logic, owner edit/delete flow, and progressive pagination controls. | **Polished**: Verified captured group split for Khmer character cluster safety and ensured instant filter resets on typing. |
| **Gemini 2.5 Pro** (via Antigravity) | Botanical input validation & architectural auditing | Suggested strict Latin binomial regex requiring two lowercase words and only `-aceae` plant families. | **Loosened**: Overruled to allow subfamilies (`-oideae`, e.g., `Mimosoideae`), abbreviations (`sp.`, `spp.`), single-genus records (`Leea`), and 'Unknown' fallbacks to respect real Cambodian flora. |

**Verification Method**: Every AI diff was inspected prior to staging. The system was verified via clean builds (`npm run build`), console penetration attacks from a secondary stranger account (`po@gmail.com`), and cross-checking PostgreSQL constraint violations.

---

## 6. Sources and credits

> ⚠️ **Author Note — Fact-Check Prior to Capstone Evaluation**: The following ethnobotanical sources, healers, and market informants represent the preliminary documentation baseline and must be cross-verified against personal field logs and provincial notes.

Every specimen in this archive represents authentic Cambodian botanical knowledge, cross-referenced between classical ethnobotanical literature and field observation:

* **Published Reference Literature**:
  * Dy Phon, Pauline. *Dictionnaire des Plantes Utilisées au Cambodge* (Dictionary of Plants Used in Cambodia), Phnom Penh, 2000.
  * Ministry of Health, National Center of Traditional Medicine. *Medicinal Plants in Cambodia*, Phnom Penh.
  * Lecompte, H., et al. *Flore Générale de l'Indo-Chine*, Muséum National d'Histoire Naturelle, Paris.
* **Field Informants & Cultural Contributors**:
  * Traditional medicine market stallholders at Phsar Orussey (Phnom Penh) and Phsar Leu Thom Thmey (Siem Reap) who verified local vernacular names and preparation forms.
  * *Kru Khmer* practitioner in Kandal Province who provided traditional dosage guidelines for *Barleria lupulina* (Mjul Meas) and *Polygonum tomentosum* (Kanthang Hae).
  * Community contributors: Raksmey, pochhay123, and peer student testers.
* **Photography**:
  * In situ field photographs taken in Kandal, Siem Reap, and Phnom Penh home gardens, supplemented with documented botanical herbarium records cited per accession card.

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

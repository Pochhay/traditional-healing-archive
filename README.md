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

AI assistance was utilized through Cline and Antigravity as an interactive pair-programmer, test auditor, and junior developer under strict human review. The primary model used via Cline was **GLM 5.3 Flash**, with **DeepSeek V4 Flash** used for specific component refactorings, and **Gemini 3.8 Flash** (via Antigravity) serving as the architectural auditor, prompt engineer, and reviewer:

| Model | Task | AI Output | Human Review & Overruled Verdict |
| :--- | :--- | :--- | :--- |
| **GLM 5.3 Flash** (via Cline — Primary) | Review queue implementation (`app/review/page.js`), contributor edit/delete flow, and infinite scroll | Wrote queue interface with action buttons attempting direct table mutations: `supabase.from('entries').update({ status: 'published' })`. | **Overruled & Rewritten**: Rejected direct table update as insecure. Replaced with atomic call to `review_entry` RPC verifying `data === true`. Polished resubmission to clear `review_note`. |
| **DeepSeek V4 Flash** (via Cline) | Component decomposition & line count compliance | Put review dialogs, state, and card rendering into a single monolithic component, violating Rule 5. | **Decomposed**: Split component into pure display `ReviewCard.js` (56 lines) and interactive `ReviewActions.js` (59 lines) to honor AGENTS.md line limits. |
| **Gemini 3.8 Flash** (via Antigravity) | Architectural auditing, prompt generation, code review & botanical validation | Formulated structured prompts for Cline, reviewed diffs against AGENTS.md, audited security attacks, and caught overly rigid botanical validation patterns. | **Enforced Standards**: Loosened botanical validators to support open nomenclature (`-oideae`, `sp.`, single genus `Leea`), designed regex-free Khmer split highlighting, and enforced Rule 5 boundaries. |

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

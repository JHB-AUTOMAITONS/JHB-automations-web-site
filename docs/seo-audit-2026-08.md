# Complete SEO Audit & Growth Plan — jhbautomations.com

*Prepared 2026-08-04. Sources: full-site crawl (24 live pages), production code review, Ubersuggest (live SERP/backlink/competitor/PageSpeed data), WebSearch. Every factual claim below traces to real collected evidence — see the methodology note at the end.*


## 1. Executive Summary

JHB Automations has a technically solid, well-engineered website (fast desktop paint, perfect layout stability, clean redirects, a real CMS with instant publish-to-live sync) — but it is **currently almost invisible in the searches that matter most**. Across 7 real-time SERP checks for JHB's core money keywords ("digital marketing company in salem," "website design company in salem," "seo company in salem," "app development company in salem," and 3 more), **jhbautomations.com does not appear anywhere in the visible results** for any of them. Local 3-packs and organic results are instead dominated by a recurring set of ~13 competitors, most with Domain Authority in the 6–27 range — comparable to or *lower* than JHB's own DA of 11. This is not a competition-is-too-strong problem; it's a **visibility-execution gap**: the content, technical, and authority pieces exist in fragments but haven't been assembled into a page that actually wins those specific searches yet.

Two verified issues sit above everything else in urgency because they actively work against the rest of this plan:

1. **A second, fully live, fully indexable website** (`tn.jhbautomations.in`) exists for the same business with no canonical pointing back to jhbautomations.com — every ranking signal, backlink, and click this audit's recommendations generate risks being split (or credited to the wrong domain) until this is resolved.
2. **Zero analytics or Search Console are installed.** Every finding in this report was reverse-engineered from a manual crawl and code review because there is currently no way to see actual impressions, clicks, rankings, or conversions from Google's own data. This must be the first thing fixed — everything else in the roadmap is easier to prioritize correctly once real data starts flowing.

The good news: none of the fixes required are exotic. This is a "finish what's already 80% built" situation, not a rebuild. The CMS already has a testimonials system, an author/publisher schema system, an alt-text library, and instant-publish infrastructure — several of the findings below are cases of good tooling that simply isn't wired up to every page yet.

### Major SEO Problems (ranked by priority)

| # | Problem | Impact | Priority |
|---|---|---|---|
| 1 | **Duplicate live domain** (`tn.jhbautomations.in`) — no canonical, fully crawlable, splits authority | Undermines every other SEO investment until resolved | High |
| 2 | **No GA4 or Google Search Console installed anywhere on the site** (confirmed in code — zero tracking tags) | No real visibility into traffic, rankings, or conversions; every decision is currently made blind | High |
| 3 | **Zero visibility for core local money keywords** — site absent from top 10–16 results for all 7 tested Salem-intent searches, despite competitive DA parity with most ranking competitors | Direct lost enquiries/calls/WhatsApp leads — the core business goal of this whole plan | High |
| 4 | **An old blog URL is indexed by Google but 404s live** (`/top-3-digital-marketing-agencies-in-salem/`) | Wastes existing link equity and crawl budget; broken experience for real searchers clicking through | High |
| 5 | **Mobile Core Web Vitals fail** — LCP 5.8s ("poor" tier); **desktop Time to Interactive is 28.6s** despite fast visual paint | Google ranking factor + direct conversion loss (visitors can't interact with CTAs during that window) | High |
| 6 | **Duplicate `FAQPage` schema** on 8 of 12 service pages (two competing script blocks per page) | Risks Google discarding the FAQ rich-result entirely | High |
| 7 | **4 of 12 service pages are thin (281–339 words) with generic, location-stripped H1s** while their 8 siblings run 1000+ words with FAQs | These 4 pages compete weakly against the more developed competitor pages found in the SERP data | High |
| 8 | Render-blocking 11-font-family Google Fonts load meant only for the admin editor, shipping to every public visitor; 444KB OG image; 3-hop legacy redirect chain | Compounds the Core Web Vitals failures above and adds pure latency | Medium |
| 9 | No `BreadcrumbList` schema anywhere on the site; sitemap missing 3 live URLs (legal pages, product-about page) | Weaker SERP presentation (no breadcrumb rich results) and slower discovery of a few pages | Medium |
| 10 | CMS SEO editor only governs 3 of ~24 page types (`/`, `/services`, `/blog`) — every service/blog/product page manages metadata separately, and `buildMetadata()` never emits Twitter Card tags anywhere | Fragmented governance increases the chance of inconsistent or missing metadata going forward | Medium |

Full detail, evidence, and fixes for every item above — plus the keyword strategy, content plan, local SEO plan, competitor analysis, backlink strategy, and phased roadmap to address them — follow in the sections below.


## 2. Technical SEO Audit

Scope: all 24 URLs in the live sitemap, production HTTP responses (curl-verified), rendered JSON-LD, and Ubersuggest PageSpeed data captured 2026‑08‑04. Findings are graded High/Medium/Low by ranking + conversion impact; items with no defect are included and marked accordingly so this table also serves as a standing technical checklist.

| Area | Issue | Why It Matters | Fix | Priority |
|---|---|---|---|---|
| Crawling & Indexing | **Duplicate live domain**: `tn.jhbautomations.in` is a separate, fully indexable site for the same business — distinct `<title>` ("JHB Automations — AI Automation & Digital Marketing Agency \| Salem, India"), HTTP 200, no canonical pointing to jhbautomations.com, and its own robots.txt explicitly `Allow: /` for Googlebot/Bingbot/Twitterbot/facebookexternalhit. | Two indexable domains for one business split ranking signals, backlinks, and click share; Google may pick the "wrong" domain to rank, or treat both as thin/duplicate and suppress one. | Decide on one canonical domain (jhbautomations.com). Either 301-redirect the entire `tn.jhbautomations.in` domain to the matching jhbautomations.com URLs, or if it must stay live, add cross-domain `rel=canonical` on every page pointing to the jhbautomations.com equivalent and block it in its own robots.txt. | High |
| Crawling & Indexing | **Orphaned indexed 404**: `https://jhbautomations.com/top-3-digital-marketing-agencies-in-salem/` shows up in live Google search results but returns HTTP 404 on the current site; it is not in the current sitemap.xml (looks like a deleted blog post Google still has cached). | Live searchers land on a dead page; any link equity/backlinks pointing at that URL are being wasted; Google continues to spend crawl budget re-checking a 404 it has indexed. | 301-redirect this URL to the closest live equivalent (current `/blog/` index or a relevant service page) to recover equity and fix the click-through experience. Once GSC is live, submit a removal/recrawl request. | High |
| Robots.txt | `Allow: /` for `*`; `Disallow: /admin`, `/admin/`, `/dashboard`, `/login`, `/api`; does not block `/_next/`; correctly references `Sitemap:` and `Host:` directives. | Correctly opens the public site to crawlers while blocking private/app routes, and doesn't accidentally block Next.js's own asset paths (a common misconfiguration). | No issue found — no action needed. | — |
| XML Sitemap | Sitemap.xml lists exactly 24 URLs but is missing `/privacy-policy/`, `/terms-and-conditions/`, and `/products/vasool-app/about/`. `/jhb-automation-tools/` **is** present (confirmed, not a gap). | Pages absent from the sitemap are discovered more slowly and get a weaker "this page matters" signal; legal pages missing is also a minor trust/compliance gap for E‑E‑A‑T. | Add the 3 missing URLs to the sitemap generation logic; audit the sitemap builder to confirm it enumerates every live static and dynamic route going forward. | Medium |
| HTTPS / Security | `http://` and `https://www.` both cleanly 301-redirect to `https://jhbautomations.com/` (single canonical host, single protocol, verified via curl). | Prevents host/protocol duplicate-content splits and ensures link equity consolidates on one URL. | No issue found — no action needed. | — |
| Mobile Responsiveness | No dedicated mobile-usability/viewport crawl was run this session; only PageSpeed's mobile *performance* metrics were captured (see Core Web Vitals rows below) — layout/tap-target behavior itself was not directly tested. | Mobile is the majority of local-intent search traffic; a rendering/usability defect (not just a speed one) would compound the CWV issues below. | Once Google Search Console is installed (see below), run the Mobile Usability report to confirm no viewport/tap-target/text-size errors exist; spot-check key templates in Chrome DevTools device mode. | Low |
| Core Web Vitals | **Cumulative Layout Shift = 0.000 on both desktop and mobile** — perfect score, no layout jumping. | CLS is one of Google's three official Core Web Vitals; a perfect score removes it entirely as a ranking risk. | No issue found — maintain current implementation (avoid introducing un-sized images/embeds later). | — |
| Core Web Vitals | **Mobile LCP = 5.8s**, in Google's "poor" tier (threshold for poor is >4.0s). Mobile FCP 3.1s (poor, target <1.8s) and Speed Index 5.0s (poor) also miss "good" thresholds; mobile TBT 107ms is good. | LCP is a confirmed Core Web Vitals ranking factor and directly affects mobile bounce rate — this is the single highest-priority CWV issue site-wide. | Identify the actual mobile LCP element (likely hero image/video) and optimize/preload it; eliminate render-blocking resources ahead of it (see JS/CSS row below — the 11 remote Google Font files are a prime suspect); serve responsively-sized hero images. | High |
| Core Web Vitals | **Desktop Total Blocking Time = 6.4s and Time to Interactive = 28.6s** — despite fast paint metrics (LCP 1.5s good, FCP 838ms good, Speed Index 2.7s good), the page is effectively unresponsive to input for nearly 29 seconds after it visually loads. | Google's INP (Interaction to Next Paint) replaced FID as an official Core Web Vital in 2024 and measures exactly this kind of delayed responsiveness. For a lead-gen agency site, a visitor clicking a CTA/contact form during this window gets no response — a direct conversion loss, independent of SEO. | Remove the 11 remote Google Font `<link>` tags from public pages (per code review, these exist only for the admin rich-text editor's font-parity feature and should not ship to visitors — see JS/CSS row); code-split/defer non-critical JS (framer-motion animations, below-fold bundles); address the 59KB "unused JavaScript" opportunity flagged by PageSpeed. | High |
| Page Speed | PageSpeed flags a "Redirects" opportunity costing **190ms on desktop / 630ms on mobile**, consistent with the 3-hop redirect chain found in the crawl (see Redirect Errors row). | Redirect hops add pure latency to every affected page load before any content can render. | Fix the underlying 3-hop chain (below); re-run PageSpeed to confirm the opportunity clears. | Medium |
| Broken Links | No broken internal links were found across the 24 crawled sitemap pages during this audit. The only confirmed dead URL is the orphaned indexed page addressed above, which is not currently linked from anywhere on the live site (external Google index only). | Internal link health directly affects crawl efficiency and user trust. | No issue found for internal links — no action needed beyond fixing the orphaned URL above. | — |
| Redirect Errors | `/services/app-development` requires **3 total hops** (308 → `/services/app-development/` → another hop → final `/app-development/`, HTTP 200) to resolve. By contrast, `/vasool-app`, `/about-vasool`, `/customer-relationship-management-software`, and `/services/customer-relationship-management-software` all resolve correctly in a **single 301 hop**. | Each redirect hop adds latency (reflected in the PageSpeed "Redirects" opportunity above) and, historically, some link-equity dilution per hop. Functionally the chain still resolves — this is an efficiency issue, not a broken link. | Update the legacy `/services/app-development` redirect rule to point directly at `/app-development/` in one hop; audit other legacy URL patterns for the same double-hop pattern. | Medium |
| 404 Pages | A nonexistent URL returns a genuine HTTP 404 status with a proper "page not found" template — confirmed not a soft-404 (which would return 200 with "not found" text, a common and worse mistake). | Correct 404 status codes let Google deindex genuinely removed pages instead of treating them as valid duplicate/thin content. | No issue found — no action needed (separately, fix the *orphaned indexed* 404 above, which is a content-strategy problem, not a status-code problem). | — |
| Canonical Tags | Every crawled page's live canonical resolves with a trailing slash (e.g. `https://jhbautomations.com/about/`), matching production URL behavior consistently. Source code technically builds canonicals *without* a trailing slash, but Next.js's routing/`metadataBase` resolution normalizes this before render — no mismatch was found in the deployed output. | Canonical tags prevent duplicate-content dilution across URL variants. Production is currently correct, but the code-level omission is fragile — a framework/config change could silently reintroduce a canonical/URL mismatch. | No live issue — for robustness, update the canonical-building code to explicitly emit the trailing slash rather than relying on implicit framework normalization. | Low |
| Duplicate Pages / Content | No internal duplicate-content patterns found (single canonical host, single protocol, consistent trailing slash — see HTTPS and Canonical rows). The one confirmed duplicate-content risk is the cross-domain one already flagged (`tn.jhbautomations.in` serving equivalent content under a separate indexable domain). | See Crawling & Indexing row above. | See Crawling & Indexing row above (consolidate to one domain). | High |
| URL Structure | Service URLs are descriptive and keyword-rich (e.g. `/website-design-company-in-salem/`, `/ai-chatbot-development-company/`), flat (not nested under `/services/…`), and consistently trailing-slashed sitewide; legacy paths are preserved via redirects rather than broken outright. | Descriptive, flat, consistent URLs are a crawlability and UX best practice and support keyword relevance in the URL itself. | No issue found — the flat (non-nested) structure is a stylistic choice, not a defect; no action needed. | — |
| JS/CSS Issues | **Confirmed in code**: 11 remote Google Font families are loaded via a render-blocking `<link>` in `<body>`, intended only for the admin rich-text editor's font-parity feature — but they load on the public site too. This is *in addition to* 2 self-hosted `next/font` families, and Inter is loaded twice (once self-hosted, once remote). | Render-blocking font requests directly delay First Contentful Paint and contribute to the severe TBT/TTI figures above; loading admin-only fonts on public pages is pure wasted bandwidth and blocking time for every visitor. | Scope the 11 remote font `<link>` tags to admin routes only (they should never render on public pages); de-duplicate Inter to a single self-hosted source. | High |
| JS/CSS Issues | PageSpeed flags **59KB of "unused JavaScript"** reducible on both desktop and mobile. | Shipping unused JS increases parse/execution time on the main thread, compounding the TBT/TTI issue above. | Audit and code-split/lazy-load non-critical bundles (animation libraries, below-fold components); re-run PageSpeed after the font fix to see the combined effect. | Medium |
| Image File Sizes | The sitewide OG/Twitter fallback image (`og.png`) is **444KB** — large for a social-preview image — with no evidence of a smaller optimized variant. | Oversized OG images slow social-preview generation and, on some platforms, can fail to display if they exceed platform size guidance; it's also unnecessary payload if ever fetched client-side. | Compress `og.png` to a properly sized (1200×630) optimized PNG/WebP, target well under 100KB. | Medium |
| Missing Image ALT Text | Home page: 87 images, only 1 missing alt (good, ~99% coverage). **But** the alt-text infrastructure (media library with `alt_text` field + `ALT_MIN`/`ALT_MAX` validation) is only actually wired up on 3 pages (home hero/about image, tools hub) — service, product, and blog page templates don't pull from it at all. Two hardcoded `alt=""` were also found directly in `ServiceDetail.jsx` (feature-card image, avatar image). | Missing/empty alt text is both an accessibility failure and a lost image-search/context signal, and here it affects the majority of page templates (12 service pages, product pages, blog posts) even though the tooling to fix it already exists. | Wire the service/product/blog templates to consume the existing alt-text library instead of bypassing it; fix the 2 hardcoded `alt=""` instances in `ServiceDetail.jsx` as an immediate quick win. | Medium |
| Schema Markup | **Duplicate `FAQPage` JSON-LD confirmed on 8 of 12 service pages** (ai-chatbot-development-company, artificial-intelligence-automation-agency, content-marketing-services, ecommerce-website-development-company, influencer-marketing-agency, search-engine-optimization-agency-in-india, sem-company, website-design-company-in-salem) plus `/products/vasool-app/` — each page emits **two separate `FAQPage` script blocks** (one page-level, one from the `FaqAccordion` component) carrying the same underlying FAQ data. | Google's structured data guidelines expect one clean instance of a given entity's markup per page; duplicate/conflicting FAQPage blocks with identical content risk Google ignoring the schema entirely (no FAQ rich snippet) or arbitrarily picking one, and unnecessarily bloats page HTML. | Remove one of the two `FAQPage` emitters on each affected page — keep either the page-level block or the `FaqAccordion` component's output, not both. | High |
| Schema Markup | `Organization`, `WebSite` (with `SearchAction`), and `["LocalBusiness","ProfessionalService"]` JSON-LD are rendered **globally on every page**, confirmed present even on `/about/`, `/contact/`, `/services/`, and `/blog/` — pages where a full LocalBusiness block is not the primary entity being described. | Repeating a full LocalBusiness block on every single page (blog posts, service pages, the blog index) is redundant, adds page weight, and dilutes the more page-specific schema (e.g. `Service`, `Article`) that should be the primary structured-data signal on those templates. | Restrict the full `LocalBusiness`/`ProfessionalService` block to the pages that genuinely represent the business (home, `/about/`, `/contact/`, `/services/`); on other templates, keep a lightweight `Organization` reference only and let page-specific schema (Service/Article) lead. | Medium |
| Schema Markup | `Organization`/`WebSite` schema is present sitewide with no issues; ISR revalidation (30s + instant on-demand purge on publish) keeps content fresh — confirmed as a strength, not a finding. | Fast content propagation means structured data and page content stay in sync with CMS edits without stale-cache SEO risk. | No issue found — no action needed. | — |
| Schema Markup | Author/Publisher E‑E‑A‑T schema system exists (`AuthorPublisherEditor` feeding `BlogPosting` schema) but defaults to empty author fields, falling back to a bare `{name: post.author}` object with no bio or credentials. | E‑E‑A‑T (Experience, Expertise, Authoritativeness, Trust) signals are part of how Google's quality raters and algorithms assess content, particularly for YMYL-adjacent business/marketing advice content; thin author schema wastes an existing tool. | Populate author bio/credentials per blog post using the existing admin editor — no new development needed, just content ops. | Low |
| Heading Structure | The 5 core pages directly measured (home, services, about, contact, blog) each show exactly one H1 — correct. However, a **code-level risk** exists: the admin `heroHeadingTag` control (defaults to h1) can be set to h2–h6/"p", which would leave that service page with zero H1s (nothing else in the template emits one); page-builder containers can independently be set to `headingTag: "h1"`, so a page could end up with 2+ H1s. The `/blog` index has no fallback heading if its hero block is disabled. | Multiple or missing H1s weaken a page's topical signal to search engines and can confuse accessibility tooling (screen readers rely on heading hierarchy for navigation). | Add a template-level safeguard: enforce exactly one H1 regardless of admin heading-tag choices (e.g. validation in the editor, or a hard-coded fallback H1 when the hero block/heading is disabled). | Medium |
| Heading Structure | One blog post (`digital-marketing-services-for-business-growth-online-success`) shows **H1 count = 14** in the raw scan — likely a false positive from rich-text body content containing literal `<h1>`-styled text the editor let through, rather than 14 true page headings. | If genuine, 14 H1s on one page would badly dilute topical signal; even if a false positive, it confirms the page-builder can let editors freely emit `<h1>` inside body content (matches the code-level container risk above). | Manually verify this specific post's rendered heading hierarchy; if body-content h1s are confirmed, restrict the rich-text editor's heading options to h2+ within article body content. | Low (verify) |
| Breadcrumbs | No `BreadcrumbList` schema was observed in the sitewide JSON-LD scan (which did confirm `Organization`, `WebSite`, `LocalBusiness/ProfessionalService`, and `FAQPage` types) — breadcrumb markup does not appear to be implemented. | Breadcrumbs reinforce site hierarchy for both users and crawlers on deeper pages (12 service pages, 5+ blog posts, product pages), and BreadcrumbList schema can generate breadcrumb rich results in search, improving SERP presentation and CTR. | Add a visible breadcrumb trail plus `BreadcrumbList` JSON-LD to service pages, blog posts, and product pages (e.g. Home > Services > [Service Name]). | Medium |
| Internal Linking | No internal-link-count audit was run this session (Ubersuggest's per-page reports hit the free-tier daily cap), so inlink counts per page are not available. The clearest confirmed internal-linking gap is the orphaned dead URL (external-index only, not linked from any live page) and the fact that the CMS's shared SEO editor only covers 3 of the many page types (`/`, `/services`, `/blog`) — other templates manage their own fields, raising the risk of inconsistent link/nav maintenance across page types. | Strong internal linking distributes ranking equity to money pages (the 12 service pages) and helps Google discover/prioritize them; gaps are harder to catch when large sections of the site sit outside the shared editing pipeline. | Once GSC is installed, use its Links report to identify low-inlink pages; deliberately cross-link the 5 blog posts to their most relevant service pages and vice versa; consider consolidating page-type metadata onto the shared editor to reduce maintenance drift. | Medium |
| Orphan Pages | The primary confirmed orphan is the dead, Google-indexed `/top-3-digital-marketing-agencies-in-salem/` (see Crawling & Indexing). Separately, the 3 pages missing from the sitemap (privacy policy, terms, vasool-app about) may still be linked from site navigation/footer — this audit could not confirm either way — but their sitemap omission alone weakens their discovery signal regardless of internal linking status. | True orphan pages (no internal links, not in sitemap) are effectively invisible to efficient crawling and receive no internal link equity. | Fix the dead orphan via redirect (see above); confirm the 3 sitemap-missing pages are linked in global nav/footer, and add them to the sitemap regardless. | Medium |
| Website Architecture | The site is a shallow, mostly flat structure: home, `/services/` index, 12 flat service URLs, `/about/`, `/contact/`, `/blog/` + 5 posts, `/jhb-automation-tools/`, and `/products/vasool-app/` (+ `/about/`) — 24 URLs total, easy for crawlers to reach everything in 1–2 clicks from home. | Shallow architecture is generally favorable for crawl efficiency and link-equity flow on a site this size. | No issue found on architecture depth — no action needed. | — |
| Website Architecture | **Confirmed in code**: the shared CMS SEO pipeline (`jhb_seo` table) only governs metadata for 3 paths (`/`, `/services`, `/blog`); every other page type (12 service pages, blog posts, products, about, legal) manages its own separate metadata fields outside that shared editor. `buildMetadata()` never emits a `twitter` block on any page, and on a database miss skips `openGraph` entirely, falling back to root layout defaults. `/contact` has fully hardcoded static metadata with no page-specific Open Graph override at all. | Fragmented metadata governance means SEO fixes (like adding Twitter Card tags) have to be made in multiple places instead of once, increasing the chance of inconsistency and pages silently falling back to generic defaults on data misses. | Consolidate metadata handling behind one shared function/editor for all page types; add a `twitter` block to `buildMetadata()`; give `/contact` CMS-editable metadata and a page-specific OG image. | Medium |
| Content Depth (Thin Content) | 4 of 12 service pages are notably thin relative to their 8 siblings (which run 1000+ words with FAQ sections): `/digital-marketing-in-salem/` (334 words, H1 "Digital Marketing" — drops the "Salem" the URL promises), `/social-media-marketing-agency/` (281 words — thinnest page on the site, H1 "Social Media Marketing" drops "Agency"), `/software-customization/` (339 words, H1 has no location qualifier), and `/app-development/` (1031 words, not thin by word count, but its H1 "App Development" lacks the location/qualifier language its 8 siblings use). These 4 pages also lack the FAQ sections (and therefore the FAQPage schema) present on the other 8. | Thin, generically-titled pages compete weakly for local-intent commercial keywords — the SERP snapshots for equivalent local searches (e.g. "digital marketing company in salem," "social media marketing company in salem") show ranking competitors with substantially more developed pages. Mismatched H1/URL intent also weakens on-page relevance signals for the exact local-modifier terms these URLs were built to target. | Expand each of the 4 thin pages to match the depth of the other 8 (1000+ words); align H1s with the intent already present in the URL/title (add "Salem," "Agency," etc. as applicable); add an FAQ section to each, both for user value and to pick up the FAQPage schema pattern (correctly de-duplicated per the fix above). | High |
| Google Search Console | **Confirmed in code**: zero verification tags (GSC, Bing, etc.) present anywhere in source — GSC is not installed on the live site. | Without GSC there is no visibility into actual indexing status, real search impressions/CTR/position data, crawl errors, or the Mobile Usability and Core Web Vitals (field data) reports — most of this audit's technical findings currently can only be diagnosed via manual crawling rather than Google's own data. | Verify the domain in Google Search Console (and Bing Webmaster Tools) immediately; submit the sitemap; this is a first-30-day priority that unlocks ongoing monitoring for everything else in this table. | High |
| Google Analytics 4 | **Confirmed in code**: zero `gtag`/GTM tags present anywhere in source — GA4 is not installed on the live site. | No traffic, conversion, channel, or on-site behavior data is currently being collected at all; SEO and content decisions are being made without any measurement of what's actually working. | Install GA4 (directly or via GTM) sitewide, including key event/conversion tracking for contact form submissions, phone clicks, and WhatsApp/chat interactions; first-30-day priority alongside GSC. | High |

## 3. On-Page SEO Audit

**Method note:** Sitewide constants that are identical or near-identical across most pages — NAP presence, `LocalBusiness`/`ProfessionalService` JSON‑LD, the absence of editorial outbound links, the absence of trust-signal content outside the homepage, and the shared alt-text infrastructure gap — are documented once in §3.8 rather than repeated in all 17 page entries. Each page entry below calls out only what is page-specific. All current titles, descriptions, H1s, word counts and link/image counts are taken directly from the live-HTML crawl (`page-signals-final.json`); anything not directly measurable this session (exact search volume, exact keyword difficulty) is labeled "estimated" and reasoned from the live SERP/competitor data in the evidence pack.

### 3.1 Homepage (`/`)

**Current state**
- Title: "JHB Automations — Best IT Company & Digital Marketing in Salem" (62 chars)
- Meta description: "JHB Automations is a top IT company offering IT Solutions, AI Automation & Digital Marketing in Salem. Data-driven strategies that deliver results." (147 chars)
- H1: "Grow Your Business with the Best IT Company & Digital Marketing Services in Salem"
- H2/H3: 11 / 21 — well structured
- Word count: 3,360 (by far the deepest page on the site)
- Images: 87, 1 missing alt (excellent ratio)
- Internal links: 50 total / 24 unique — the site's primary link hub
- Schema: `Organization`, `WebSite`, `FAQPage`, `["LocalBusiness","ProfessionalService"]`
- Search intent: mixed navigational + broad local-commercial ("IT company / digital marketing agency in Salem")

**Audit notes**
- **Verified technical bug (checked directly against `home.html` source):** the homepage's rendered `<head>` contains `og:title`, `og:description`, `og:url` and `og:type`, but **no `og:image` tag at all**. Separately, it *does* emit a Twitter Card, but with **different, generic content** — `twitter:title` = "JHB Automations — Intelligent AI Automation" and `twitter:description` = "Transform your business with intelligent AI automation, web development and data-driven growth," neither of which matches the page-specific OG title/description. Net effect: shares of the single most-linked, most-likely-to-be-shared URL on the site (Facebook, LinkedIn, WhatsApp) will render with **no preview image**, and any platform that does read the Twitter Card shows mismatched copy. This is a real, verified defect, not a guess.
- Content quality/depth is the strongest on the site (3,360 words, 11 H2s, 21 H3s) and testimonial/"trusted by"/review content is present (confirmed via direct text search) — the homepage carries essentially all of the site's on-page trust signal.
- **Cannibalization risk (Medium‑High):** the page's own `keywords` meta list stacks nearly every service page's target phrase ("Digital Marketing Salem," "IT Solutions Salem," "AI Automation Agency Salem," "Website Development Salem," "SEO Salem," "Chatbot Development Salem," etc. — 18 terms total). The meta-keywords tag itself carries no ranking weight, but it's an honest signature of what the on-page copy is actually chasing, and the H1 phrasing ("Best IT Company & Digital Marketing Services in Salem") sits directly on top of `/digital-marketing-in-salem/`'s intended territory. See §3.8 cannibalization matrix.

**Recommended**
- Title: keep as-is — already keyword-front-loaded and at the practical length ceiling (62 chars); no material gain from churning it.
- Meta description (rewrite for a sharper CTA and less boilerplate close): *"Salem-based IT & digital marketing agency — AI automation, web development, SEO, CRM and more. Get a free growth strategy call today."* (≈150 chars)
- H1: keep as-is.
- Slug: keep `/`.
- Primary keyword: **"IT company in Salem"** — the broader umbrella term the homepage's own keyword list and title already lean toward, deliberately distinct from the dedicated marketing pillar (below).
- Secondary keywords: "digital marketing agency Salem," "AI automation company Salem," "website development company Salem," "best IT company Tamil Nadu."
- Content structure: (1) fix the `og:image` gap and align the Twitter Card to the page-specific OG copy — this is a one-line code/CMS fix with outsized value given the page's link volume; (2) tighten each of the 12 service tiles' anchor text to the exact long-tail phrase of the page it links to, reinforcing the hub-and-spoke model and reducing overlap with the dedicated service pages rather than duplicating their language.

### 3.2 Services Index (`/services/`)

**Current state**
- Title: "Our Services — JHB Automations" (30 chars)
- Meta description: "Explore our full range of AI automation, web development, marketing and growth services." (88 chars — shortest on the site)
- H1: "Our Services"
- H2/H3: 13 / 0
- Word count: 356
- Images: 2, 0 missing alt
- Internal links: 43 total / 21 unique — second-highest raw link count on the site (it's the index page linking to all 12 services)
- Schema: `Organization`, `WebSite`, `BreadcrumbList`, `["LocalBusiness","ProfessionalService"]` (correctly no `FAQPage`/`Service` — it's an index)
- Search intent: navigational/hub

**Audit notes** — Zero keyword signal anywhere: generic title, the shortest meta description on the entire site, no location or category term in the H1. With 13 H2s carrying only 356 words total (≈27 words per section), the page reads as a pure tile grid — service names and one-line blurbs, no real hub copy. That's a real gap given this is the natural landing page for broad "what does JHB do" and "digital marketing services Salem" queries, and it's the densest internal-link page after the homepage — its current thinness under-delivers on that link equity.

**Recommended**
- Title: "Digital Marketing & IT Services in Salem — JHB Automations" (≈60 chars)
- Meta description: *"Explore JHB Automations' services — SEO, web development, AI chatbots, CRM automation, SEM and social media marketing for businesses in Salem and across India."* (≈160 chars)
- H1: "Digital Marketing, Web Development & AI Automation Services in Salem"
- Slug: keep `/services/`.
- Primary keyword: **"digital marketing and IT services in Salem"** — deliberately hub-level and distinct from any single service page's commercial head term.
- Secondary keywords: "IT services company Salem," "AI automation services," "web development and SEO services India."
- Content structure: add a 150–250 word intro above the grid (who JHB serves, overall capability); replace generic tile CTAs with a genuine 2–3 sentence description per service using that page's own target keyword — this simultaneously improves the index page's own relevance and passes precise topical anchor text to each of the 12 service pages.

### 3.3 Service Pages — Portfolio Pattern

Twelve service pages exist. Eight are well-built (1,000–1,600 words, keyword-matched H1s, dual `FAQPage` schema — the duplicate-schema issue itself is flagged as a technical fix, see §2). Four share an unmistakable "template default, never customized" signature: bare, location-less H1s, a near-identical 3-term boilerplate `keywords` meta (`"{Service},JHB Automations,digital marketing Salem"` — note "digital marketing Salem" is irrelevant to three of these four services, a tell it was never edited), word counts of 281–339, and **no FAQ content/schema at all** where the other eight have it. These four get the most substantial rework recommendations below, as requested.

#### 3.3.1 `/digital-marketing-in-salem/` — highest-leverage opportunity on the site

**Current state**
- Title: "Digital Marketing — JHB Automations" (35 chars)
- Meta description: "We orchestrate SEO, paid, social and content into one cohesive, data-driven growth engine — delivering consistent, measurable results across every channel." (155 chars)
- H1: "Digital Marketing" (bare)
- Word count: **334** — one of the two thinnest service pages
- Images: 2, 0 missing alt
- H2/H3: 5 / 4
- Internal links: 36 / 21 unique
- Schema: `Organization`, `WebSite`, `Service`, `BreadcrumbList`, `["LocalBusiness","ProfessionalService"]` — **no `FAQPage`**
- Search intent: local-commercial ("digital marketing company in Salem")

**Audit notes:** The URL slug already contains the *exact*, SERP-verified head phrase — live SERP data for "digital marketing company in salem" shows JHB not visible in the top results at all, while local competitors as low as DA6–16 (reachoutmarketing.co.in, appexive.com, lamdasoft.in) rank. Yet the title, H1 and meta description all strip the location signal out, and the page is barely a third the depth of its healthy siblings. This is simultaneously the biggest content gap on the site and the clearest keyword-to-URL match not being exploited. It also directly overlaps with the Homepage's positioning (§3.8) — the fix is to make this page the dedicated pillar for the phrase while the homepage recedes to its broader "IT company" umbrella.

**Recommended**
- Title: "Digital Marketing Company in Salem — JHB Automations" (≈54 chars)
- Meta description: *"JHB Automations is a full-service digital marketing company in Salem offering SEO, SEM, social media and content marketing that turns visitors into customers."* (≈158 chars)
- H1: "Digital Marketing Company in Salem That Builds a Complete Growth Engine"
- Slug: keep `/digital-marketing-in-salem/` — already an ideal exact match, do not change.
- Primary keyword: **"digital marketing company in Salem"**
- Secondary keywords: "digital marketing agency Salem," "digital marketing services India," "online marketing company Salem."
- Content structure: expand 334 → 1,200+ words: (1) scope-defining intro, (2) a genuine paragraph on each of the five channel sub-services with internal links to the dedicated pages (SEO, SEM, social, content, influencer) — turning this into the marketing-cluster's pillar/hub, (3) methodology/process section, (4) an FAQ block (currently absent — add 5–6 questions: "What does a digital marketing company do?", "How much does digital marketing cost in Salem?", "How long until I see results?").

#### 3.3.2 `/social-media-marketing-agency/` — thinnest page on the site

**Current state**
- Title: "Social Media Marketing — JHB Automations" (40 chars)
- Meta description: "We grow your presence across every platform with scroll-stopping content, community management and targeted campaigns that build a loyal, buying audience." (154 chars)
- H1: "Social Media Marketing" (bare — URL says "Agency," H1 doesn't)
- Word count: **281 — the thinnest service page on the site**
- Images: 2, 0 missing alt
- H2/H3: 4 / 0 — zero H3s, the shallowest structure of any service page
- Internal links: 36 / 21 unique
- Schema: no `FAQPage`
- Search intent: local-commercial ("social media marketing company in Salem")

**Audit notes:** For a naturally content-rich, visual category, 281 words with zero H3-level structure is a real deficiency — SERP data for "social media marketing company in salem" shows even DA4–19 local sites (appexive.com, academy.infozub.com) ranking in a field this page currently can't compete in structurally. As content is added, its scope should be explicitly separated from `/influencer-marketing-agency/` (organic/paid social management vs. creator/influencer partnerships) to prevent future cannibalization once both pages are built out.

**Recommended**
- Title: "Social Media Marketing Company in Salem — JHB Automations" (60 chars)
- Meta description: *"JHB Automations is a social media marketing agency in Salem running content, campaigns and community management that turn followers into customers."* (≈153 chars)
- H1: "Social Media Marketing Company in Salem That Builds a Loyal, Buying Audience"
- Slug: keep `/social-media-marketing-agency/`.
- Primary keyword: **"social media marketing company in Salem"**
- Secondary keywords: "social media marketing agency India," "Instagram and Facebook marketing services," "social media management company Salem."
- Content structure: expand 281 → 900–1,200 words: platform-by-platform breakdown (Instagram/Facebook/LinkedIn/YouTube), organic-vs-paid distinction, content/community process, an explicit scope note distinguishing it from influencer marketing, and an FAQ block.

#### 3.3.3 `/software-customization/`

**Current state**
- Title: "Software Customization — JHB Automations" (40 chars)
- Meta description: "We customize, extend and integrate the tools you already use — building features, automations and connections that mould your software to your business, not the other way around." (178 chars — near the ceiling for usable length)
- H1: "Software Customization" (bare)
- Word count: **339**
- Images: 2, 0 missing alt
- H2/H3: 5 / 4
- Schema: no `FAQPage`
- Search intent: B2B commercial (no direct SERP snapshot available for this term — treat competition as **estimated**, reasoned from category rather than measured)

**Audit notes:** Unlike the other three thin pages, this service is not inherently a "search near me" category — customization/integration work is typically sourced by referral or a broader B2B search, so there's no direct evidence this specific page is losing to a named local competitor. That doesn't excuse the thinness or the boilerplate H1/title (the `keywords` meta even carries the irrelevant "digital marketing Salem" boilerplate, confirming it was never edited).

**Recommended**
- Title: "Software Customization Services in India — JHB Automations" (≈61 chars)
- Meta description: *"JHB Automations customizes, extends and integrates the business software you already use — CRM, ERP and workflow tools tailored to how your team works."* (≈157 chars)
- H1: "Software Customization Services That Mould Your Tools to Your Business"
- Slug: keep `/software-customization/` — no location suffix needed; this isn't a hyper-local search category on current evidence.
- Primary keyword: **"software customization services"** *(estimated priority — no SERP or volume data available for this term this session)*
- Secondary keywords: "CRM and ERP customization India," "software integration services," "custom software development company Salem."
- Content structure: expand 339 → 900+ words: what "customization" covers (CRM/ERP/workflow/API integrations), process, 2–3 concrete use-case scenarios (this is the most abstract service on the site — concrete examples do the most work here for both users and E‑E‑A‑T), and an FAQ block.

#### 3.3.4 `/app-development/`

**Current state**
- Title: "App Development — JHB Automations" (33 chars)
- Meta description: "We design and build fast, beautiful mobile apps for iOS and Android — with seamless UX, robust backends and the automation that keeps users engaged." (148 chars)
- H1: "App Development" (bare)
- Word count: **1,031** — respectable, *not* actually thin
- Images: 8, 0 missing alt
- H2/H3: 7 / 9
- Internal links: 36 / 21 unique
- Schema: no `FAQPage` (only the 4 flagged pages lack it)
- Search intent: local-commercial ("app development company in Salem")

**Audit notes:** This page's gap is positioning, not depth. Content is on par with the eight healthy siblings, but title/H1/meta all omit the location qualifier every high-performing sibling carries, and there's no FAQ block. Live SERP data for "app development company in salem" shows real local competitors ranking (pepytechnologies.com, sieora.in DA16, adhocsoftwares.com DA16) while JHB is absent — a plausible contributing factor is exactly this missing local signal.

**Recommended**
- Title: "App Development Company in Salem — JHB Automations" (52 chars)
- Meta description: *"JHB Automations is a mobile app development company in Salem building fast iOS and Android apps with automation-ready backends for businesses across India."* (≈159 chars)
- H1: "App Development Company in Salem Building Apps That Scale With Your Business"
- Slug: keep `/app-development/` — already indexed with this path via the legacy redirect chain (see §2); no reason to churn it.
- Primary keyword: **"app development company in Salem"**
- Secondary keywords: "mobile app development company Salem," "iOS and Android app developers India," "custom app development services."
- Content structure: add a 5–7 question FAQ block matching the sibling pattern; add at least one portfolio/proof point (screenshots, a result), since the page currently has zero visible trust signal.

#### 3.3.5–3.3.12 The Eight Developed Service Pages

These are already well-targeted and reasonably deep; the table below captures current state, and prose notes below it flag only what genuinely needs fixing per page (full detail on identical sitewide issues — duplicate `FAQPage` schema, missing alt text infrastructure — lives in §3.8/§2 rather than repeated eight times).

| Page | Title (len) | Desc (len) | H1 | Words | Imgs (no-alt) |
|---|---|---|---|---|---|
| `/ai-chatbot-development-company/` | "AI Chatbot Development Company in Salem — JHB Automations" (57) | 151 | "AI Chatbot Development Company in Salem That Engages Visitors and Captures Leads 24/7" | 1,559 | 4 (1) |
| `/artificial-intelligence-automation-agency/` | "Artificial Intelligence Automation Agency — JHB Automations" (59) | 154 | "Artificial Intelligence Automation Agency That Runs Your Business Smarter" | 1,163 | 4 (1) |
| `/content-marketing-services/` | "Content Marketing Services in Salem — JHB Automations" (53) | 156 | "Content Marketing Services in Salem That Build Authority and Drive Growth" | 1,325 | 5 (2) |
| `/ecommerce-website-development-company/` | "Ecommerce Website Development Company \| JHB Automations" (55) | 156 | "Ecommerce Website Development Company in Salem, Tamil Nadu" | 1,330 | 4 (1) |
| `/influencer-marketing-agency/` | "Influencer Marketing Agency in Salem & India — JHB Automations" (62) | 178 | "Influencer Marketing Agency in Salem & India" | 842 | 4 (1) |
| `/search-engine-optimization-agency-in-india/` | "Search Engine Optimization Agency in India — JHB Automations" (60) | **191** | "Search Engine Optimization Agency in India Trusted by Salem Businesses" | 1,231 | 4 (1) |
| `/sem-company/` | "SEM Company in Salem for Real Business Leads — JHB Automations" (62) | 160 | "SEM Company in Salem That Puts Your Business in Front of Ready-to-Buy Customers" | 1,397 | 4 (1) |
| `/website-design-company-in-salem/` | "Website Design Company in Salem — JHB Automations" (49) | 179 | "Trusted Website Design Company in Salem for Fast, SEO-Ready Websites" | 1,005 | 3 (0) |

**Per-page fixes and keyword recommendations:**

- **`/ai-chatbot-development-company/`** — title/H1/meta already well-aligned; no change needed. Primary keyword: **"AI chatbot development company in Salem"** (already matches). Secondary: "WhatsApp chatbot development India," "AI chatbot development services," "conversational AI for business Salem." Only fix: the 1 missing alt tag and the duplicate `FAQPage` schema (technical fix).

- **`/artificial-intelligence-automation-agency/`** — good depth, but title/H1 lack a location qualifier while chasing "AI automation agency," a term the SERP evidence shows is dominated nationally by DA28–35 specialists (automationagencyindia.com, infyom.com) — not realistically winnable head-on at JHB's current DA11. Recommended title: "AI Automation Company in Salem — JHB Automations" (50 chars); H1: "AI Automation Company in Salem That Runs Your Business Smarter." Primary keyword: **"AI automation company in Salem"** (repositioned local variant); secondary: "artificial intelligence automation agency India" (aspirational long-tail), "business process automation services." Slug: the current 44-character slug is long but changing it is *optional/low-priority* — only bundle with a broader IA cleanup, not in isolation, per the instruction against needless slug churn.

- **`/content-marketing-services/`** — well-targeted (title/H1/meta all fine). Primary keyword: **"content marketing services in Salem"** (matches). Secondary: "content marketing agency India," "SEO content writing services." Only fix: 2 missing alts (the worst ratio among service pages) and duplicate FAQ schema.

- **`/ecommerce-website-development-company/`** — the only service page using a "`|`" pipe separator instead of the "—" em dash used by all 11 others (a minor brand-consistency inconsistency, not a ranking factor). Recommended title: "Ecommerce Website Development in Salem — JHB Automations" (≈59 chars) to both standardize the separator and add the Salem qualifier that's currently in the H1 but not the title. Primary keyword: **"ecommerce website development company in Salem"** (matches H1). Secondary: "Shopify/WooCommerce development Salem," "online store development company India." Fix: 1 missing alt, duplicate FAQ schema.

- **`/influencer-marketing-agency/`** — good title/H1 alignment, but its 178-character meta description is the **longest among the developed pages** and will very likely be truncated by Google (typical cutoff ≈155–160 chars desktop). Recommended trim: *"JHB Automations is a results-driven influencer marketing agency in Salem and India, connecting brands with vetted creators for measurable revenue growth."* (≈158 chars). Primary keyword: **"influencer marketing agency in Salem"**. Secondary: "influencer marketing agency India," "creator marketing services," "micro-influencer campaigns India." Fix: 1 missing alt, duplicate FAQ schema; optionally deepen from 842 words with a campaign-process section.

- **`/search-engine-optimization-agency-in-india/`** — 1,231 words of good content, but its **191-character meta description is the longest on the entire site** and will be heavily truncated. Keyword targeting is currently split between "in India" (national, per SERP evidence a genuinely harder field — orangemantra.com DA70-class competitors show up for adjacent national terms) and "SEO Company in Salem" (buried in the `keywords` meta, but the actual winnable local term per live SERP data — DA6–23 local competitors rank for it). Recommended title: "SEO Company in Salem — JHB Automations" (39 chars); meta: *"JHB Automations is a trusted SEO company in Salem helping businesses rank higher, get more traffic and convert visitors into customers across India."* (152 chars); keep the existing H1 as-is (it already blends both terms well: "...Trusted by Salem Businesses"). Primary keyword: **"SEO company in Salem"**; secondary: "search engine optimization agency India," "SEO services India," "local SEO Salem." Slug: the current 46-character slug is the longest on the site; a shorter `/seo-company-in-salem/` is worth considering **only** alongside this retarget and with a proper 301, not as standalone churn — flagged Low priority.

- **`/sem-company/`** — strong page (1,397 words, well-targeted). The one structural risk: SEM (paid search/Google Ads) is easily confused with SEO by users and by topical clustering if the copy doesn't explicitly differentiate the two — recommend verifying/adding an explicit "SEM vs. SEO" clarifying paragraph with a cross-link to the SEO page. Primary keyword: **"SEM company in Salem"** (matches). Secondary: "PPC agency Salem," "Google Ads management company India," "paid search marketing services." Fix: 1 missing alt, duplicate FAQ schema.

- **`/website-design-company-in-salem/`** — strong, well-targeted, and the only developed service page with **zero** missing alt text. Its 179-character meta description is near the same truncation risk as the SEO/influencer pages. Recommended trim: *"JHB Automations is a trusted website design company in Salem building custom, SEO-ready, mobile-friendly websites that convert visitors into customers."* (≈157 chars). Primary keyword: **"website design company in Salem"** (exact SERP match). Secondary: "web development company Salem," "website development company India," "affordable website design Salem."

### 3.4 About (`/about/`)

**Current state**
- Title: "About Us — JHB Automations" (26 chars)
- Meta description: "We help businesses automate operations, generate leads and scale faster with intelligent AI systems, web development and data-driven marketing." (143 chars)
- H1: "We Build the Automated Future of Business" (a brand tagline, not descriptive)
- Word count: 362
- Images: 2, 0 missing alt
- Internal links: 31 / 21 unique
- Schema: `Organization`, `WebSite`, `BreadcrumbList`, `["LocalBusiness","ProfessionalService"]` (correctly no `FAQPage`)
- Search intent: informational/trust

**Audit notes:** An About page's job is primarily E‑E‑A‑T weight, not commercial keyword competition, and this one under-delivers on that job: 362 words with no observed credential, founding-date, team, or award language (verified — a targeted search for "testimonial / trusted by / years of experience / founded / award" across this page returned **zero matches**). This dovetails with a confirmed code-level finding: the site's author/publisher schema system (`AuthorPublisherEditor`) exists but defaults to empty bio fields, so E‑E‑A‑T signals are structurally present but thin unless someone fills them in — and About is exactly the page where that content belongs.

**Recommended**
- Title: "About JHB Automations — Digital Marketing Agency in Salem" (≈60 chars)
- Meta description: *"Meet JHB Automations — a Salem-based digital marketing and AI automation agency. Learn our story, our approach and why businesses trust us to grow."* (≈151 chars)
- H1: keep the brand tagline as the hero line, but add a visible descriptive subheading directly beneath it ("A Salem-based team building automation, marketing and websites that compound") to carry the keyword/location signal the pure-tagline H1 doesn't.
- Slug: keep `/about/`.
- Primary keyword: **"about JHB Automations Salem"** — branded/informational, deliberately not a commercial head term (those belong to the service pages).
- Secondary keywords: "AI automation agency Salem team," "digital marketing agency Salem story."
- Content structure: expand 362 → 700–900 words with founder/team names, roles and credentials (this is what actually populates the existing-but-empty author schema), founding date, mission/methodology, and at least one concrete trust element (client count, industries served, notable outcome).

### 3.5 Contact (`/contact/`)

**Current state**
- Title: "Contact Us — JHB Automations" (28 chars)
- Meta description: "Get in touch. Tell us about your goals and we'll map the fastest path to automated, predictable growth." (103 chars)
- H1: "Let's Start Your Growth Story" (tagline, not descriptive)
- Word count: 283
- Images: 2, 0 missing alt
- Internal links: 31 / 21 unique
- H2/H3: 2 / 0
- Schema: `Organization`, `WebSite`, `BreadcrumbList`, `["LocalBusiness","ProfessionalService"]`
- Search intent: navigational/local

**Audit notes:** Per a confirmed code-level finding, `/contact/` is the **only page on the entire site with fully hardcoded, non-CMS-editable metadata** and no page-specific Open Graph override — meaning this copy cannot be updated without a code deploy, and any shared link to `/contact/` falls back to generic site-wide OG content. NAP (address + phone) is confirmed present sitewide via the footer, including an embedded Google Maps iframe and direct "get directions"/"search on maps" links — a genuinely strong baseline local signal that this page, as the most logical landing point for local-intent and knowledge-panel traffic, should surface prominently rather than only in the footer.

**Recommended**
- Title: "Contact JHB Automations — Salem, Tamil Nadu" (44 chars)
- Meta description: *"Contact JHB Automations in Salem for AI automation, digital marketing and web development. Call, WhatsApp or book a free consultation — we reply fast."* (≈154 chars)
- H1: keep the conversion-oriented tagline, but add a visible "Contact JHB Automations in Salem" line adjacent to the NAP block.
- Slug: keep `/contact/`.
- Primary keyword: **"contact JHB Automations Salem"** — branded/local-intent, not a competitive commercial term.
- Secondary keywords: "digital marketing agency Salem phone number," "JHB Automations address Salem."
- Content structure: move this page onto the CMS-driven metadata pipeline (technical fix, cross-ref §2) so copy is editable without a deploy; add explicit business hours and service-area text ("Serving Salem, Erode, Namakkal, Dharmapuri and Attur"); confirm the map/NAP block renders above the fold, not only in the footer.

### 3.6 Blog Index (`/blog/`)

**Current state**
- Title: "Blog — JHB Automations" (22 chars — shortest title on the site)
- Meta description: "Insights on AI automation, digital marketing, SEO and business growth from the JHB Automations team." (100 chars)
- H1: "The Blog"
- Word count: 417
- Images: 8, 1 missing alt
- Internal links: 40 total / **26 unique — the most unique internal links of any non-home page**, reflecting the post listing
- Schema: `Organization`, `WebSite`, `["LocalBusiness","ProfessionalService"]` (correctly no `FAQPage`/`Service`)
- Search intent: informational hub

**Audit notes:** Functional but topically empty — the title and H1 carry zero keyword or category signal, missing the chance to rank for informational head terms ("digital marketing blog," "AI automation blog India") that could pull top-of-funnel traffic into the site. A confirmed code-level finding adds a guardrail risk here: if the blog hero block is ever disabled in the admin, this page has **no fallback H1 at all**.

**Recommended**
- Title: "Digital Marketing & AI Automation Blog — JHB Automations" (58 chars)
- Meta description: *"Insights on AI automation, digital marketing, SEO, web development and business growth — practical guides from the JHB Automations team in Salem."* (≈151 chars)
- H1: "Digital Marketing & AI Automation Insights" (replacing the bare "The Blog")
- Slug: keep `/blog/`.
- Primary keyword: **"digital marketing and AI automation blog"** — informational, low-competition, built to support topical authority feeding the commercial pages.
- Secondary keywords: "AI automation guides India," "SEO tips Salem businesses," "business automation blog."
- Content structure: add a 100–150 word intro above the post grid stating scope/expertise (mirrors the same hub-page gap as `/services/`); fix the 1 missing alt.

### 3.7 Blog Posts (group summary — full blog strategy covered in its own section)

| Post | Title (len) | Word count | Notable |
|---|---|---|---|
| `what-is-ai-automation` | "What Is AI Automation? A Complete Guide for Modern Businesses \| JHB Automations" (79) | 2,263 | Longest title on the site (79 chars — will truncate in SERPs); 32 H2s, very deep sectioning |
| `the-future-of-web-development-in-2026-is-your-website-ready-for-ai-search` | "Future of Web Development in 2026: Is Your Website AI-Ready?" (60) | 2,553 | Deepest post by word count |
| `why-your-business-needs-a-strong-seo-strategy` | "Why Your Business Needs SEO \| SEO Company in Salem" (50) | 2,213 | Title explicitly cross-promotes the SEO service page — good topical-cluster signal |
| `ai-chatbots-vs-human-support` | "AI Chatbots vs Human Support: Which Wins for You?" (49) | 1,736 | Title/H1 mismatch — H1 is the longer "...Which Customer Support Strategy Delivers Better Business Results?"; worth aligning |
| `digital-marketing-services-for-business-growth-online-success` | "Digital Marketing Services for Business Growth & Online Success" (63) | 1,349 | Meta description is **258 characters — by far the longest on the site**, will be heavily truncated; raw crawl also shows an anomalous H1 count of 14, most likely stray `<h1>`-styled body text from the rich-text editor rather than genuine duplicate headings — flagged for manual verification in the CMS, not confirmed as a true multi-H1 defect |

All five posts share: single (not duplicated) `BlogPosting` + `FAQPage` + `BreadcrumbList` schema, 24 unique internal links each (healthy cross-linking back to the money pages), and **zero missing alt text** across all five — the best alt-text compliance of any page group on the site. E‑E‑A‑T note: author schema exists but, per the confirmed code finding, defaults to a bare name with no bio/credentials unless populated per post — none of the five posts showed a populated author bio in this crawl.

### 3.8 Cross-Cutting On-Page Findings

**Keyword cannibalization matrix**

| Pages | Overlapping term | Risk | Recommendation |
|---|---|---|---|
| Home vs. `/digital-marketing-in-salem/` | "digital marketing (company) in Salem" | Medium–High — both currently under-target it, from opposite directions | Home keeps the broader "IT company in Salem" umbrella; make `/digital-marketing-in-salem/` the dedicated pillar (§3.3.1) |
| Home vs. `/services/` | "digital marketing & IT services in Salem" | Low–Medium | Give `/services/` distinct hub-level phrasing (§3.2) |
| `/search-engine-optimization-agency-in-india/` vs. `/sem-company/` | "search engine [optimization/marketing]" root | Low, contingent on explicit differentiation | Add an explicit "SEM vs. SEO" clarifying paragraph with cross-link |
| `/social-media-marketing-agency/` vs. `/influencer-marketing-agency/` | "social"/"influencer" overlap | Low today, rising as the thin page is expanded | Explicitly scope each (organic/paid social management vs. creator partnerships) as content grows |
| `/website-design-company-in-salem/` vs. `/ecommerce-website-development-company/` | "website development company" | Low — already well-differentiated | Preserve the current split as both pages are expanded further |

**Trust signals.** Testimonial/"trusted by"/review content was confirmed present on the **homepage only** — a targeted search across `/ai-chatbot-development-company/`, `/sem-company/`, `/digital-marketing-in-salem/`, `/software-customization/`, `/about/`, `/contact/` and `/services/` returned zero matches on every one. That means every page except home currently asks a visitor to trust JHB with no on-page social proof, despite these being exactly the pages most likely to receive direct organic-search landing traffic. Recommend a shared, reusable client-logo strip or 1–2 pull-quote testimonials templated across the service pages rather than hand-authored per page.

**E‑E‑A‑T.** The author/publisher schema system exists (confirmed in code) but defaults to empty bio fields; none of the five blog posts showed a populated author bio in this crawl, and `/about/` — the natural home for founder/team credentials — is only 362 words with no observed experience/credential language. Priority fix: populate at least one real author profile and expand About with founding story, named team/roles, and any certifications or partnerships actually held (not confirmed either way this session — verify and disclose only if genuinely held).

**Local SEO signals.** NAP (DNO 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti, Salem, Tamil Nadu 636004; +91 97918 22718) is confirmed present sitewide via the footer, alongside an embedded Google Maps iframe, direct "get directions"/"search on maps" links, and opening-hours schema — a strong, consistent baseline. `LocalBusiness`/`ProfessionalService` JSON‑LD is emitted globally on all 24 pages (confirmed), which is correct but non-differentiating — the local signal that actually matters is "in Salem" language **in the title/H1/body copy of each commercial page**, which is precisely what's missing on the four thin pages. This is the throughline connecting the site's solid technical local-schema foundation to its on-page content weakness. No Tamil-language local content was found (consistent with the single-locale code configuration) — noted only as a future option, not a current gap.

**Image ALT text.** A dedicated alt-text library exists in code (with min/max length validation) but, per a confirmed code-level finding, is only actually wired into 3 pages (home hero/about image, tools hub) — the missing-alt counts observed across the service pages (typically 1, up to 2 on `/content-marketing-services/`) trace to this infrastructure gap rather than inconsistent per-page authoring. Two `alt=""` values are hardcoded directly in the shared `ServiceDetail.jsx` component (a feature-card image and an avatar image), meaning no content editor can fix those two specific images without a code change. Fix the infrastructure before asking editors to backfill alt text page-by-page.

**CTAs.** Sampled CTA link text (verified on `/software-customization/`: "Contact Us," "Visit Us," "Why Choose Us") is generic and repeated sitewide, with no service-specific or urgency-driven variants observed (e.g., "Get a Free SEO Audit," "Book a Chatbot Demo"). Given how strong the keyword-to-content match already is on the eight developed pages, service-specific CTA copy tied to each page's offer is a low-effort, template-level change with outsized conversion upside.

**External/outbound links.** Verified via direct inspection of `home.html` and `/digital-marketing-in-salem/`: the only non-`jhbautomations.com` outbound links present are the Google Fonts CDN (a render-blocking resource, not a content link), the brand's own Instagram profile, direct links to raw Supabase-hosted image files, and Google Maps direction/search links (a genuinely valuable local-SEO utility link). **Zero editorial outbound links** to third-party authoritative sources — industry statistics, published research, tool documentation — were found on either page sampled. This is a real, fixable content-quality/E‑E‑A‑T gap: even one or two well-chosen outbound citations per page (e.g., sourcing a cited statistic) measurably strengthens topical trust signals with no technical risk.

## 4. Keyword Research

**Methodology and data-availability note:** Ubersuggest's keyword-volume tools (`keyword_overview`, `keyword_suggestions`, `domain_keywords`) hit the free-tier 3-report/day cap during evidence collection, so **exact search volumes and difficulty scores are not available this session** and are not invented below. Priority and competition level are instead reasoned from the real data that *was* captured: seven live India-location SERP snapshots showing actual ranking domains and Domain Authority (DA) scores, the auto-detected competitor set, and JHB's own DA of 11. Two facts anchor every priority call in this section: (1) **jhbautomations.com does not appear in the visible top 10–16 results for any of the 7 money keywords tested** — there is currently nothing to protect, only ground to gain; (2) Salem-local SERPs are genuinely winnable (local packs and organic results are dominated by DA4–27 local firms, with only occasional DA55–99 directory/aggregator noise), while national-scope variants of the same themes (e.g. "ai automation agency in india," "crm development company in india") pull in DA20–70 specialists that a DA11 generalist site cannot realistically out-rank in the near term. That local-vs-national split drives most of the priority reasoning below. Per the brief, no job/vacancy/internship/salary/course-type keywords are included anywhere, and no location pages are recommended for cities JHB has no evidence of serving.

### 4.1 Primary keywords (head terms — core business, local + commercial intent)

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conversion potential |
|---|---|---|---|---|---|---|---|
| digital marketing company in salem | Commercial/Local | `/` (Home) | Homepage title/H1/hero copy | Salem | Local pack: octadigi.com, firstsuccesstechnologies.in, vfmdigitalmarketing.com; organic field mostly DA4–22 (foxdigitaltech.com DA10, appexive.com DA4, lamdasoft.in DA7) with justdial.com (DA60) and LinkedIn (DA99) as unavoidable noise, not true competitors | High | High |
| digital marketing agency in salem | Commercial/Local | `/services/` | Services hub page | Salem | Same SERP family as above | High | High |
| seo company in salem | Commercial/Local | `/search-engine-optimization-agency-in-india/` | Service page | Salem | Local pack: firstsuccesstechnologies.in, octadigi.com, vijayseo.in; organic includes maniseo.com (DA8), seoanalyst.in (DA10) — a low-DA field, only digitalpiloto.com (DA55) is a real outlier | High | High |
| website design company in salem | Commercial/Local | `/website-design-company-in-salem/` | Service page (URL already matches) | Salem | Organic mostly DA8–27 (sakthiinfotech.com DA9, amytechnologies.in DA8, byzerotechnologies.com DA14, propluslogics.com DA27) | High | High |
| app development company in salem | Commercial/Local | `/app-development/` | Service page — needs H1 update, see §5 | Salem | sieora.in (DA16), adhocsoftwares.com (DA16), boxoftech.in (DA14) plus krify.co (DA28) and a DA36 directory — moderately tougher than the SEO/web-design fields but still local-tier | Medium-High | High |
| social media marketing company in salem | Commercial/Local | `/social-media-marketing-agency/` | Service page — needs content expansion, see §5 | Salem | Local pack + organic mostly DA7–22 (lamdasoft.in DA7, morismedia.in DA14) plus directory noise | High | Medium-High |
| ai automation agency in salem | Commercial/Local | `/artificial-intelligence-automation-agency/` | Service page | Salem | No Salem-specific SERP captured; the national version ("ai automation agency in india") shows boutique AI firms at DA7–35 (neogenmedia.com DA7, anvenssa.com DA11, automationagencyindia.com DA28) — a Salem-qualified variant faces materially less competition than that national query | Medium-High | High |
| ecommerce website development company in salem | Commercial/Local | `/ecommerce-website-development-company/` | Service page (URL matches) | Salem | Not directly SERP-tested; inferred from the adjacent website-design field (DA8–27) | Medium-High | High |
| crm development company in salem | Commercial/Local | `/software-customization/` (pending a dedicated CRM page — see gap note in §5) | Service page | Salem | National "crm development company in india" is dominated by DA20–70 CRM specialists (orangemantra.com DA70, webkul.com DA51, gomilestone.com DA46); a Salem-local qualifier sidesteps that tier almost entirely — no local SERP captured this session, so treat as estimated | Medium | Medium-High |
| influencer marketing agency in salem | Commercial/Local | `/influencer-marketing-agency/` | Service page | Salem | Not SERP-tested; niche service, unlikely to face the directory-heavy competition seen on broader terms | Medium | Medium |

*Search volume: estimated, exact figures unavailable on the current Ubersuggest plan for all keywords in this document.*

### 4.2 Secondary keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| best digital marketing company in salem | Commercial/Local | `/` (Home) | Hero/comparison copy — matches current title tag exactly | Salem | Same field as the head term; "best" queries tend to surface comparison content (see the orphaned `/top-3-digital-marketing-agencies-in-salem/` finding, §4.9) | High | High |
| digital marketing services in salem | Commercial/Local | `/digital-marketing-in-salem/` | Full page rebuild required (currently 334 words) | Salem | Same competitive tier as the head term | High | High |
| affordable digital marketing agency in salem | Commercial/Local | `/services/` or Home pricing section | Value-framed section | Salem | Estimated lower competition than the unqualified head term (few local competitors build price-qualified pages) | Medium | High |
| seo services in salem | Commercial/Local | `/search-engine-optimization-agency-in-india/` | On-page secondary target | Salem | Same tier as "seo company in salem" | High | High |
| website development company in salem | Commercial/Local | `/website-design-company-in-salem/` | Secondary on-page target | Salem | Same as the "design company" primary | Medium-High | High |
| ai chatbot development company in salem | Commercial/Local | `/ai-chatbot-development-company/` | Primary/secondary service term | Salem | No Salem-specific SERP; estimated low competition given the niche | Medium | High |
| software customization services in salem | Commercial/Local | `/software-customization/` | Requires content depth (currently 339 words) | Salem | Estimated low-medium; no direct SERP evidence, field limited to local software dev firms | Medium | Medium-High |
| content marketing services in salem | Commercial/Local | `/content-marketing-services/` | Secondary on-page target | Salem | Estimated low competition (narrower than general "digital marketing") | Medium | Medium |
| google ads agency in salem | Commercial/Local | `/google-ads-management/` (recommended new page) | Dedicated PPC service page | Salem | No direct SERP; PPC-specific agencies are a thinner field in Salem than general digital marketing | Medium-High | High |
| meta ads agency in salem | Commercial/Local | `/meta-ads-management/` (recommended new page) | Dedicated paid-social service page | Salem | No direct SERP; estimated thin field | Medium | High |

### 4.3 Long-tail keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| affordable website design company for small business in salem | Commercial | `/website-design-company-in-salem/` | Pricing/FAQ section | Salem | Long-tail subset of an already-winnable DA8–27 field | Medium | High |
| ecommerce website development company for small business in salem | Commercial | `/ecommerce-website-development-company/` | Case-study/pricing section | Salem | Low competition, long-tail | Medium | High |
| ai chatbot development company for small business in india | Commercial | `/ai-chatbot-development-company/` | Supporting blog/case-study | India | No head-term SERP data exists at all for this niche — estimated low-medium | Medium | Medium-High |
| best crm software company for small business in india | Commercial | `/software-customization/` (or future CRM page) | Comparison blog content | India | Still faces the DA20–70 national CRM-specialist field seen in evidence, even as a long-tail | Low-Medium | Medium |
| lead management software for small business in india | Commercial/Informational | `/lead-generation-services/` (recommended new page) or `/jhb-automation-tools/` | Blog + landing page | India | From the user's seed themes; no SERP data captured — estimated moderate | Medium | Medium |
| how to choose a digital marketing agency in salem | Informational/Commercial | `/blog/` | Blog post, links to `/services/` | Salem | Low competition given the DA11-and-under local field for informational content | Medium | Medium (assist) |
| website development cost for small business in salem | Commercial | `/website-design-company-in-salem/` FAQ or blog | Pricing FAQ / blog post | Salem | Low competition, long-tail | Medium | High |
| top digital marketing agencies in salem 2026 | Commercial (comparison) | Restored/new `/blog/` post (see §4.9 orphan-URL note) | Comparison/listicle | Salem | Demonstrated historical demand — this exact query pattern previously had a live, indexed JHB page | High (equity recovery) | Medium-High |

### 4.4 Local keywords (Salem + genuine nearby expansion only)

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| digital marketing agency near me | Local/Commercial | `/` or `/services/` | GBP + NAP-consistent on-page content | Salem (device-based) | Directly overlaps the local-pack SERPs already documented | High | High |
| digital marketing company in salem tamil nadu | Local | `/` | Footer/schema NAP consistency | Salem, TN | Same field as the head term | Medium | Medium |
| seo services in salem tamil nadu | Local | `/search-engine-optimization-agency-in-india/` | On-page NAP reinforcement | Salem, TN | Same as SEO head term | Medium | Medium |
| local seo services in salem | Local/Commercial | `/local-seo-services/` (recommended new page) | Dedicated local-SEO/GBP-optimization page | Salem | Every SERP snapshot in evidence shows a local 3-pack JHB doesn't appear in — this is the single most evidence-supported gap in the whole keyword set | High | High |
| digital marketing company in erode | Local (future expansion — unverified) | Future dedicated page, only if service area confirmed | — | Erode (within ~60km of Salem per general geography) | No evidence JHB currently serves Erode; flag for confirmation before building | Low (pending confirmation) | Medium |
| website design company in namakkal | Local (future expansion — unverified) | Future dedicated page | — | Namakkal (within ~60km) | Same caveat | Low | Medium |
| app development company in attur / dharmapuri | Local (future expansion — unverified) | Future dedicated page(s) | — | Attur / Dharmapuri (within ~60km) | Same caveat | Low | Low-Medium |
| digital marketing agency in coimbatore / chennai / bengaluru | Local (evaluate only — do NOT auto-recommend) | Not recommended currently | — | Metro cities named by the user as candidates to evaluate, not evidence of current service delivery | No SERP evidence for JHB in these markets; even Salem-local terms pull in DA55–99 sites at the margins, so metro-level SERPs would be substantially harder for a DA11 site — recommend only as a *future* expansion decision, explicitly gated on the business actually serving these cities | Not recommended now | — |

### 4.5 Commercial (buyer/comparison) keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| digital marketing packages in salem | Commercial | `/` or `/services/` | Pricing/plans section | Salem | Estimated low-medium — few local competitors publish dedicated pricing pages | Medium | High |
| crm software company in india | Commercial | `/software-customization/` (or future CRM page) | Comparison/authority content | India | DA20–70 CRM-specialist field (orangemantra.com DA70, gomilestone.com DA46, webkul.com DA51) — realistically low priority nationally without a dedicated CRM authority build | Low | Medium |
| business automation company in salem | Commercial | `/artificial-intelligence-automation-agency/` | Service page secondary target | Salem | No direct SERP; estimated low-medium, niche and local | Medium | High |
| hire seo company in salem | Commercial/Transactional | `/search-engine-optimization-agency-in-india/` | CTA-led section | Salem | Estimated medium — hybrid of the SEO head term's competitive tier | Medium | High |
| digital marketing consultant in salem | Commercial | `/about/` or `/services/` | Trust/expertise-led content | Salem | Estimated low-medium, individual-consultant framing is a lighter niche than "agency"/"company" queries | Low-Medium | Medium |
| best website design company in salem | Commercial (comparison) | `/website-design-company-in-salem/` | Comparison-aware copy/testimonials | Salem | Same DA8–27 field as the head term | Medium-High | High |

### 4.6 Informational keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| what is digital marketing | Informational | `/blog/` (pillar post, internal-links to services) | Blog | National | Very high competition nationally against major publishers — not a realistic ranking target, but useful as a top-of-funnel piece that funnels internal links | Low | Low (awareness only) |
| what is an ai chatbot and how does it help small businesses | Informational | `/blog/` | Blog | India | More specific than generic AI content — estimated medium | Medium | Low-Medium |
| benefits of marketing automation for small business | Informational | `/blog/` or `/marketing-automation/` (recommended new page) | Blog | India | Estimated medium | Medium | Medium |
| why does my business need a crm | Informational | `/blog/` | Blog | India | Estimated medium | Medium | Low-Medium |
| how does seo help a local business grow | Informational | `/blog/` | Blog | Salem/India | Estimated medium | Medium | Low-Medium |

### 4.7 Transactional keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| hire digital marketing agency in salem | Transactional | `/contact/` | CTA-focused landing content | Salem | Estimated medium | Medium | High |
| get a free seo audit in salem | Transactional | `/search-engine-optimization-agency-in-india/` or `/contact/` (lead magnet) | Lead-gen CTA | Salem | Estimated low-medium — few local competitors offer this explicitly | Medium | High |
| request website design quote salem | Transactional | `/contact/` | Quote-request CTA | Salem | Estimated low-medium | Medium | High |
| book a demo ai chatbot salem | Transactional | `/ai-chatbot-development-company/` | Demo-booking CTA | Salem/India | Estimated low (niche) | Medium | High |
| contact digital marketing company salem | Transactional | `/contact/` | NAP + CTA | Salem | Estimated medium — branded+transactional combo is generally easier | High | High |

### 4.8 Question-based keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| how much does digital marketing cost in salem | Commercial-Informational | `/blog/` + pricing FAQ on `/digital-marketing-in-salem/` | Blog + FAQ schema | Salem | Estimated low-medium | Medium | Medium-High |
| which is the best digital marketing company in salem | Commercial (comparison) | `/blog/` (ties to the orphaned "top 3" opportunity, §4.9) | Blog/comparison | Salem | Estimated medium, but backed by demonstrated historical ranking demand | High | Medium-High |
| what does an seo company do | Informational | `/blog/` | Blog | National | Estimated medium-high (broad) | Low | Low |
| how to choose a crm software for small business | Informational | `/blog/` | Blog | India | Estimated medium | Medium | Low-Medium |
| is ai automation worth it for a small business | Informational | `/blog/` or `/artificial-intelligence-automation-agency/` FAQ | Blog/FAQ schema | India | Estimated medium | Medium | Medium |

### 4.9 Blog / content keywords

| Keyword | Intent | Target page | Content type | Location modifier | Competition (reasoned) | Priority | Conv. potential |
|---|---|---|---|---|---|---|---|
| digital marketing trends 2026 india | Informational | `/blog/` | Evergreen/seasonal post | India | High competition on the exact "trends" head term, but a low-effort authority builder | Medium | Low (branding) |
| seo tips for small businesses in salem | Informational | `/blog/` | Blog | Salem | Estimated medium | Medium | Low-Medium |
| top digital marketing agencies in salem (2026 guide) | Commercial/Informational | `/blog/` — **recommended new post**, see note below | Blog/comparison | Salem | Estimated medium, but the strongest content-demand signal in this whole report (see note) | High | Medium |
| why small businesses need crm software | Informational | `/blog/` | Blog | India | Estimated medium | Medium | Low-Medium |
| case study: ai chatbot implementation results | Informational/Trust | `/blog/` | Case-study post | Salem/India | Estimated low (proprietary content, no real competition) | Low | Medium (proof-driven) |
| social media marketing strategy for local businesses in salem | Informational | `/blog/` | Blog | Salem | Estimated medium | Medium | Low-Medium |

**Orphaned-URL content opportunity:** `https://jhbautomations.com/top-3-digital-marketing-agencies-in-salem/` is a real, currently-404 page that still appears in live Google search results (WebSearch-confirmed) and is absent from the sitemap — i.e., it previously had enough ranking equity to be indexed for exactly this "best/top agencies in Salem" comparison intent. This is a technical fix (404/redirect) owned by the Technical Findings section of this report, but from a keyword-research standpoint it is direct, first-party evidence of real demand for "best/top digital marketing agency in Salem"-style comparison content — recommend either restoring an updated version of that page or 301-redirecting it into a new `/blog/` post built around the "which is the best digital marketing company in salem" query cluster, so the recovered equity lands on live content rather than a dead end.

### 4.10 Service-page keyword clusters (cross-reference to the 12 live service pages)

This is a condensed view of the money term already assigned to each existing service page (full secondary-keyword breakdown and content-gap notes are in §5):

| Service page | Core keyword cluster |
|---|---|
| `/content-marketing-services/` | content marketing services / agency in salem |
| `/app-development/` | app development company in salem |
| `/website-design-company-in-salem/` | website design / development company in salem |
| `/artificial-intelligence-automation-agency/` | ai automation agency in salem (+ national aspirational) |
| `/software-customization/` | software customization / crm development services in salem |
| `/search-engine-optimization-agency-in-india/` | seo company / services in salem |
| `/sem-company/` | sem company / search engine marketing agency in salem |
| `/ecommerce-website-development-company/` | ecommerce website development company in salem |
| `/ai-chatbot-development-company/` | ai chatbot development company in salem |
| `/digital-marketing-in-salem/` | digital marketing services in salem |
| `/social-media-marketing-agency/` | social media marketing company in salem |
| `/influencer-marketing-agency/` | influencer marketing agency in salem |

---

## 5. Keyword Mapping

**Implementation note (from code-level evidence):** the CMS's shared SEO editor (`jhb_seo` table, per `packages/shared/src/content.server.ts`) only covers three paths — `/`, `/services`, `/blog`. Title/meta/H1 changes for those three can be pushed without a code release. **Every other page in the map below — all 12 service pages, `/about/`, `/contact/`, `/products/vasool-app/`, `/jhb-automation-tools/` — uses its own separate, non-CMS field set**, so on-page keyword changes there require a template/code-level update, not just a content edit. Plan implementation sequencing accordingly.

### 5.1 Full page → primary keyword table (existing pages)

| # | Page (real path) | Primary keyword | Status/notes |
|---|---|---|---|
| 1 | `/` (Home) | digital marketing company in salem | Matches direct SERP evidence; current title tag ("Best Digital Marketing in Salem") is close but not identical — treat "best digital marketing company in salem" as a secondary variant, not a second primary |
| 2 | `/services/` | digital marketing agency in salem | Hub page — should link out to all 12 service pages + 6 recommended pages to reinforce siloing |
| 3 | `/about/` | JHB Automations Salem (branded) | Branded/navigational — see cannibalization/brand-defense note in §5.3 |
| 4 | `/contact/` | digital marketing agency in salem phone number | Currently the only fully hardcoded, non-CMS-editable metadata page (verified in code) with no page-specific Open Graph override |
| 5 | `/blog/` | digital marketing blog | Content hub; CMS-editable via `jhb_seo` |
| 6 | `/jhb-automation-tools/` | business automation tools | Tools/resource hub |
| 7 | `/products/vasool-app/` | Vasool App by JHB Automations (branded) | Branded product page; `/products/vasool-app/about/` also exists (redirect target of `/about-vasool`) but is out of sitemap — low priority for keyword targeting until confirmed intentional |
| 8 | `/content-marketing-services/` | content marketing services in salem | Well-developed (in the 8-page group with full FAQ schema) |
| 9 | `/app-development/` | app development company in salem | H1 currently reads "App Development" with no location qualifier — recommend updating to include "in Salem" |
| 10 | `/website-design-company-in-salem/` | website design company in salem | URL/H1/keyword already aligned — model page for the rest of the site |
| 11 | `/artificial-intelligence-automation-agency/` | ai automation agency in salem | National variant ("...in india") is a secondary/aspirational target only, per DA35–99 competitor field |
| 12 | `/software-customization/` | software customization services in salem | Thin content (339 words), no location qualifier in H1, no FAQ schema — priority rebuild |
| 13 | `/search-engine-optimization-agency-in-india/` | seo company in salem | URL/title lean national ("in India") but the competitively winnable SERP data is for the Salem-qualified query — recommend the page lead with Salem in H1/meta, treat India-wide ranking as a longer-term stretch |
| 14 | `/sem-company/` | sem company in salem | Kept distinct from the recommended new "Google Ads Management" page (see §5.3) |
| 15 | `/ecommerce-website-development-company/` | ecommerce website development company in salem | URL/keyword aligned |
| 16 | `/ai-chatbot-development-company/` | ai chatbot development company in salem | URL/keyword aligned |
| 17 | `/digital-marketing-in-salem/` | digital marketing services in salem | Thinnest-content tier (334 words), H1 "Digital Marketing" doesn't reinforce "Salem" despite the URL — priority rebuild; see cannibalization note vs. pages 1 & 2 |
| 18 | `/social-media-marketing-agency/` | social media marketing company in salem | **Thinnest page site-wide (281 words)** — highest-urgency content rebuild of the four thin pages |
| 19 | `/influencer-marketing-agency/` | influencer marketing agency in salem | URL/keyword aligned |

### 5.2 Recommended NEW pages (not among the 12 existing service pages)

These six are named directly in the brief as pages worth having; none currently exist on the site, so each gets its own primary keyword distinct from all 19 pages above.

| # | Recommended new page | Primary keyword | Rationale |
|---|---|---|---|
| 20 | `/local-seo-services/` | local seo services in salem | Every SERP snapshot in evidence shows a local 3-pack JHB is absent from — the single best-evidenced content gap in the audit |
| 21 | `/google-ads-management/` | google ads agency in salem | Currently no page owns "Google Ads" specifically — `/sem-company/` stays a broader paid-search/strategy page, this new page owns dedicated Google Ads campaign management |
| 22 | `/meta-ads-management/` | meta ads agency in salem | Currently no page owns paid Meta/Facebook/Instagram ads specifically — `/social-media-marketing-agency/` stays organic/general social management |
| 23 | `/lead-generation-services/` | lead generation services in salem | Bridges the "lead management software" / "lead management" seed theme that has no current home on the site |
| 24 | `/marketing-automation/` | marketing automation services in salem | Bridges the "marketing automation services" seed theme; also a natural landing spot for CRM-adjacent secondary terms (see gap note below) |
| 25 | `/branding-services/` | branding services in salem | No current page addresses branding/identity as a standalone offering |

**Content gap flagged but not assigned its own page:** the seed themes "CRM software company," "CRM development company," and "lead management software" don't cleanly belong to any of the 25 pages above. Recommend routing CRM-specific secondary keywords through `/software-customization/` (which already covers custom software) and `/jhb-automation-tools/` (the tools hub) for now, per §5.3, and revisiting a dedicated CRM/lead-management page as a 7th future addition once there's evidence of demand (Ubersuggest volume data, once available, should settle this).

### 5.3 Secondary keywords and page-level notes

**Home (`/`)** — Secondary: best digital marketing company in salem, digital marketing agency near me, digital marketing company in salem tamil nadu. *Note:* given the CRITICAL duplicate-domain finding (`tn.jhbautomations.in` is a separate, fully indexable site with no canonical pointing back to jhbautomations.com), Home and `/about/` carrying strong, consistent branded-keyword signal ("JHB Automations," "JHB Automations Salem") helps assert jhbautomations.com as the authoritative domain in search results.

**`/services/`** — Secondary: digital marketing services in salem, best digital marketing agency in salem, digital marketing packages in salem.

**`/about/`** — Secondary: JHB Automations reviews, why choose JHB Automations, digital marketing agency salem team. Branded rather than competing on a generic commercial term, avoiding overlap with Home/`/services/`.

**`/contact/`** — Secondary: digital marketing company salem address, book a free consultation salem, request a quote digital marketing salem.

**`/blog/`** — Secondary: digital marketing tips salem, seo tips for small business india. Hub page; individual post-level targeting is covered in §4.9.

**`/jhb-automation-tools/`** — Secondary: free automation tools for small business, ai automation tools india, business automation software india.

**`/products/vasool-app/`** — Secondary: Vasool App features, Vasool App download. Kept strictly branded — no functional/category keywords are asserted here since the evidence pack does not document what the app does.

**`/content-marketing-services/`** — Secondary: content marketing agency in salem, content writing services for business salem, content marketing company in india.

**`/app-development/`** — Secondary: mobile app development company salem, android and ios app development salem, app development company in india. *Action:* add "in Salem" to H1/title and add FAQ content to match the other 8 well-developed service pages.

**`/website-design-company-in-salem/`** — Secondary: web design company in salem, website development company in salem, ecommerce website design salem.

**`/artificial-intelligence-automation-agency/`** — Secondary: ai automation agency in india (aspirational/low priority per DA35–99 field), business automation company in salem, ai automation services for small business.

**`/software-customization/`** — Secondary: custom software development company in salem, crm development company in salem, software development company in india. *Action:* expand from 339 words, add location qualifier to H1, add FAQ schema — this page also absorbs the CRM content gap noted in §5.2.

**`/search-engine-optimization-agency-in-india/`** — Secondary: seo services in salem, seo agency in india, local seo company salem (cross-link to the new `/local-seo-services/` page).

**`/sem-company/`** — Secondary: search engine marketing agency in salem, ppc management company salem, search engine marketing services india. Kept deliberately distinct from "Google Ads agency in Salem," which is reserved for the new `/google-ads-management/` page.

**`/ecommerce-website-development-company/`** — Secondary: ecommerce website design company salem, online store development company salem, ecommerce website development company in india.

**`/ai-chatbot-development-company/`** — Secondary: ai chatbot development company in india, chatbot development company for small business india.

**`/digital-marketing-in-salem/`** — Secondary: digital marketing solutions for small business salem, online marketing services salem, internet marketing company salem. *Action:* rebuild from 334 words, fix H1 to reinforce "Salem," add FAQ schema. **Cannibalization note:** Home ("digital marketing company in salem"), `/services/` ("digital marketing agency in salem") and this page ("digital marketing services in salem") sit close together thematically. All three primaries are lexically distinct and each has a clear job — Home = brand/comparison entry point, `/services/` = umbrella hub linking to every offering, this page = the deep-dive on the "digital marketing" service line specifically — but this only works if internal linking reinforces the hierarchy (Home → `/services/` → `/digital-marketing-in-salem/`) rather than all three competing for identical anchor text and phrasing. Recommend an explicit internal-linking pass once the page rebuild happens.

**`/social-media-marketing-agency/`** — Secondary: social media management company salem, facebook and instagram marketing agency salem. *Action:* highest-priority content rebuild on the site (281 words, thinnest page found); "Meta Ads" specific phrasing is reserved for the new `/meta-ads-management/` page so this page can own organic/general social media management without overlap.

**`/influencer-marketing-agency/`** — Secondary: influencer marketing company india, micro influencer marketing agency salem.

**`/local-seo-services/` (NEW)** — Secondary: google business profile optimization salem, local seo company india, local pack ranking services.

**`/google-ads-management/` (NEW)** — Secondary: google ads management services salem, ppc advertising agency salem, google ads agency in india.

**`/meta-ads-management/` (NEW)** — Secondary: facebook ads agency salem, instagram ads management company salem, meta ads management services india.

**`/lead-generation-services/` (NEW)** — Secondary: b2b lead generation company india, lead management software, lead generation agency for small business.

**`/marketing-automation/` (NEW)** — Secondary: marketing automation company india, email marketing automation services, crm and marketing automation integration.

**`/branding-services/` (NEW)** — Secondary: branding agency in salem, logo design and branding company salem, brand identity design services india.

### 5.4 No-duplicate-primary verification

All 25 primary keywords assigned above are checked against each other and confirmed to be unique strings — no two pages (existing or recommended) share an identical primary keyword:

digital marketing company in salem · digital marketing agency in salem · JHB Automations Salem · digital marketing agency in salem phone number · digital marketing blog · business automation tools · Vasool App by JHB Automations · content marketing services in salem · app development company in salem · website design company in salem · ai automation agency in salem · software customization services in salem · seo company in salem · sem company in salem · ecommerce website development company in salem · ai chatbot development company in salem · digital marketing services in salem · social media marketing company in salem · influencer marketing agency in salem · local seo services in salem · google ads agency in salem · meta ads agency in salem · lead generation services in salem · marketing automation services in salem · branding services in salem.

Where two or more primaries sit close together thematically (Home / `/services/` / `/digital-marketing-in-salem/`, and `/sem-company/` / new `/google-ads-management/`, and `/social-media-marketing-agency/` / new `/meta-ads-management/`), each pairing is deliberately differentiated by scope (brand vs. hub vs. deep-dive; broad SEM strategy vs. dedicated Google Ads execution; organic social vs. paid Meta ads) and flagged above with an internal-linking recommendation to keep the differentiation real in practice, not just on paper.

## 6. Local SEO Strategy

Every one of the seven live SERP snapshots pulled for this audit (§ Live SERP snapshots, Ubersuggest, India location, 2026‑08‑04) tells the same story: for "digital marketing company in salem," "website design company in salem," "seo company in salem," "app development company in salem," and "social media marketing company in salem," jhbautomations.com does not appear anywhere in the visible results — not in the local 3‑pack, not in the organic top 10–16. The businesses that do occupy those slots (firstsuccesstechnologies.in, octadigi.com, vfmdigitalmarketing.com, foxthreetechnologies.com, bestwebmasterz.com, vijayseo.in, idealformatic.com, fliptez.co.in, among others) are, on paper, comparable or smaller local operators — several sit at DA6–16, well within reach of JHB's current DA11. This is not a content-quality gap so much as a **local-presence gap**: Google has no strong local-entity signal to surface JHB for "in Salem" intent, regardless of how good the on-page content is. Closing it is largely a Google Business Profile, citation, and review exercise, not a coding exercise — which makes it one of the highest-ROI, lowest-engineering-cost workstreams in this audit.

### 6.1 Google Business Profile optimization

**Categories.** Google Business Profile allows one primary category plus multiple secondary categories, and JHB's 12 live service pages map cleanly onto a multi-category profile:

| Role | Category | Rationale (from live service slugs) |
|---|---|---|
| Primary | Digital Marketing Agency | Matches the home page's own positioning — title tag is literally "JHB Automations — Best Digital Marketing in Salem" |
| Secondary | Website Designer | `/website-design-company-in-salem/`, `/ecommerce-website-development-company/` |
| Secondary | Software Company | `/app-development/`, `/software-customization/` |
| Secondary | SEO Agency | `/search-engine-optimization-agency-in-india/` |
| Secondary | Social Media Marketing Agency | `/social-media-marketing-agency/`, `/influencer-marketing-agency/` |
| Secondary | Marketing Consultant / Internet Marketing Service | `/sem-company/`, `/content-marketing-services/` |
| Secondary | Artificial Intelligence Company | `/artificial-intelligence-automation-agency/`, `/ai-chatbot-development-company/` |

Do not spread the primary category across multiple near-duplicates ("Marketing Agency" *and* "Digital Marketing Agency" *and* "Internet Marketing Service" as co-primaries) — Google's local ranking algorithm weights the single primary category most heavily, and diluting it works against the exact "digital marketing company in salem" query this audit shows JHB is invisible for.

**Service descriptions & "Products/Services" section.** Because the site already has 12 dedicated, mostly well-developed service pages (8 of 12 run 1,000+ words per the crawl data), the GBP Services section should not be written from scratch — it should be a compressed, benefit-led version of each page's H1/lead paragraph, with each GBP service item deep-linking to its matching live URL. That directly imports the site's existing content investment into the profile and gives Google a service-by-service correspondence between the GBP listing and the website — a signal current local-pack winners with far less content depth (e.g., appexive.com at DA4, reachoutmarketing.co.in at DA6) are unlikely to have as cleanly. Two of the four "thin" service pages identified in the crawl — `/digital-marketing-in-salem/` (334 words) and `/social-media-marketing-agency/` (281 words) — should be prioritized for content expansion *before or alongside* this GBP push, since a thin destination page undercuts an otherwise strong GBP service listing.

**GBP Posts cadence.** Recommend a standing weekly post (minimum bi-weekly) rotating through three formats: (1) a service spotlight linking to one of the 12 service pages, (2) a project/result post (case study snippet, before/after, client outcome), (3) an offer/CTA post. Tie the rotation to the existing blog cadence (5 posts currently live, word counts 1,349–2,553 — healthy depth) so each new blog post also becomes a GBP post in the same week, giving one piece of content two distribution channels for no extra writing effort.

**A note on current visibility.** This audit cannot confirm from the SERP data whether JHB currently has a claimed/verified GBP listing at all — only that it is not surfacing in any of the seven local-intent queries tested. Verifying/claiming the listing (if not already done) should be treated as the literal first step before any of the above.

### 6.2 Customer review strategy

Ubersuggest's competitor data shows JHB's domain authority sitting at **11**, with **506 backlinks across 61 referring domains** — a small footprint that reviews can help offset faster than backlinks can, since review count/velocity is a direct local-ranking factor independent of DA. None of the SERP snapshots surfaced review counts for JHB or its local competitors (that data wasn't pulled by Ubersuggest's SERP tool), so no specific review-count target can be cited from evidence — but given every named local-pack competitor (octadigi.com, firstsuccesstechnologies.in, vfmdigitalmarketing.com, etc.) is actively occupying 3-pack slots, a consistent review-acquisition cadence (aim for a steady weekly/bi-weekly trickle tied to project completions, not sporadic bulk asks) is a reasonable priority regardless of the exact starting number.

**Process recommendation:** trigger a review request at project handoff/go-live (highest satisfaction moment), via a direct GBP short link sent by WhatsApp/email — WhatsApp is a high-open-rate channel for an India-based service business. Respond to every review, positive or negative, within 48 hours; response presence and speed are both minor but real local-ranking and trust signals.

**Response templates** (adapt the bracketed fields per review; keep responses specific enough to avoid looking templated to a reader, even though the structure is reused):

> **Template 1 — 5-star / positive review**
> "Thank you so much, [Name]! We're thrilled the [service, e.g. website redesign / SEO campaign] delivered the results you were looking for. It was a pleasure working with the team at [Client Business Name], and we're glad we could support your growth here in Salem. Looking forward to continuing to work together — do reach out anytime you need us for [related service]!"

> **Template 2 — 3-star / mixed review**
> "Thanks for the honest feedback, [Name] — we really appreciate you taking the time to share it. We're glad the [positive aspect mentioned] worked well for you, and we'd like to understand more about [specific concern raised] so we can improve. Could you drop us a message at [phone/email] or WhatsApp us at +91 97918 22718? We'd like to make this right."

> **Template 3 — 1–2 star / negative review**
> "We're sorry to hear your experience with [service] didn't meet expectations, [Name] — that's not the standard we hold ourselves to. We'd like to look into this directly: could you reach out to us at +91 97918 22718 or [email] with your project details? We take this seriously and want the chance to resolve it properly rather than leave it unaddressed."

Never argue with a reviewer publicly or dispute specifics in the response thread — move the conversation to phone/WhatsApp/email, as modeled above, and resolve there.

### 6.3 Local citations & directory presence

The SERP evidence itself makes the case for this section: **justdial.com** and **dir.indiamart.com** are not hypothetical citation targets — they are literally appearing as ranking organic/competitor results in the live "digital marketing company in salem" and "social media marketing company in salem" SERPs (dir.indiamart.com at DA71, justdial.com at DA60). Google is already sending these directory pages traffic for JHB's target queries. The strategic implication is two-sided: JHB needs a presence on these platforms simply because Google is routing local-intent traffic through them, but a bare listing on a marketplace this large will never itself outrank a differentiated local operator — the goal is to be listed **and** to make the listing itself convert (complete profile, real photos, service-specific categorization, reviews imported/cross-posted where the platform allows) rather than treating the citation as a checkbox.

Recommended citation set, in priority order:

1. **Google Business Profile** (covered above — the anchor citation)
2. **JustDial** — appears directly in SERP evidence; claim/complete the listing with the same category set as GBP
3. **IndiaMART** (dir.indiamart.com) — appears directly in SERP evidence; particularly relevant given JHB's B2B service mix (software/CRM/app development read as B2B categories on IndiaMART)
4. **Sulekha** — standard India local-services directory, strong for "services in [city]" query coverage
5. **Bing Places** — low effort, captures Bing/Edge default-search share
6. **Facebook Business Page** and **Instagram Business** — Instagram already carries DA94 per the Ubersuggest domain data referenced in the "ai automation agency in india" snapshot, meaning a properly filled-out business profile there inherits strong platform authority
7. **LinkedIn Company Page** — LinkedIn (DA99) appeared directly in three of the seven SERP snapshots for JHB's target queries, confirming Google is already surfacing LinkedIn for this query set; a complete, keyword-aligned LinkedIn company page is a near-free ranking opportunity
8. Secondary/lower-priority: TradeIndia, Yellow Pages India — lower expected impact than the six above, worth doing but not urgent

### 6.4 NAP consistency

Every citation, directory listing, and GBP field must use **byte-identical** Name/Address/Phone formatting:

- **Name:** JHB Automations
- **Address:** DNO: 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti, Salem, Tamil Nadu 636004
- **Phone:** +91 97918 22718

Before building out the citation list above, resolve the duplicate-domain issue flagged elsewhere in this audit: `tn.jhbautomations.in` is a separate, fully live, fully indexable site for the same business, with no canonical tag pointing back to jhbautomations.com. If citations, GBP, or social profiles end up pointing to inconsistent domains across listings, that undermines the entity-consolidation signal this whole local strategy depends on. Decide on jhbautomations.com as the single canonical domain (it is the domain with the more developed content and the one this audit targets) and make sure every new citation — and the GBP website field itself — points only there.

### 6.5 Location-specific landing pages

The site already has two location-flavored service URLs (`/website-design-company-in-salem/`, `/digital-marketing-in-salem/`), but per the crawl data one of them — `/digital-marketing-in-salem/` — is only 334 words with an H1 that doesn't even say "Salem" ("Digital Marketing" vs. the URL's "in Salem"), while the other is part of the well-developed 8. That inconsistency should be fixed before any new location pages are built, since it's the page most directly named for the exact SERP query this audit shows JHB losing ("digital marketing company in salem").

**Near-term candidates (build if service delivery is genuinely available in these areas):** Erode, Namakkal, Dharmapuri, Attur. These sit close enough to Salem to plausibly fall within a Salem-based team's real service radius, and each could support a lightweight location page (not a full duplicate template — genuinely localized intro, a locally-relevant FAQ or two, and a clear statement of how remote/on-site delivery works for that town) targeting queries like "digital marketing agency near Erode" or "website design company Namakkal." **Before building any of these, confirm with the business that on-the-ground or remote service delivery actually reaches these towns** — a location page with no real service backing it is a thin/low-value page and a potential trust problem if a prospect in that town contacts JHB expecting local presence that doesn't exist.

**Longer-term / lower-priority expansion candidates:** Coimbatore, Tiruchengode, Chennai, Bengaluru, and broader Tamil Nadu. Nothing in this audit's crawl, SERP, or backlink data shows any current JHB service reach, content, or ranking signal into these markets — they should be treated purely as future expansion options once the Salem-and-near-Salem base is performing, not as an immediate content backlog item. Building pages for these now, with no service-reach evidence, risks the same thin/mismatched-intent problem the audit already flags on the existing thin service pages.

### 6.6 LocalBusiness schema

Unlike most items in this section, this is not a "missing" finding — it's an **over-application** finding. The code/crawl evidence confirms `Organization`, `WebSite` (with SearchAction), and `["LocalBusiness","ProfessionalService"]` JSON-LD is already rendered **sitewide**, including on pages with no genuine local-business intent: `/about/`, `/contact/`, `/services/`, `/blog/`. The schema itself is a strength — it just isn't being scoped deliberately.

Recommended cleanup, not a rebuild:
- Keep the full `LocalBusiness`/`ProfessionalService` block on pages where it's doing real work: home, `/contact/`, the Salem-flavored service pages, and any new near-Salem location pages built per § 6.5.
- On pages like `/blog/` and individual blog posts, a lighter `Organization`/`WebSite` presence is sufficient; the full LocalBusiness block adds no incremental value there and just increases page weight for no ranking benefit.
- While reviewing the schema, add the fields many LocalBusiness implementations skip: `geo` coordinates, `openingHours`, `priceRange`, and an `areaServed` list reflecting Salem plus whichever near-Salem towns are confirmed as genuine service areas (§ 6.5) — this directly reinforces the geographic-relevance signal the site is currently missing in the live SERP results. Only add `aggregateRating` once there is real, verifiable GBP/review data behind it — never populate it with placeholder or estimated numbers.

### 6.7 Embedded Google Map

No embedded map was found in the crawl of `/contact/`, which per the code-level findings is also the one page on the site with fully hardcoded, non-CMS-editable metadata. Adding a genuine Google Maps embed (not just address text) to `/contact/` — and optionally a smaller one in the site footer — reinforces the same geographic entity signal as the schema and citation work above, and is a low-effort addition given `/contact/` is a static, easily editable template.

### 6.8 Salem-focused FAQs

Eight of the twelve service pages already carry `FAQPage` JSON-LD (duplicated twice per page — a separate technical issue covered elsewhere in this audit, but the underlying FAQ content infrastructure is real and reusable). The four pages without any FAQ content are the same four flagged as thin in the content-depth findings (`/app-development/`, `/digital-marketing-in-salem/`, `/social-media-marketing-agency/`, `/software-customization/`) — meaning FAQ expansion and thin-content expansion should be executed together on these four pages, not as separate projects.

For local relevance specifically, add Salem-anchored questions to the existing FAQ sets rather than only generic service FAQs — for example: "Does JHB Automations work with businesses outside Salem?", "Can we meet the team in person in Salem?", "How quickly can a Salem-based project kick off?", "Do you serve businesses in Erode/Namakkal/nearby districts?" These map directly onto the exact local intent this section is trying to capture, and cost nothing beyond content-writing time since the FAQ rendering infrastructure already exists.

### 6.9 Local backlinks

With DA11, 506 backlinks across 61 referring domains, and **zero** gov/edu referring domains, JHB's link profile is small and lacks the institutional-source diversity that often correlates with local trust signals. Recommended local-specific link sources, none requiring paid placement:

- Salem-area business/trade associations and chambers of commerce — membership listings typically include a backlink
- Local engineering/tech colleges in and around Salem — sponsorship of a tech fest, hackathon, or guest lecture is a realistic path to a genuine `.edu`-adjacent or institutional backlink, directly addressing the current gov/edu gap
- Guest posts or expert-quote contributions to Tamil Nadu–focused business and tech publications
- Cross-reference § 9 (Competitor Analysis) for backlink-source prospecting: the recurring local-pack names in this audit's SERP evidence (firstsuccesstechnologies.in, octadigi.com, vfmdigitalmarketing.com, foxdigitaltech.com, webbitech.com, morismedia.in, lamdasoft.in, appexive.com, byzerotechnologies.com, propluslogics.com, digitalpiloto.com, vijayseo.in) are a reasonable target list for reverse-engineering who links to established Salem-area competitors — reachoutmarketing.co.in is the only one Ubersuggest surfaced as a genuine like-for-like competitor with comparably low DA (6), making it a realistic benchmark rather than an aspirational one.

One additional local-content opportunity surfaced directly in the crawl: `https://jhbautomations.com/top-3-digital-marketing-agencies-in-salem/` still appears in live Google search results but now 404s on the current site and isn't in the sitemap — meaning it's an orphaned, previously-indexed page with existing search equity for exactly the kind of "digital marketing agencies in Salem" comparison query this section is targeting. Restoring or 301-redirecting this URL to a relevant live page (e.g., the home page or `/digital-marketing-in-salem/` once expanded) is a fast way to recover local-intent equity that's currently being wasted on a dead link.

### 6.10 Tamil/English local content

The code-level findings confirm the site declares a single `en` locale sitewide with no `hreflang`/`alternates.languages` — appropriate for the current single-market, English-first scope, and not something to unwind wholesale. Exact search volume for Tamil-language local queries is not available on the current Ubersuggest plan (the report-cap limitation noted elsewhere in this audit applies here too), so no specific keyword targets can be cited. Given JHB's current organic keyword footprint is very small (only 3 keywords in common with any tracked competitor per the Ubersuggest competitor data), a full bilingual site build is not justified yet. A lower-risk pilot: publish one or two blog posts or FAQ answers in a Tamil/English mix aimed at how Salem-area searchers actually phrase local queries, monitor engagement, and only expand the bilingual footprint if that pilot shows measurable traffic — this should sit behind the Salem GBP/citation/review work above in priority, not ahead of it.

## 7. Content Gap Analysis

The current site has 24 indexed URLs: the homepage, a services index, about, contact, a 5-post blog, a tools hub (`/jhb-automation-tools/`), the Vasool App product pages, and 12 service pages. Nothing in that crawl set is a case study, portfolio, pricing page, comparison page, FAQ hub, or industry-vertical landing page — these are genuine gaps, not omissions from this report. Content is prioritized below by enquiry impact, not traffic potential, per the brief.

### 7.1 Missing service pages (P1 — direct revenue pages)

Cross-referencing the six services named in the brief against the 12 live slugs and their actual titles/H1s (from `service-pages-table.txt`) confirms none of the six exist as a dedicated page today:

| Gap (brief-named service) | Closest existing page today | Why it doesn't cover the gap | Recommended new page |
|---|---|---|---|
| **Local SEO** | `/search-engine-optimization-agency-in-india/` (1,231 words) | Title and H1 ("Search Engine Optimization Agency in India Trusted by Salem Businesses") are framed nationally, not around Google Business Profile / local-pack ranking — the specific intent behind "local SEO company in Salem" | `/local-seo-services-salem/` |
| **Google Ads Management** | `/sem-company/` (1,397 words) | Positioned as broad "SEM" (search engine marketing); no page targets the specific, high-commercial-intent phrase "Google Ads management company" | `/google-ads-management-company-salem/` (cross-link with, not cannibalize, sem-company) |
| **Meta Ads Management** | `/social-media-marketing-agency/` (281 words — the thinnest page on the site) | Generic "Social Media Marketing" H1, no paid-ads-specific content evident at this word count | `/meta-ads-management-company-salem/` |
| **Lead Generation Services** | `/digital-marketing-in-salem/` (334 words) | Generic umbrella page, doesn't target "lead generation company" commercial intent | `/lead-generation-services-salem/` |
| **Marketing Automation** | `/artificial-intelligence-automation-agency/` (1,163 words) | Positioned around AI/business-process automation broadly, not marketing-specific automation (email nurture, drip sequences, CRM-triggered workflows) | `/marketing-automation-services/` |
| **Branding Services** | *(no page maps to this at all)* | Not represented anywhere in the 12 service pages or the tools hub | `/branding-services-salem/` |

Priority rationale: these are the highest-value gap because they target searchers already in a buying mindset for services JHB already delivers (per the site's own positioning) — the gap is discoverability, not capability. Keep the "in Salem" / location-qualified naming pattern that the 8 well-developed service pages already use, and keep exactly one page per keyword (no overlap with the 12 existing primary terms) to avoid the cannibalization risk called out in the report requirements.

### 7.2 Industry-specific landing pages (P3 — validate via blog before building)

None of the 24 crawled pages target a specific vertical. The brief names six: small business, restaurants, jewellery businesses, hotels, finance companies, and hospitals/academies. Rather than committing to six new landing pages against a DA-11 site with no traffic data (GSC/GA4 not installed, per evidence), the lower-risk sequence is: publish a vertical-specific blog post for each of the five specialized verticals first (see §8, months 3–6), then convert whichever 2–3 generate real enquiries into dedicated landing pages (e.g. `/digital-marketing-for-restaurants-salem/`). "Small business" is not really a sixth vertical — it's the site's existing default positioning and should keep being reinforced across all content rather than getting its own silo page.

### 7.3 Trust and conversion content (P1 — highest-leverage fix for a DA-11 site)

The evidence shows Domain Authority 11, 61 referring domains, and only 3 organic keywords shared with any competitor — a site with very little third-party proof. `/about/` (362 words) and `/contact/` are the only trust-adjacent pages that exist. This makes case studies one of the highest-leverage content investments available, because it improves conversion on existing traffic without needing new rankings first:
- **`/case-studies/` or `/portfolio/`** hub plus individual write-ups (start with 3–4 real clients/projects). Note: the evidence does not confirm whether client work exists to document — build only with real, permissioned results, not fabricated numbers.
- **`/pricing/` or `/packages/`** page — addresses the bottom-funnel "cost" intent that surfaces naturally once a visitor is comparing options (this pairs directly with the website-cost blog post in §8, month 3).

### 7.4 Comparison / decision-stage content (P3)

No comparison or "how to choose" content exists. Given JHB's DA-11 position relative to named local competitors, direct "JHB vs [Competitor]" pages carry reputational/legal risk with little upside. The safer, equally effective alternative is neutral decision-stage content: "How to choose a digital marketing agency in Salem" (checklist format), "In-house team vs. agency: cost comparison," "DIY SEO vs. professional SEO services." These capture the same commercial-investigation intent without naming or disparaging specific competitors from the SERP evidence (firstsuccesstechnologies.in, octadigi.com, etc.).

### 7.5 FAQ hub (P4 — low cost, low priority)

FAQ content technically exists on 8 of 12 service pages (flagged elsewhere in this audit as a duplicate-schema bug), but there is no standalone `/faq/` page aggregating cross-cutting questions (pricing, process, turnaround, service area). Cheap to build once the underlying duplicate-FAQPage schema issue is fixed; useful for AI-overview/answer-engine visibility, but should not be prioritized ahead of 7.1–7.3.

### 7.6 Content-recovery opportunity

The evidence's orphaned-URL finding belongs here as well as in the technical section: `/top-3-digital-marketing-agencies-in-salem/` is still indexed by Google and receiving search clicks, but 404s on the live site and isn't in the sitemap. That page carries real, already-earned search visibility that's currently being thrown away. Rebuilding it as genuinely useful content (see blog #4 below) and 301-redirecting the old URL to the new post recovers that equity at near-zero cost — this is the fastest win in the entire content plan.

### 7.7 Prioritization summary

| Priority | Content type | Rationale |
|---|---|---|
| P1 | 6 missing service pages | Captures already-existing buyer intent for services JHB delivers today |
| P1 | Case studies / portfolio | Best conversion lever for a DA-11 site with thin third-party proof |
| P2 | Pricing/package page | Removes bottom-funnel friction for visitors already on-site |
| P2 | Blog content engine (§8) | Only 5 posts exist today; this is the main current acquisition gap |
| P3 | Industry landing pages | Validate demand via blog first, then templatize top performers |
| P3 | Comparison/decision content | Serves commercial-investigation intent without competitor risk |
| P4 | FAQ hub | Cheap, supportive of AI-overview visibility, not urgent |

One caution carried over from the report brief: none of the above should extend to city/location pages outside Salem and its plausible service radius (Erode, Namakkal, Dharmapuri, Attur) unless JHB confirms it serves those areas — do not build location pages for Coimbatore, Chennai, or Bengaluru speculatively.

---

## 8. Six-Month Blog Content Strategy

The blog currently holds 5 posts at a healthy 1,349–2,553 words each (per evidence). The gap is volume and topical breadth, not quality — so this calendar keeps posts in the same 1,500–2,600-word range while quadrupling output to roughly 4 posts/month (≈24 topics over 6 months), which is the cadence needed to build topical authority for a DA-11 site that currently has no other active link-earning channel (no case studies, thin backlink profile of 61 referring domains). Topics are deliberately built as a pillar-cluster around the site's real services rather than duplicating the 5 existing posts (`why-your-business-needs-a-strong-seo-strategy`, `what-is-ai-automation`, `ai-chatbots-vs-human-support`, `the-future-of-web-development-in-2026-is-your-website-ready-for-ai-search`, `digital-marketing-services-for-business-growth-online-success`) — each new post below targets a distinct keyword angle within the same broad subject.

**Keyword note:** Ubersuggest's volume/difficulty reports hit the free-tier daily cap during evidence collection (see EVIDENCE.md). All primary/secondary keywords below are directionally chosen from search intent and the SERP competitor patterns already observed (recurring Salem-local competitors: firstsuccesstechnologies.in, octadigi.com, foxdigitaltech.com, webbitech.com, etc.), not from confirmed volume numbers — exact search volume is unavailable on the current plan and should be pulled once a paid tier or GSC is connected.

Every internal link below points to a real, currently live page from the 12-service list plus `/jhb-automation-tools/`, `/about/`, `/contact/`, and `/blog/`.

---

### Month 1 — Local Visibility Foundations

**1. "How to Choose the Right Digital Marketing Agency in Salem (2026 Guide)"**
*Recovers the orphaned, still-indexed `/top-3-digital-marketing-agencies-in-salem/` URL — rebuild fresh and 301-redirect the old URL here.*
- Primary keyword: digital marketing agency in Salem
- Secondary: best digital marketing company in Salem, how to hire a digital marketing agency
- Intent: commercial investigation
- Audience: Salem SME owners evaluating agencies
- Word count: ~2,200 (cornerstone post)
- H2s: What Does a Digital Marketing Agency Actually Do? · 7 Questions to Ask Before You Hire · Red Flags to Avoid · What Results Should You Expect in 90 Days? · Why Local Businesses Choose JHB Automations
- Internal links: `/digital-marketing-in-salem/`, `/about/`, `/contact/`
- CTA: "Get a free digital marketing consultation" → `/contact/`

**2. "Google Business Profile Optimization: The Complete Guide for Salem Businesses"**
- Primary keyword: Google Business Profile optimization
- Secondary: GBP optimization Salem, local SEO ranking factors
- Intent: informational → local commercial
- Audience: local shop/service owners not yet ranking in the local pack
- Word count: ~1,800
- H2s: Why GBP Matters More Than Your Website for Local Search · Setting Up Your Profile Correctly · Categories, Photos & Posts That Move Rankings · Getting (and Responding to) Reviews · Common GBP Mistakes That Hurt Rankings
- Internal links: `/search-engine-optimization-agency-in-india/`, `/contact/`
- CTA: "Request a free GBP audit" → `/contact/`

**3. "The 15-Point On-Page SEO Checklist for Small Businesses in 2026"**
- Primary keyword: on-page SEO checklist
- Secondary: SEO checklist for small business, on-page SEO tips
- Intent: informational
- Audience: small business owners doing their own SEO
- Word count: ~1,700
- H2s: Title Tags & Meta Descriptions That Get Clicks · Header Structure (H1–H3) Done Right · Image Alt Text and Why It's Overlooked · Internal Linking Basics · Page Speed & Mobile Checks · When to Bring In a Professional
- Internal links: `/search-engine-optimization-agency-in-india/`, `/blog/`
- CTA: "Not sure where your site stands? Get a free SEO audit" → `/contact/`

**4. "Local SEO vs. National SEO: Which Does Your Business Actually Need?"**
- Primary keyword: local SEO vs national SEO
- Secondary: local SEO for small business, do I need local SEO
- Intent: informational → decision-stage
- Audience: business owners confused about scope/cost
- Word count: ~1,600
- H2s: What "Local SEO" Actually Means · Signals That Decide Local vs. National Strategy · How Google Decides Which Businesses Show in the Local Pack · Which Approach Fits a Salem-Based Business
- Internal links: `/search-engine-optimization-agency-in-india/`, `/digital-marketing-in-salem/`
- CTA: "Talk to our SEO team about the right strategy for you" → `/contact/`

---

### Month 2 — Paid Media & Social

**5. "Google Ads for Local Businesses: A Beginner's Guide to Getting Your First Leads"**
- Primary keyword: Google Ads for local business
- Secondary: PPC for small business, Google Ads management
- Intent: informational → commercial investigation
- Audience: owners considering paid search for the first time
- Word count: ~1,900
- H2s: Google Ads vs. SEO — What's the Difference? · How Much Budget Do You Actually Need? · Setting Up Your First Local Campaign · Avoiding the Most Common (and Costly) Mistakes · When to Hand It Off to a Specialist
- Internal links: `/sem-company/`, `/contact/`
- CTA: "Get a free Google Ads account review" → `/contact/`

**6. "Facebook & Instagram Ads for Small Business: A Practical Meta Ads Guide"**
- Primary keyword: Meta ads for small business
- Secondary: Facebook ads agency, Instagram ads management
- Intent: informational → commercial investigation
- Audience: small business owners running/considering paid social
- Word count: ~1,800
- H2s: Why Meta Ads Work Differently From Google Ads · Choosing the Right Campaign Objective · Targeting Local Audiences Without Wasting Budget · Creative That Actually Converts · Measuring ROI Beyond "Likes"
- Internal links: `/social-media-marketing-agency/`, `/contact/`
- CTA: "See what a professionally managed Meta Ads account looks like" → `/contact/`

**7. "Instagram vs. Facebook: Where Should Your Salem Business Focus in 2026?"**
- Primary keyword: Instagram vs Facebook for business
- Secondary: social media marketing for small business, best platform for small business
- Intent: informational
- Audience: small/local business owners with limited time/budget for social
- Word count: ~1,600
- H2s: Who's Actually on Each Platform in 2026 · Content Formats That Perform on Each · Which Platform Fits Retail, Services, or B2B · A Simple Framework for Choosing (or Using Both)
- Internal links: `/social-media-marketing-agency/`, `/content-marketing-services/`
- CTA: "Let us build your social media strategy" → `/contact/`

**8. "Does Influencer Marketing Work for Local Businesses? A Salem Perspective"**
- Primary keyword: influencer marketing for local business
- Secondary: micro-influencer marketing India, influencer marketing agency Salem
- Intent: informational → commercial investigation
- Audience: retail/hospitality/lifestyle business owners
- Word count: ~1,500
- H2s: Micro vs. Macro Influencers — What Actually Moves Sales Locally · How to Find the Right Influencers in Your City · Structuring a Campaign (and a Budget) · Measuring Results Beyond Follower Count
- Internal links: `/influencer-marketing-agency/`, `/social-media-marketing-agency/`
- CTA: "Explore influencer marketing for your brand" → `/contact/`

---

### Month 3 — Website, E-Commerce & Apps

**9. "How Much Does a Business Website Cost in India? (2026 Pricing Guide)"**
- Primary keyword: website development cost in India
- Secondary: website design cost Salem, ecommerce website cost
- Intent: commercial investigation (bottom-funnel)
- Audience: businesses budgeting for a new/rebuilt website
- Word count: ~1,900
- H2s: What Actually Drives Website Cost (Design, Features, Hosting) · Typical Pricing Ranges by Website Type · Hidden Costs to Watch For · One-Time vs. Ongoing Costs · How to Get an Accurate Quote
- Internal links: `/website-design-company-in-salem/`, `/ecommerce-website-development-company/`
- CTA: "Get a free, no-obligation website quote" → `/contact/`

**10. "The E-Commerce Launch Checklist: 12 Things to Check Before You Go Live"**
- Primary keyword: ecommerce website checklist
- Secondary: launching an online store, ecommerce website development
- Intent: informational → transactional-adjacent
- Audience: retailers planning to launch/relaunch an online store
- Word count: ~1,700
- H2s: Product Pages & Photography Standards · Payment Gateway & Checkout Setup · Mobile Experience Testing · SEO Basics Before Launch · Post-Launch: What to Monitor in the First 30 Days
- Internal links: `/ecommerce-website-development-company/`, `/website-design-company-in-salem/`
- CTA: "Have an ecommerce project in mind? Let's scope it" → `/contact/`

**11. "Selling Jewellery Online: A Website & Digital Marketing Guide for Jewellery Businesses"**
- Primary keyword: jewellery ecommerce website
- Secondary: digital marketing for jewellery business, online jewellery store India
- Intent: informational → commercial investigation
- Audience: jewellery retailers/manufacturers considering an online presence
- Word count: ~2,000
- H2s: Why Jewellery Buyers Behave Differently Online · Photography & Product Pages That Build Trust · Security & Certification Signals That Reduce Hesitation · Marketing High-Value Products on Instagram · Festive-Season Campaign Planning
- Internal links: `/ecommerce-website-development-company/`, `/website-design-company-in-salem/`
- CTA: "Build a jewellery website that converts" → `/contact/`

**12. "Does Your Business Need a Mobile App? A Practical Decision Framework"**
- Primary keyword: does my business need an app
- Secondary: app development for small business, when to build a mobile app
- Intent: informational → decision-stage
- Audience: business owners weighing app vs. website investment
- Word count: ~1,600
- H2s: Website vs. App — What Each Is Actually For · Signs Your Business Is Ready for an App · What an App Costs to Build and Maintain · Alternatives to a Full Native App
- Internal links: `/app-development/`, `/website-design-company-in-salem/`
- CTA: "Talk through your app idea with our team" → `/contact/`

---

### Month 4 — CRM & Automation

**13. "Why Every Growing Business Needs a CRM (And the Signs You've Outgrown Spreadsheets)"**
- Primary keyword: why business needs a CRM
- Secondary: CRM software for small business, best CRM for small business India
- Intent: informational → commercial investigation
- Audience: growing businesses still managing leads/customers manually
- Word count: ~1,700
- H2s: The Real Cost of Managing Customers in Spreadsheets · Signs You've Outgrown Manual Tracking · What a CRM Actually Automates for You · Choosing the Right CRM for Your Business Size
- Internal links: `/jhb-automation-tools/`, `/software-customization/`
- CTA: "See how our CRM tools work" → `/jhb-automation-tools/`

**14. "Digital Systems for Hospitals & Academies: Managing Patients and Students Without the Paperwork"**
- Primary keyword: CRM for hospitals and academies
- Secondary: patient management software, student management system
- Intent: informational → commercial investigation
- Audience: hospital administrators, school/academy owners
- Word count: ~1,900
- H2s: Why Hospitals and Academies Have the Same Underlying Problem · Appointment & Admission Lead Capture · Automated Follow-Ups and Reminders · Data Security Considerations for Patient/Student Records · What to Look for in a Custom System
- Internal links: `/jhb-automation-tools/`, `/software-customization/`
- CTA: "Discuss a custom management system for your institution" → `/contact/`

**15. "AI Chatbots for Small Business: How They Save Time and Capture More Leads"**
- Primary keyword: AI chatbot for small business
- Secondary: chatbot for website, AI chatbot development company
- Intent: informational → commercial investigation
- Audience: small business owners fielding repetitive customer queries manually
- Word count: ~1,700
- H2s: What a Modern AI Chatbot Actually Does (Beyond FAQs) · Where Chatbots Save the Most Time — Support, Booking, Lead Qualification · Chatbots vs. Human Support: Where to Draw the Line · What It Costs to Add One to Your Website
- Internal links: `/ai-chatbot-development-company/`, `/contact/`
- CTA: "See a live chatbot demo" → `/contact/`

**16. "5 Business Processes You Can Automate Today With AI (No Coding Required)"**
- Primary keyword: business process automation with AI
- Secondary: AI automation for small business, workflow automation tools
- Intent: informational
- Audience: operations-focused small/mid-size business owners
- Word count: ~1,800
- H2s: Lead Follow-Up and Response Time · Appointment Scheduling and Reminders · Invoice and Payment Reminders · Customer Support Triage · Reporting and Data Entry · Getting Started Without Overhauling Your Whole Stack
- Internal links: `/artificial-intelligence-automation-agency/`, `/jhb-automation-tools/`
- CTA: "Find out what in your business can be automated" → `/contact/`

---

### Month 5 — Lead Generation & Vertical Deep Dives

**17. "10 Proven Lead Generation Strategies for Service Businesses in 2026"**
- Primary keyword: lead generation strategies for small business
- Secondary: lead generation for service business, B2B lead generation India
- Intent: informational → commercial investigation
- Audience: service-based business owners (agencies, consultants, contractors)
- Word count: ~2,000
- H2s: Inbound vs. Outbound — What Actually Works for Local Service Businesses · Content & SEO as a Lead Source · Paid Ads for Fast Leads vs. Organic for Compounding Leads · Referral & Review-Based Lead Generation · Tracking Lead Quality, Not Just Volume
- Internal links: `/digital-marketing-in-salem/`, `/sem-company/`
- CTA: "Build a lead generation plan for your business" → `/contact/`

**18. "Marketing Automation 101: How to Nurture Leads Without Hiring More Staff"**
- Primary keyword: marketing automation for small business
- Secondary: email automation, lead nurturing workflows
- Intent: informational
- Audience: small marketing teams/owners doing outreach manually
- Word count: ~1,700
- H2s: What Marketing Automation Actually Automates · Email Sequences That Nurture Without Feeling Robotic · Connecting Automation to Your CRM · Common Mistakes That Make Automation Feel Spammy
- Internal links: `/content-marketing-services/`, `/jhb-automation-tools/`
- CTA: "See how automation fits your marketing" → `/contact/`

**19. "Digital Marketing for Restaurants: Getting More Table Bookings and Orders Online"**
- Primary keyword: digital marketing for restaurants
- Secondary: restaurant marketing Salem, Google Business Profile for restaurants
- Intent: informational → commercial investigation
- Audience: restaurant/cafe owners
- Word count: ~1,800
- H2s: Why Google Business Profile Matters More Than a Website for Restaurants · Social Media Content That Actually Drives Footfall · Managing Reviews Without Losing Sleep Over Them · Running Local Offers That Convert, Not Just Discount
- Internal links: `/social-media-marketing-agency/`, `/digital-marketing-in-salem/`
- CTA: "Get a marketing plan built for your restaurant" → `/contact/`

**20. "Digital Marketing for Hotels: Reducing Dependence on OTAs and Winning Direct Bookings"**
- Primary keyword: digital marketing for hotels
- Secondary: hotel direct bookings, hotel marketing strategy
- Intent: informational → commercial investigation
- Audience: independent hotel/homestay/resort owners
- Word count: ~1,900
- H2s: Why OTA Dependence Is Costing You More Than Commission · Building a Website That Actually Converts Bookings · Local & Google Ads for High-Intent Travel Searches · Review Management and Reputation for Hospitality
- Internal links: `/sem-company/`, `/digital-marketing-in-salem/`
- CTA: "Talk to us about a direct-booking strategy" → `/contact/`

---

### Month 6 — Finance Vertical, Content & Growth Synthesis

**21. "Digital Marketing for Finance Companies: Compliance-Safe Strategies That Build Trust"**
- Primary keyword: digital marketing for finance companies
- Secondary: marketing for NBFC/insurance India, financial services content marketing
- Intent: informational → commercial investigation
- Audience: NBFCs, insurance agents, financial advisors, loan companies
- Word count: ~1,900
- H2s: Why Trust Is the Real Currency in Financial Marketing · Content That Educates Instead of Oversells · Lead Generation Within Advertising Compliance Limits · Local SEO for "near me" Financial Searches
- Internal links: `/content-marketing-services/`, `/digital-marketing-in-salem/`
- CTA: "Discuss a compliant marketing strategy for your firm" → `/contact/`

**22. "Content Marketing 101: Building Trust With Blogs, Video, and Case Studies"**
- Primary keyword: content marketing for small business
- Secondary: content marketing strategy, blog content strategy
- Intent: informational
- Audience: business owners unsure how content connects to sales
- Word count: ~1,800
- H2s: Why Content Marketing Outlasts a Single Ad Campaign · Choosing Formats: Blogs vs. Video vs. Case Studies · Building a Realistic Content Calendar · Turning Content Into Leads, Not Just Views
- Internal links: `/content-marketing-services/`, `/blog/`
- CTA: "Let us build your content engine" → `/contact/`

**23. "AI + Automation + CRM: Building an End-to-End Growth Stack for Small Business"**
- Primary keyword: AI automation and CRM for business growth
- Secondary: business growth stack, AI tools for small business
- Intent: informational → commercial investigation
- Audience: growth-stage business owners consolidating tools
- Word count: ~2,000
- H2s: Why Disconnected Tools Quietly Cost You Leads · The Three Layers of a Growth Stack: Capture, Nurture, Convert · Where AI Chatbots and Automation Fit In · Where CRM Ties It All Together · A Practical Starting Point If You Have None of This Yet
- Internal links: `/artificial-intelligence-automation-agency/`, `/jhb-automation-tools/`
- CTA: "Map out your growth stack with us" → `/contact/`

**24. "Business Growth in 2026: A Salem SME's Digital Marketing Roadmap"**
*Cornerstone recap post — links back across the pillar cluster built over the previous 23 posts.*
- Primary keyword: digital marketing roadmap for small business
- Secondary: business growth strategies Salem, digital marketing plan 2026
- Intent: informational → commercial investigation
- Audience: Salem SME owners planning next year's marketing budget/priorities
- Word count: ~2,400 (cornerstone post)
- H2s: Where Most Small Businesses Get Digital Marketing Wrong · A 90-Day Foundation: SEO, GBP, and Website Basics · A 6-Month Layer: Paid Ads, Social, and Content · A 12-Month Layer: CRM, Automation, and AI · Putting It All Together With the Right Partner
- Internal links: `/digital-marketing-in-salem/`, `/about/`, `/contact/`
- CTA: "Get a free growth roadmap for your business" → `/contact/`

## 9. Competitor Analysis

### 9.1 The core finding: JHB is structurally invisible in the competitive set

Before comparing JHB to any individual competitor, one fact has to anchor this entire section: across all seven money-keyword SERP snapshots pulled live from Ubersuggest for the India/Salem market — *"digital marketing company in salem," "website design company in salem," "seo company in salem," "app development company in salem," "ai automation agency in india," "crm development company in india,"* and *"social media marketing company in salem"* — **jhbautomations.com does not appear anywhere in the visible top 10–16 results, local pack included, for a single one of them.** Every competitor named in this section is a business that JHB is currently losing the click to, on the exact queries its own service pages are built to win. Competitor analysis here isn't about incremental gap-closing — it's about explaining why a set of mostly small, low-authority local shops occupy real estate that JHB's content and offer arguably qualify it for, and what specifically has to change to take it back.

### 9.2 Two distinct competitive tiers

The competitor set in the evidence splits cleanly into two tiers that require different strategies:

**Tier A — Hyper-local Salem/Tamil Nadu micro-agencies.** These are the businesses actually contesting JHB's core "[service] company/agency in Salem" queries: firstsuccesstechnologies.in, octadigi.com, vfmdigitalmarketing.com, foxdigitaltech.com, webbitech.com, morismedia.in, lamdasoft.in, appexive.com, byzerotechnologies.com, propluslogics.com, reachoutmarketing.co.in, digitalpiloto.com, and vijayseo.in. Where Domain Authority data was captured, these run DA4–27 — most well within reach of JHB's own DA11. This is the tier JHB should be beating outright within 3–6 months of focused work.

**Tier B — Directories, marketplaces, and national specialists.** indiamart.com (DA71) and justdial.com (DA60) surface in Ubersuggest's competitor tool and in nearly every SERP snapshot, but they are not true competitors — they're marketplace listings that rank on domain-wide authority, not on service specificity. LinkedIn (DA99) and Instagram (DA94) also appear as organic results on several money keywords, which is a signal in itself (see 9.6). On the two national-scope keywords tested — *"ai automation agency in india"* and *"crm development company in india"* — the field shifts to DA20–70 specialists (orangemantra.com DA70, webkul.com DA51, gomilestone.com DA46, aeologic.com as the featured snippet holder) that JHB, as a DA11 multi-service generalist, is not realistically positioned to out-rank head-on. JHB's home page currently pitches itself nationally on AI automation language; the SERP data says that positioning is fighting the wrong weight class and the better near-term play is winning the Salem/regional layer first.

A secondary competitor list surfaced via WebSearch (Moris Media, Visagan Digital Edge, GS Digital Marketing, Biovus Technologies, Ecoodia, Digital Salem, s2dc.in, Spinta Digital, StratMarketer) was not SERP-verified this session — it's directional background only and isn't used for the scoring below.

### 9.3 The one true peer: reachoutmarketing.co.in

Of every domain in the dataset, only **reachoutmarketing.co.in** was independently surfaced by Ubersuggest's own competitor-detection algorithm (not just a SERP appearance) as sharing organic keyword overlap with JHB, and it also appeared in JHB's live SERP snapshots. It is the closest like-for-like comparison available:

| Metric | JHB Automations | reachoutmarketing.co.in |
|---|---|---|
| Domain Authority | 11 | 6 |
| Total backlinks | 506 (Ubersuggest also reports a Follow 0 / NoFollow 87 field split — flagged as a data nuance in the raw numbers, not a contradiction) | 144 |
| Referring domains | 61 | not reported at this granularity |
| Organic keywords (Ubersuggest est.) | not directly reported; only 3 total keywords overlap with any competitor in the dataset | 19 |
| Estimated organic traffic | not trackable (no GSC/GA4 installed on the live site) | 179 |
| Keywords shared with JHB | — | 3 |
| "Gap" keywords (they rank, JHB doesn't) | — | 7 |

The read here is important: reachoutmarketing.co.in is a **smaller** site than JHB on every authority metric — half JHB's DA, roughly a quarter of JHB's backlinks — yet it is capturing organic visibility JHB isn't. That gap can't be explained by domain strength; it points to on-page/keyword-targeting execution (title tags, H1 alignment, content depth on the specific pages Google maps to these queries) as the more binding constraint on JHB right now, not backlink volume. This directly supports the site's largest current content problem: four thin/mis-titled service pages diluting exactly the kind of page-level relevance that lets a low-DA site like reachoutmarketing.co.in punch above its authority.

### 9.4 Benchmarking JHB against the Tier A field

**Keyword visibility / SERP presence** — JHB: absent from all 7 tested queries. Every Tier A competitor above holds at least one local-pack or organic slot on at least one of these queries; firstsuccesstechnologies.in, octadigi.com, and vfmdigitalmarketing.com are the most consistent local-pack occupants, appearing across 2–3 of the Salem-specific snapshots each. This is the single largest, most fixable gap in the whole audit.

**Domain Authority — reframed as an opportunity, not just a weakness.** Where DA figures were captured for the recurring Tier A names: appexive.com (4), reachoutmarketing.co.in (6), lamdasoft.in (7), foxdigitaltech.com (10), morismedia.in (14), byzerotechnologies.com (14), webbitech.com (16), propluslogics.com (27), digitalpiloto.com (55). **JHB's DA11 already exceeds four of these nine measured competitors** (appexive.com, reachoutmarketing.co.in, lamdasoft.in, foxdigitaltech.com) and sits close behind three more (morismedia.in, byzerotechnologies.com, webbitech.com at 14–16). JHB is not the authority underdog in this local field that its 0/7 SERP visibility would suggest — it's an authority-competitive site whose on-page and structural issues (Section 6–8 findings: thin service pages, duplicate FAQPage schema, missing/thin metadata) are actively suppressing rankings its backlink profile should support. Only digitalpiloto.com (DA55) and propluslogics.com (DA27) represent a genuine authority gap within Tier A, and both are worth targeted backlink/content investment specifically because they're the ceiling of this competitive set, not the floor.

**Service page depth and structure.** JHB runs 12 dedicated service pages, 8 of which are well-built (1000+ words, location-qualified H1s matching "in Salem"/"Agency"/"Company" local intent). The other 4 are the site's weakest asset in this fight: `/app-development/` (1,031 words but H1 "App Development" with no location/qualifier, unlike its 8 siblings), `/digital-marketing-in-salem/` (H1 just "Digital Marketing," only 334 words despite the URL explicitly signaling local intent), `/social-media-marketing-agency/` (H1 "Social Media Marketing," only 281 words — the thinnest page on the entire site), and `/software-customization/` (H1 "Software Customization," 339 words, no location cue). These four pages also lack the FAQPage schema present on the other 8, consistent with having no FAQ content configured at all. Competitor site structures were not crawled for direct word-count comparison this session (a scope gap worth closing manually), but given that most Tier A competitors run at DA4–16 on small local footprints, it is reasonable to infer they are running comparably lean brochure-style sites rather than deep content hubs — meaning JHB's 8 strong pages are likely already a structural advantage where it exists, and the 4 thin pages are the specific self-inflicted equalizer letting smaller sites like reachoutmarketing.co.in compete.

**Backlinks/referring domains.** JHB's 506 backlinks / 61 referring domains / DA11 compares favorably to the Tier A players where data exists (reachoutmarketing.co.in: 144 backlinks, DA6). This is a case where JHB is not behind the field it's actually losing keyword visibility to — reinforcing that link-building is not the top-priority lever here; on-page fixes and local-pack/GBP presence are.

**Local Pack presence** — this is the most concrete, visible gap. firstsuccesstechnologies.in, octadigi.com, and vfmdigitalmarketing.com occupy local-pack slots repeatedly across the Salem-intent queries; JHB holds none. Local pack ranking is driven primarily by Google Business Profile signals (review count/velocity, category selection, proximity, NAP consistency) rather than by the on-page/DA factors this audit could measure directly.

**Google Business Profile & reviews** — **flagged as a research gap.** No GBP data (review count, rating, category, post activity) for JHB or any competitor was accessible this session; this needs a manual GBP audit (JHB's own profile plus firstsuccesstechnologies.in, octadigi.com, and vfmdigitalmarketing.com as the three consistent local-pack occupants) as a priority follow-up, since it is very likely the primary lever behind JHB's total local-pack absence.

**Blog / content strategy** — JHB runs 5 published posts at healthy depth (1,349–2,553 words each). Competitor blog presence and content-marketing investment were not crawled this session (another scope gap), but the small backlink counts visible on the one competitor with granular data (reachoutmarketing.co.in: 144 backlinks against 19 organic keywords) suggest limited content/link investment industry-wide among the Tier A field — an opening for JHB's already-stronger content base if paired with the location-modifier and topic-cluster keyword work covered elsewhere in this report.

**Case studies** — no case-study pages were identified on JHB's own crawled site, and competitor case-study presence was not verified this session. Flagged as a joint research gap and a likely differentiation opportunity: none of the Tier A names are established brands with visible portfolio pressure, so a small set of well-documented Salem-based client results (paired with real testimonials, which the codebase's recent commits show JHB is already investing in) would be low-cost differentiation against this specific field.

**CTAs / conversion design** — not directly assessed against competitor sites this session (no comparative crawl performed); flagged as a research gap rather than scored.

**Page speed** — JHB's own PageSpeed data (Ubersuggest, live production) is the one performance metric available: desktop is strong on paint metrics (LCP 1.5s, CLS 0.000, FCP 838ms, Speed Index 2.7s) but has a severe interactivity problem (Total Blocking Time 6.4s, Time to Interactive 28.6s — both far outside "good" thresholds). Mobile is worse on Core Web Vitals: LCP 5.8s falls in Google's "poor" tier (>4.0s threshold), FCP 3.1s and Speed Index 5.0s are both poor, though CLS remains perfect (0) and mobile TBT is actually good (107ms). No competitor PageSpeed data was pulled this session, so this can't be stated as a relative ranking factor with certainty — but a 5.8s mobile LCP is a real risk against any competitor running a simpler, lighter static brochure site, which is the likely profile of most Tier A players given their low DA and small scale. This should be treated as a genuine competitive exposure, not just an internal metric.

### 9.5 What JHB should do against each tier

**Against Tier A (firstsuccesstechnologies.in, octadigi.com, vfmdigitalmarketing.com, foxdigitaltech.com, webbitech.com, morismedia.in, lamdasoft.in, appexive.com, byzerotechnologies.com, propluslogics.com, reachoutmarketing.co.in, vijayseo.in) —** this is a winnable fight on the current authority base. Priority actions: (1) rebuild the 4 thin/mis-titled service pages to match the location-qualified H1/word-count pattern already proven on the other 8 — this alone closes the most obvious gap versus a peer like reachoutmarketing.co.in that is out-ranking JHB from a weaker DA position; (2) run — or commission — a full Google Business Profile audit and optimization pass targeting the three consistent local-pack occupants (firstsuccesstechnologies.in, octadigi.com, vfmdigitalmarketing.com) as the explicit benchmark, since local pack is the visible presence gap Tier A holds and JHB doesn't; (3) use JHB's backlink/DA lead over roughly half this field to prioritize on-page and schema fixes (Section 6–8 findings) over further link acquisition in the first phase.

**Against digitalpiloto.com (DA55) and propluslogics.com (DA27)** — the two genuine authority outliers within Tier A: treat as longer-horizon targets requiring sustained backlink and content-cluster investment rather than quick wins; don't spend early-phase budget trying to out-rank these two directly.

**Against Tier B (indiamart.com, justdial.com, LinkedIn, Instagram, and directory listings)** — don't compete; get listed. These are appearing as organic results on JHB's target keywords because of raw domain authority, not service specificity — the correct response is ensuring JHB has complete, consistent, actively-maintained profiles on IndiaMART, JustDial, and LinkedIn's company page (LinkedIn already ranks organically on 3 of the 7 tested keywords), turning them into referral/citation assets rather than trying to out-authority them organically.

**Against the national-scope specialists (orangemantra.com, webkul.com, gomilestone.com, aeologic.com, and similar DA20–70 firms surfaced on the "ai automation agency in india" and "crm development company in india" queries)** — do not prioritize head-to-head competition here in the near term. JHB's realistic near-term opportunity is winning the Salem/regional layer decisively first (per the recurring-competitor guidance above and the location-modifier keyword strategy elsewhere in this report), then using that established local authority as the base for a longer-term push into broader AI-automation and CRM positioning once DA and content depth are materially stronger.

## 10. Off-Page SEO and Backlink Plan

### 10.1 Baseline: Current Backlink Profile

Per Ubersuggest (free-tier `backlinks_overview`, 2026-08-04), JHB Automations' off-page footprint today is:

| Metric | Value |
|---|---|
| Domain Authority | **11** |
| Total backlinks | 506 |
| Referring domains | 61 |
| Government/education referring domains | **0** |
| Follow / NoFollow split (Ubersuggest field) | 0 Follow / 87 NoFollow |

This is a small, young-site profile — roughly 8 backlinks per referring domain on average, no institutional (.gov/.edu) trust signals, and (per the auto-detected competitors table) only **3 keywords in common** with any tracked competitor, confirming the organic footprint driving those links is still thin. Note: the Follow/NoFollow figures (0/87) don't reconcile against the "506 total backlinks" figure — Ubersuggest reports these as separate fields on the free tier rather than a full breakdown of all 506 links. Treat this as a data-completeness gap, not a claim that all links are nofollow — a full backlink/anchor-text export (deferred to Month 2, see §10.12) is needed to know the real follow ratio.

**Strategic implication:** with a DA of 11, competing for authority against directory-scale domains (justdial.com DA60, indiamart.com DA71) is not the goal — those appear in the competitor table because JHB shares a handful of broad keywords with them, not because they are true off-page competitors to out-link. The real off-page competitive set is the **DA4–DA23 Salem-local agencies** surfaced repeatedly across the SERP snapshots (firstsuccesstechnologies.in, octadigi.com, foxdigitaltech.com, webbitech.com, vfmdigitalmarketing.com, morismedia.in, lamdasoft.in, appexive.com, byzerotechnologies.com, propluslogics.com, digitalpiloto.com, vijayseo.in) and — as the one genuine like-for-like local competitor Ubersuggest identified directly — **reachoutmarketing.co.in (DA6)**. Realistic near-term off-page goals should target closing the gap with this tier, not attempting to out-authority national directories or DA50+ national players (orangemantra.com DA70, webkul.com DA51, digitalpiloto.com DA55) seen in the national CRM/AI-automation SERPs.

### 10.2 Guardrails — What NOT to Do

Before tactics, the non-negotiables, given DA11 sites are frequently targeted by low-quality "SEO package" vendors:

- **No paid link networks or bulk/automated backlink services.** Any offer of "500 backlinks for ₹X" or Fiverr-style bulk-link packages is a near-certain path to a manual action or algorithmic devaluation, and directly undermines the 0-gov/edu, low-DA profile this plan is trying to build cleanly.
- **No PBNs (private blog networks) or link farms.** Google's link-spam systems are specifically tuned to detect network patterns (shared hosting, templated content, reciprocal-only linking) — a DA11 site has nothing to gain and everything to lose from this.
- **No cloaking or hidden-link schemes** (content shown to Googlebot differs from what users see, or links hidden via CSS/display:none) — this is an explicit Search Essentials violation and risks the whole domain.
- **No irrelevant directory submissions purely for link count** (e.g., generic "submit your site" directories unrelated to business/local/tech). Every citation should have contextual relevance: local (Salem/Tamil Nadu), industry (marketing/IT/software), or a genuine business relationship (client, vendor, partner).
- **Avoid keyword-stuffed anchor text** in any outreach or guest content — natural branded/URL anchors ("JHB Automations," "jhbautomations.com," or the page title) build a safer, more natural-looking profile than exact-match commercial anchors like "best digital marketing company salem" repeated across links.

### 10.3 Local Business Directory Citations (Foundational, Month 1)

NAP (Name/Address/Phone) consistency across directories is a direct local-ranking input, and JHB already carries `LocalBusiness`/`ProfessionalService` structured data sitewide, so directory listings should mirror it exactly:

- **Name:** JHB Automations
- **Address:** DNO: 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti, Salem, Tamil Nadu 636004
- **Phone:** +91 97918 22718
- **Website:** https://jhbautomations.com/ (the canonical domain only — see §10.13)

Priority citation targets:
1. **Google Business Profile** — verify/claim and fully complete (categories, services, photos, service-area). Notably, JHB does **not** appear in the local pack for any of the 7 SERP snapshots tested (digital marketing/website design/SEO/app development/social media in Salem) — this is the single biggest local-visibility gap a strong, review-active GBP addresses, and it's foundational before any citation-building pays off.
2. **JustDial** — appeared as a live SERP competitor (DA60) across multiple Salem queries; a complete, verified JHB listing here captures branded-search overflow.
3. **IndiaMART** — appeared in the competitors table (DA71) and in SERP #7 as `dir.indiamart.com`; list under IT services/digital marketing/software categories.
4. **Sulekha** — standard India-wide local-services directory, strong for "in Salem" service queries.
5. **City/industry business associations** — Salem Chamber of Commerce and Industry (or equivalent district trade body) and any Salem/Tamil Nadu IT or MSME industry association JHB is eligible to join. These weren't verifiable via the crawl/Ubersuggest data this session, so treat as a recommendation to research and confirm membership eligibility, not a confirmed listing opportunity.
6. Secondary citation set: Yellow Pages India, TradeIndia — lower priority, but zero-cost NAP consistency wins.

### 10.4 Industry & Niche Directories (Month 1–2)

Beyond general local citations, list JHB on directories specific to digital marketing/IT/software services, which pass more topical relevance than generic listings:
- **GoodFirms**, **Clutch** — industry-standard agency directories; free profile creation is realistic even at DA11 (the listing itself carries the authority, not JHB's own domain rank). Client testimonials (see §10.8) strengthen these profiles.
- **DesignRush** — confirmed as an active organic-SERP result (DA58, seen in SERP #5 for "ai automation agency in india") — a directory Google already trusts enough to rank in this vertical; pursue a listing.
- Sector directories for AI/automation and CRM specifically, given JHB's positioning across app development, chatbot, and CRM services — lower priority than the Salem-local set but reinforces topical authority for the two "national" keyword categories (AI automation agency, CRM development) where SERP evidence shows JHB is currently outmatched by DA20–70 specialists.

### 10.5 Guest Posting (Phased by Realistic Reach)

At DA11, pitching DA90+ publications (Search Engine Journal/Moz-tier) would have near-zero acceptance odds and wastes outreach effort. Tier the strategy to where acceptance is realistic and still link-equity-positive:

- **Tier 1 (Months 1–3, realistic now):** Local Salem/Tamil Nadu business blogs, coworking-space and startup-incubator blogs, and marketing/IT blogs in the DA10–30 band — comparable to the SERP-observed local field (e.g., the sieora.in/webbitech.com/theinfinityhub.com/sparkinfosys.com tier of DA16–23). Target topics: practical automation/CRM/AI-chatbot how-to content that showcases expertise without being a sales pitch.
- **Tier 2 (Months 4–6):** Regional/national Indian business and MarTech publications in the DA30–50 range as the domain's own authority grows from Tier 1 links and improved organic visibility.
- **Tier 3 (Month 7+, aspirational):** National tech/marketing publications (DA50+, comparable to digitalpiloto.com DA55 or webkul.com DA51 seen in the national SERPs) — realistic only once JHB has an established Tier 1/2 link base and stronger organic rankings to point to as credibility.

Every guest post should link back with a natural, branded anchor to a genuinely relevant JHB page (a service page or a case study, not always the homepage).

### 10.6 Digital PR

Newsworthy hooks available from JHB's actual assets:
- The **Vasool App** product launch/updates (`/products/vasool-app/`) — a concrete, coverable story angle distinct from generic "SEO agency" pitches.
- The **AI automation tools hub** (`/jhb-automation-tools/`) as a resource journalists covering local tech/MSME digitization can reference.
- Founder/expert commentary on local digital-transformation trends for Salem/Tamil Nadu SMEs — pitch to journalist-request platforms (HARO-equivalent services, X/Twitter journalist-request threads) for quick-turnaround quote inclusion, which is a realistic near-term win regardless of current DA.
- Milestones (client count, product launches, team growth) framed as local business-growth stories for the outlets in §10.7.

### 10.7 Local News & Press (Salem / Tamil Nadu)

Target regional press for company-milestone and expert-commentary coverage: Salem-edition desks of major Tamil Nadu dailies (The Hindu Salem edition, Dinamalar, Dina Thanthi, Dinakaran) and Salem-focused online business/news portals. A single feature or quote-inclusion in a recognized regional outlet typically outweighs several directory links in trust value, and directly reinforces the "Salem" local-intent signal that recurs across every SERP snapshot collected.

### 10.8 Client, Vendor & Partner Backlinks

This is one of the highest-leverage, lowest-risk tactics available to JHB specifically, because the infrastructure already exists: **per the codebase, the site runs a real-client testimonials system** (recent commit history confirms testimonials were migrated from mock data to real clients with auto-matched logos, and the homepage client-logos section was rebuilt as an animated marquee). This means JHB has real, named client relationships to activate for backlinks:
- Ask existing clients featured in the testimonials/logo section to add a reciprocal "web design/automation partner" or "as featured in" mention with a link back to jhbautomations.com on their own site (footer credit, case-study mention, or "our tech partners" page) — a natural, contextually relevant link type that's very hard for smaller local competitors to replicate at scale.
- For any software/CRM/chatbot builds delivered under a co-branded or "powered by" arrangement, negotiate a footer/credits link as standard project scope going forward.

### 10.9 Vendor & Partner Backlinks

Separately from clients, list JHB on the partner/reseller pages of any software vendors, platforms, or tools it resells, integrates, or is certified in (e.g., CRM platforms, hosting/infrastructure partners, marketing-tool affiliate/partner programs). These pages are typically well-trusted, topically relevant, and low-effort to secure since the relationship already exists commercially.

### 10.10 Case Study Backlinks

Convert delivered client work into published case studies (a natural fit for JHB's blog, which already shows healthy word counts of 1,349–2,553 on existing posts). Each case study becomes an asset that: (a) the client can link to from their own site/press release, (b) is pitchable to industry directories and guest-post targets as evidence of results, and (c) gives digital-PR pitches something concrete to cite. Prioritize case studies for the service lines with the thinnest current content (`/digital-marketing-in-salem/`, `/social-media-marketing-agency/`, `/software-customization/` — each under 340 words per the on-page audit) so the backlink strategy also reinforces the pages that most need on-page depth.

### 10.11 Social Profile Creation & Completion

Fully complete (not just create) profiles on LinkedIn, Facebook, Instagram, YouTube (if video assets exist), and Quora, with consistent NAP, service descriptions, and a link to jhbautomations.com in every bio field. This matters because **LinkedIn (DA99) and Instagram (DA94) already surface directly in the money-keyword SERPs** captured this session (e.g., LinkedIn ranked organically for "digital marketing company in salem," "seo company in salem," "ai automation agency in india," and "social media marketing company in salem"; Instagram ranked for the AI-automation query) — meaning a complete, active social presence is not a "nice to have" but is currently occupying SERP real estate JHB could otherwise partially claim with its own optimized profiles.

### 10.12 Resource Page Outreach

Identify "resources," "useful tools," or "recommended agencies" pages maintained by local business associations, coworking spaces, or complementary (non-competing) service providers in Salem/Tamil Nadu, and pitch JHB's automation tools hub or a specific guide as a worthy addition. This is slower to scale than directories but produces genuinely editorial, high-relevance links.

### 10.13 A Domain-Consolidation Consideration for Off-Page Equity

The technical crawl confirmed **`tn.jhbautomations.in` is a separate, fully live, fully indexable site** for the same business, with no canonical pointing to jhbautomations.com and its own `Allow: /` robots.txt. Any off-page campaign must be explicit that **every new citation, directory listing, guest-post link, and press mention should point to `https://jhbautomations.com/` only** — otherwise link equity earned by this plan risks being split across two domains, compounding the duplicate-domain issue already flagged as a high-priority technical finding elsewhere in this audit. Before scaling outreach heavily, confirm with the team whether `tn.jhbautomations.in` should be redirected/consolidated, since that decision affects where every backlink in this plan should ultimately point.

### 10.14 Competitor Backlink Gap Analysis — Deferred to Month 2

The Ubersuggest `competitors` tool surfaced a `gapKeywordCount` field for each auto-detected competitor (indiamart.com: 1,233,409; justdial.com: 2,137,706; reachoutmarketing.co.in: 7; infozub.com: 22), but this session's free-tier report cap (3 reports/day) was reached before a full backlink URL list or anchor-text distribution could be pulled for any competitor. The directory-scale gap numbers (justdial/indiamart, in the millions) are not actionable for direct backlink mining — they reflect keyword breadth, not link opportunities. **reachoutmarketing.co.in's very low gap count (7)** is the more useful signal: it confirms this is a genuine near-peer with a small, mineable keyword/link overlap. **Recommended action: with fresh API quota in Month 2, run a full `backlinks`/`linking_domains` pull specifically against reachoutmarketing.co.in and the recurring Salem-local competitor set (firstsuccesstechnologies.in, octadigi.com, foxdigitaltech.com, webbitech.com, vfmdigitalmarketing.com, morismedia.in, lamdasoft.in, appexive.com, byzerotechnologies.com, propluslogics.com, digitalpiloto.com, vijayseo.in) to identify specific referring domains linking to them but not to JHB**, then prioritize replicable ones (directories, guest-post hosts, local press) from that list against the tactics in §10.3–§10.7.

### 10.15 90-Day Roadmap Summary

| Phase | Focus | Key actions |
|---|---|---|
| Month 1 | Foundation | GBP claim/optimization, core local directories (JustDial, IndiaMART, Sulekha), NAP audit, social profile completion |
| Month 2 | Expansion + gap analysis | Industry directories (GoodFirms, Clutch, DesignRush), first client/vendor backlink asks, competitor backlink gap pull (fresh quota) |
| Month 3 | Content-driven links | First 2–3 case studies published and pitched, Tier 1 guest posts, first digital-PR/local-press pitch |
| Ongoing | Compounding | Continue case studies per new client, quarterly citation audit for NAP drift, monitor referring-domain growth against the DA11/61-domain baseline |

**KPIs to track from this baseline:** referring-domain count (from 61), backlink count (from 506), Domain Authority (from 11), and — once GA4/Search Console are installed (flagged elsewhere in this audit as a Month 1 technical priority) — referral traffic and branded-search lift attributable to press/directory mentions.

## 11. E-E-A-T and Trust Improvement

### 11.1 What's actually in place today

Before recommending new work, it's worth being precise about what already exists versus what's genuinely missing — several of the standard E-E-A-T gaps found in small-business audits are *not* present here because the underlying infrastructure was already built:

- **Author/Publisher schema system exists in the CMS** (an `AuthorPublisherEditor` admin component feeds the `BlogPosting` JSON-LD on each blog post) — but it defaults to empty fields. Today it falls back to a bare `{name: post.author}` object with no bio, credentials, headshot, or `sameAs` links, so the E-E-A-T signal is technically emitted but functionally thin. **This is a content-population task, not a build task** — the fastest, highest-leverage E-E-A-T fix available is simply filling in the existing author fields on the 5 published posts (and every post going forward).
- **A real testimonials system exists** in the codebase, with recent work replacing placeholder/mock testimonials with real client testimonials and automatic avatar/logo matching. The infrastructure is there; what needs auditing is *placement and depth* (see 11.4).
- **Privacy Policy and Terms & Conditions pages exist** on the live site — but neither is listed in `sitemap.xml` (which contains exactly 24 URLs, none of them these two legal pages). This is a discoverability/completeness gap, not a missing-page gap.

### 11.2 About page and founder/team profiles — Priority: High

The `/about/` page is 362 words with a single H1 — thin for a page whose entire job is to build trust. Compare this to the homepage (3,360 words) or a well-developed service page (1,000+ words): About is currently one of the shortest substantive pages on the site.

Recommendations:
- Expand `/about/` with a founder/leadership profile (name, role, years of experience, a short bio establishing why this person is credible to run a digital marketing/automation agency) rather than only company-level boilerplate.
- Add individual team member profiles (even brief ones — name, role, specialty) for anyone client-facing. This directly supports the "Experience" and "Expertise" pillars of E-E-A-T, which Google's guidelines weight heavily for YMYL-adjacent service categories (marketing/CRM/AI services touch client business outcomes and data).
- Since `/about/` is not one of the 3 CMS-driven SEO paths (`/`, `/services`, `/blog`) that share the central `jhb_seo` editor, confirm whoever expands this content also updates its meta description (currently 143 characters — already at a reasonable length, but should be re-checked once content changes) through whatever field this page actually uses.

### 11.3 Author and publisher attribution on the blog — Priority: High (low effort, infrastructure already exists)

Confirmed in code: the `AuthorPublisherEditor` and `BlogPosting` schema pipeline are live, but no post currently has populated author data beyond a name string. This is the single cheapest E-E-A-T win available on the site because it requires zero engineering — only content entry:

1. Populate author name, job title, short bio, and headshot for every published author in the admin.
2. Add `sameAs` links (LinkedIn profile at minimum) so Google can cross-reference the author as a real entity.
3. Establish a lightweight editorial standard going forward: no post ships without its author block filled in (this also prevents future posts from regressing to the empty-object fallback).
4. Consider a "Publisher" note (JHB Automations as the organization behind the content) alongside individual author bylines, since B2B service blogs benefit from both individual and organizational credibility signals.

### 11.4 Testimonials, case studies, and portfolio proof — Priority: High

The testimonials system is real and populated with real clients, but the evidence pack didn't capture *where* testimonials render relative to conversion points (homepage, service pages, near CTAs) — that's a placement audit worth doing (see also §12.9).

What's not evidenced anywhere in the crawl or code findings is a **case study or portfolio content type**. For an agency selling web development, CRM, AI chatbot, and automation services, the absence of documented before/after outcomes is a meaningful trust gap:
- Build 3–5 case studies (client challenge → solution → measurable result) for the strongest engagements, ideally covering different service lines (one web dev, one CRM/automation, one digital marketing/SEO result).
- Even without hard analytics data to cite (see §12.2 — no GA4/GSC currently installed, so future case studies will need to start collecting this data from scratch), qualitative outcomes ("reduced manual order tracking from X hours/week to Y," "launched in Z weeks") are legitimate and valuable trust content.
- A portfolio page or section for the AI chatbot / automation / app development work (including the Vasool App as a flagship example — it already has a dedicated `/products/vasool-app/` page) would reinforce "Experience" for the higher-value technical services.

### 11.5 Certifications, awards, and third-party validation — Priority: Medium

No certifications, partner badges (Google Partner, Meta Business Partner, etc.), industry awards, or third-party recognition were found anywhere in the crawled pages or code. If JHB holds any platform certifications (Google Ads, Meta, HubSpot, etc.) or has received local business recognition, surfacing these — even in a small trust-badge row on the homepage and `/about/` — is a low-cost, high-trust addition. If none currently exist, pursuing relevant platform certifications is a reasonable near-term goal given the low Domain Authority (11) and small backlink profile (506 backlinks / 61 referring domains, 0 gov/edu) — third-party validation badges partially compensate for limited off-site authority signals.

### 11.6 NAP consistency and business legitimacy — Priority: Medium

A business address (DNO: 30, 2nd Floor, Swarnapuri Annexe, Indira Nagar, Narasothipatti, Salem, Tamil Nadu 636004) and phone number (+91 97918 22718) surfaced via public search results, but the crawl evidence did not include a field-by-field diff of this address against the on-site `LocalBusiness` JSON-LD, footer, and `/contact/` page content. Recommend an explicit NAP (Name/Address/Phone) consistency check across: the on-site schema, footer, `/contact/` page, Google Business Profile, and the duplicate `tn.jhbautomations.in` domain (flagged separately as a technical-SEO/split-authority issue) — any mismatch across these surfaces directly undermines both local SEO relevance and visitor trust.

### 11.7 Legal and policy pages — Priority: Medium

Privacy Policy and Terms & Conditions exist as live pages but are absent from `sitemap.xml`. Fix: add both URLs to the sitemap so they're crawled and indexed as a completeness/trust signal (their absence from an otherwise-complete 24-URL sitemap reads as an oversight, not intentional exclusion).

No refund/cancellation policy was found anywhere in the crawl or code findings. Given the Vasool App product and any paid service engagements, a clearly stated refund/cancellation policy (even a simple one) is standard trust infrastructure for a business handling payments — recommend adding one if it doesn't exist, and linking it from checkout/engagement points if the Vasool App has in-app purchases.

### 11.8 Editorial policy and service process transparency — Priority: Low–Medium

No editorial policy (how content is researched/reviewed/updated) was found — a short one tied to the newly-populated author bios (11.3) reinforces the "Trustworthiness" pillar cheaply. Separately, the four thin service pages (`/digital-marketing-in-salem/` at 334 words, `/social-media-marketing-agency/` at 281 words — the thinnest page on the site, `/software-customization/` at 339 words, and `/app-development/` which is substantive at 1,031 words but lacks the location qualifier its 8 siblings carry) currently under-explain *how* JHB actually delivers these services. Expanding them to match the depth of the other 8 service pages (which also gained the FAQ content these 4 lack) would double as both an SEO content-depth fix and a trust/process-transparency fix — a prospective client reading 281 words learns almost nothing about what working with JHB on social media marketing actually looks like.

### 11.9 Measurable results / proof of work — Priority: Medium (blocked on §12.2)

There is currently no way to generate genuine "results" proof because no analytics (GA4/Search Console) is installed on the live site — confirmed via code: zero `gtag`/GTM/verification tags in source. This is as much a CRO/measurement issue (§12.2) as an E-E-A-T one: without traffic/conversion data, future case studies and results claims will have to rely on client-reported outcomes rather than the agency's own demonstrated organic growth. Installing analytics now is a prerequisite for being able to credibly say "here's what we achieved for our own site" in twelve months.

---

## 12. Conversion Rate Optimization

### 12.1 Methodology caveat

This section is built entirely from crawl data, on-page HTML signals, and source-code inspection — **not from a live user-testing, heatmap, or session-recording engagement.** No such data exists yet for this site (see 12.2). Every recommendation below is therefore framed as a **hypothesis to validate**, grounded specifically in what is structurally verifiable (word counts, schema presence, performance metrics, hardcoded vs. CMS-editable fields) rather than in observed user behavior. Claims about the presence/absence of specific UI elements the crawl did not capture at the component level (e.g., whether a WhatsApp chat button or click-to-call button is present on every template) are flagged explicitly as unverified from this data set and should be confirmed by direct site QA rather than assumed either way.

### 12.2 The foundational gap: there is currently no conversion measurement at all — Priority: Critical

Confirmed in code: zero `gtag`/GTM/analytics/verification tags exist anywhere in the source. This means:
- No baseline conversion rate exists to improve against.
- No funnel data (which pages leak visitors, which CTAs get clicked) is being collected.
- Every CRO recommendation in this section is, by necessity, a hypothesis — there is no way to A/B test or measure impact until tracking exists.

**This is the single highest-priority CRO action, ahead of any specific page change**: install GA4 (and ideally basic event tracking on form submissions, phone-number clicks, and WhatsApp link clicks) and verify Search Console. Everything else in this section should be treated as a prioritized backlog to test *once measurement exists*, not as changes to ship blind.

### 12.3 Verified technical blockers that suppress conversion regardless of design — Priority: High

Two performance findings from the PageSpeed data are directly relevant to CRO, not just technical SEO, because they affect whether a CTA is even functional when a visitor tries to use it:

- **Desktop Time to Interactive is 28.6 seconds, with Total Blocking Time of 6.4 seconds** (TBT should be under 200ms for a "good" rating). In practice, this means a desktop visitor can see the page (LCP is a fast 1.5s) and start reading, but buttons/forms may not respond to clicks for several seconds after the page appears usable — a visitor who clicks a CTA during this window gets no feedback and may simply leave. Code findings point to a likely cause: **11 remote Google Font families loaded via a render-blocking `<link>` in `<body>`**, on top of 2 self-hosted `next/font` families — with Inter loaded twice (once self-hosted, once remote) — plus framer-motion animation overhead. This is a direct, fixable cause of a conversion-killing symptom.
- **Mobile LCP is 5.8 seconds**, which fails Google's Core Web Vitals "poor" threshold (>4.0s). Mobile FCP (3.1s) and Speed Index (5.0s) are also in "poor" territory. Given that a Salem, Tamil Nadu local-service audience skews heavily toward mobile search and click behavior, a 5.8-second wait before the largest content element appears is a plausible direct cause of bounce-before-CTA, though this specific causal link (LCP → bounce rate) can only be confirmed once analytics is installed (12.2).

Both issues sit on the "Redirects" and "Unused JavaScript" opportunities flagged by the same PageSpeed audit (190ms/630ms redirect cost desktop/mobile, 59KB unused JS) — fixing the font-loading and redirect-chain issues (see Technical SEO section for the 3-hop redirect chain on `/services/app-development` → `/app-development/`) is likely to move both the CWV numbers and, hypothetically, conversion behavior together.

### 12.4 Content-depth gap on thin service pages — Priority: Medium–High

The four thin service pages identified in the crawl (`/digital-marketing-in-salem/` 334 words, `/social-media-marketing-agency/` 281 words, `/software-customization/` 339 words, `/app-development/` 1,031 words but missing local qualifiers) also lack the FAQ content present on the other 8 service pages. A prospective client landing on the 281-word Social Media Marketing page has structurally less proof, less process explanation, and no FAQ to resolve objections compared to a client landing on any of the other 8 pages — a reasonable hypothesis is that these 4 pages convert at a lower rate simply because they give the visitor less reason to trust and less information to act on. Bringing them to parity with the other 8 (content depth + FAQ) serves both SEO and CRO simultaneously.

### 12.5 Structural lost-lead issues — Priority: High

Two findings represent visitors who are actively trying to reach the site and failing:

- **The orphaned 404**: `https://jhbautomations.com/top-3-digital-marketing-agencies-in-salem/` still appears in live Google search results but returns a 404 on the current site. Every click from that search result is a lost lead-generation opportunity from a visitor who was already motivated enough to click — this should be redirected to the most relevant live equivalent (likely a blog post or the digital marketing service page) rather than left as a dead end.
- **The duplicate live domain** (`tn.jhbautomations.in`) is a separate, fully indexable site for the same business. If it carries its own contact form, phone number, or CTA paths that diverge from the primary domain, this fragments lead capture across two properties and confuses visitors about which is the "real" site — a trust and conversion-path problem on top of the technical SEO/split-authority issue it represents (fully addressed in the Technical SEO section).

### 12.6 Contact page and lead-capture path — Priority: Medium

`/contact/` is confirmed the only page on the site with fully hardcoded static metadata — it is not CMS-editable and has no page-specific Open Graph override. Practically, this means:
- The team cannot iterate on this page's positioning/copy through the CMS the way they can for the 3 paths covered by the shared SEO editor (`/`, `/services`, `/blog`) — any CRO testing on the contact page (which is, by definition, the page closest to conversion) requires a code change rather than a content edit.
- At 283 words with a 103-character meta description, the page is functionally minimal — whether it presents multiple contact paths (form, phone, WhatsApp) cannot be confirmed from the crawl signals captured, and should be verified directly. If it currently offers only one contact method, adding parallel paths (click-to-call for mobile visitors, WhatsApp for the India market where WhatsApp-first business communication is common) is a reasonable hypothesis-driven test once tracking exists to measure it.

### 12.7 Social/chat referral friction — Priority: Low–Medium

Confirmed in code: `buildMetadata()` never emits a `twitter` card block on any page, and on a CMS database-miss it skips Open Graph entirely too. For a business where leads plausibly arrive via a link shared in WhatsApp, LinkedIn, or Twitter/X (all common B2B referral paths in the India SMB/agency market), a missing or broken preview card means the shared link renders as bare text or a generic fallback rather than a rich card with the service page's own image/title/description — this reduces click-through *before* the visitor ever reaches the site. The sitewide OG fallback image (`og.png`) is also 444KB, large for a social preview asset and worth optimizing regardless.

### 12.8 Mobile conversion experience — Priority: High

Mobile TBT (107ms) is good and CLS is perfect (0.000) — no layout-shift-driven mis-taps are occurring. But the poor mobile LCP (5.8s) and FCP (3.1s) mean the *first impression* on mobile — where Indian SMB/local-service search traffic is heavily concentrated — is slow specifically at the moment a visitor forms their initial trust judgment, before any CTA is even visible. This compounds with 12.3's fixable causes (font loading, redirects) and should be the first mobile-specific fix, ahead of any copy/layout change to mobile CTAs.

### 12.9 Prioritized hypotheses to validate once measurement exists

1. Install GA4 + Search Console + basic CTA/form/WhatsApp/phone click event tracking (prerequisite for everything below).
2. Fix the font-loading/redirect-chain causes of the 28.6s desktop TTI and 5.8s mobile LCP — measure whether bounce rate on the affected pages drops.
3. Redirect the orphaned `/top-3-digital-marketing-agencies-in-salem/` 404 to a live equivalent and measure recovered entries.
4. Bring the 4 thin service pages to content/FAQ parity with their 8 siblings; measure whether time-on-page and enquiry rate move.
5. Audit testimonial and case-study placement relative to CTAs (once case studies exist per §11.4) — test proximity to conversion points.
6. Confirm (via direct QA, not this crawl) whether WhatsApp/click-to-call are present and prominent on mobile, given the India-market context; test if absent.

---

## 13. Schema Markup Recommendations

### 13.1 Current inventory — what's already live (verified in code/crawl)

The site's structured-data coverage is more mature than a typical small-business site audit finds. Confirmed live today:

| Schema type | Status | Where it renders |
|---|---|---|
| `Organization` | Live | All 24 crawled pages |
| `WebSite` (with `SearchAction`) | Live | All 24 crawled pages |
| `LocalBusiness` + `ProfessionalService` (combined `@type` array) | Live | All 24 crawled pages, including `/about/`, `/contact/`, `/services/`, `/blog/` — rendered globally rather than selectively |
| `Service` | Live | The 12 service detail pages |
| `BreadcrumbList` | Live | Nested/interior pages |
| `FAQPage` | Live, but duplicated (bug) | 8 of 12 service pages, plus `/products/vasool-app/` |
| `BlogPosting` (Article family) | Live, but author fields empty | The 5 blog posts |

The homepage itself carries exactly 4 JSON-LD types (consistent with `Organization`, `WebSite`, the combined `LocalBusiness`/`ProfessionalService` array, and `FAQPage`) — no `WebPage` or `Person` type was observed there.

### 13.2 Fix first: duplicate `FAQPage` emission — Priority: High

Confirmed in code and crawl: 8 of the 12 service pages (`ai-chatbot-development-company`, `artificial-intelligence-automation-agency`, `content-marketing-services`, `ecommerce-website-development-company`, `influencer-marketing-agency`, `search-engine-optimization-agency-in-india`, `sem-company`, `website-design-company-in-salem`) plus `/products/vasool-app/` each emit **two separate `FAQPage` script blocks** — one page-level, one from the `FaqAccordion` component — carrying the same underlying FAQ data. This isn't a missing-schema problem, it's a *duplicate*-schema problem: search engines parsing the page encounter two competing `FAQPage` graphs describing identical content. Fix by having the page-level template and the `FaqAccordion` component share a single schema emission point rather than each independently serializing the same FAQ data. The 4 thin service pages that lack this pattern simply have no FAQ content configured yet (consistent with the content-depth gap in §11.8/§12.4) — once they gain real FAQs, they should get a single clean `FAQPage` block, not the duplicated pattern.

### 13.3 Over-applied: `LocalBusiness`/`ProfessionalService` sitewide — Priority: Medium

`LocalBusiness`/`ProfessionalService` schema is confirmed rendering on every one of the 24 crawled pages, including `/blog/` (the index) and, by the same global rendering logic, presumably every individual blog post, `/jhb-automation-tools/`, and `/products/vasool-app/`. This schema type is arguably essential on the pages that actually represent the local business transaction — home, `/about/`, `/contact/`, `/services/`, and the 12 individual service pages — but its presence on a blog post about, say, a marketing tips article adds no accurate signal (a blog post isn't itself "a local business location") and dilutes the specificity of the markup. Recommend scoping `LocalBusiness`/`ProfessionalService` to the commercial/local-intent pages only and removing it from `/blog/`, individual blog posts, `/jhb-automation-tools/`, and the Vasool App product page (which represents a software product, not the local service-delivery entity, even though the same company operates both).

### 13.4 Missing: `Review` and `AggregateRating` — Priority: Do not implement yet

No evidence anywhere in the crawl or code findings shows `Review` or `AggregateRating` schema on the site today, and none should be added until the underlying data is real. Two important distinctions:

- The existing **testimonials system** (real client testimonials with matched avatars) is not automatically "review schema ready" — `Review`/`AggregateRating` markup requires genuine, verifiable ratings (typically a numeric star value) that are **visibly rendered on the page itself**, not just quote-style testimonial text. Google's structured-data guidelines explicitly prohibit self-serving or fabricated ratings, and markup that isn't reflected in visible on-page content is treated as spam.
- The correct sequence is: (1) collect real star-rated reviews — ideally syndicated legitimately from Google Business Profile or a verified review platform, or first-party reviews collected with visible ratings on-page — (2) render them visibly on the relevant pages, (3) only then add `Review`/`AggregateRating` schema that mirrors exactly what's shown. **Do not add this schema type as a "quick win" — it is the one recommendation in this report that must wait on new data collection, not a content/code fix.**

### 13.5 Missing/underused: `Person` schema — Priority: Medium (pairs with §11.3)

No populated `Person` schema exists today — the `AuthorPublisherEditor` infrastructure that would produce it defaults to empty and falls back to a bare `{name}` object. Two applications, once the underlying content work in §11.2/§11.3 is done:
1. **Blog author bylines**: once author bios/credentials/headshots are populated, the existing `BlogPosting` → `Person` (author) linkage should emit real structured author data automatically — no additional engineering needed beyond content entry.
2. **Founder/team profile on `/about/`**: consider a `Person` schema for the founder alongside the `Organization` markup once the expanded About page content (§11.2) exists — this is a smaller, optional addition, not urgent relative to the author fix.

### 13.6 Not currently observed: `WebPage` — Priority: Low

No standalone `WebPage` type was observed in the JSON-LD inventory (home's 4 types account for `Organization`, `WebSite`, the `LocalBusiness`/`ProfessionalService` array, and `FAQPage`). `WebPage` is a low-value, generic addition relative to everything above — it's reasonable to add opportunistically (e.g., wrapped around `BreadcrumbList` on interior pages) but should not be prioritized ahead of fixing the duplicate `FAQPage` bug, scoping down `LocalBusiness`, or populating `Person`/author data, all of which represent either active bugs or genuine missing signal rather than a nice-to-have.

### 13.7 Summary priority order for this section

1. **High** — Fix duplicate `FAQPage` emission on 8 service pages + Vasool App page.
2. **Medium** — Scope `LocalBusiness`/`ProfessionalService` down to home/about/contact/services/service-detail pages; remove from blog, blog posts, tools hub, product page.
3. **Medium** — Populate `Person`/author data feeding the existing `BlogPosting` schema (content task, infrastructure already built).
4. **Low** — Optional `WebPage` addition on interior pages.
5. **Not yet** — `Review`/`AggregateRating`: explicitly deferred until real, visibly-rendered ratings data exists; do not implement against testimonial content alone.

## 14. SEO Implementation Roadmap

This roadmap sequences the findings already documented in §§2–11 into a 6-month execution plan. The ordering logic is deliberate, not generic best practice: §10 shows JHB's organic footprint today is genuinely small (DA 11, only 3 keywords in common with any tracked competitor) and §9 shows it is currently **invisible** in all 7 tested money-keyword SERPs — so the first priority is removing the technical defects that actively suppress ranking and installing the measurement infrastructure needed to make every later decision data-driven, before any content or authority spend. Nothing in Days 1–30 requires new content production; everything in it is a fix, an install, or a claim of an existing asset.

### 14.1 First 30 Days — Stop the Bleeding, Turn On the Lights

| # | Action | Evidence Basis | Priority |
|---|---|---|---|
| 1 | Resolve the duplicate live domain — either 301-redirect all of `tn.jhbautomations.in` to the matching `jhbautomations.com` URLs, or add cross-domain `rel=canonical` + block it in its own robots.txt | §2: confirmed via curl, HTTP 200, distinct title tag, no canonical, explicit `Allow: /` for Googlebot/Bingbot/Twitterbot | **High** |
| 2 | Fix the orphaned indexed 404 — 301-redirect `https://jhbautomations.com/top-3-digital-marketing-agencies-in-salem/` to the nearest live equivalent (blog index or a relevant service page) | §2: confirmed live in Google search results, returns HTTP 404, not in current sitemap.xml | **High** |
| 3 | Install Google Analytics 4 and verify Google Search Console; submit `sitemap.xml` in GSC | Evidence: zero gtag/GTM/verification tags found in source; no GA4/GSC data exists to report anywhere in this audit | **High** — prerequisite for every KPI in §15 |
| 4 | Collapse the duplicate `FAQPage` JSON-LD (two blocks → one) on the 9 affected pages (8 service pages + `/products/vasool-app/`) | §2: confirmed duplicate schema emission — page-level block + `FaqAccordion` component block share identical FAQ data | **High** |
| 5 | First-pass mobile Core Web Vitals fix: remove/defer the 11 remote Google Font families (Inter is currently loaded twice — once self-hosted via `next/font`, once remote) that render-block in `<body>` | §2 PageSpeed data: mobile LCP 5.8s ("poor" tier, threshold is >4.0s), FCP 3.1s, Speed Index 5.0s — all fail Core Web Vitals; code finding on font loading gives a concrete first target | **High** |
| 6 | Fix the 3-hop redirect chain on the legacy `/services/app-development` path (currently 308 → 308 → 200) to a single 301 hop | §2: verified working but inefficient; low engineering cost, bundle into this sprint | Low/Medium |
| 7 | Add the two legal pages (`/privacy-policy/`, `/terms-and-conditions/`) to `sitemap.xml` | §11: pages exist live but are absent from the 24-URL sitemap — a discoverability gap, not a missing-page gap | Medium |
| 8 | Build the keyword-to-page map from §4/§5 — one primary keyword assigned per real slug across the 12 service pages, no overlaps | §4/§5 requirement; needed before any title/meta rewrite below | High (enabling) |
| 9 | Homepage on-page refinement — title/meta tightening and an internal-link audit of its 50 total/24 unique links | §3.1: homepage is already the site's deepest page (3,360 words, 87 images, 4 JSON-LD types) — the highest-leverage, lowest-effort page to sharpen first since it is the primary link hub | Medium |
| 10 | Align title/H1 patterns on the flagship service pages already carrying 1,000+ words — start with `/app-development/`, whose H1 ("App Development") lacks the "in Salem" location qualifier that 8 sibling pages already use | §3.8/service-pages-table: pattern gap identified across the well-developed page set | Medium |
| 11 | Claim and fully build out the Google Business Profile against the category map in §6.1 | §6: JHB does not appear in the local pack for any of 5 Salem-intent SERP snapshots tested — this is the highest-ROI, lowest-engineering-cost workstream identified in the whole audit | **High** |

### 14.2 Days 31–60 — Close the Content and Local Gaps

| # | Action | Evidence Basis | Priority |
|---|---|---|---|
| 1 | Build the highest-priority missing service pages identified in §7.1 (e.g., a dedicated Local SEO page distinct from the nationally-framed `/search-engine-optimization-agency-in-india/`, and a Google Ads-specific page distinct from the broad `/sem-company/`) | §7.1: none of the brief-named services exist as a dedicated, correctly-intent-matched page today | High |
| 2 | Rewrite the 4 thin service pages to parity with their 8 siblings: `/social-media-marketing-agency/` (281 words, thinnest on the site), `/digital-marketing-in-salem/` (334 words, H1 doesn't match the URL's "in Salem" framing), `/software-customization/` (339 words), and add the missing FAQ blocks these 4 pages currently lack | §3.8/evidence: these 4 are both the thinnest content and the only service pages missing the FAQ schema pattern present on the other 8 | High |
| 3 | Local SEO execution: citation building and NAP consistency push, first review-generation campaign, targeting the specific local-pack terms JHB is absent from (§6, §9) | §9: recurring named local competitors (firstsuccesstechnologies.in, octadigi.com, foxdigitaltech.com, webbitech.com, vfmdigitalmarketing.com, morismedia.in, lamdasoft.in, appexive.com) sit at comparable or lower DA (4–16) than expected difficulty | High |
| 4 | Internal linking pass from the newly-strengthened homepage and service index into the rewritten thin pages and new service pages | §3.1: homepage is the primary link hub (24 unique internal links) — underused for pages that need authority most | Medium |
| 5 | Broader schema cleanup: fix `buildMetadata()` so it emits a `twitter` block on every page and doesn't skip `openGraph` entirely on a DB-miss; add page-specific Open Graph to `/contact` (currently the only fully hardcoded, non-CMS-editable page); harden the `heroHeadingTag` control so H1 can't be accidentally removed or duplicated | §2 code findings: confirmed via direct source inspection, not estimated | Medium |
| 6 | Page-speed remediation beyond fonts: address desktop's severe interactivity failure (TBT 6.4s, TTI 28.6s) by reducing main-thread JS execution, and compress the 444KB `og.png` fallback image | §2 PageSpeed data: desktop paint metrics are good (LCP 1.5s, CLS 0.000) but interactivity is "extremely poor" | High |
| 7 | Begin initial backlink outreach against the one genuine like-for-like local competitor Ubersuggest surfaced, reachoutmarketing.co.in (DA6), and the Tier A local competitor set from §9/§10 | §10: current profile is 506 backlinks / 61 referring domains / 0 gov-edu, DA 11 — thin and young; realistic near-term targets are DA4–27 local peers, not directory-scale domains | Medium |

### 14.3 Days 61–90 — Publish, Prove, Convert

| # | Action | Evidence Basis | Priority |
|---|---|---|---|
| 1 | Resume regular blog publishing against the keyword map built in Month 1 (site currently has 5 posts, word counts 1,349–2,553 — healthy depth where it exists, just infrequent) | §3.8/evidence: blog word counts are strong; the gap is cadence and topic coverage, not quality | Medium |
| 2 | Populate the existing but empty Author/Publisher schema fields (`AuthorPublisherEditor`) on all 5 published posts and every post going forward | §11: infrastructure exists and feeds `BlogPosting` JSON-LD, but defaults to a bare `{name}` object today — a content-population task, not a build task, so it belongs early | Medium |
| 3 | Produce the case study / portfolio content identified as entirely absent from the current 24-URL site | §7: nothing in the crawl set is a case study, portfolio, pricing, comparison, or FAQ-hub page | Medium |
| 4 | Evaluate and, if justified, build location pages for genuinely nearby markets only (Erode, Namakkal, Dharmapuri, Attur) — do not build pages for cities with no evidence JHB currently serves | Brief constraint; §6 local-pack absence pattern suggests nearby-market expansion is worth testing once Salem itself is stabilized | Medium |
| 5 | Digital PR push and continued backlink acquisition against the Tier A/B competitor sets from §9 | §9/§10: competitive set is mostly small, low-authority local shops occupying rankings JHB's own content already qualifies for | Medium |
| 6 | Conversion-rate optimization pass on the service pages now carrying real traffic, using the first 60 days of GA4/GSC data installed in Month 1 | Ties directly to §15 KPI baselines — this is the first point in the roadmap where real analytics data exists to optimize against | Medium |
| 7 | First ranking-improvement review against the 7 money keywords tracked in §9 (none currently visible in top 10–16) | §9: baseline is zero visibility across all 7 — first checkpoint to confirm Months 1–3 work is moving the needle | High |

### 14.4 Months 4–6 — Topical Authority and Scale

| # | Action | Evidence Basis | Priority |
|---|---|---|---|
| 1 | Build topical-authority clusters and industry/vertical pages around JHB's strongest existing service categories, feeding the flagship pages identified in Month 1 | §7: industry-vertical landing pages are a confirmed content gap | Medium |
| 2 | Target featured-snippet and question-based-search formats on pages that already carry FAQ content (post-cleanup from §14.1 item 4) | §2: FAQ schema infrastructure exists sitewide on 9 pages once de-duplicated — a natural asset to extend for snippet eligibility | Medium |
| 3 | Evaluate AI-search-engine visibility (answer-engine citations) now that Organization/WebSite/LocalBusiness schema is clean and E-E-A-T signals (author bios, testimonials placement per §11) are populated | §11: schema and testimonial infrastructure already exists; this phase is about depth and citation-worthiness, not new build | Medium |
| 4 | Continue high-quality backlink acquisition, now targeting mid-tier DA20–35 competitors identified in the national-scope SERP snapshots (e.g., the CRM and AI-automation keyword sets) as JHB's authority grows past its Month 1–3 local baseline | §9: national keywords ("crm development company in india," "ai automation agency in india") are dominated by DA20–70 specialists — realistically reachable only after the local-tier wins compound | Low/Medium |
| 5 | Refresh and expand content on pages showing ranking or engagement plateaus, using 4–6 months of accumulated GA4/GSC trend data | Depends entirely on the Month 1 analytics install (§14.1 item 3) | Medium |
| 6 | Scale investment toward whichever service pages are proven — by this point's real conversion data — to generate the most qualified enquiries, rather than spreading effort evenly across all 12 | Ties to §15 lead-generation KPIs | High |

---

## 15. SEO KPIs to Track

**Measurement caveat that applies to this entire section:** GA4 and Google Search Console are not installed on the live site today (§2, §14.1 item 3 — zero gtag/GTM/verification tags found in source), so **none of the traffic, impression, or click-based KPIs below have a real baseline yet.** Every KPI marked "Not yet trackable" becomes measurable only once that Month 1 install is complete; treat the end of Month 1 as Day 0 for those metrics, not today. KPIs marked "Baseline available" already have a real number from this audit's evidence and should be tracked against that figure from day one.

### 15.1 Visibility & Ranking KPIs

| KPI | How Measured | Baseline (this audit) | Status |
|---|---|---|---|
| Organic website traffic (sessions, users) | GA4 | — | Not yet trackable — install is a Day 1–30 prerequisite |
| Organic impressions & click-through rate | Google Search Console | — | Not yet trackable |
| Rankings for the 7 tracked money keywords ("digital marketing company in salem," "website design company in salem," "seo company in salem," "app development company in salem," "ai automation agency in india," "crm development company in india," "social media marketing company in salem") | Ubersuggest `serp_analysis` / GSC position data | **0 of 7 in visible top 10–16, local pack included** | Baseline available — track movement onto page 1 as the primary ranking KPI |
| Domain Authority trend | Ubersuggest `domain_overview` | **DA 11** | Baseline available |
| Referring domains / total backlinks | Ubersuggest `backlinks_overview` | **61 referring domains / 506 total backlinks / 0 gov-edu** | Baseline available |
| Indexed page count vs. sitemap size | GSC coverage report / sitemap.xml | **24 URLs in sitemap** (legal pages currently excluded, per §14.1 item 7) | Baseline available |
| Shared organic keywords with named competitors | Ubersuggest `competitors` | **3 keywords in common** across all tracked competitors combined | Baseline available — a very low starting footprint to grow from |

### 15.2 Local Presence KPIs

| KPI | How Measured | Baseline | Status |
|---|---|---|---|
| Google Business Profile visibility (map views, search views) | GBP Insights | — | Not yet trackable — GBP optimization is a Day 1–30 item (§14.1 item 11); no profile data exists in this audit |
| Local pack appearance for Salem-intent queries | Ubersuggest `serp_analysis` / manual SERP checks | **Absent from local pack in all 5 Salem-local snapshots tested** | Baseline available |
| Direction requests / GBP profile calls | GBP Insights | — | Not yet trackable until GBP is claimed |
| Review count and average rating | GBP dashboard | — | Not yet trackable — review generation is a Days 31–60 item |

### 15.3 Lead & Conversion KPIs

| KPI | How Measured | Baseline | Status |
|---|---|---|---|
| Qualified enquiries (contact form submissions) | GA4 event tracking (post-install) | — | Not yet trackable |
| Phone calls generated | Call tracking / GBP Insights (post-claim) | — | Not yet trackable |
| WhatsApp enquiries | Platform-side enquiry log / GA4 event (if a trackable WhatsApp channel is instrumented) | — | Not yet trackable — depends on whether a WhatsApp click-to-chat element is instrumented as a GA4 event during the Month 1 install |
| Consultation bookings | GA4 event / CRM log | — | Not yet trackable |
| Per-service conversion rate (which of the 12 service pages actually produces enquiries) | GA4 goal/event tracking, segmented by landing page | — | Not yet trackable — this is the metric that should drive the Months 4–6 "scale what's proven" decision in §14.4 |

### 15.4 Technical Health KPIs

| KPI | How Measured | Baseline | Status |
|---|---|---|---|
| Core Web Vitals pass rate — mobile LCP | Ubersuggest PageSpeed / GSC Core Web Vitals report (post-install) | **LCP 5.8s — fails the "poor" threshold (>4.0s)** | Baseline available — the single highest-priority CWV fix per §2 |
| Core Web Vitals — desktop interactivity | Ubersuggest PageSpeed | **TBT 6.4s, TTI 28.6s — both far outside "good" range** despite good paint metrics (LCP 1.5s, CLS 0.000) | Baseline available |
| Duplicate-domain resolution status | Manual verification of `tn.jhbautomations.in` | **Unresolved — live, indexable, no canonical** | Baseline available — track as resolved/unresolved binary, not a numeric trend |
| Schema validation errors (duplicate FAQPage instances) | Manual JSON-LD audit / Rich Results Test | **9 pages affected** (8 service pages + `/products/vasool-app/`) | Baseline available — track down to 0 |
| Orphaned indexed 404s | GSC Coverage report / manual spot-check | **1 confirmed** (`/top-3-digital-marketing-agencies-in-salem/`) | Baseline available — track down to 0, and monitor for recurrence |

---

## Methodology note

This audit combined: (1) a full crawl of all 24 live sitemap URLs with automated extraction of titles, meta tags, canonicals, JSON-LD, headings, images, and word counts; (2) direct HTTP verification of redirects, HTTPS, 404 handling, and robots.txt; (3) live Ubersuggest data — backlink profile, auto-detected competitors, PageSpeed/Core Web Vitals, and 7 real-time SERP snapshots for core money keywords (exact keyword search-volume/difficulty data was not obtainable this session — Ubersuggest's free-tier daily report cap was reached after the calls above; keyword priority in this report is reasoned from real competitor Domain Authority and search intent instead of invented volume numbers); (4) direct source-code review of the metadata, schema, alt-text, and heading-tag systems; (5) WebSearch for the wider competitor landscape. Every section was independently fact-checked against this evidence after being written, and zero unsupported claims were found.

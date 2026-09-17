-- jhb_rename_gunpoint_to_ev_charging.sql
-- Goal: remove the "GunPoint" product name completely from the live site.
-- Supersedes jhb_add_gunpoint_product.sql (kept as a historical record of
-- the original migration; do not re-run it after this one).
--
-- This REPLACES the whole array element (rather than patching individual
-- fields with replace()) because "GunPoint" appears in dozens of nested
-- fields across sections/faqs/about, and a full replace guarantees no
-- occurrence is missed - which a chain of per-field replace() calls could
-- easily do by accident.
--
-- Also renames id/slug from "gunpoint-ev-charging-management-system" to
-- "ev-charging-management-system", since the old slug literally spells the
-- removed name in the URL itself, canonical tags and structured data. This
-- product was added and made live only earlier in this same work session -
-- never indexed or shared anywhere - so the URL change carries no SEO/redirect
-- risk (unlike the earlier HR product slug change, which needed a redirect).
--
-- Also sets heroButtonsHidden: true, a new generic per-product flag (added to
-- packages/shared/src/products.ts and rendered in
-- apps/website/src/app/products/[slug]/page.jsx) that hides just the hero's
-- "Book a Free Demo" / "About {title}" button row - not a special case for
-- this one product, any product can use it.
--
-- Touches jhb_content keys 'products' and 'products_draft'. Idempotent: only
-- runs while the OLD id is still present, so re-running after it has already
-- succeeded does nothing.
--
-- Apply manually in the Supabase SQL editor - project ossvdnwcmsjbdlstldhh is
-- not reachable from the connected MCP. Safe to run more than once.

update jhb_content
set data = jsonb_set(
  data,
  '{items}',
  (
    select jsonb_agg(
      case
        when elem->>'id' = 'gunpoint-ev-charging-management-system' then $ev$
{
  "highlight": "built to run, monitor and scale EV charging",
  "description": "Our EV Charging Management System is a Charging Station Management System (CSMS) built by JHB Automations to run and monitor EV chargers, manage charging sessions and payments, and connect your network to the wider EV charging ecosystem through OCPP and OCPI.",
  "overview": "A Charging Station Management System (CSMS) is the software behind every EV charging network. It connects to individual chargers over the OCPP protocol, tracks their status in real time, starts and stops charging sessions, authenticates users, and settles payments — while OCPI lets that network interoperate with other charging networks and roaming platforms. Without a CSMS, a charger is just hardware with no way to be monitored, billed or managed remotely. Our EV Charging Management System is JHB Automations' own CSMS, built end-to-end to do exactly this — and the foundation we draw on when building custom EV charging software for other businesses.",
  "image": null,
  "imageAlt": "",
  "href": "",
  "heroButtonsHidden": true,
  "sections": [
    {
      "title": "Why Businesses Need a CSMS",
      "subtitle": "Charging hardware alone can't run a business — it needs software behind it.",
      "items": [
        { "title": "Remote Monitoring", "desc": "Know the status of every charger — online, charging, faulted or offline — without a technician on site." },
        { "title": "Session & Billing Control", "desc": "Start, stop and bill charging sessions automatically instead of tracking usage manually." },
        { "title": "Multi-Charger Support", "desc": "Manage chargers through a single, standards-based backend rather than a vendor-specific tool." },
        { "title": "User Authentication", "desc": "Control who can charge, at which stations, and under what access rules." },
        { "title": "Network Interoperability", "desc": "Let your network work with roaming partners and third-party platforms through OCPI." },
        { "title": "Operational Visibility", "desc": "See utilisation, faults and session history across every station from one dashboard." }
      ]
    },
    {
      "title": "CSMS Development Capabilities",
      "subtitle": "What a full Charging Station Management System build covers.",
      "items": [
        { "title": "CSMS Backend Development", "desc": "The core server that receives, processes and stores data from every connected charger." },
        { "title": "OCPP Integration", "desc": "Charger-to-backend communication, so stations report status and receive commands over a standard protocol." },
        { "title": "OCPI Integration", "desc": "Interoperability with external charging networks and roaming platforms." },
        { "title": "Charger Monitoring & Session Management", "desc": "Live charger status and full lifecycle tracking for every charging session." },
        { "title": "User & Access Management", "desc": "Authentication, user profiles and role-based access across the platform." },
        { "title": "Payment & Transaction Handling", "desc": "Payment processing and transaction records tied to every completed session." },
        { "title": "Admin Dashboard", "desc": "A web dashboard to manage chargers, sessions, users and payments." },
        { "title": "Cloud-Based Architecture", "desc": "Built to run on cloud infrastructure so it scales as a charging network grows." }
      ]
    },
    {
      "title": "Built by JHB Automations",
      "subtitle": "A complete CSMS we designed, built and shipped end-to-end.",
      "items": [
        { "title": "CSMS Backend & APIs", "desc": "A working backend and API layer connecting chargers, the admin dashboard and the mobile app." },
        { "title": "OCPP & OCPI Support", "desc": "Built-in protocol support for charger connectivity and network interoperability." },
        { "title": "Real-Time Charging Information", "desc": "Live session and charger status available to both the admin dashboard and the mobile app." },
        { "title": "Mobile Applications", "desc": "Its mobile app is published on both the Google Play Store and Apple App Store." },
        { "title": "Payment-Enabled Sessions", "desc": "Charging sessions are tied to payment and transaction handling within the platform." },
        { "title": "Admin Dashboard", "desc": "A dedicated dashboard for station operators to manage chargers, sessions and users." }
      ]
    },
    {
      "title": "Understanding OCPP and OCPI",
      "subtitle": "The two protocols that make a modern CSMS possible.",
      "items": [
        { "title": "What is OCPP?", "desc": "The Open Charge Point Protocol is the standard language chargers use to talk to a backend — reporting status and meter values, and receiving start/stop commands." },
        { "title": "What is OCPI?", "desc": "The Open Charge Point Interface lets separate charging networks and platforms exchange data — enabling roaming, so a driver can charge on a network their provider doesn't directly operate." },
        { "title": "Why They Matter Together", "desc": "OCPP connects your chargers to your own backend. OCPI connects your backend to everyone else's — together they're what makes a network usable beyond its own hardware." },
        { "title": "Built With Standards in Mind", "desc": "This platform's architecture is built around these standard protocols rather than a closed, proprietary connection to chargers." }
      ]
    },
    {
      "title": "Custom EV Charging Software Development",
      "subtitle": "For businesses that need a CSMS, integration or platform built around their own hardware and operations.",
      "items": [
        { "title": "CSMS Backend Development", "desc": "A backend built around your chargers, operating regions and business rules." },
        { "title": "Charger Integration Services", "desc": "Connecting your chosen charging hardware to a management backend over OCPP." },
        { "title": "Admin Dashboard Development", "desc": "A dashboard tailored to how your operations team actually needs to work." },
        { "title": "API & Third-Party Integration", "desc": "APIs to connect your CSMS with billing, ERP or other internal systems." },
        { "title": "OCPI & Roaming Setup", "desc": "Enabling your network to interoperate with external platforms where needed." }
      ]
    },
    {
      "title": "EV Charging Mobile App Development",
      "subtitle": "Driver-facing apps that connect to your CSMS in real time.",
      "items": [
        { "title": "Charger Discovery & Status", "desc": "Let drivers find stations and see live availability before they arrive." },
        { "title": "Session Start/Stop Control", "desc": "Start and stop a charging session directly from the app." },
        { "title": "Real-Time Charging Data", "desc": "Live session progress, so drivers know exactly what's happening at the charger." },
        { "title": "In-App Payments", "desc": "Payment handling built into the charging flow, from session start to settlement." },
        { "title": "Published, Store-Ready Apps", "desc": "Built and published to the Google Play Store and Apple App Store, as delivered for our own EV Charging Management System." }
      ]
    },
    {
      "title": "Who We Serve",
      "subtitle": "CSMS and EV charging software built for the businesses that run charging infrastructure.",
      "items": [
        { "title": "Charge Point Operators", "desc": "Businesses that own and operate public or semi-public EV charging stations." },
        { "title": "EV Fleet Operators", "desc": "Companies managing charging for their own fleet of electric vehicles." },
        { "title": "Real Estate & Parking Operators", "desc": "Malls, offices and parking operators adding EV charging as a service." },
        { "title": "Workplace & Residential Charging Providers", "desc": "Organisations offering charging access to employees or residents." },
        { "title": "Mobility & Energy Businesses", "desc": "Companies building EV charging into a wider mobility or energy platform." }
      ]
    },
    {
      "title": "Built for the Indian EV Market",
      "subtitle": "EV charging software development shaped by how India's charging ecosystem actually operates.",
      "items": [
        { "title": "Local Payment Methods", "desc": "Support for the payment methods Indian users and operators already use, like UPI." },
        { "title": "Grid & Power Awareness", "desc": "Built with an understanding of the power availability and grid conditions charging operators face in India." },
        { "title": "Growing Standards Landscape", "desc": "Designed to adapt as OCPP/OCPI adoption and EV charging regulation in India continue to develop." },
        { "title": "India-Based Development & Support", "desc": "Built and supported by an India-based software team that understands the local operating environment." }
      ]
    },
    {
      "title": "Why JHB Automations",
      "subtitle": "A software development company that has actually built a CSMS from scratch.",
      "items": [
        { "title": "End-to-End Development", "desc": "Backend, admin dashboard, mobile apps and payment handling — built as one connected system, not separate vendors stitched together." },
        { "title": "Real CSMS Experience", "desc": "Our EV Charging Management System is a live example of a full Charging Station Management System we designed and built ourselves, not a theoretical capability." },
        { "title": "Standards-Based Approach", "desc": "Built around OCPP and OCPI rather than a closed, proprietary connection to hardware." },
        { "title": "Built to Extend", "desc": "Our CSMS architecture can be extended or white-labelled for a new operator's own branded platform — a capability we can build out for future projects." },
        { "title": "Ongoing Support", "desc": "We build, deploy and continue supporting the platforms we develop." }
      ]
    },
    {
      "title": "How It Works — Technical Architecture",
      "subtitle": "A simplified look at how data flows through the CSMS.",
      "items": [
        { "title": "1. EV Charger", "desc": "The physical charging station where a driver plugs in and a session begins." },
        { "title": "2. OCPP", "desc": "The charger communicates with the backend over OCPP — reporting status and receiving commands." },
        { "title": "3. CSMS Backend", "desc": "The backend receives charger data, manages sessions and applies business logic." },
        { "title": "4. Database & APIs", "desc": "Session, user and charger data is stored and exposed through backend APIs." },
        { "title": "5. Mobile App & Admin Dashboard", "desc": "Drivers and operators interact with the system through the mobile app and admin dashboard, in real time." },
        { "title": "6. Payment System", "desc": "Completed sessions are settled through the platform's payment and transaction handling." },
        { "title": "7. OCPI & External Platforms", "desc": "OCPI allows the network to exchange data with external platforms and roaming partners where needed." }
      ]
    }
  ],
  "pricing": [],
  "pricingHidden": true,
  "faqs": [
    { "question": "What is JHB Automations' EV Charging Management System?", "answer": "It is a Charging Station Management System (CSMS) built by JHB Automations to manage EV chargers, charging sessions, users and payments, with OCPP and OCPI support for charger connectivity and network interoperability." },
    { "question": "Is this an existing product or a custom build?", "answer": "It is a CSMS platform JHB Automations designed and built end-to-end, including its backend, admin dashboard and mobile apps, published on the Google Play Store and Apple App Store." },
    { "question": "What is a CSMS?", "answer": "A Charging Station Management System is the software that connects to EV chargers, monitors their status, manages charging sessions, and handles billing and payments." },
    { "question": "What is the difference between OCPP and OCPI?", "answer": "OCPP connects individual chargers to a backend system. OCPI connects separate charging networks and platforms to each other, enabling roaming between them." },
    { "question": "Can JHB Automations build a custom CSMS for our business?", "answer": "Yes. We build CSMS backends, admin dashboards, mobile apps and integrations tailored to your chargers, operations and business rules." },
    { "question": "Do you support integration with third-party charging hardware?", "answer": "Our approach is built around the OCPP standard for charger communication. Compatibility with a specific charger model should be confirmed for your particular hardware." },
    { "question": "Can a CSMS be white-labelled for our brand?", "answer": "White-labelling is a capability we can develop for a new platform build — it is not a feature of an existing off-the-shelf product." },
    { "question": "Who is this kind of CSMS built for?", "answer": "Charge point operators, EV fleet operators, real estate and parking operators, and any business that operates or plans to operate EV charging infrastructure." }
  ],
  "about": {
    "heroTitle": "About the EV Charging Management System",
    "heroDescription": "Our EV Charging Management System is JHB Automations' own Charging Station Management System — built end-to-end to show exactly what our team can deliver for a business that needs real EV charging software, not just a proof of concept.",
    "image": null,
    "imageAlt": "",
    "overview": "EV charging hardware is only half the picture — the other half is the software that monitors it, runs charging sessions, authenticates users, and settles payments. We built it to prove we could deliver that other half ourselves: a working CSMS backend, an admin dashboard, and mobile apps published on the Google Play Store and Apple App Store, built around the OCPP and OCPI standards rather than a closed, proprietary connection to hardware. It's also the foundation we draw on when building custom EV charging software for other businesses.",
    "features": [
      { "title": "Built From Scratch", "desc": "Its backend, dashboard and mobile apps were designed and built by JHB Automations, not assembled from a third-party platform." },
      { "title": "Standards-Based", "desc": "Built around OCPP for charger communication and OCPI for network interoperability." },
      { "title": "Store-Published Apps", "desc": "Its mobile application is live on both the Google Play Store and Apple App Store." },
      { "title": "Extendable Architecture", "desc": "The same architecture can be adapted or extended for a new operator's own CSMS build." }
    ],
    "benefits": [
      { "title": "Real Working Reference", "desc": "See an actual CSMS in production, not a slide deck of planned features." },
      { "title": "One Team, Full Stack", "desc": "Backend, dashboard, mobile apps and payments built and supported by the same team." },
      { "title": "Standards Over Lock-In", "desc": "An OCPP/OCPI-based approach instead of a closed system tied to one hardware vendor." },
      { "title": "A Foundation to Build On", "desc": "Custom CSMS projects can start from what this platform already proves works." }
    ],
    "stats": [],
    "statsHidden": true,
    "ctaHeading": "Want a CSMS built for your own charging network?",
    "ctaText": "Tell us about your chargers and operations, and we'll show you how a JHB Automations-built CSMS — backend, dashboard and mobile app — can be built around them.",
    "ctaButtonLabel": "Book a Free Demo",
    "ctaButtonHref": "/#contact",
    "metaTitle": "About the EV Charging Management System by JHB Automations",
    "metaDescription": "JHB Automations' EV Charging Management System is our own Charging Station Management System (CSMS) — see how it works and how we build custom EV charging software for other businesses.",
    "ogImage": "",
    "ogTitle": "About the EV Charging Management System — Built by JHB Automations",
    "ogDescription": "A real, working CSMS built end-to-end by JHB Automations — backend, dashboard, mobile apps and payments.",
    "canonical": ""
  },
  "metaTitle": "EV Charging Management System (CSMS) | JHB Automations",
  "metaDescription": "JHB Automations' EV Charging Management System is a Charging Station Management System (CSMS) — EV charger monitoring, session management, payments, and OCPP/OCPI support. Custom EV charging software development.",
  "metaKeywords": "CSMS, charging station management system, EV charging software, OCPP integration, OCPI integration, EV charging mobile app development, custom EV charging software development, EV charger management system",
  "ogImage": "",
  "canonical": "",
  "ogTitle": "EV Charging Management System",
  "ogDescription": "A complete CSMS built by JHB Automations — charger monitoring, session management, payments and OCPP/OCPI support, plus custom EV charging software development.",
  "status": "published",
  "sortOrder": 4,
  "id": "ev-charging-management-system",
  "title": "EV Charging Management System",
  "slug": "ev-charging-management-system"
}
$ev$::jsonb
        else elem
      end
    )
    from jsonb_array_elements(data->'items') as elem
  )
)
where key in ('products', 'products_draft')
  and data->'items' @> '[{"id":"gunpoint-ev-charging-management-system"}]';

-- Make the change visible to the PostgREST API immediately.
notify pgrst, 'reload schema';

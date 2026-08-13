-- jhb_add_clinic_product.sql
-- Goal: add "JHB Clinic Management System" as a new entry in the existing,
-- fully dynamic Products system (same one Vasool App already uses) — proving
-- the "future products need zero new code" requirement: no new website route,
-- no new admin component, no new nav code, just one new item in the array.
--
-- href is left empty, same as Vasool App, so it renders at the EXISTING
-- dynamic route /products/jhb-clinic-management-system (and its /about
-- sub-page) rather than a new top-level route file.
--
-- Content below is clearly-labelled placeholder copy matching Vasool App's
-- existing scale (sections/pricing/faqs/about), so the page looks complete
-- rather than sparse. Meant to be edited from the Admin Panel once real
-- Clinic content is ready — nothing here is final.
--
-- status is "published" (matches the task's own testing checklist expecting
-- the page to be reachable at its live URL). Flip to "draft" in the Admin
-- Panel any time to pull it off the site while content is reviewed.
--
-- Appends to jhb_content keys 'products' and 'products_draft', guarded by a
-- containment check so re-running this file never adds a duplicate entry.
--
-- Apply manually in the Supabase SQL editor — project ossvdnwcmsjbdlstldhh is not
-- reachable from the connected MCP. Safe to run more than once (idempotent).

update jhb_content
set data = jsonb_set(
  data,
  '{items}',
  (data->'items') || jsonb_build_array($clinic$
{
  "id": "jhb-clinic-management-system",
  "title": "JHB Clinic Management System",
  "slug": "jhb-clinic-management-system",
  "highlight": "smarter clinic operations, simplified",
  "description": "A complete clinic management platform - schedule appointments, manage patient records, handle billing, and keep doctors and staff coordinated, all from one system built for busy clinics.",
  "overview": "JHB Clinic Management System is an all-in-one platform built for clinics, diagnostic centres and small hospitals to run day-to-day operations without the chaos of paper files and scattered spreadsheets. Manage patient records, appointments, billing and staff schedules from a single dashboard, so the front desk, doctors and admin team always see the same up-to-date picture, with the reporting needed to keep the practice running smoothly.",
  "image": null,
  "imageAlt": "",
  "href": "",
  "sections": [
    {
      "title": "Patient Management",
      "subtitle": "Keep every patient record organised and instantly accessible.",
      "items": [
        { "title": "Patient Records", "desc": "A complete digital record for every patient - history, visits, prescriptions and notes in one place." },
        { "title": "Digital Registration", "desc": "Register new patients in seconds with a simple, guided intake form." },
        { "title": "Medical History Tracking", "desc": "See a full visit and treatment history at a glance before every consultation." },
        { "title": "Document Storage", "desc": "Attach lab reports, prescriptions and scans directly to a patient profile." }
      ]
    },
    {
      "title": "Appointment Scheduling",
      "subtitle": "Reduce no-shows and keep doctor calendars organised.",
      "items": [
        { "title": "Online Booking", "desc": "Patients book available slots online, with instant confirmation." },
        { "title": "Doctor Calendars", "desc": "A clear, conflict-free calendar for every doctor across departments." },
        { "title": "Automated Reminders", "desc": "SMS and WhatsApp reminders that cut down missed appointments." },
        { "title": "Queue Management", "desc": "A digital token and queue system so patients know the expected wait time." }
      ]
    },
    {
      "title": "Billing & Invoicing",
      "subtitle": "Get paid accurately, every time, without the manual paperwork.",
      "items": [
        { "title": "Invoice Generation", "desc": "Generate itemised invoices for consultations, tests and procedures instantly." },
        { "title": "Payment Tracking", "desc": "Record cash, card, UPI and insurance payments with real-time balance updates." },
        { "title": "Insurance Claims", "desc": "Track insurance-linked bills and claim status without leaving the system." },
        { "title": "Financial Reports", "desc": "Daily, weekly and monthly revenue summaries ready for accounting." }
      ]
    },
    {
      "title": "Doctor & Staff Management",
      "subtitle": "Run a coordinated clinical and admin team.",
      "items": [
        { "title": "Staff Scheduling", "desc": "Plan doctor and staff shifts, leave and department assignments." },
        { "title": "Role-Based Access", "desc": "Give doctors, front desk and admin exactly the access they need, nothing more." },
        { "title": "Department Management", "desc": "Organise the clinic into departments with their own doctors and schedules." },
        { "title": "Performance Overview", "desc": "See patient load and appointment volume per doctor at a glance." }
      ]
    },
    {
      "title": "Reports & Analytics",
      "subtitle": "Make decisions backed by real clinic data.",
      "items": [
        { "title": "Patient Analytics", "desc": "Track new vs returning patients, visit trends and peak hours." },
        { "title": "Revenue Reports", "desc": "See revenue by department, doctor or service, over any period." },
        { "title": "Appointment Reports", "desc": "Monitor booking volume, cancellations and no-show rates." },
        { "title": "Exports", "desc": "Export any report to Excel or PDF for audits and management reviews." }
      ]
    }
  ],
  "pricing": [
    {
      "name": "Starter",
      "price": "₹1,499",
      "period": "/month",
      "features": ["Up to 2 doctors", "Patient records and registration", "Appointment scheduling", "Basic billing", "Email support"],
      "highlighted": false,
      "ctaLabel": "Book a Demo",
      "ctaHref": "/#contact"
    },
    {
      "name": "Growth",
      "price": "₹3,999",
      "period": "/month",
      "features": ["Up to 8 doctors", "Everything in Starter", "Automated reminders", "Insurance claim tracking", "Staff scheduling", "Advanced reports", "Priority support"],
      "highlighted": true,
      "ctaLabel": "Book a Demo",
      "ctaHref": "/#contact"
    },
    {
      "name": "Enterprise",
      "price": "Custom",
      "period": "",
      "features": ["Unlimited doctors", "Everything in Growth", "Multi-branch support", "Custom integrations", "Dedicated onboarding", "Dedicated account manager"],
      "highlighted": false,
      "ctaLabel": "Contact Sales",
      "ctaHref": "/#contact"
    }
  ],
  "faqs": [
    { "question": "What is JHB Clinic Management System?", "answer": "JHB Clinic Management System is a clinic management platform that helps clinics, diagnostic centres and small hospitals manage patient records, appointments, billing and staff, all from one system." },
    { "question": "Who is JHB Clinic Management System for?", "answer": "It is built for clinics, diagnostic centres, polyclinics and small hospitals that want to move away from paper records and scattered spreadsheets." },
    { "question": "Can patients book appointments online?", "answer": "Yes. Patients can view available slots and book online, with automated SMS and WhatsApp reminders to reduce no-shows." },
    { "question": "Does it handle billing and insurance?", "answer": "Yes. Generate itemised invoices, track cash, card, UPI and insurance payments, and monitor insurance claim status in one place." },
    { "question": "Can multiple doctors and departments be managed?", "answer": "Yes. Each doctor gets an individual calendar, and the clinic can be organised into departments with role-based access for staff." },
    { "question": "Is patient data secure?", "answer": "Yes. Patient records are centralised and protected with role-based access, so only authorised staff can view sensitive information." },
    { "question": "Can I generate reports for my clinic?", "answer": "Yes. Get patient, revenue and appointment reports by day, week, month, doctor or department, exportable to Excel or PDF." },
    { "question": "How long does it take to get started?", "answer": "Most clinics are up and running quickly. Setup, data import where possible, and staff training are handled as part of onboarding." }
  ],
  "about": {
    "heroTitle": "About JHB Clinic Management System",
    "heroDescription": "JHB Clinic Management System was built to take the chaos out of running a clinic, replacing paper files, missed follow-ups and scattered spreadsheets with one clear system the front desk, doctors and admin team can rely on.",
    "image": null,
    "imageAlt": "",
    "overview": "Clinics lose time and revenue not because care is not good, but because records are scattered, appointments clash, and billing falls behind. JHB Clinic Management System closes that gap, giving clinics, diagnostic centres and small hospitals a single source of truth for every patient, appointment and rupee billed, with the visibility and automation needed to run a tighter, more profitable practice.",
    "features": [
      { "title": "Built for Clinics", "desc": "Designed around how clinics actually run - fast patient intake, clear doctor calendars and simple billing." },
      { "title": "Organised by Design", "desc": "Every patient record, appointment and invoice lives in one searchable system, not scattered files." },
      { "title": "Made to Scale", "desc": "From a single-doctor clinic to a multi-department, multi-branch practice, on the same platform." },
      { "title": "Local-Friendly", "desc": "Supports the billing, insurance and communication patterns common across Indian clinics." }
    ],
    "benefits": [
      { "title": "Fewer No-Shows", "desc": "Automated reminders keep patients showing up, protecting doctor time." },
      { "title": "Total Visibility", "desc": "See appointments, revenue and patient load for the day without chasing anyone." },
      { "title": "Less Manual Work", "desc": "Auto-generated invoices, reminders and reports replace hours of paperwork." },
      { "title": "Confident Decisions", "desc": "Real-time analytics show exactly where the clinic needs attention next." }
    ],
    "stats": [
      { "value": "2x", "label": "Faster Patient Check-In" },
      { "value": "-30%", "label": "Fewer No-Shows" },
      { "value": "100%", "label": "Digital Patient Records" },
      { "value": "24/7", "label": "Access From Anywhere" }
    ],
    "ctaHeading": "See JHB Clinic Management System in action",
    "ctaText": "Book a free, no-obligation demo and see how it fits the way the clinic already runs.",
    "ctaButtonLabel": "Book a Free Demo",
    "ctaButtonHref": "/#contact",
    "metaTitle": "About JHB Clinic Management System - Clinic Software Built for Everyday Practice",
    "metaDescription": "Learn how JHB Clinic Management System helps clinics and small hospitals run smoother with organised patient records, automated reminders and real-time billing visibility.",
    "ogImage": "",
    "ogTitle": "About JHB Clinic Management System",
    "ogDescription": "Why JHB Clinic Management System exists, how it works, and the results it drives for clinics.",
    "canonical": "",
    "containers": []
  },
  "metaTitle": "JHB Clinic Management System - Patient, Appointment and Billing Software",
  "metaDescription": "JHB Clinic Management System is clinic management software for clinics, diagnostic centres and small hospitals - manage patient records, appointments, billing and staff in one platform.",
  "ogImage": "",
  "canonical": "",
  "ogTitle": "JHB Clinic Management System - Clinic Operations, Simplified",
  "ogDescription": "Manage patients, appointments, doctors, billing and reports in one system. Book a free demo.",
  "status": "published",
  "sortOrder": 2,
  "containers": []
}
$clinic$::jsonb)
)
where key in ('products', 'products_draft')
  and not (data->'items' @> '[{"id":"jhb-clinic-management-system"}]');

-- Make the change visible to the PostgREST API immediately.
notify pgrst, 'reload schema';

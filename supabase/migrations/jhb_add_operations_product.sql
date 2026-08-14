-- jhb_add_operations_product.sql
-- Goal: add "JHB Operations" as a new entry in the existing dynamic Products
-- system - the same one Vasool App and JHB Clinic Management System use.
--
-- No new code was needed for this product: the website dropdown reads
-- getPublishedProducts(), the admin sidebar generates its entry from the same
-- array, and both the public page (/products/{slug}) and the admin editor
-- (/products/{slug}) are generic routes. This file only adds the DATA.
--
-- href is empty, like Vasool and Clinic, so it renders at the existing dynamic
-- route /products/jhb-operations rather than needing a new top-level route.
--
-- Every section and card inherits the Hide/Unhide and Show-section-link
-- toggles automatically: those fields are optional and ABSENT means visible,
-- which is why none of them appear in the payload below.
--
-- Content is professional starter copy, fully editable from the Admin Panel.
--
-- Appends to jhb_content keys 'products' and 'products_draft', guarded by a
-- containment check so re-running never creates a duplicate.
--
-- Apply manually in the Supabase SQL editor - project ossvdnwcmsjbdlstldhh is
-- not reachable from the connected MCP. Safe to run more than once.

update jhb_content
set data = jsonb_set(
  data,
  '{items}',
  (data->'items') || jsonb_build_array($ops$
{
  "highlight": "every moving part, under control",
  "description": "An operations platform that brings workflows, tasks, teams and approvals into one place — so work moves on schedule, nothing gets dropped, and you can see exactly where every job stands.",
  "overview": "JHB Operations is an all-in-one operations management platform for businesses whose work spans multiple people, steps and sites. Standardise how work gets done with repeatable workflows, assign and track every task to an owner and a deadline, route approvals automatically, and see live status across the whole operation from one dashboard. No more chasing updates on WhatsApp, rebuilding the same spreadsheet each month, or discovering a missed step after the customer does.",
  "image": null,
  "imageAlt": "",
  "href": "",
  "sections": [
    {
      "title": "Operations Management",
      "subtitle": "One place to run the whole operation.",
      "items": [
        {
          "title": "Central Dashboard",
          "desc": "Live status of every job, team and site on a single screen."
        },
        {
          "title": "SOP Library",
          "desc": "Standard operating procedures stored once and reused on every job."
        },
        {
          "title": "Resource Planning",
          "desc": "Plan people, equipment and capacity before the work starts."
        },
        {
          "title": "Multi-Site Support",
          "desc": "Run several branches or sites from one account, with their own teams."
        }
      ]
    },
    {
      "title": "Workflow & Process Automation",
      "subtitle": "Standardise the work, then let the system move it along.",
      "items": [
        {
          "title": "Workflow Builder",
          "desc": "Lay out each process step by step, with owners and due dates."
        },
        {
          "title": "Approval Chains",
          "desc": "Route approvals to the right person automatically, in the right order."
        },
        {
          "title": "Automated Handoffs",
          "desc": "The next stage opens the moment the previous one is signed off."
        },
        {
          "title": "Escalation Rules",
          "desc": "Overdue work escalates on its own, so nothing quietly stalls."
        }
      ]
    },
    {
      "title": "Task & Team Coordination",
      "subtitle": "Everyone knows what they own and what is next.",
      "items": [
        {
          "title": "Task Assignment",
          "desc": "Assign work to a person with a clear deadline and priority."
        },
        {
          "title": "Shift & Roster Planning",
          "desc": "Plan shifts and duty rosters, and see who is available."
        },
        {
          "title": "Team Workload",
          "desc": "Spot who is overloaded and rebalance before deadlines slip."
        },
        {
          "title": "Checklists",
          "desc": "Step-by-step checklists so every job is completed the same way."
        }
      ]
    },
    {
      "title": "Tracking & Compliance",
      "subtitle": "A verifiable record of what happened, and when.",
      "items": [
        {
          "title": "Real-Time Status",
          "desc": "See exactly which stage every job is in, without asking anyone."
        },
        {
          "title": "Audit Trail",
          "desc": "Every action timestamped against the person who performed it."
        },
        {
          "title": "Issue Logging",
          "desc": "Raise, assign and close operational issues against the job."
        },
        {
          "title": "Document Control",
          "desc": "Attach and version the documents each job depends on."
        }
      ]
    },
    {
      "title": "Reports & Analytics",
      "subtitle": "Run the operation on numbers, not impressions.",
      "items": [
        {
          "title": "Operations Dashboard",
          "desc": "Throughput, on-time completion and workload at a glance."
        },
        {
          "title": "Productivity Reports",
          "desc": "Compare output by team, site or period over any date range."
        },
        {
          "title": "Bottleneck Analysis",
          "desc": "Find the stage where work consistently piles up."
        },
        {
          "title": "Exports",
          "desc": "Export any report to Excel or PDF for reviews and audits."
        }
      ]
    }
  ],
  "pricing": [
    {
      "name": "Starter",
      "price": "₹1,999",
      "period": "/month",
      "features": [
        "Up to 10 users",
        "Task and checklist management",
        "Basic workflows",
        "Operations dashboard",
        "Email support"
      ],
      "highlighted": false,
      "ctaLabel": "Book a Demo",
      "ctaHref": "/#contact"
    },
    {
      "name": "Growth",
      "price": "₹4,999",
      "period": "/month",
      "features": [
        "Up to 50 users",
        "Everything in Starter",
        "Approval chains and escalations",
        "Shift and roster planning",
        "Audit trail",
        "Advanced reports and exports",
        "Priority support"
      ],
      "highlighted": true,
      "ctaLabel": "Book a Demo",
      "ctaHref": "/#contact"
    },
    {
      "name": "Enterprise",
      "price": "Custom",
      "period": "",
      "features": [
        "Unlimited users",
        "Everything in Growth",
        "Multi-site operations",
        "Custom workflows and integrations",
        "Dedicated onboarding",
        "Dedicated account manager"
      ],
      "highlighted": false,
      "ctaLabel": "Contact Sales",
      "ctaHref": "/#contact"
    }
  ],
  "faqs": [
    {
      "question": "What is JHB Operations?",
      "answer": "JHB Operations is an operations management platform that brings workflows, tasks, teams, approvals and reporting into one system, so work moves on schedule and nothing gets dropped between people or stages."
    },
    {
      "question": "Who is JHB Operations for?",
      "answer": "It is built for businesses whose work runs across multiple people, steps or sites — service teams, field operations, manufacturing and processing units, and back-office teams that depend on repeatable processes."
    },
    {
      "question": "How is it different from a task app?",
      "answer": "A task app tracks to-dos. JHB Operations models the whole process: each stage has an owner, approvals route automatically, overdue work escalates, and every action is recorded for audit."
    },
    {
      "question": "Can we build our own workflows?",
      "answer": "Yes. Lay out each process step by step with owners, deadlines and approvals, and reuse it for every job of that type so the work is done the same way every time."
    },
    {
      "question": "Does it handle approvals?",
      "answer": "Yes. Approvals route to the right person in the right order, and the next stage only opens once the previous one is signed off."
    },
    {
      "question": "Can we manage more than one location?",
      "answer": "Yes. Run multiple branches or sites from one account, each with its own teams and schedules, while management keeps a consolidated view."
    },
    {
      "question": "What reports do we get?",
      "answer": "Throughput, on-time completion, productivity by team or site, and bottleneck analysis showing where work piles up — all exportable to Excel or PDF."
    },
    {
      "question": "How long does it take to get started?",
      "answer": "Most teams are running quickly. Setup covers mapping your existing processes into workflows, importing your team, and training — the timeline depends on how many processes you start with."
    }
  ],
  "about": {
    "heroTitle": "About JHB Operations",
    "heroDescription": "JHB Operations was built for the moment a business outgrows spreadsheets and group chats — when the work is still getting done, but nobody can say with confidence where any of it stands.",
    "image": null,
    "imageAlt": "",
    "overview": "Operations rarely break because people stop working. They break because a step is skipped, an approval sits unread, or the only person who knew the process is on leave. JHB Operations closes those gaps by making the process itself the system: every job follows a defined workflow, every stage has an owner and a deadline, approvals move on their own, and management can see live status without chasing a single update.",
    "features": [
      {
        "title": "Process-First",
        "desc": "The workflow is the product — jobs follow a defined path instead of living in someone's head."
      },
      {
        "title": "Accountable by Design",
        "desc": "Every stage has a named owner and a timestamped record of what was done."
      },
      {
        "title": "Built to Scale",
        "desc": "From one team to multiple sites and departments, on the same platform."
      },
      {
        "title": "Practical to Adopt",
        "desc": "Designed around how teams already work, so rollout does not stall on training."
      }
    ],
    "benefits": [
      {
        "title": "Fewer Dropped Jobs",
        "desc": "Automated handoffs and escalations mean work cannot quietly stall."
      },
      {
        "title": "Total Visibility",
        "desc": "See the live status of every job without asking anyone for an update."
      },
      {
        "title": "Less Manual Follow-Up",
        "desc": "Reminders, approvals and reports run themselves instead of chasing people."
      },
      {
        "title": "Confident Decisions",
        "desc": "Real throughput and bottleneck data shows exactly where to act next."
      }
    ],
    "stats": [
      {
        "value": "2x",
        "label": "Faster Handoffs"
      },
      {
        "value": "+35%",
        "label": "On-Time Completion"
      },
      {
        "value": "100%",
        "label": "Audit-Tracked Actions"
      },
      {
        "value": "24/7",
        "label": "Live Operations View"
      }
    ],
    "ctaHeading": "See JHB Operations in action",
    "ctaText": "Book a free, no-obligation demo and we'll map one of your existing processes into the system so you can see it working on your own operation.",
    "ctaButtonLabel": "Book a Free Demo",
    "ctaButtonHref": "/#contact",
    "metaTitle": "About JHB Operations — Operations Management Built Around Your Process",
    "metaDescription": "Learn how JHB Operations helps growing businesses standardise processes, keep every job accountable to an owner and a deadline, and see live operational status without chasing updates.",
    "ogImage": "",
    "ogTitle": "About JHB Operations",
    "ogDescription": "Why JHB Operations exists, how it works, and the results it drives for operations teams.",
    "canonical": ""
  },
  "metaTitle": "JHB Operations — Workflow, Task and Operations Management Software",
  "metaDescription": "JHB Operations is operations management software for growing businesses — build workflows, assign and track tasks, route approvals, coordinate teams across sites, and report on throughput in real time.",
  "ogImage": "",
  "canonical": "",
  "ogTitle": "JHB Operations — Business Operations, Under Control",
  "ogDescription": "Workflows, tasks, approvals, teams and reporting in one operations platform. Book a free demo.",
  "status": "published",
  "sortOrder": 3,
  "id": "jhb-operations",
  "title": "JHB Operations",
  "slug": "jhb-operations"
}
$ops$::jsonb)
)
where key in ('products', 'products_draft')
  and not (data->'items' @> '[{"id":"jhb-operations"}]');

-- Make the change visible to the PostgREST API immediately.
notify pgrst, 'reload schema';

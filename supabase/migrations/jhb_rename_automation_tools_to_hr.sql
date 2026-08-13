-- jhb_rename_automation_tools_to_hr.sql
-- Goal: rename the "JHB Automation Tools" product to "JHB HR Management System"
-- (label/SEO only, per explicit confirmation — the page's actual body content
-- stays CRM/lead-management/marketing-automation as-is; only the outward-facing
-- name changes). URL stays /jhb-automation-tools (no redirect needed, preserves
-- existing SEO equity).
--
-- Uses replace() rather than overwriting fields outright, so if any of this
-- text was hand-edited in the Admin beyond the original seed copy, those edits
-- survive and only the product-name substring changes. Renames both "JHB
-- Automation Tools" and the shorter "JHB Automations" form (in that order, so
-- neither is left behind whichever a field used).
--
-- Touches three jhb_content documents:
--   • key='products' / 'products_draft' — the item with id='jhb-automation-tools'
--     in the items[] array: title, metaTitle, metaDescription, ogTitle,
--     ogDescription. slug/href/description/sections etc. untouched.
--   • key='tools_hub' — data->'seo': metaTitle, metaDescription, ogTitle,
--     ogDescription. Hero copy, categories, CRM section, FAQs untouched.
--   • key='settings' — toolsButtonLabel (the navbar CTA button text).
--
-- Apply manually in the Supabase SQL editor — project ossvdnwcmsjbdlstldhh is not
-- reachable from the connected MCP. Safe to run more than once (idempotent).

-- 1) Products doc(s) — rename the jhb-automation-tools item's display fields.
update jhb_content
set data = jsonb_set(
  data,
  '{items}',
  (
    select jsonb_agg(
      case
        when elem->>'id' = 'jhb-automation-tools' then elem || jsonb_build_object(
          'title', replace(replace(elem->>'title', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
          'metaTitle', replace(replace(elem->>'metaTitle', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
          'metaDescription', replace(replace(elem->>'metaDescription', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
          'ogTitle', replace(replace(elem->>'ogTitle', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
          'ogDescription', replace(replace(elem->>'ogDescription', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System')
        )
        else elem
      end
    )
    from jsonb_array_elements(data->'items') as elem
  )
)
where key in ('products', 'products_draft')
  and data->'items' @> '[{"id":"jhb-automation-tools"}]';

-- 2) Tools hub doc — SEO fields only.
update jhb_content
set data = jsonb_set(
  data,
  '{seo}',
  (data->'seo') || jsonb_build_object(
    'metaTitle', replace(replace(data->'seo'->>'metaTitle', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
    'metaDescription', replace(replace(data->'seo'->>'metaDescription', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
    'ogTitle', replace(replace(data->'seo'->>'ogTitle', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'),
    'ogDescription', replace(replace(data->'seo'->>'ogDescription', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System')
  )
)
where key = 'tools_hub';

-- 3) Settings doc — navbar CTA button label.
update jhb_content
set data = jsonb_set(
  data,
  '{toolsButtonLabel}',
  to_jsonb(replace(replace(data->>'toolsButtonLabel', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'))
)
where key = 'settings'
  and data ? 'toolsButtonLabel';

-- Make the change visible to the PostgREST API immediately.
notify pgrst, 'reload schema';

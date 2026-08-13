-- jhb_fix_tools_button_label.sql
-- Follow-up to jhb_rename_automation_tools_to_hr.sql: that migration's third
-- update targeted key='settings', but the navbar CTA button
-- (toolsButtonLabel) is still "JHB Automation Tools" live — that WHERE clause
-- didn't match the actual row (key is evidently named something else). This
-- version targets the field value directly instead of guessing the key name,
-- so it works regardless of what the row is actually called.
--
-- Apply manually in the Supabase SQL editor. Safe to run more than once.

update jhb_content
set data = jsonb_set(
  data,
  '{toolsButtonLabel}',
  to_jsonb(replace(replace(data->>'toolsButtonLabel', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System'))
)
where data ? 'toolsButtonLabel'
  and data->>'toolsButtonLabel' <> replace(replace(data->>'toolsButtonLabel', 'JHB Automation Tools', 'JHB HR Management System'), 'JHB Automations', 'JHB HR Management System')
returning key, data->>'toolsButtonLabel' as new_label;

notify pgrst, 'reload schema';

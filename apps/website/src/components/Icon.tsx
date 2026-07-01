// Icon now lives in @jhb/shared so the website and the admin editor previews
// render the exact same named icons. This thin re-export keeps every existing
// `import Icon from "@/components/Icon"` (and "./Icon") call site working unchanged.
export { default, ICON_NAMES } from "@jhb/shared/icon";

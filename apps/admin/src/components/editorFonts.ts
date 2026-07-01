// Single source of truth for the Rich Text Editor font-family dropdown.
//
// `stack` is the exact CSS the editor applies to the selection (and that gets
// published in the page HTML), so the website renders the same face the editor
// previews. System fonts (`web: false`) rely on the visitor's OS; web fonts
// (`web: true`) are pulled from Google Fonts — they MUST stay in sync with the
// `@import` in both apps' globals.css. To add a font: add a row here, and if it
// is a web font add its family to that `@import` URL.
export type EditorFont = { name: string; stack: string; web?: boolean };

export const EDITOR_FONTS: EditorFont[] = [
  { name: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { name: "Arial Black", stack: "'Arial Black', Gadget, sans-serif" },
  { name: "Calibri", stack: "Calibri, 'Segoe UI', sans-serif" },
  { name: "Cambria", stack: "Cambria, Georgia, serif" },
  { name: "Century Gothic", stack: "'Century Gothic', 'Apple Gothic', sans-serif" },
  { name: "Comic Sans MS", stack: "'Comic Sans MS', 'Comic Sans', cursive" },
  { name: "Courier New", stack: "'Courier New', Courier, monospace" },
  { name: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { name: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { name: "Impact", stack: "Impact, Charcoal, sans-serif" },
  { name: "Inter", stack: "'Inter', sans-serif", web: true },
  { name: "Lato", stack: "'Lato', sans-serif", web: true },
  { name: "Merriweather", stack: "'Merriweather', serif", web: true },
  { name: "Montserrat", stack: "'Montserrat', sans-serif", web: true },
  { name: "Open Sans", stack: "'Open Sans', sans-serif", web: true },
  { name: "Oswald", stack: "'Oswald', sans-serif", web: true },
  { name: "Poppins", stack: "'Poppins', sans-serif", web: true },
  { name: "Raleway", stack: "'Raleway', sans-serif", web: true },
  { name: "Roboto", stack: "'Roboto', sans-serif", web: true },
  { name: "Roboto Slab", stack: "'Roboto Slab', serif", web: true },
  { name: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { name: "Times New Roman", stack: "'Times New Roman', Times, serif" },
  { name: "Trebuchet MS", stack: "'Trebuchet MS', Helvetica, sans-serif" },
  { name: "Ubuntu", stack: "'Ubuntu', sans-serif", web: true },
  { name: "Verdana", stack: "Verdana, Geneva, sans-serif" },
];

// Match a computed `font-family` string back to a known font so the toolbar
// dropdown reflects the face at the caret. Returns the font name or "".
export function matchFont(computedFamily: string): string {
  const f = (computedFamily || "").toLowerCase();
  const hit = EDITOR_FONTS.find((x) => f.includes(x.name.toLowerCase()));
  return hit ? hit.name : "";
}

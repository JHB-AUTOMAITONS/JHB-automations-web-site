"use client";

import RichEditor from "./RichEditor";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

// Thin wrapper kept for the editors that imported the old simpler toolbar
// (blog content, legal pages, SEO content, founder/CTA, blog FAQ). Every editor
// in the admin now shares the one full-featured RichEditor toolbar; this just
// renders it at a slightly more compact height for inline fields.
export default function RichText({ value, onChange }: Props) {
  return <RichEditor value={value} onChange={onChange} minHeight={140} />;
}

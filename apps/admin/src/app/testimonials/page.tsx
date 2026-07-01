import { getAllTestimonials } from "@jhb/shared/testimonials-server";
import TestimonialsManager from "@/components/TestimonialsManager";

export default async function AdminTestimonials() {
  const items = await getAllTestimonials();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Testimonials</h1>
      <p className="mt-1 text-sm text-muted">
        Manage the client testimonials shown on the homepage. Add, edit, reorder
        (drag), publish/unpublish, and delete. Changes go live instantly.
      </p>
      <TestimonialsManager initial={items} />
    </div>
  );
}

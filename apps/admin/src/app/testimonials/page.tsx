import { getAllTestimonials } from "@jhb/shared/testimonials-server";
import TestimonialsManager from "@/components/TestimonialsManager";

export default async function AdminTestimonials() {
  const items = await getAllTestimonials();
  return <TestimonialsManager initial={items} />;
}

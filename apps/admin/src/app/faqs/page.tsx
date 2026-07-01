import { getServices } from "@jhb/shared/services-server";
import { getAllServiceFaqs } from "@jhb/shared/faqs-server";
import { getInternalPages } from "@jhb/shared/service-pages-server";
import FaqManager from "@/components/FaqManager";

export default async function AdminFaqs() {
  const [services, faqs, internalPages] = await Promise.all([
    getServices(),
    getAllServiceFaqs(),
    getInternalPages(),
  ]);

  const serviceList = services.map((s) => ({ key: s.key, title: s.title }));

  const faqsByService: Record<string, { question: string; answer: string }[]> =
    {};
  for (const s of serviceList) faqsByService[s.key] = [];
  for (const f of faqs) {
    (faqsByService[f.service_key] ??= []).push({
      question: f.question,
      answer: f.answer,
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Service FAQs
      </h1>
      <p className="mt-1 text-sm text-muted">
        Manage the FAQ accordion shown on each service page. Drag to reorder.
      </p>
      <FaqManager services={serviceList} faqsByService={faqsByService} internalPages={internalPages} />
    </div>
  );
}

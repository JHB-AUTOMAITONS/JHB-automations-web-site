// Home Page FAQ types — client-safe.

export type HomeFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
};

// Lightweight shape rendered by the public FAQ accordion.
export type HomeFaqItem = { question: string; answer: string };

// Built-in defaults — frontend fallback when the DB is empty, and the source
// for the admin "Import current FAQs" action.
export const HOME_FAQ_DEFAULTS: HomeFaqItem[] = [
  {
    question: "What exactly does a business development company do?",
    answer:
      "A business development company helps businesses generate leads, improve sales processes, optimize marketing strategies, automate workflows, and create growth systems that increase revenue and business efficiency.",
  },
  {
    question: "Do you only work with companies in Salem?",
    answer:
      "No. We work with businesses across India and internationally through online consultations, digital marketing, automation solutions, and web development services.",
  },
  {
    question: "How long before I see results from business development?",
    answer:
      "Results depend on the service provided. Some improvements can be seen within a few weeks, while long-term growth strategies typically show significant results within 2–6 months.",
  },
  {
    question: "Can startups afford your services?",
    answer:
      "Yes. We offer flexible packages suitable for startups, small businesses, and established companies, ensuring solutions that fit different budgets and growth stages.",
  },
];

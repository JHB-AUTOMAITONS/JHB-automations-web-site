// Service FAQ types — client-safe.

export type ServiceFaq = {
  id: string;
  service_key: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type FaqItem = { question: string; answer: string };

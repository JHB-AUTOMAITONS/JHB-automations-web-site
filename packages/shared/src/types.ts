// Central type re-exports for both apps. Type-only — no runtime imports,
// so importing this never pulls server-only modules into client code.
export type {
  HeroContent,
  StatsContent,
  StatItem,
  SiteSettings,
} from "./content";
export type {
  ServiceDetail,
  Service,
  Stat,
  CaseStudy,
  Testimonial,
  NavItem,
} from "./data";
export type { ResolvedService, ServiceLink } from "./services.server";
export type { SeoRow } from "./content.server";
export type {
  HomeContent,
  HeroBlock,
  AboutBlock,
  ServicesSectionBlock,
  ServiceCardOverride,
  CtaBlock,
} from "./home";
export type { Post, PostCard, PostStatus } from "./posts";

export type ServiceDetail = {
  slug: string;
  title: string;
  icon: string;
  short: string; // for cards
  tagline: string;
  intro: string;
  features: { title: string; desc: string }[];
  benefits: string[];
  stats: { value: string; label: string }[];
};

export const serviceOrder = [
  "content-marketing",
  "app-development",
  "web-development",
  "ai-automations",
  "software-customization",
  "search-engine-optimization",
  "search-engine-marketing",
  "ecommerce-website-development",
  "chatbot-services",
  "digital-marketing",
  "social-media-marketing",
  "influencer-marketing",
] as const;

const serviceOrderIndex = new Map<string, number>(
  serviceOrder.map((slug, index) => [slug, index])
);

export const serviceDetails: ServiceDetail[] = [
  {
    slug: "influencer-marketing",
    title: "Influencer Marketing",
    icon: "rocket",
    short: "Partner with the right creators to build trust and drive sales at scale.",
    tagline: "Authentic reach that actually converts",
    intro:
      "We connect your brand with vetted creators whose audiences match your ideal customers — turning genuine recommendations into measurable revenue.",
    features: [
      { title: "Creator Discovery", desc: "Data-driven matching to find influencers whose audience mirrors your buyers." },
      { title: "Campaign Management", desc: "End-to-end briefs, contracts, content approvals and posting schedules handled for you." },
      { title: "Performance Tracking", desc: "Track reach, engagement, clicks and conversions with transparent reporting." },
      { title: "UGC Library", desc: "Repurpose authentic creator content across ads, email and your website." },
    ],
    benefits: [
      "Reach high-intent audiences through trusted voices",
      "Higher engagement than traditional ads",
      "A growing library of authentic content",
      "Clear ROI on every collaboration",
    ],
    stats: [
      { value: "5.2x", label: "Avg. ROI" },
      { value: "+143%", label: "Engagement" },
      { value: "300+", label: "Creators" },
    ],
  },
  {
    slug: "web-development",
    title: "Web Development",
    icon: "code",
    short: "Blazing-fast, conversion-optimised websites engineered for performance.",
    tagline: "Websites that load fast and sell faster",
    intro:
      "We design and build high-performance, responsive websites with clean code, beautiful UI and conversion-focused architecture that turns visitors into customers.",
    features: [
      { title: "Custom Design", desc: "Pixel-perfect, brand-aligned interfaces crafted for your audience." },
      { title: "Lightning Performance", desc: "Optimised for Core Web Vitals and Lighthouse scores of 95+." },
      { title: "Responsive & Accessible", desc: "Flawless on every device and compliant with accessibility standards." },
      { title: "SEO-Ready Build", desc: "Semantic, fast and search-engine friendly from day one." },
    ],
    benefits: [
      "Faster load times and better rankings",
      "Higher conversion rates",
      "Easy-to-manage content",
      "Scalable, future-proof architecture",
    ],
    stats: [
      { value: "95+", label: "Lighthouse" },
      { value: "<1s", label: "Load Time" },
      { value: "+68%", label: "Conversions" },
    ],
  },
  {
    slug: "search-engine-optimization",
    title: "Search Engine Optimization",
    icon: "search",
    short: "Rank higher, get found faster and own your category on Google.",
    tagline: "Own page one of Google",
    intro:
      "Our data-driven SEO strategies improve your visibility, drive qualified organic traffic and build long-term authority that compounds over time.",
    features: [
      { title: "Technical SEO", desc: "Site speed, crawlability, schema and structure fixed for maximum visibility." },
      { title: "Keyword Strategy", desc: "Target the searches your customers actually make." },
      { title: "On-Page Optimization", desc: "Content, meta and internal linking tuned to rank." },
      { title: "Authority Building", desc: "High-quality backlinks that earn Google's trust." },
    ],
    benefits: [
      "Sustainable, compounding organic traffic",
      "Higher visibility for high-intent keywords",
      "Lower cost per lead over time",
      "Transparent ranking and traffic reports",
    ],
    stats: [
      { value: "+212%", label: "Organic Traffic" },
      { value: "Top 3", label: "Rankings" },
      { value: "-40%", label: "Cost / Lead" },
    ],
  },
  {
    slug: "content-marketing",
    title: "Content Marketing",
    icon: "doc",
    short: "Authority-building content engineered to attract, educate and convert.",
    tagline: "Content that builds trust and pipeline",
    intro:
      "We craft strategic content — blogs, guides, videos and social — that positions you as the expert, attracts your ideal audience and nurtures them to a sale.",
    features: [
      { title: "Content Strategy", desc: "A roadmap mapped to your funnel and search demand." },
      { title: "SEO Blogging", desc: "Long-form content engineered to rank and convert." },
      { title: "Video & Visual", desc: "Scroll-stopping creative for every platform." },
      { title: "Distribution", desc: "We make sure the right people actually see it." },
    ],
    benefits: [
      "Establish authority in your niche",
      "Attract leads without paying per click",
      "Nurture prospects to a buying decision",
      "Fuel SEO, social and email at once",
    ],
    stats: [
      { value: "3x", label: "More Leads" },
      { value: "+180%", label: "Time on Site" },
      { value: "50+", label: "Assets / mo" },
    ],
  },
  {
    slug: "ai-automations",
    title: "AI Automations",
    icon: "spark",
    short: "End-to-end intelligent automation that runs your operations 24/7.",
    tagline: "Put your business on autopilot",
    intro:
      "We design and deploy intelligent AI systems that automate repetitive work, qualify leads, sync your tools and let your team focus on growth — around the clock.",
    features: [
      { title: "Workflow Automation", desc: "Connect your apps and eliminate manual, repetitive tasks." },
      { title: "AI Lead Qualification", desc: "Score and route leads in real time, automatically." },
      { title: "CRM Integration", desc: "Keep your pipeline updated without lifting a finger." },
      { title: "24/7 Operations", desc: "Systems that work nights, weekends and holidays." },
    ],
    benefits: [
      "Save hundreds of hours of manual work",
      "Never miss a lead again",
      "Reduce human error to near zero",
      "Scale operations without scaling headcount",
    ],
    stats: [
      { value: "+40%", label: "Productivity" },
      { value: "24/7", label: "Uptime" },
      { value: "-90%", label: "Manual Work" },
    ],
  },
  {
    slug: "search-engine-marketing",
    title: "Search Engine Marketing",
    icon: "flow",
    short: "High-intent paid campaigns that put you in front of ready-to-buy customers.",
    tagline: "Instant visibility, immediate leads",
    intro:
      "Our SEM campaigns capture demand the moment it happens — putting your brand at the top of search results with precision targeting and relentless optimisation.",
    features: [
      { title: "Google & Bing Ads", desc: "Campaigns built around high-intent, high-value keywords." },
      { title: "Conversion Tracking", desc: "Every click measured down to revenue." },
      { title: "Landing Page CRO", desc: "Pages designed to turn clicks into customers." },
      { title: "Budget Optimization", desc: "Spend allocated to what actually drives ROI." },
    ],
    benefits: [
      "Immediate, predictable lead flow",
      "Pay only for high-intent traffic",
      "Full transparency on ad spend",
      "Continuous optimisation for lower CPA",
    ],
    stats: [
      { value: "4.1x", label: "ROAS" },
      { value: "-35%", label: "Cost / Click" },
      { value: "+96%", label: "Lead Volume" },
    ],
  },
  {
    slug: "ecommerce-website-development",
    title: "Ecommerce Website Development",
    icon: "cart",
    short: "High-performance stores built to maximise order value and retention.",
    tagline: "Stores engineered to sell",
    intro:
      "We build fast, beautiful, conversion-optimised online stores with seamless checkout, smart upsells and automation that maximise revenue per visitor.",
    features: [
      { title: "Conversion-First Design", desc: "Layouts proven to lift add-to-cart and checkout rates." },
      { title: "Seamless Checkout", desc: "Frictionless, mobile-first purchase flows." },
      { title: "Upsell Automation", desc: "Smart cross-sells and recovery flows that grow AOV." },
      { title: "Payment & Logistics", desc: "Integrated gateways, inventory and shipping." },
    ],
    benefits: [
      "Higher average order value",
      "Reduced cart abandonment",
      "Automated revenue recovery",
      "A store that scales with you",
    ],
    stats: [
      { value: "+212%", label: "Revenue" },
      { value: "-48%", label: "Cart Drop-off" },
      { value: "+96%", label: "Repeat Buyers" },
    ],
  },
  {
    slug: "chatbot-services",
    title: "Chatbot Services",
    icon: "chat",
    short: "AI assistants that engage visitors, answer questions and capture leads 24/7.",
    tagline: "Your best salesperson, always online",
    intro:
      "We build intelligent chatbots that greet every visitor, answer questions instantly, qualify leads and book meetings — capturing revenue you'd otherwise lose.",
    features: [
      { title: "AI Conversations", desc: "Natural, on-brand replies trained on your business." },
      { title: "Lead Capture", desc: "Qualify and collect details automatically, day or night." },
      { title: "Multi-Channel", desc: "Deploy on web, WhatsApp, Instagram and Messenger." },
      { title: "Human Handoff", desc: "Seamlessly route hot leads to your sales team." },
    ],
    benefits: [
      "Respond to every visitor instantly",
      "Capture leads outside business hours",
      "Reduce support workload",
      "Higher conversion from existing traffic",
    ],
    stats: [
      { value: "24/7", label: "Availability" },
      { value: "+187%", label: "Bookings" },
      { value: "-92%", label: "Response Time" },
    ],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    icon: "rocket",
    short: "Multi-channel, data-driven campaigns that put your brand in front of buyers.",
    tagline: "Full-funnel growth, measured end to end",
    intro:
      "We orchestrate SEO, paid, social and content into one cohesive, data-driven growth engine — delivering consistent, measurable results across every channel.",
    features: [
      { title: "Channel Strategy", desc: "The right mix of channels for your goals and budget." },
      { title: "Paid Advertising", desc: "Meta, Google and beyond — optimised for ROI." },
      { title: "Analytics & Reporting", desc: "Clear dashboards showing exactly what's working." },
      { title: "Conversion Optimization", desc: "Turn more of your traffic into customers." },
    ],
    benefits: [
      "One partner for every channel",
      "Data-driven decisions, not guesswork",
      "Consistent, predictable lead flow",
      "Transparent, measurable ROI",
    ],
    stats: [
      { value: "5.4x", label: "ROI" },
      { value: "+143%", label: "Leads" },
      { value: "12+", label: "Channels" },
    ],
  },
  {
    slug: "social-media-marketing",
    title: "Social Media Marketing",
    icon: "crm",
    short: "Build a loyal audience and turn followers into paying customers.",
    tagline: "Turn followers into customers",
    intro:
      "We grow your presence across every platform with scroll-stopping content, community management and targeted campaigns that build a loyal, buying audience.",
    features: [
      { title: "Content Creation", desc: "On-brand posts, reels and stories that stop the scroll." },
      { title: "Community Management", desc: "Engage your audience and build real relationships." },
      { title: "Paid Social", desc: "Targeted campaigns that grow reach and sales." },
      { title: "Analytics", desc: "Track growth, engagement and conversions clearly." },
    ],
    benefits: [
      "Grow a loyal, engaged following",
      "Consistent, professional brand presence",
      "More traffic and sales from social",
      "Content that works across platforms",
    ],
    stats: [
      { value: "+220%", label: "Followers" },
      { value: "+143%", label: "Engagement" },
      { value: "8+", label: "Platforms" },
    ],
  },
  {
    slug: "app-development",
    title: "App Development",
    icon: "app",
    short: "Native-quality mobile apps that delight users and grow your business.",
    tagline: "Mobile experiences that scale",
    intro:
      "We design and build fast, beautiful mobile apps for iOS and Android — with seamless UX, robust backends and the automation that keeps users engaged.",
    features: [
      { title: "iOS & Android", desc: "Cross-platform apps that feel native on every device." },
      { title: "UX-First Design", desc: "Intuitive, polished interfaces users love to return to." },
      { title: "Scalable Backend", desc: "Secure APIs and infrastructure built to grow with you." },
      { title: "Push & Automation", desc: "Smart notifications and flows that drive retention." },
    ],
    benefits: [
      "Reach customers on the device they use most",
      "Higher engagement and retention",
      "Secure, scalable architecture",
      "One codebase, every platform",
    ],
    stats: [
      { value: "4.8★", label: "App Rating" },
      { value: "+120%", label: "Retention" },
      { value: "2", label: "Platforms" },
    ],
  },
  {
    slug: "software-customization",
    title: "Software Customization",
    icon: "settings",
    short: "Tailor existing software to fit your exact workflows and goals.",
    tagline: "Software that fits you perfectly",
    intro:
      "We customize, extend and integrate the tools you already use — building features, automations and connections that mould your software to your business, not the other way around.",
    features: [
      { title: "Custom Features", desc: "New modules and capabilities built around your needs." },
      { title: "Integrations", desc: "Connect your CRM, ERP and tools into one seamless system." },
      { title: "Workflow Tuning", desc: "Automate and streamline your unique business processes." },
      { title: "Ongoing Support", desc: "Maintenance and enhancements as your needs evolve." },
    ],
    benefits: [
      "Software shaped to your exact workflows",
      "Eliminate manual workarounds",
      "Seamlessly connected tools",
      "Lower long-term operating costs",
    ],
    stats: [
      { value: "-70%", label: "Manual Steps" },
      { value: "100%", label: "Tailored" },
      { value: "24/7", label: "Support" },
    ],
  },
].sort(
  (a, b) =>
    (serviceOrderIndex.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
    (serviceOrderIndex.get(b.slug) ?? Number.MAX_SAFE_INTEGER)
);

export function getService(slug: string) {
  return serviceDetails.find((s) => s.slug === slug);
}

// Home page service cards (derived from canonical details)
export type Service = { title: string; desc: string; icon: string; slug: string };
export const services: Service[] = serviceDetails.map((s) => ({
  title: s.title,
  desc: s.short,
  icon: s.icon,
  slug: s.slug,
}));

export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

export const stats: Stat[] = [
  { value: 87, suffix: "%", label: "Client Retention" },
  { value: 3, suffix: "+", label: "Years of Service" },
  { value: 15, suffix: "+", label: "Professionals" },
  { value: 180, suffix: "+", label: "Satisfied Clients" },
];

export const workflowSteps = [
  { title: "Lead Capture", desc: "Every inquiry captured instantly across all channels.", icon: "📥" },
  { title: "AI Qualification", desc: "AI scores and qualifies leads in real time.", icon: "🧠" },
  { title: "CRM Integration", desc: "Qualified leads sync straight into your CRM.", icon: "🗂️" },
  { title: "WhatsApp Automation", desc: "Automated, personal follow-ups that convert.", icon: "💬" },
  { title: "Sales Conversion", desc: "Hot leads handed to sales — ready to close.", icon: "🎯" },
];

export const industries = [
  { name: "Healthcare", icon: "🏥" },
  { name: "Real Estate", icon: "🏙️" },
  { name: "Finance", icon: "💳" },
  { name: "Ecommerce", icon: "🛒" },
  { name: "Education", icon: "🎓" },
  { name: "Manufacturing", icon: "🏭" },
  { name: "Retail", icon: "🏬" },
  { name: "Logistics", icon: "🚚" },
];

export type CaseStudy = {
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  metrics: { label: string; value: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    client: "MediCare Plus",
    industry: "Healthcare",
    challenge: "Missing 60% of patient inquiries after hours.",
    solution: "Deployed an AI chatbot + WhatsApp automation for 24/7 booking.",
    metrics: [
      { label: "Bookings", value: "+187%" },
      { label: "Response Time", value: "-92%" },
      { label: "ROI", value: "5.4x" },
    ],
  },
  {
    client: "Urban Nest Realty",
    industry: "Real Estate",
    challenge: "Slow lead follow-up was losing high-value buyers.",
    solution: "AI lead qualification wired into CRM with instant routing.",
    metrics: [
      { label: "Lead Conversion", value: "+143%" },
      { label: "Deals Closed", value: "+68%" },
      { label: "ROI", value: "4.1x" },
    ],
  },
  {
    client: "PureGlow Cosmetics",
    industry: "Ecommerce",
    challenge: "High cart abandonment and low repeat purchases.",
    solution: "Automated WhatsApp recovery flows + retention campaigns.",
    metrics: [
      { label: "Revenue", value: "+212%" },
      { label: "Repeat Buyers", value: "+96%" },
      { label: "ROI", value: "6.8x" },
    ],
  },
];

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  rating: number;
  quote: string;
  result: string;
  tags: string[];
  // One-line summary of the solution delivered, shown between the
  // designation/company line and the star rating.
  solution: string;
  // Client company logo shown in the avatar circle instead of initials, when
  // available. Left unset to fall back to initials (see rollout notes above
  // the array below).
  logo?: string;
  accent: "blue" | "cyan" | "purple" | "orange";
};

// Company-logo avatars: none of these 15 real clients have a logo asset
// available in this repo (checked apps/website/public — only the JHB brand
// logo files exist there) or reachable via the Supabase project that stores
// the admin-uploaded "Client Logos" marquee images (that project isn't
// reachable from this environment, and even if it were, those rows don't
// expose a company-name column to match against). Every entry below
// therefore omits `logo` and falls back to initials, per instructions.
// Once real logo files/URLs are supplied, set e.g. `logo: "/clients/aarthi-gold-finance.png"`.

export const testimonials: Testimonial[] = [
  {
    name: "Manikandan",
    role: "Founder",
    company: "Aarthi Gold Finance",
    rating: 5,
    quote:
      "We came to JHB looking for a way to manage leads better, and they delivered more than we expected. The custom CRM keeps our branches organized, the mobile app makes it easy for customers to reach us, and the marketing team is always quick to respond. Genuinely dependable people to work with.",
    result: "Long-Term Partnership",
    tags: ["DIGITAL MARKETING", "APP DEVELOPMENT", "CRM"],
    solution: "Digital growth strategy powered by a custom CRM and mobile application.",
    accent: "cyan",
  },
  {
    name: "Prasanna",
    role: "Founder",
    company: "H2O Tracker",
    rating: 5,
    quote:
      "Tracking our fleet used to be a constant headache until JHB built our GPS system from scratch. It works exactly the way we need it to, and whenever we've asked for changes, they've handled it quickly without any fuss. Their support team stays available, and the whole process felt refreshingly straightforward.",
    result: "Reliable Service",
    tags: ["GPS TRACKING", "CUSTOM SOFTWARE"],
    solution: "Custom GPS tracking platform built for real-time fleet management.",
    accent: "purple",
  },
  {
    name: "Subaranjani Natarajan",
    role: "Co-Founder",
    company: "Manakkadu Masala",
    rating: 5,
    quote:
      "Moving our masala business online felt overwhelming, but JHB made it simple. The Shopify store they built looks professional and works smoothly, and their SEO work has genuinely helped people find us on Google. They explained everything clearly along the way and were patient with all our questions.",
    result: "Business Growth",
    tags: ["SHOPIFY", "SEO"],
    solution: "Shopify e-commerce store optimized for online sales and search visibility.",
    accent: "orange",
  },
  {
    name: "Karthikeyan",
    role: "Co-Founder",
    company: "JK Finstrade",
    rating: 5,
    quote:
      "JHB shot our advertisement campaign and it turned out better than we imagined — sharp visuals, great direction, no wasted time on set. Since then their digital marketing team has kept our campaigns consistent and on-brand. They communicate clearly at every stage and never leave us guessing about progress or results.",
    result: "Creative Solutions",
    tags: ["ADS SHOOT", "DIGITAL MARKETING"],
    solution: "Creative advertising campaigns supported by performance-driven marketing.",
    accent: "blue",
  },
  {
    name: "Aruna Jayavel",
    role: "Co-Founder",
    company: "Aruna Furniture",
    rating: 5,
    quote:
      "We needed our furniture brand to look as premium online as it does in the showroom, and JHB delivered exactly that. The advertisement shoot captured our pieces beautifully, and their digital marketing has kept us visible to the right audience. Professional team, easy to reach, and genuinely invested in our brand.",
    result: "Professional Team",
    tags: ["ADS SHOOT", "DIGITAL MARKETING"],
    solution: "Creative brand campaigns designed to strengthen digital presence.",
    accent: "cyan",
  },
  {
    name: "Nazzer",
    role: "Founder",
    company: "Koyas",
    rating: 5,
    quote:
      "JHB connected us with influencers who actually matched our brand instead of just anyone with followers, and it made a real difference. Our social media has been far more active and engaging since we started working with them. They're organized, communicate well, and clearly understand how to run a campaign properly.",
    result: "Highly Recommended",
    tags: ["INFLUENCER MARKETING", "SMM"],
    solution: "Influencer collaborations combined with strategic social media marketing.",
    accent: "purple",
  },
  {
    name: "Kumarasan",
    role: "Co-Founder",
    company: "Indian Master",
    rating: 5,
    quote:
      "The mobile app JHB built for us runs smoothly and our customers find it genuinely easy to use. Alongside that, their digital marketing has brought steady, relevant traffic our way. What stood out most was how responsive the team stayed throughout — every question was answered without delay and every update was clear.",
    result: "Quality Delivery",
    tags: ["APP DEVELOPMENT", "DIGITAL MARKETING"],
    solution: "Business mobile application supported by effective digital marketing.",
    accent: "orange",
  },
  {
    name: "Vijayakannan",
    role: "Founder",
    company: "Salem Cosmetic Clinic",
    rating: 5,
    quote:
      "Running the clinic used to mean juggling paper records and missed appointments. JHB built us a web application with a proper clinic management system, and now everything from bookings to patient records runs in one place. The team took time to understand our workflow and delivered something that actually fits how we work.",
    result: "Premium Service",
    tags: ["WEB APPLICATION", "CLINIC MANAGEMENT"],
    solution: "Custom clinic management web application for streamlined operations.",
    accent: "blue",
  },
  {
    name: "Dhandraj",
    role: "Founder",
    company: "Gun Point",
    rating: 5,
    quote:
      "Before JHB, we were managing customer requests across scattered notebooks and phone calls. Now we have a proper management system paired with a mobile app that keeps everything organized in one place. The build quality was solid, the turnaround was quick, and their support team has stayed helpful even after launch.",
    result: "Fast Turnaround",
    tags: ["CUSTOM SOFTWARE", "APP DEVELOPMENT"],
    solution: "Business management platform integrated with a dedicated mobile application.",
    accent: "cyan",
  },
  {
    name: "Harish",
    role: "Owner",
    company: "Kauvery Restaurant",
    rating: 5,
    quote:
      "JHB took the time to actually understand our restaurant and the kind of customers we wanted to reach, instead of running generic campaigns. Our social media presence feels far more consistent now, and we're seeing more regulars mention finding us online. They're friendly to work with and always quick to reply.",
    result: "Customer Satisfaction",
    tags: ["DIGITAL MARKETING", "SMM"],
    solution: "Restaurant marketing focused on improving local customer engagement.",
    accent: "purple",
  },
  {
    name: "Praveen Kumar",
    role: "Owner",
    company: "Swarnalaya",
    rating: 5,
    quote:
      "As a jewellery business, trust matters more than anything, and JHB's marketing has helped us build exactly that online. Our visibility has improved noticeably, and they take the time to explain what's working and why. It's rare to find a team this transparent and easy to communicate with on a regular basis.",
    result: "Trusted Partner",
    tags: ["DIGITAL MARKETING"],
    solution: "Performance-focused digital campaigns to improve online visibility.",
    accent: "orange",
  },
  {
    name: "Prabhu Antony Raj",
    role: "Owner",
    company: "Jojo Momos",
    rating: 5,
    quote:
      "Our online ordering site runs smoothly now thanks to the Shopify store JHB set up for us, and the digital marketing around it has genuinely brought in new customers. What I appreciate most is how easy they are to reach — no long waits for replies, just quick, honest updates every time.",
    result: "Smooth Execution",
    tags: ["SHOPIFY", "DIGITAL MARKETING"],
    solution: "Online ordering website supported by targeted digital marketing campaigns.",
    accent: "blue",
  },
  {
    name: "Prasanth",
    role: "Owner",
    company: "Ram Aromatics",
    rating: 5,
    quote:
      "The product photography JHB delivered made our aromatics line look far more premium than any photos we'd had before, and the advertisement shoot matched that same quality. They were professional on set, easy to communicate with, and delivered the final files right on schedule without any back and forth.",
    result: "Dedicated Support",
    tags: ["ADS SHOOT", "PRODUCT SHOOT"],
    solution: "Professional product photography and commercial advertising creatives.",
    accent: "cyan",
  },
  {
    name: "Rishib",
    role: "Founder",
    company: "J Pencil",
    rating: 5,
    quote:
      "JHB built our website from the ground up and added an AI chatbot that actually handles customer questions well, not just generic replies. The whole build felt well thought out, and they stayed responsive throughout the project, explaining decisions instead of just implementing things quietly in the background.",
    result: "Timely Delivery",
    tags: ["WEBSITE DEVELOPMENT", "AI CHATBOT"],
    solution: "Modern business website integrated with an AI-powered customer chatbot.",
    accent: "purple",
  },
  {
    name: "Shanker",
    role: "Owner",
    company: "SFC",
    rating: 5,
    quote:
      "We'd tried digital marketing before with little to show for it, but JHB's approach was different from day one — clear plans, honest expectations, and steady follow-through. Our brand visibility has grown month over month, and their team is always reachable whenever we have questions or want to adjust something.",
    result: "Excellent Support",
    tags: ["DIGITAL MARKETING"],
    solution: "Digital marketing campaigns designed to increase brand visibility.",
    accent: "orange",
  },
];

export type NavItem = {
  label: string;
  href: string;
  dropdown?: { label: string; href: string; icon: string }[];
};

export const serviceMenu = serviceDetails.map((s) => ({
  label: s.title,
  href: `/${s.slug}`,
  icon: s.icon,
}));

export const navItems: NavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services", dropdown: serviceMenu },
  { label: "JHB Products", href: "/jhb-automation-tools" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

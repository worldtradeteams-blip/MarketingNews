// Bundled seed cases. Used when live source fetching is unavailable (CORS/offline),
// and as day-one content so the dashboard is never empty.
// These are hand-curated example teaching cases (not scraped) — replace/extend via live pipeline.
const SEED_CASES = [
  {
    id: "c1", brand: "Nike", title: "Nike ties local sport rituals to a global 'Just Do It' refresh",
    source: "Marketing Week", coverage: ["Marketing Week","Adweek"], date: "2026-09-14",
    country: "Global", region: "Global", industry: "Retail", url: "https://www.marketingweek.com/",
    reliability: "SPECIALIST_MARKETING",
    summary: "Nike relaunched a market-by-market creative platform that pairs its global tagline with hyper-local athlete stories, shot and cast entirely within each market.",
    idea: "Keep one global brand promise, but let local creative teams choose the athletes, sports and settings that carry it.",
    insight: "Consumers trust brands more when the aspiration on screen looks like their own street, gym or neighborhood, not an imported ideal.",
    creative: "Uses hyper-local casting and vernacular sport culture instead of a single global hero film.",
    innovative: "Decentralizes creative production to regional teams while keeping strict brand-system guardrails.",
    strategy: "Balances global brand consistency with local market adaptation (standardization vs. adaptation).",
    impact: "Not publicly reported.",
    why: "A clean, teachable example of the global-standardization-vs-local-adaptation tension in international marketing.",
    concepts: ["Brand Strategy","International Marketing","Cultural Marketing","Positioning"],
    questions: [
      "Where should Nike draw the line between global consistency and local adaptation?",
      "What risks come from decentralizing creative control to regional teams?",
      "How would you measure whether local adaptation is working?",
      "Could a smaller challenger brand copy this playbook with less budget?"
    ],
    score: 82, tier: "STRONG CASE", aiRole: null
  },
  {
    id: "c2", brand: "IKEA", title: "IKEA turns small-space living into a modular content series",
    source: "The Drum", coverage: ["The Drum"], date: "2026-09-13",
    country: "Multiple", region: "Europe", industry: "Retail", url: "https://www.thedrum.com/",
    reliability: "SPECIALIST_MARKETING",
    summary: "IKEA built a recurring short-video series showing real customers redesigning small urban apartments, using only products under a fixed budget.",
    idea: "Turn the product catalogue into a problem-solving format instead of a showroom.",
    insight: "Urban renters feel anxious about wasting money on furniture that won't fit their space or their lease.",
    creative: "Format-driven storytelling (budget + real homes) rather than a single polished campaign film.",
    innovative: "Repeatable content system that can scale infinitely across markets with local budgets and homes.",
    strategy: "Builds category relevance ('small-space living') rather than promoting individual SKUs.",
    impact: "Not publicly reported.",
    why: "Shows how a recurring content format can outperform one-off campaigns for sustained brand relevance.",
    concepts: ["Content Marketing","Customer Experience","Consumer Insight","Retail Marketing"],
    questions: [
      "Why might a recurring format build more equity than a single campaign?",
      "What consumer tension is IKEA solving here?",
      "How could this format be adapted for a luxury brand?",
      "What would make this campaign fail to scale internationally?"
    ],
    score: 76, tier: "STRONG CASE", aiRole: null
  },
  {
    id: "c3", brand: "Sephora", title: "Sephora's AI shade-matching tool changes in-store conversion",
    source: "Marketing Dive", coverage: ["Marketing Dive","Digiday"], date: "2026-09-12",
    country: "United States", region: "North America", industry: "Retail", url: "https://www.marketingdive.com/",
    reliability: "SPECIALIST_MARKETING",
    summary: "Sephora expanded an in-store AI tool that scans skin tone under real lighting to recommend foundation shades across multiple brands simultaneously.",
    idea: "Use AI to remove the single biggest purchase-anxiety point in beauty retail: shade mismatch.",
    insight: "Shoppers abandon beauty purchases when they fear buying the wrong shade, especially for their own skin tone.",
    creative: "Not the visual creative that stands out — the interaction design is the creative act.",
    innovative: "AI materially changes the purchase decision itself (shade accuracy), not just the marketing message.",
    strategy: "Reduces purchase friction to increase basket size and reduce returns.",
    impact: "Not publicly reported.",
    why: "A clean example of AI creating real customer value versus AI as a marketing buzzword.",
    concepts: ["AI Marketing","Personalization","Customer Experience","Retail Marketing"],
    questions: [
      "What did AI actually change here versus a normal in-store display?",
      "What data and trust issues does this raise?",
      "Would this work for a lower-cost, mass-market beauty brand?",
      "How should Sephora measure success beyond satisfaction scores?"
    ],
    score: 79, tier: "STRONG CASE", aiRole: "Shade-matching computer vision recommendation"
  },
  {
    id: "c4", brand: "Duolingo", title: "Duolingo's owl mascot leans further into unhinged social comedy",
    source: "Adweek", coverage: ["Adweek","Fast Company"], date: "2026-09-11",
    country: "Global", region: "Global", industry: "Technology", url: "https://www.adweek.com/",
    reliability: "SPECIALIST_MARKETING",
    summary: "Duolingo continued building its mascot 'Duo' as an independent social-first character with its own comedic storylines across TikTok and Instagram.",
    idea: "Treat the brand mascot as an entertainment property, not a logo animation.",
    insight: "Gen Z engages with characters and bits, not brand messaging; entertainment earns attention that ads cannot buy.",
    creative: "Absurdist, meme-native humor that intentionally breaks traditional brand-safety norms.",
    innovative: "Brand-as-character strategy run like a creator account rather than a corporate channel.",
    strategy: "Builds top-of-funnel cultural relevance and app-store visibility through organic reach.",
    impact: "Not publicly reported.",
    why: "Widely used teaching example of social-first brand building and Gen Z engagement strategy.",
    concepts: ["Gen Z Strategy","Brand Equity","Cultural Marketing","Digital Marketing"],
    questions: [
      "What is the risk of a mascot becoming more famous than the product?",
      "How would you brief a 'brand-safe absurdity' content strategy?",
      "Could this work for a financial services or healthcare brand?",
      "How should Duolingo know when the bit has run its course?"
    ],
    score: 74, tier: "WATCHLIST", aiRole: null
  },
  {
    id: "c5", brand: "L'Oréal", title: "L'Oréal expands AI-generated shade try-on across e-commerce partners",
    source: "Vogue Business", coverage: ["Vogue Business"], date: "2026-09-10",
    country: "France", region: "Europe", industry: "Fashion", url: "https://www.voguebusiness.com/",
    reliability: "SPECIALIST_MARKETING",
    summary: "L'Oréal rolled its virtual try-on technology out to third-party retail partners, letting shoppers preview makeup shades on their own photos before buying anywhere online.",
    idea: "License AI beauty-tech as a distribution advantage, not just a brand feature.",
    insight: "Online beauty shoppers convert better when uncertainty about appearance is reduced before checkout.",
    creative: "Limited — this is primarily an infrastructure and distribution innovation.",
    innovative: "Licensing owned AI technology to partners turns a feature into a B2B revenue and reach strategy.",
    strategy: "Extends brand influence into retail partners' funnels, not just L'Oréal's own channels.",
    impact: "Not publicly reported.",
    why: "Good example of marketing technology becoming a strategic distribution asset.",
    concepts: ["AI Marketing","Personalization","International Marketing","Innovation"],
    questions: [
      "Is this a marketing case or purely a technology licensing case? Why does that distinction matter?",
      "What competitive advantage does L'Oréal gain by licensing versus keeping it exclusive?",
      "How might smaller beauty brands respond?",
      "What data-privacy questions should be raised in class?"
    ],
    score: 71, tier: "WATCHLIST", aiRole: "Virtual try-on image generation licensed to partners"
  }
];

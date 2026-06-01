// Real portfolio projects — sourced from yasirbashir.com's published work.
// Shown as cards inside the chat when a client asks to see Yasir's work.
// Read-only mirror of authentic data; the main site remains the source of truth.

export interface Project {
  title: string;
  subtitle: string;
  emoji: string;
  image: string;
  url: string;
  categories: string[];
  headline: string;
  stats: { label: string; value: string }[];
}

export const PROJECTS: Project[] = [
  {
    title: "RMG Transport",
    subtitle: "Nationwide vehicle transport, USA",
    emoji: "🚗",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/rmg-transport.png",
    url: "https://rmgtransport.com",
    categories: ["Web Apps", "Logistics", "n8n Automation", "CRM Systems"],
    headline: "AI lead system for a nationwide transport company.",
    stats: [
      { label: "More Leads", value: "40%" },
      { label: "Less Manual Work", value: "60%" },
      { label: "Faster Booking", value: "3×" },
    ],
  },
  {
    title: "Steer Logistics",
    subtitle: "Freight brokerage platform, USA",
    emoji: "🚛",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/steer-logistics.png",
    url: "https://steerlogistics.co",
    categories: ["Web Apps", "Logistics"],
    headline: "Full-scale freight brokerage web platform.",
    stats: [
      { label: "Digitised Ops", value: "100%" },
      { label: "Launch Time", value: "2 wks" },
      { label: "Scalable", value: "∞" },
    ],
  },
  {
    title: "Dominique McClaney",
    subtitle: "Personal site + AI chatbot",
    emoji: "🤖",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/dominique-mcclaney.png",
    url: "https://dominiquemcclaney.com",
    categories: ["Web Apps", "AI Chatbots"],
    headline: "AI-powered personal site for a full-stack engineer & Navy veteran.",
    stats: [
      { label: "AI Chatbot", value: "24/7" },
      { label: "Personalised UX", value: "100%" },
      { label: "Lead Qualify", value: "Auto" },
    ],
  },
  {
    title: "TruckinLink",
    subtitle: "Digital marketing + driver recruitment for trucking",
    emoji: "🎯",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/truckin-link.png",
    url: "https://truckinlink.com",
    categories: ["Web Apps", "Logistics", "Social Automation"],
    headline: "All-in-one digital marketing partner for US trucking companies.",
    stats: [
      { label: "Yrs Trucking Niche", value: "10+" },
      { label: "Cost per Driver", value: "Lower" },
      { label: "Channel Ads", value: "Multi" },
    ],
  },
  {
    title: "Elevated Financial",
    subtitle: "Credit repair, business funding & financial planning",
    emoji: "💼",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/elevated-financial.png",
    url: "https://elevatedfinancialllc.com",
    categories: ["Web Apps"],
    headline: "Trust-first site for a credit repair + business funding firm.",
    stats: [
      { label: "Funding Approved", value: "$1M+" },
      { label: "Client Rating", value: "4.95★" },
      { label: "Service Tracks", value: "3" },
    ],
  },
  {
    title: "FWL Logistics",
    subtitle: "Freight brokerage website, USA",
    emoji: "🚚",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/fwl-logistics.png",
    url: "https://fwllogistics.com",
    categories: ["Web Apps", "Logistics"],
    headline: "Clean, conversion-focused site for a US freight broker.",
    stats: [
      { label: "Lead Capture", value: "B2B" },
      { label: "Load Times", value: "Fast" },
      { label: "Brand Trust", value: "Pro" },
    ],
  },
  {
    title: "SFam Logistics",
    subtitle: "Freight brokerage + admin dashboard",
    emoji: "📦",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/sfam-logistics.png",
    url: "https://sfamlogistics.com",
    categories: ["Web Apps", "Logistics", "CRM Systems"],
    headline: "Bold-themed freight brokerage site with a real admin dashboard.",
    stats: [
      { label: "Public Pages", value: "12" },
      { label: "Admin Panel", value: "Full" },
      { label: "Login System", value: "Auth" },
    ],
  },
  {
    title: "Earth Logistics Inc",
    subtitle: "Indiana freight broker, 15-page corporate site",
    emoji: "🌎",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/earth-logistics.png",
    url: "https://earth-logistics-inc.vercel.app",
    categories: ["Web Apps", "Logistics"],
    headline: "Professional 15-page freight broker site built for shipper/carrier leads.",
    stats: [
      { label: "Pages", value: "15" },
      { label: "Lead Funnels", value: "3" },
      { label: "Operation Story", value: "24/7" },
    ],
  },
  {
    title: "Arnold Freight Group",
    subtitle: "Freight brokerage website, USA",
    emoji: "🚛",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/arnold-freight.png",
    url: "https://arnoldfreightgroup.com",
    categories: ["Web Apps", "Logistics"],
    headline: "Corporate freight broker site engineered for trust and lead capture.",
    stats: [
      { label: "B2B Design", value: "Pro" },
      { label: "Lead Forms", value: "Fast" },
      { label: "Signal Stack", value: "Trust" },
    ],
  },
  {
    title: "SC Commercial Concepts",
    subtitle: "Commercial cleaning services website",
    emoji: "🧼",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/sc-commercial.png",
    url: "https://sc-commercialconcepts.com",
    categories: ["Web Apps"],
    headline: "Service-first site for a commercial cleaning operator.",
    stats: [
      { label: "Service Pages", value: "Pro" },
      { label: "Quote Form", value: "Fast" },
      { label: "SEO Built-in", value: "Local" },
    ],
  },
  {
    title: "Sublime Pathways",
    subtitle: "Wellness, yoga & care center site",
    emoji: "🧘",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/sublime-pathways.png",
    url: "https://sublimepathways.com",
    categories: ["Web Apps"],
    headline: "Calm, premium presence for a wellness & yoga practice.",
    stats: [
      { label: "Brand Feel", value: "Calm" },
      { label: "Booking UX", value: "Easy" },
      { label: "Practitioner Story", value: "Pro" },
    ],
  },
  {
    title: "Love & Care Retreat",
    subtitle: "Bilingual healing retreat (EN / RO)",
    emoji: "🌸",
    image: "https://veiribiwafqlhexygspn.supabase.co/storage/v1/object/public/portfolio-images/projects/love-care-retreat.png",
    url: "https://loveandcareretreat.com",
    categories: ["Web Apps"],
    headline: "Feminine, bilingual site for a healing & retreat practitioner.",
    stats: [
      { label: "Bilingual", value: "EN/RO" },
      { label: "Pages", value: "5" },
      { label: "Freebie Funnel", value: "PDF" },
    ],
  },
];

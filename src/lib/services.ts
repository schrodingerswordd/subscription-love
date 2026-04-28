// Curated brand metadata for popular subscription services
import {
  Music, Film, Tv, Cloud, Gamepad2, Dumbbell, Newspaper,
  Briefcase, Code, Sparkles, ShoppingBag, BookOpen, type LucideIcon,
} from "lucide-react";

export type Category =
  | "entertainment"
  | "music"
  | "productivity"
  | "fitness"
  | "news"
  | "cloud"
  | "gaming"
  | "shopping"
  | "education"
  | "ai"
  | "other";

export const CATEGORIES: { value: Category; label: string; icon: LucideIcon }[] = [
  { value: "entertainment", label: "Entertainment", icon: Film },
  { value: "music", label: "Music", icon: Music },
  { value: "productivity", label: "Productivity", icon: Briefcase },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
  { value: "news", label: "News", icon: Newspaper },
  { value: "cloud", label: "Cloud Storage", icon: Cloud },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "education", label: "Education", icon: BookOpen },
  { value: "ai", label: "AI Tools", icon: Sparkles },
  { value: "other", label: "Other", icon: Code },
];

export interface ServicePreset {
  name: string;
  category: Category;
  color: string; // hex for brand-colored avatar
  slug?: string; // simple-icons slug for brand logo
  defaultCost?: number; // typical monthly price in USD
  initials?: string;
}

// Note: Disney, Amazon, Hulu, OpenAI, Adobe, Xbox, Nintendo, Google One were
// removed from simple-icons due to trademark policy. Those fall back to
// nicely-colored brand initials, which is intentional.
export const SERVICE_PRESETS: ServicePreset[] = [
  { name: "Netflix", category: "entertainment", color: "#E50914", slug: "netflix", defaultCost: 15.49 },
  { name: "Spotify", category: "music", color: "#1DB954", slug: "spotify", defaultCost: 11.99 },
  { name: "Disney+", category: "entertainment", color: "#0E47A1", defaultCost: 9.99 },
  { name: "YouTube Premium", category: "entertainment", color: "#FF0000", slug: "youtube", defaultCost: 13.99 },
  { name: "Apple Music", category: "music", color: "#FA243C", slug: "applemusic", defaultCost: 10.99 },
  { name: "Apple TV+", category: "entertainment", color: "#000000", slug: "appletv", defaultCost: 9.99 },
  { name: "Amazon Prime", category: "shopping", color: "#00A8E1", defaultCost: 14.99 },
  { name: "HBO Max", category: "entertainment", color: "#5822B4", slug: "max", defaultCost: 15.99 },
  { name: "Hulu", category: "entertainment", color: "#1CE783", defaultCost: 7.99 },
  { name: "Notion", category: "productivity", color: "#000000", slug: "notion", defaultCost: 10 },
  { name: "ChatGPT Plus", category: "ai", color: "#10A37F", defaultCost: 20 },
  { name: "Claude Pro", category: "ai", color: "#D97757", slug: "claude", defaultCost: 20 },
  { name: "Adobe Creative Cloud", category: "productivity", color: "#FA0F00", defaultCost: 59.99 },
  { name: "GitHub", category: "productivity", color: "#181717", slug: "github", defaultCost: 4 },
  { name: "iCloud+", category: "cloud", color: "#1B82F1", slug: "icloud", defaultCost: 2.99 },
  { name: "Google Drive", category: "cloud", color: "#4285F4", slug: "googledrive", defaultCost: 1.99 },
  { name: "Dropbox", category: "cloud", color: "#0061FF", slug: "dropbox", defaultCost: 11.99 },
  { name: "Xbox Game Pass", category: "gaming", color: "#107C10", defaultCost: 16.99 },
  { name: "PlayStation Plus", category: "gaming", color: "#003791", slug: "playstation", defaultCost: 10.99 },
  { name: "Nintendo Switch Online", category: "gaming", color: "#E60012", defaultCost: 3.99 },
  { name: "Peloton", category: "fitness", color: "#181A1D", slug: "peloton", defaultCost: 24 },
  { name: "Strava", category: "fitness", color: "#FC4C02", slug: "strava", defaultCost: 11.99 },
  { name: "NYTimes", category: "news", color: "#000000", slug: "newyorktimes", defaultCost: 17 },
  { name: "Linear", category: "productivity", color: "#5E6AD2", slug: "linear", defaultCost: 8 },
  { name: "Figma", category: "productivity", color: "#F24E1E", slug: "figma", defaultCost: 15 },
];

// Most-popular services to surface as quick-add buttons
export const QUICK_ADD_NAMES = [
  "Netflix", "Spotify", "Disney+", "YouTube Premium", "HBO Max", "ChatGPT Plus", "Apple Music", "Amazon Prime",
];

export function getServicePreset(name: string): ServicePreset | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return SERVICE_PRESETS.find(
    (p) => p.name.toLowerCase() === lower || lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lower),
  );
}

export function getCategoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Convert any cycle to monthly equivalent
export function toMonthly(cost: number, cycle: string): number {
  if (cycle === "weekly") return cost * 4.345;
  if (cycle === "yearly") return cost / 12;
  return cost;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

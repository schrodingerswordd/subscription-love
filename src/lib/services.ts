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
  initials?: string;
}

export const SERVICE_PRESETS: ServicePreset[] = [
  { name: "Netflix", category: "entertainment", color: "#E50914" },
  { name: "Spotify", category: "music", color: "#1DB954" },
  { name: "Disney+", category: "entertainment", color: "#0E47A1" },
  { name: "YouTube Premium", category: "entertainment", color: "#FF0000" },
  { name: "Apple Music", category: "music", color: "#FA243C" },
  { name: "Apple TV+", category: "entertainment", color: "#000000" },
  { name: "Amazon Prime", category: "shopping", color: "#00A8E1" },
  { name: "HBO Max", category: "entertainment", color: "#5822B4" },
  { name: "Hulu", category: "entertainment", color: "#1CE783" },
  { name: "Notion", category: "productivity", color: "#000000" },
  { name: "ChatGPT Plus", category: "ai", color: "#10A37F" },
  { name: "Claude Pro", category: "ai", color: "#D97757" },
  { name: "Adobe Creative Cloud", category: "productivity", color: "#FA0F00" },
  { name: "GitHub", category: "productivity", color: "#181717" },
  { name: "iCloud+", category: "cloud", color: "#1B82F1" },
  { name: "Google One", category: "cloud", color: "#4285F4" },
  { name: "Dropbox", category: "cloud", color: "#0061FF" },
  { name: "Xbox Game Pass", category: "gaming", color: "#107C10" },
  { name: "PlayStation Plus", category: "gaming", color: "#003791" },
  { name: "Nintendo Switch Online", category: "gaming", color: "#E60012" },
  { name: "Peloton", category: "fitness", color: "#181A1D" },
  { name: "Strava", category: "fitness", color: "#FC4C02" },
  { name: "NYTimes", category: "news", color: "#000000" },
  { name: "Linear", category: "productivity", color: "#5E6AD2" },
  { name: "Figma", category: "productivity", color: "#F24E1E" },
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

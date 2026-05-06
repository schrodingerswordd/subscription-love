// Curated direct cancellation URLs for popular subscription services.
// These deep-link straight to the provider's cancel/manage page so users
// never have to dig through settings menus.

const CURATED: Record<string, string> = {
  "netflix": "https://www.netflix.com/cancelplan",
  "spotify": "https://www.spotify.com/account/subscription/",
  "disney+": "https://www.disneyplus.com/account/subscription",
  "youtube premium": "https://www.youtube.com/paid_memberships",
  "apple music": "https://music.apple.com/account/subscriptions",
  "apple tv+": "https://tv.apple.com/account/subscriptions",
  "icloud+": "https://support.apple.com/en-us/HT207884",
  "amazon prime": "https://www.amazon.com/gp/primecentral",
  "hbo max": "https://help.max.com/Subscription",
  "max": "https://help.max.com/Subscription",
  "hulu": "https://secure.hulu.com/account",
  "notion": "https://www.notion.so/my-integrations",
  "chatgpt plus": "https://chat.openai.com/#settings/Subscription",
  "claude pro": "https://claude.ai/settings/billing",
  "adobe creative cloud": "https://account.adobe.com/plans",
  "github": "https://github.com/settings/billing/plans",
  "google drive": "https://one.google.com/u/0/storage/management",
  "dropbox": "https://www.dropbox.com/account/plan",
  "xbox game pass": "https://account.microsoft.com/services/",
  "playstation plus": "https://www.playstation.com/acct/subscription/",
  "nintendo switch online": "https://accounts.nintendo.com/membership",
  "peloton": "https://account.onepeloton.com/subscription",
  "strava": "https://www.strava.com/settings/profile",
  "nytimes": "https://myaccount.nytimes.com/seg/subscription",
  "linear": "https://linear.app/settings/billing",
  "figma": "https://www.figma.com/settings/account",
};

export interface CancelLink {
  url: string;
  /** "official" = curated direct link; "search" = Google fallback. */
  kind: "official" | "search";
}

/**
 * Resolve a cancellation URL for a subscription name.
 * Tries the curated map first, falls back to a Google search query.
 */
export function getCancelLink(name: string): CancelLink {
  const key = name.toLowerCase().trim();
  if (CURATED[key]) return { url: CURATED[key], kind: "official" };
  // try partial — e.g. "Netflix Premium" → netflix
  for (const [k, url] of Object.entries(CURATED)) {
    if (key.includes(k) || k.includes(key)) return { url, kind: "official" };
  }
  const q = encodeURIComponent(`how to cancel ${name} subscription`);
  return { url: `https://www.google.com/search?q=${q}`, kind: "search" };
}

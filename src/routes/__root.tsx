import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";
import { registerPWA } from "@/lib/pwa";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#5B2FD6" },
      { title: "SubTrack — Track every subscription, never get surprised" },
      { name: "description", content: "SubTrack helps you track all your subscriptions in one place. See your true monthly spend, get clarity on recurring costs, and cancel what you don't use." },
      { property: "og:title", content: "SubTrack — Track every subscription, never get surprised" },
      { property: "og:description", content: "SubTrack helps you track all your subscriptions in one place. See your true monthly spend, get clarity on recurring costs, and cancel what you don't use." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SubTrack — Track every subscription, never get surprised" },
      { name: "twitter:description", content: "SubTrack helps you track all your subscriptions in one place. See your true monthly spend, get clarity on recurring costs, and cancel what you don't use." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d4c4a090-10ee-4eae-80ad-b4d092bedf37/id-preview-7b803751--050461d5-a656-4e5d-a221-43d607dd05eb.lovable.app-1778088332178.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d4c4a090-10ee-4eae-80ad-b4d092bedf37/id-preview-7b803751--050461d5-a656-4e5d-a221-43d607dd05eb.lovable.app-1778088332178.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    registerPWA();
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

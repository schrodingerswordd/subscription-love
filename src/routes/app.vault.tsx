import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, ShieldCheck, Cpu, HardDrive, BookOpen, ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/app/vault")({
  component: VaultPage,
});

function VaultPage() {
  const { user } = useAuth();
  const { openCheckout, loading } = useStripeCheckout();

  const handlePurchase = async (priceId: string) => {
    await openCheckout({
      priceId,
      mode: "payment",
      successUrl: `${window.location.origin}/app/vault?success=1`,
      cancelUrl: `${window.location.origin}/app/vault`,
    });
  };

  const products = [
    {
      id: "physical-archives",
      title: "The Physical Archives",
      description: "Complete printed editions of the Knowledge Vault. 12 volumes of verified human wisdom.",
      price: "$199.00",
      priceId: "price_physical_archives", // Placeholder
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      features: ["Hardcover limited edition", "Worldwide shipping", "Analog reference index"],
    },
    {
      id: "survival-gear-bundle",
      title: "Survival Gear Bundle",
      description: "Hardened USB containing the entire digital vault + premium analog survival tools.",
      price: "$299.00",
      priceId: "price_gear_bundle", // Placeholder
      icon: <Cpu className="h-10 w-10 text-primary" />,
      features: ["Military-grade encrypted USB", "Professional grade compass", "Emergency medical kit"],
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/app">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">The Knowledge Vault</h1>
          <p className="text-muted-foreground text-lg">Secure your future with physical wisdom and gear.</p>
        </div>
        <div className="hidden sm:block">
           <ShieldCheck className="h-16 w-16 text-primary opacity-20" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-col border-2 border-border/50 hover:border-primary/50 transition-colors shadow-elegant">
            <CardHeader>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {product.icon}
              </div>
              <CardTitle className="text-2xl">{product.title}</CardTitle>
              <CardDescription className="text-base">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t bg-muted/30 p-6">
              <div className="mb-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold">{product.price}</span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>
              <Button 
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={() => handlePurchase(product.priceId)}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                Buy Now
              </Button>
              <p className="mt-4 text-center w-full text-xs text-muted-foreground uppercase tracking-widest">
                Multi-currency checkout // Worldwide shipping
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-primary/5 p-8 border border-primary/20">
        <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Secure Global Delivery</h3>
            <p className="text-muted-foreground">
              All physical archives and gear bundles are shipped via tracked, insured couriers. 
              Our fulfillment partners ensure delivery even to off-grid locations worldwide.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { 
  Plus, Calendar, Sparkles, Ban, RotateCcw, 
  Crown, ExternalLink, Flame, Download, 
  HardDrive, BookOpen, Lock,
  ChevronRight, Activity, Zap
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, getCategoryMeta, toMonthly } from "@/lib/services";
import { BunkerWrapper } from "./BunkerWrapper";
import { SchrodingerMark } from "./SchrodingerMark";

interface Subscription {
  id: string;
  name: string;
  cost: number;
  billing_cycle: string;
  next_billing_date: string;
  category: string;
  created_at: string;
  status: "active" | "cancelled";
  cancelled_at: string | null;
  shared_with_count: number;
}

interface VaultDashboardProps {
  subs: Subscription[];
  loading: boolean;
  onCancel: (s: Subscription) => void;
  onReactivate: (s: Subscription) => void;
  onDelete: (id: string) => void;
}

export const VaultDashboard = ({ subs, loading, onCancel, onReactivate, onDelete }: VaultDashboardProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [tab, setTab] = useState<"library" | "subscriptions">("library");

  const activeSubs = useMemo(() => subs.filter((s) => s.status === "active"), [subs]);
  
  const totalMonthly = useMemo(
    () => activeSubs.reduce((sum, s) => sum + toMonthly(Number(s.cost), s.billing_cycle), 0),
    [activeSubs],
  );

  const scenarioPacks = [
    {
      id: "72h",
      title: "Protocol: The First 72 Hours",
      category: "Tactical / Survival",
      image: "/vault/72h-scenario-pack.png",
      status: "Downloaded",
      color: "border-primary",
    },
    {
      id: "medicine",
      title: "Grid-Down Medicine",
      category: "Medical / Primitive",
      image: "/vault/grid-down-medicine.png",
      status: "Access Granted",
      color: "border-emerald-500",
    },
    {
      id: "winter",
      title: "Winter Survival",
      category: "Environment / Fortification",
      image: "/vault/winter-survival.png",
      status: "Access Granted",
      color: "border-cyan-500",
    },
    {
      id: "harvest",
      title: "The Eternal Harvest",
      category: "Sustenance / Agriculture",
      image: "/vault/eternal-harvest-hero.png",
      status: "Locked",
      color: "border-amber-500",
      locked: true,
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
        {/* Subtle coded-identity watermark */}
        <SchrodingerMark
          size={420}
          ring
          state={isPremium ? "alive" : "superposition"}
          title=""
          className="pointer-events-none absolute -top-10 right-0 opacity-[0.025] select-none hidden lg:block"
        />

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-primary/20 pb-8 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SchrodingerMark size={20} ring={false} state={isPremium ? "alive" : "superposition"} title="" className="text-primary bunker-glow" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary/60">Secure Terminal // Level 4 Clearance</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-primary bunker-glow">
              Knowledge Vault Hub
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
              Operative: {user?.email?.split('@')[0] || "Unknown"} // Status: {isPremium ? "Elite Sovereign" : "Standard Archive Access"}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-black/60 border border-primary/30 p-3 px-6 text-right">
              <div className="text-[10px] uppercase text-primary/40 font-mono">Resource Allocation</div>
              <div className="text-xl font-bold font-mono text-primary bunker-glow">{formatCurrency(totalMonthly)}<span className="text-xs opacity-60 ml-1">/MO</span></div>
            </div>
            {!isPremium && (
              <Button asChild className="bg-primary text-primary-foreground rounded-none h-auto py-3 px-6 font-bold uppercase tracking-widest hover:bg-primary/90">
                <Link to="/pricing">Upgrade Access</Link>
              </Button>
            )}
          </div>
        </header>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-8 mb-8 border-b border-white/5 w-full justify-start rounded-none">
            <TabsTrigger 
              value="library" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 pb-4 text-sm font-bold uppercase tracking-widest transition-all opacity-50 data-[state=active]:opacity-100"
            >
              <BookOpen className="w-4 h-4 mr-2" /> The Library
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 pb-4 text-sm font-bold uppercase tracking-widest transition-all opacity-50 data-[state=active]:opacity-100"
            >
              <Activity className="w-4 h-4 mr-2" /> Subscription Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0 focus-visible:ring-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Knowledge Map Card */}
              <div className="lg:col-span-3 group relative border border-primary/20 bg-black/40 overflow-hidden hover:border-primary/50 transition-all">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 rounded-none bg-primary/20 text-primary border-primary/30 font-mono text-[10px] tracking-widest uppercase">Central Intelligence</Badge>
                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 bunker-glow text-primary">Intelligence Taxonomy Map</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
                      A visual visualization of the platform's intelligence architecture, including Founding Archives, Scenario Packs, and Tactical Updates. Verifiable wisdom across 12 distinct survival vectors.
                    </p>
                    <Button variant="outline" className="w-fit rounded-none border-primary/30 uppercase tracking-widest text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Open Schema Viewer <ChevronRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                  <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative border-l border-primary/10">
                    <img src="/vault/knowledge_map.png" alt="Knowledge Map" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Scenario Pack Cards */}
              {scenarioPacks.map((pack) => (
                <div key={pack.id} className={cn("group relative border bg-black/40 flex flex-col transition-all", pack.color + "/20 hover:" + pack.color + "/50")}>
                  <div className="aspect-square relative overflow-hidden">
                    <img src={pack.image} alt={pack.title} className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-110", pack.locked ? "grayscale blur-sm opacity-40" : "")} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                    
                    {pack.locked ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 border border-white/10 p-4 flex flex-col items-center">
                          <Lock className="w-8 h-8 text-white/40 mb-2" />
                          <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.2em]">Restricted Data</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4">
                        <div className="bg-primary/90 text-primary-foreground px-2 py-1 text-[8px] font-mono font-black uppercase tracking-widest">Available</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">{pack.category}</span>
                    <h4 className="text-lg font-bold uppercase tracking-tight mb-4 leading-tight group-hover:text-primary transition-colors">{pack.title}</h4>
                    
                    <div className="mt-auto flex items-center justify-between">
                      {pack.locked ? (
                        <Button className="w-full rounded-none border border-white/10 bg-transparent text-white/60 hover:bg-white/5 uppercase text-[10px] tracking-widest">
                          Acquire Access
                        </Button>
                      ) : (
                        <Button className="w-full rounded-none bg-white/10 text-white hover:bg-primary hover:text-primary-foreground uppercase text-[10px] tracking-widest border border-white/10">
                          <Download className="w-3 h-3 mr-2" /> Initialize Sync
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Pack Placeholder */}
              <div className="border border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-8 text-center opacity-60 hover:opacity-100 hover:border-primary/40 transition-all group">
                <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/10">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold uppercase tracking-widest text-primary/80 mb-2">Initialize Data Fetch</h4>
                <p className="text-[10px] text-muted-foreground uppercase max-w-[180px]">Request manual archive ingestion for custom datasets</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="mt-0 focus-visible:ring-0">
            <div className="grid gap-6">
              <section className="bg-primary/5 border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -left-8 -top-8 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Vault Subscription Tier</h3>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-primary-foreground rounded-none font-black uppercase tracking-widest">
                      {isPremium ? "Elite Sovereign" : "Basic Access"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Renew Date: {activeSubs[0]?.next_billing_date || "N/A"}</span>
                  </div>
                </div>
                <div className="flex gap-3 relative z-10">
                  <Button variant="outline" asChild className="rounded-none border-primary/30 hover:bg-primary/10 uppercase tracking-widest text-[10px] font-bold">
                    <Link to="/app/billing">View Logs</Link>
                  </Button>
                  <Button className="bg-primary text-primary-foreground rounded-none font-bold uppercase tracking-widest text-[10px] px-6 h-auto py-3">
                    Change Allocation
                  </Button>
                </div>
              </section>

              <div className="grid gap-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary/60">Tracked Service Allocations</h4>
                  <Button asChild variant="ghost" size="sm" className="text-primary text-[10px] uppercase tracking-widest font-bold">
                    <Link to="/app/add"><Plus className="w-3 h-3 mr-1" /> Add Allocation</Link>
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse border border-white/5" />)}
                  </div>
                ) : activeSubs.length === 0 ? (
                  <div className="border border-white/5 bg-black/40 p-12 text-center">
                    <p className="text-muted-foreground uppercase text-xs tracking-widest">No service allocations found in current session</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {activeSubs.map(s => {
                      const cat = getCategoryMeta(s.category);
                      return (
                        <div key={s.id} className="group flex items-center justify-between border border-primary/10 bg-black/40 p-4 hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-2 border border-primary/10 group-hover:border-primary/30 transition-all">
                              <ServiceAvatar name={s.name} size={32} />
                            </div>
                            <div>
                              <h5 className="font-bold uppercase tracking-tight text-sm">{s.name}</h5>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{cat.label}</span>
                                <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest">{formatCurrency(Number(s.cost))}/{s.billing_cycle === 'yearly' ? 'YR' : 'MO'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none border border-transparent hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary">
                                <RotateCcw className="h-3.5 w-3.5" />
                             </Button>
                             <Button onClick={() => onCancel(s)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none border border-transparent hover:border-destructive/30 hover:bg-destructive/5 text-muted-foreground hover:text-destructive">
                                <Ban className="h-3.5 w-3.5" />
                             </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Security Footer */}
        <footer className="mt-20 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest">Uplink: ESTABLISHED</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3" />
              <span className="text-[9px] font-mono uppercase tracking-widest">Local Buffer: 4.2TB Free</span>
            </div>
          </div>
          <div className="text-[9px] font-mono uppercase tracking-widest">
            Vault OS v4.12.0 // Node: SG-7 // {new Date().toISOString()}
          </div>
        </footer>
      </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

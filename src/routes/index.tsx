import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Box, Shield, Terminal } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Schrödinger's Archive" },
      { name: "description", content: "Everywhere and nowhere. Professional-grade redundancy for the modern thinker." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans selection:bg-[#FF8C00] selection:text-[#121212]">
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-40 border-b border-[#333] bg-[#121212]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            {/* Coded Identity - Feline Silhouette inside Aperture */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#333] bg-[#1a1a1a]">
              {/* Simplified feline ear silhouette */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8E8E8E]">
                <path d="M12 2L9 9H15L12 2Z" />
                <path d="M3 22L7 14L11 22" />
                <path d="M21 22L17 14L13 22" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-[0.2em] uppercase">Schrödinger's Archive</span>
          </div>
          <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-[#8E8E8E]">
            <Link to="/login" className="hover:text-[#F5F5F5] transition-colors">Login</Link>
            <Link to="/signup" className="text-[#FF8C00] hover:text-[#e07b00] transition-colors">Initiate</Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-[#1A1A1A] to-[#0A0A0A] -z-10" />
        <div className="mx-auto max-w-6xl px-4 py-32 sm:px-6 lg:py-48 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-left">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight uppercase leading-[0.9]">
              The <br />
              <span className="text-[#8E8E8E]">Schrödinger</span> <br />
              Protocol.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-[#8E8E8E] max-w-md leading-relaxed">
              Everywhere and nowhere. Professional-grade redundancy for the modern thinker.
            </p>
            <div className="mt-12">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-3 bg-[#303030] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#F5F5F5] hover:text-[#FF8C00] transition-all border border-[#333] hover:border-[#FF8C00]"
              >
                Access the Archive <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="hidden md:block flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10" />
            <div className="w-full h-[400px] bg-[#121212] border border-[#333] rounded-sm shadow-2xl relative overflow-hidden flex items-center justify-center">
              <Box className="w-32 h-32 text-[#212121]" />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
                <span className="font-mono text-[10px] text-[#8E8E8E] uppercase tracking-widest">Alive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION 01: THE DIGITAL VAULT */}
      <section className="bg-[#121212] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Visual - Terminal HUD */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-[#0A0A0A] border border-[#333] rounded-sm p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px] pointer-events-none" />
              <div className="flex items-center justify-between border-b border-[#333] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#8E8E8E]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#8E8E8E]">Vault Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00FF66] opacity-50 animate-pulse"></span>
                  <span className="h-2 w-2 rounded-full bg-[#333]"></span>
                </div>
              </div>
              <div className="space-y-4 font-mono text-xs text-[#8E8E8E]">
                <p>&gt; Authenticating...</p>
                <p className="text-[#00FF66]">&gt; Access Granted.</p>
                <p>&gt; Loading Archive index...</p>
                <div className="pl-4 border-l border-[#333] mt-4 space-y-2 py-2">
                  <p>├── The Foundations Series</p>
                  <p>├── The Clinical Operations Series</p>
                  <p>├── The Tactical Engineering Series</p>
                  <p>├── The Foraging & Sustenance Series</p>
                  <p>└── The CBRN & Defense Series</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold uppercase tracking-tight">Archive Access</h2>
              <p className="mt-2 font-mono text-xl text-[#8E8E8E]">$19.99 <span className="text-sm">/ MO</span></p>
              
              <p className="mt-6 text-sm text-[#8E8E8E] leading-relaxed">
                Complete digital access to the Knowledge Vault. Synthesized, unredacted, clinical doctrines for survival, evasion, and absolute readiness.
              </p>

              <div className="mt-10 space-y-8">
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#F5F5F5]">The Archive Includes:</h3>
                
                <div className="space-y-6">
                  <div className="border-t border-[#333] pt-4">
                    <p className="text-sm font-bold">The Foundations Series</p>
                    <p className="text-xs text-[#8E8E8E] mt-1">The Urban Evasion Manual | Core Survival Psychology & Social Dynamics</p>
                  </div>
                  <div className="border-t border-[#333] pt-4">
                    <p className="text-sm font-bold">The Clinical Operations Series</p>
                    <p className="text-xs text-[#8E8E8E] mt-1">Advanced Field Trauma Guide | Grid-Down Botanical Pharmacy | Biological Hazard & Sanitation Mitigation</p>
                  </div>
                  <div className="border-t border-[#333] pt-4">
                    <p className="text-sm font-bold">The Tactical Engineering Series</p>
                    <p className="text-xs text-[#8E8E8E] mt-1">Improvised Power & Mechanical Systems | Structural Concealment & Field Shelters | Tactical Rigging & Improvised Tools</p>
                  </div>
                  <div className="border-t border-[#333] pt-4">
                    <p className="text-sm font-bold">The Foraging & Sustenance Series</p>
                    <p className="text-xs text-[#8E8E8E] mt-1">Hydrological Acquisition & Filtration Protocols | Flora & Fauna Tactical Field Index | Toxicology & Hazard Avoidance</p>
                  </div>
                  <div className="border-t border-[#333] pt-4">
                    <p className="text-sm font-bold">The CBRN & Defense Series</p>
                    <p className="text-xs text-[#8E8E8E] mt-1">Radiological & Anthropogenic Hazard Protocol | Tactical Defense & Deterrence Index</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <Link
                  to="/signup"
                  className="inline-flex w-full md:w-auto items-center justify-center bg-transparent border border-[#F5F5F5] px-8 py-4 text-sm font-bold uppercase tracking-widest text-[#F5F5F5] hover:border-[#FF8C00] hover:text-[#FF8C00] transition-colors"
                >
                  Initiate Subscription
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION 02: THE FOUNDATION CRATE */}
      <section className="bg-[#1A1A1A] border-t border-b border-[#333] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
          {/* Visual Focus */}
          <div className="mx-auto w-full max-w-4xl aspect-[21/9] bg-[#0A0A0A] border border-[#333] shadow-2xl relative mb-16 flex flex-col items-center justify-center">
            <div className="absolute top-4 left-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#333]">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="text-[#212121] uppercase tracking-[0.5em] font-bold text-4xl">
              Foundation
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#333] uppercase tracking-widest">ALIVE / DEAD</span>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold uppercase tracking-tight">The Foundation Crate</h2>
            <p className="mt-2 font-mono text-sm uppercase tracking-widest text-[#8E8E8E]">The "Observer's Cache"</p>
            <p className="mt-4 font-mono text-xl text-[#F5F5F5]">$349.00</p>
            
            <p className="mt-8 text-sm text-[#8E8E8E] leading-relaxed">
              Utilitarian. Zero external branding. The essential physical starting point for the modern professional. Packaged to resemble sensitive tech hardware, engineered for total operational readiness.
            </p>

            <div className="mt-12 text-left bg-[#121212] border border-[#333] p-8">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#F5F5F5] mb-6">Requisition Contents:</h3>
              <ul className="space-y-4 font-mono text-xs text-[#8E8E8E]">
                <li className="flex items-start gap-4">
                  <span className="text-[#333]">01.</span>
                  <span className="text-[#F5F5F5]">Volume I: The Architect's Guide to Field Survival <span className="text-[#8E8E8E] block mt-1">(Physical Manual)</span></span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#333]">02.</span>
                  <span className="text-[#F5F5F5]">Apricorn Aegis Secure Key <span className="text-[#8E8E8E] block mt-1">(Hardware-encrypted USB loaded with the full Digital Vault)</span></span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#333]">03.</span>
                  <span className="text-[#F5F5F5]">Professional Sighting Compass <span className="text-[#8E8E8E] block mt-1">(Global Needle)</span></span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#333]">04.</span>
                  <span className="text-[#F5F5F5]">High-Output Tactical Flashlight</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-[#333]">05.</span>
                  <span className="text-[#F5F5F5]">Premium Water Purification System</span>
                </li>
              </ul>
            </div>

            <div className="mt-12">
              <button
                className="inline-flex w-full sm:w-auto items-center justify-center bg-[#121212] border border-[#333] px-10 py-4 text-sm font-bold uppercase tracking-widest text-[#FF8C00] hover:bg-[#FF8C00] hover:text-[#121212] hover:border-[#FF8C00] transition-all"
              >
                Requisition Crate
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <footer className="bg-[#0A0A0A] pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col items-center">
          <nav className="flex flex-wrap justify-center gap-8 font-mono text-xs uppercase tracking-widest text-[#8E8E8E]">
            <Link to="/terms" className="hover:text-[#F5F5F5] transition-colors">Terms</Link>
            <Link to="/login" className="hover:text-[#F5F5F5] transition-colors">Secure Login</Link>
            <Link to="/privacy" className="hover:text-[#F5F5F5] transition-colors">Encryption Policy</Link>
          </nav>
          
          <div className="mt-16 text-center font-mono text-[10px] uppercase tracking-widest text-[#333]">
            Schrödinger's Archive © {new Date().getFullYear()}. All rights reserved.
          </div>

          <div className="mt-12 opacity-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M12 2L9 9H15L12 2Z" />
              <path d="M3 22L7 14L11 22" />
              <path d="M21 22L17 14L13 22" />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
}

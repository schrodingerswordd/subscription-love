import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Truck, Anchor } from "lucide-react";

const GlobalFulfillmentStatus = () => {
  const regions = [
    { name: "North America", status: "Active", latency: "2-4 days", hub: "Saltbox (US)", margin: 56.59 },
    { name: "European Union", status: "Optimization Pending", latency: "7-12 days", hub: "DCL (NL)", margin: 42.40 },
    { name: "Asia Pacific", status: "Standby", latency: "TBD", hub: "TBD", margin: 0 },
  ];

  return (
    <Card className="bg-zinc-900 border-orange-600/50 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-orange-500 font-mono tracking-tighter uppercase flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Global Logistics Chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {regions.map((region) => (
            <div key={region.name} className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg relative overflow-hidden group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-mono font-bold text-zinc-200">{region.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">PRIMARY HUB: {region.hub}</p>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${region.status === 'Active' ? 'border-green-500/50 text-green-500' : 'border-orange-500/50 text-orange-500'}`}>
                  {region.status.toUpperCase()}
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-orange-500/50" />
                    {region.latency}
                  </div>
                  <div className="flex items-center gap-1">
                    <Anchor className="w-3 h-3 text-orange-500/50" />
                    MARGIN: {region.margin}%
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1 h-full bg-orange-600/20 group-hover:bg-orange-600 transition-colors" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalFulfillmentStatus;

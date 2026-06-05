import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const RealTimeMarginTracking = () => {
  const categories = [
    { name: "KV-CBRN", margin: 56.54 },
    { name: "KV-ENG", margin: 54.50 },
    { name: "KV-FOOD", margin: 57.50 },
    { name: "KV-MED", margin: 51.32 },
    { name: "KV-TAC", margin: 55.78 },
  ];

  const bundles = [
    { name: "Foundation Crate", margin: 59.85 },
    { name: "Sovereign Bundle", margin: 55.21 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900 border-orange-600/50 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-orange-500 font-mono tracking-tighter uppercase">
            Live Margin Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-mono text-zinc-400 mb-2 uppercase">Category Margins</h3>
              {categories.map((cat) => (
                <div key={cat.name} className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>{cat.name}</span>
                    <span className="text-orange-400">{cat.margin}%</span>
                  </div>
                  <Progress value={cat.margin} className="h-1 bg-zinc-800" />
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-mono text-zinc-400 mb-2 uppercase">Bundle Profitability</h3>
              {bundles.map((bundle) => (
                <div key={bundle.name} className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>{bundle.name}</span>
                    <span className="text-orange-400">{bundle.margin}%</span>
                  </div>
                  <Progress value={bundle.margin} className="h-2 bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMarginTracking;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CATEGORY_MARGINS, BUNDLE_MARGINS, PRICING_TIERS } from './types';

const RealTimeMarginTracking: React.FC = () => {
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
            {/* Category Margins */}
            <div>
              <h3 className="text-sm font-mono text-zinc-400 mb-2 uppercase">Category Margins</h3>
              {CATEGORY_MARGINS.map((cat) => (
                <div key={cat.name} className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>{cat.name}</span>
                    <span className="text-orange-400">{cat.margin}%</span>
                  </div>
                  <Progress 
                    value={cat.margin} 
                    className="h-1 bg-zinc-800 [&>div]:bg-orange-600" 
                  />
                </div>
              ))}
            </div>

            {/* Bundle Profitability */}
            <div>
              <h3 className="text-sm font-mono text-zinc-400 mb-2 uppercase">Bundle Profitability</h3>
              {BUNDLE_MARGINS.map((bundle) => (
                <div key={bundle.name} className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span>{bundle.name}</span>
                    <span className="text-orange-400">{bundle.margin}%</span>
                  </div>
                  <Progress 
                    value={bundle.margin} 
                    className="h-2 bg-zinc-800 [&>div]:bg-orange-500" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Tiers Summary */}
          <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-md">
            <h3 className="text-xs font-mono text-zinc-400 mb-3 uppercase">Official Pricing Tiers</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Archive Access</div>
                <div className="text-lg font-mono text-orange-500">${PRICING_TIERS.archiveAccess}</div>
                <div className="text-[10px] text-zinc-600">/month</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Foundation Crate</div>
                <div className="text-lg font-mono text-orange-500">${PRICING_TIERS.foundationCrate}</div>
                <div className="text-[10px] text-zinc-600">one-time</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Legacy Vault</div>
                <div className="text-lg font-mono text-orange-500">${PRICING_TIERS.legacyVault}</div>
                <div className="text-[10px] text-zinc-600">one-time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMarginTracking;

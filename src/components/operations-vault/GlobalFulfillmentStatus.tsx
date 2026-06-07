import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Truck, Anchor, Battery, Zap } from 'lucide-react';
import { RegionalShipping } from './types';

const GlobalFulfillmentStatus: React.FC = () => {
  const regions: RegionalShipping[] = [
    {
      region: 'North America',
      shippingFee: 25.00,
      effectiveMargin: 56.59,
      status: 'Active',
      latency: '2-4 days',
      hub: 'Saltbox (US)',
    },
    {
      region: 'European Union',
      shippingFee: 110.00,
      effectiveMargin: 42.40,
      status: 'Optimization Pending',
      latency: '7-12 days',
      hub: 'DCL (NL)',
    },
    {
      region: 'Canada',
      shippingFee: 55.00,
      effectiveMargin: 51.59,
      status: 'Active',
      latency: '4-7 days',
      hub: 'Saltbox (US)',
    },
    {
      region: 'Asia Pacific',
      shippingFee: 0,
      effectiveMargin: 0,
      status: 'Standby',
      latency: 'TBD',
      hub: 'TBD',
    },
  ];

  const getStatusBadgeClass = (status: RegionalShipping['status']): string => {
    switch (status) {
      case 'Active':
        return 'border-green-500/50 text-green-500 bg-green-500/10';
      case 'Optimization Pending':
        return 'border-orange-500/50 text-orange-500 bg-orange-500/10';
      default:
        return 'border-zinc-500/50 text-zinc-500 bg-zinc-500/10';
    }
  };

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
            <div
              key={region.region}
              className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg relative overflow-hidden group hover:border-orange-600/30 transition-colors"
            >
              {/* Accent bar */}
              <div className="absolute top-0 right-0 w-1 h-full bg-orange-600/20 group-hover:bg-orange-600 transition-colors" />

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-mono font-bold text-zinc-200">{region.region}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">PRIMARY HUB: {region.hub}</p>
                </div>
                <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadgeClass(region.status)}`}>
                  {region.status.toUpperCase()}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-orange-500/50" />
                    <span>{region.latency}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Anchor className="w-3 h-3 text-orange-500/50" />
                    <span>
                      {region.effectiveMargin > 0
                        ? `MARGIN: ${region.effectiveMargin}%`
                        : 'MARGIN: --'}
                    </span>
                  </div>
                </div>

                {region.shippingFee > 0 && (
                  <div className="text-[10px] font-mono text-zinc-500">
                    SHIP: ${region.shippingFee}
                  </div>
                )}
              </div>

              {/* Battery warning for EU */}
              {region.region === 'European Union' && (
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-orange-500/70">
                  <Battery className="w-3 h-3" />
                  <span>HazMat surcharge applies — consider lithium-free alternatives</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fulfillment Partners Summary */}
        <div className="mt-4 pt-4 border-t border-zinc-700/50">
          <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Active 3PL Partners</h4>
          <div className="flex gap-4 text-[10px] font-mono">
            <div className="text-zinc-400">
              <Zap className="w-3 h-3 inline mr-1 text-green-500" />
              Saltbox (US) — API: Ready
            </div>
            <div className="text-zinc-400">
              <Zap className="w-3 h-3 inline mr-1 text-green-500" />
              Red Stag Fulfillment — API: Ready
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalFulfillmentStatus;

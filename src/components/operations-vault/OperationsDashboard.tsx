import React from 'react';
import RealTimeMarginTracking from './RealTimeMarginTracking';
import InventoryStockAlerts from './InventoryStockAlerts';
import GlobalFulfillmentStatus from './GlobalFulfillmentStatus';

const OperationsDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-black min-h-screen text-zinc-100 font-mono">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-orange-600/30 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-orange-600 uppercase">
              Operations Control Vault
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              Supply Chain & Margin Intelligence // v2.0.0
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 uppercase">System Status</div>
            <div className="text-sm text-green-500 flex items-center gap-2 justify-end">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              STABLE
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Margin Tracking */}
          <div className="lg:col-span-2">
            <RealTimeMarginTracking />
          </div>

          {/* Right Column - Alerts & Fulfillment */}
          <div className="space-y-8">
            <InventoryStockAlerts />
            <GlobalFulfillmentStatus />
          </div>
        </div>

        {/* Metrics Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
            <div className="text-[10px] text-zinc-500 uppercase">Total Inventory Value</div>
            <div className="text-xl font-mono text-orange-500">$145,600</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
            <div className="text-[10px] text-zinc-500 uppercase">Potential Revenue</div>
            <div className="text-xl font-mono text-orange-500">$323,977</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
            <div className="text-[10px] text-zinc-500 uppercase">Gross Margin</div>
            <div className="text-xl font-mono text-green-500">55.06%</div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
            <div className="text-[10px] text-zinc-500 uppercase">Active SKUs</div>
            <div className="text-xl font-mono text-orange-500">18</div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-zinc-800 text-[10px] text-zinc-600 flex justify-between uppercase">
          <div>© 2026 Schrödinger's Archive — The Schrödinger Protocol</div>
          <div>Authorized Efficiency Agent Access Only</div>
        </footer>
      </div>
    </div>
  );
};

export default OperationsDashboard;

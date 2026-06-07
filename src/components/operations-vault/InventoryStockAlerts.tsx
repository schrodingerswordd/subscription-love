import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { StockAlert, StockStatus } from './types';

const InventoryStockAlerts: React.FC = () => {
  // Mock data - in production this would come from an API
  const alerts: StockAlert[] = [
    { id: '1', item: 'Apricorn Aegis USB Vault', sku: 'KV-ENG-001', stock: 300, status: 'healthy', category: 'KV-ENG' },
    { id: '2', item: 'Leatherman Wave+ Multitool', sku: 'KV-ENG-003', stock: 8, status: 'critical', category: 'KV-ENG' },
    { id: '3', item: 'Geiger Counter GMC-300E+', sku: 'KV-CBRN-002', stock: 150, status: 'healthy', category: 'KV-CBRN' },
    { id: '4', item: 'Medicinal Seed Kit', sku: 'KV-MED-002', stock: 45, status: 'low', category: 'KV-MED' },
    { id: '5', item: 'Sawyer Squeeze Water Filter', sku: 'KV-MED-003', stock: 300, status: 'healthy', category: 'KV-MED' },
    { id: '6', item: 'Fenix PD36R Flashlight', sku: 'KV-TAC-002', stock: 200, status: 'healthy', category: 'KV-TAC' },
    { id: '7', item: 'Heirloom Seed Vault (30v)', sku: 'KV-FOOD-001', stock: 500, status: 'healthy', category: 'KV-FOOD' },
    { id: '8', item: 'CBRN Mask MIRA CM-6M', sku: 'KV-CBRN-003', stock: 100, status: 'healthy', category: 'KV-CBRN' },
  ];

  const getStatusColor = (status: StockStatus): string => {
    switch (status) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'low':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      default:
        return 'text-green-500 bg-green-500/10 border-green-500/50';
    }
  };

  const getStatusIcon = (status: StockStatus): React.ReactNode => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="w-3 h-3" />;
      case 'low':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };

  const criticalCount = alerts.filter((a) => a.status === 'critical').length;
  const lowCount = alerts.filter((a) => a.status === 'low').length;
  const healthyCount = alerts.filter((a) => a.status === 'healthy').length;

  return (
    <Card className="bg-zinc-900 border-orange-600/50 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-orange-500 font-mono tracking-tighter uppercase flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory Stock Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Summary */}
        <div className="flex gap-4 mb-4 p-2 bg-zinc-800/30 rounded text-[10px] font-mono uppercase">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-zinc-400">Critical: {criticalCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-zinc-400">Low: {lowCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-zinc-400">Healthy: {healthyCount}</span>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md hover:border-orange-600/30 transition-colors"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold font-mono truncate">{alert.item}</span>
                <span className="text-[10px] uppercase text-zinc-500 font-mono">{alert.sku}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-400">STOCK: {alert.stock}</span>
                <Badge
                  className={`font-mono text-[10px] flex gap-1 items-center ${getStatusColor(alert.status)} variant-outline`}
                >
                  {getStatusIcon(alert.status)}
                  {alert.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStockAlerts;

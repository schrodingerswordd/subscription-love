import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Package } from "lucide-react";

const InventoryStockAlerts = () => {
  const alerts = [
    { id: 1, item: "Apricorn Aegis Padlock USB", stock: 12, status: "critical", category: "Hardware" },
    { id: 2, item: "Heirloom Seed Archive (100v)", stock: 45, status: "low", category: "Bio" },
    { id: 3, item: "Suunto MC-2 Compass", stock: 120, status: "healthy", category: "Analog" },
    { id: 4, item: "Leatherman Wave+", stock: 8, status: "critical", category: "Tools" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/50';
      case 'low': return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
      default: return 'text-green-500 bg-green-500/10 border-green-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-zinc-900 border-orange-600/50 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-orange-500 font-mono tracking-tighter uppercase flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory Stock Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
              <div className="flex flex-col">
                <span className="text-sm font-bold font-mono">{alert.item}</span>
                <span className="text-[10px] uppercase text-zinc-500 font-mono">{alert.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs">STOCK: {alert.stock}</span>
                <Badge className={`font-mono text-[10px] flex gap-1 items-center ${getStatusColor(alert.status)} variant-outline`}>
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

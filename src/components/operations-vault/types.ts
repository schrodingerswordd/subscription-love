/**
 * Operations Vault Type Definitions
 * Schrödinger's Archive - Internal Operations Dashboard
 */

// Category margin data from INVENTORY_ANALYSIS_REPORT.md
export interface CategoryMargin {
  name: string;
  margin: number;
  itemCount: number;
  totalCost: number;
  totalMSRP: number;
}

// Bundle profitability data
export interface BundleMargin {
  name: string;
  price: number;
  cogs: number;
  fulfillmentOverhead: number;
  netProfit: number;
  margin: number;
}

// Regional shipping impact
export interface RegionalShipping {
  region: string;
  shippingFee: number;
  effectiveMargin: number;
  status: 'Active' | 'Optimization Pending' | 'Standby';
  latency: string;
  hub: string;
}

// Inventory item for stock monitoring
export interface InventoryItem {
  sku: string;
  itemName: string;
  category: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  quantityOnHand: number;
  unitCost: number;
  msrp: number;
  warehouseHub: string;
  lithiumBattery: boolean;
}

// Stock alert threshold
export type StockStatus = 'critical' | 'low' | 'healthy';

export interface StockAlert {
  id: string;
  item: string;
  sku: string;
  stock: number;
  status: StockStatus;
  category: string;
}

// 3PL Fulfillment partner
export interface FulfillmentPartner {
  partnerName: string;
  primaryHub: string;
  contactEmail: string;
  globalShipping: boolean;
  batteryShipping: boolean;
  apiIntegration: 'Ready' | 'Manual' | 'TBD';
  leadTime: number;
}

// Pricing tiers from Business Plan
export const PRICING_TIERS = {
  archiveAccess: 19.99, // $/mo
  foundationCrate: 349.00,
  legacyVault: 1750.00,
} as const;

// Category margins from inventory analysis
export const CATEGORY_MARGINS: CategoryMargin[] = [
  { name: 'KV-CBRN', margin: 56.54, itemCount: 1750, totalCost: 22700, totalMSRP: 52235 },
  { name: 'KV-ENG', margin: 54.50, itemCount: 1150, totalCost: 53550, totalMSRP: 117681.50 },
  { name: 'KV-FOOD', margin: 57.50, itemCount: 650, totalCost: 17000, totalMSRP: 39998.50 },
  { name: 'KV-MED', margin: 51.32, itemCount: 650, totalCost: 20850, totalMSRP: 42835 },
  { name: 'KV-TAC', margin: 55.78, itemCount: 1750, totalCost: 31500, totalMSRP: 71227 },
];

// Bundle profitability (updated to Business Plan pricing)
export const BUNDLE_MARGINS: BundleMargin[] = [
  {
    name: 'Foundation Crate',
    price: PRICING_TIERS.foundationCrate,
    cogs: 235.00,
    fulfillmentOverhead: 5.50,
    netProfit: 358.50,
    margin: 59.85,
  },
  {
    name: 'Sovereign Bundle',
    price: 399.00,
    cogs: 171.70,
    fulfillmentOverhead: 7.00,
    netProfit: 220.30,
    margin: 55.21,
  },
  {
    name: 'Legacy Vault',
    price: PRICING_TIERS.legacyVault,
    cogs: 850.00,
    fulfillmentOverhead: 15.00,
    netProfit: 885.00,
    margin: 50.57,
  },
];

// Regional shipping analysis
export const REGIONAL_SHIPPING: RegionalShipping[] = [
  {
    region: 'US Domestic',
    shippingFee: 25.00,
    effectiveMargin: 56.59,
    status: 'Active',
    latency: '2-4 days',
    hub: 'Saltbox (US)',
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
    region: 'UK / EU',
    shippingFee: 110.00,
    effectiveMargin: 42.40,
    status: 'Optimization Pending',
    latency: '7-12 days',
    hub: 'DCL (NL)',
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

// Raw inventory data for stock monitoring
export const INVENTORY_DATA = [
  { sku: 'KV-CBRN-001', itemName: 'Potassium Iodide (KI) Tablets', category: 'KV-CBRN', status: 'In Stock' as const, quantityOnHand: 500, unitCost: 5.50, msrp: 14.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-CBRN-002', itemName: 'Geiger Counter (GQ GMC-300E+)', category: 'KV-CBRN', status: 'In Stock' as const, quantityOnHand: 150, unitCost: 45.00, msrp: 99.00, warehouseHub: 'Atlanta, USA', lithiumBattery: true },
  { sku: 'KV-CBRN-003', itemName: 'CBRN-rated Mask (MIRA Safety CM-6M)', category: 'KV-CBRN', status: 'In Stock' as const, quantityOnHand: 100, unitCost: 120.00, msrp: 249.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-CBRN-004', itemName: 'N95/P100 Masks (3M 8210/8233)', category: 'KV-CBRN', status: 'In Stock' as const, quantityOnHand: 1000, unitCost: 1.20, msrp: 4.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-ENG-001', itemName: 'Hardened USB Vault (Apricorn Aegis)', category: 'KV-ENG', status: 'In Stock' as const, quantityOnHand: 300, unitCost: 85.00, msrp: 199.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-ENG-002', itemName: 'Solar Charging Kit (BigBlue 28W)', category: 'KV-ENG', status: 'In Stock' as const, quantityOnHand: 200, unitCost: 35.00, msrp: 79.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-ENG-003', itemName: 'Heavy-Duty Multitool (Leatherman Wave+)', category: 'KV-ENG', status: 'In Stock' as const, quantityOnHand: 250, unitCost: 65.00, msrp: 119.95, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-ENG-004', itemName: 'EMP Faraday Bag (Mission Darkness)', category: 'KV-ENG', status: 'In Stock' as const, quantityOnHand: 400, unitCost: 12.00, msrp: 29.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-TAC-001', itemName: 'Professional Sighting Compass (Suunto MC-2)', category: 'KV-TAC', status: 'In Stock' as const, quantityOnHand: 150, unitCost: 40.00, msrp: 89.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-TAC-002', itemName: 'High-Output Tactical Flashlight (Fenix PD36R)', category: 'KV-TAC', status: 'In Stock' as const, quantityOnHand: 200, unitCost: 55.00, msrp: 99.95, warehouseHub: 'Atlanta, USA', lithiumBattery: true },
  { sku: 'KV-TAC-003', itemName: 'Laminated Topo Map Templates', category: 'KV-TAC', status: 'In Stock' as const, quantityOnHand: 1000, unitCost: 2.50, msrp: 9.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-TAC-004', itemName: 'Thermal Bivvy (SOL Escape Bivvy)', category: 'KV-TAC', status: 'In Stock' as const, quantityOnHand: 300, unitCost: 25.00, msrp: 59.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-MED-001', itemName: 'IFAK (Individual First Aid Kit)', category: 'KV-MED', status: 'In Stock' as const, quantityOnHand: 150, unitCost: 75.00, msrp: 149.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-MED-002', itemName: 'Medicinal Heirloom Seed Kit', category: 'KV-MED', status: 'In Stock' as const, quantityOnHand: 200, unitCost: 15.00, msrp: 35.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-MED-003', itemName: 'Water Purification System (Sawyer Squeeze)', category: 'KV-MED', status: 'In Stock' as const, quantityOnHand: 300, unitCost: 22.00, msrp: 44.95, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-FOOD-001', itemName: 'Large Survival Seed Vault (30+ Varieties)', category: 'KV-FOOD', status: 'In Stock' as const, quantityOnHand: 500, unitCost: 25.00, msrp: 59.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-FOOD-002', itemName: 'Solo Stove Bushcraft Pot', category: 'KV-FOOD', status: 'In Stock' as const, quantityOnHand: 150, unitCost: 30.00, msrp: 69.99, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
  { sku: 'KV-GEN-001', itemName: 'Pelican-style Hard Case', category: 'KV-TAC', status: 'In Stock' as const, quantityOnHand: 100, unitCost: 45.00, msrp: 99.00, warehouseHub: 'Atlanta, USA', lithiumBattery: false },
];

// Stock alert thresholds
const STOCK_CRITICAL_THRESHOLD = 50;
const STOCK_LOW_THRESHOLD = 200;

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= STOCK_CRITICAL_THRESHOLD) return 'critical';
  if (quantity <= STOCK_LOW_THRESHOLD) return 'low';
  return 'healthy';
}

export function generateStockAlerts(): StockAlert[] {
  return INVENTORY_DATA.map((item, index) => ({
    id: `alert-${index + 1}`,
    item: item.itemName,
    sku: item.sku,
    stock: item.quantityOnHand,
    status: getStockStatus(item.quantityOnHand),
    category: item.category,
  }));
}

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ActivitySquare, Package, Users, Truck, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface DashboardMetrics {
  activeWarehouses: number;
  totalProducts: number;
  activeStaff: number;
  pendingOrders: number;
  lowStockItems: number;
  totalInventoryValue: number;
  completedOrders: number;
  expiringItems: number;
}

export function DashboardStats() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeWarehouses: 0,
    totalProducts: 0,
    activeStaff: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
    completedOrders: 0,
    expiringItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [
          { count: warehousesCount },
          { count: productsCount },
          { count: staffCount },
          { count: pendingOrdersCount },
          { data: lowStockData },
          { data: inventoryValue },
          { count: completedOrdersCount },
          { data: expiringItemsData }
        ] = await Promise.all([
          // Active warehouses
          supabase
            .from('warehouses')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          
          // Total products
          supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),
          
          // Active staff
          supabase
            .from('staff')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          
          // Pending orders
          supabase
            .from('purchase_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          
          // Low stock items
          supabase
            .from('inventory')
            .select(`
              product_id,
              quantity,
              products!inner(
                minimum_stock
              )
            `)
            .lt('quantity', 'products.minimum_stock'),
          
          // Total inventory value
          supabase
            .from('inventory')
            .select(`
              quantity,
              products!inner(
                unit_price
              )
            `),
          
          // Completed orders
          supabase
            .from('purchase_orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed'),
          
          // Expiring items (within next 30 days)
          supabase
            .from('inventory')
            .select('*')
            .not('expiry_date', 'is', null)
            .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        // Calculate total inventory value
        const totalValue = (inventoryValue || []).reduce((sum, item) => {
          return sum + (item.quantity * item.products.unit_price);
        }, 0);

        setMetrics({
          activeWarehouses: warehousesCount || 0,
          totalProducts: productsCount || 0,
          activeStaff: staffCount || 0,
          pendingOrders: pendingOrdersCount || 0,
          lowStockItems: lowStockData?.length || 0,
          totalInventoryValue: totalValue,
          completedOrders: completedOrdersCount || 0,
          expiringItems: expiringItemsData?.length || 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Warehouses',
      value: metrics.activeWarehouses,
      icon: ActivitySquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Staff',
      value: metrics.activeStaff,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders,
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockItems,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Inventory Value',
      value: `$${metrics.totalInventoryValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      icon: CheckCircle2,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Expiring Soon',
      value: metrics.expiringItems,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">{stat.title}</h3>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              stat.value
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
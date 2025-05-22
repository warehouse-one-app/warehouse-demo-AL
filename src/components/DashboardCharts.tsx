import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StockMovement {
  date: string;
  total_quantity: number;
}

interface InventoryByZone {
  zone_name: string;
  total_items: number;
}

export function DashboardCharts() {
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [inventoryByZone, setInventoryByZone] = useState<InventoryByZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        // Fetch stock movements for the last 7 days
        const { data: movementsData, error: movementsError } = await supabase
          .from('stock_movements')
          .select('created_at, quantity')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at');

        if (movementsError) throw movementsError;

        // Group movements by date and calculate total quantity
        const groupedMovements = movementsData?.reduce((acc: Record<string, number>, curr) => {
          const date = new Date(curr.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + curr.quantity;
          return acc;
        }, {});

        const movements = Object.entries(groupedMovements || {}).map(([date, total_quantity]) => ({
          date,
          total_quantity
        }));

        // Fetch inventory by zone
        const { data: zoneData, error: zoneError } = await supabase
          .from('zones')
          .select(`
            name,
            storage_locations!inner (
              inventory!inner (
                quantity
              )
            )
          `);

        if (zoneError) throw zoneError;

        const zoneInventory = zoneData?.map(zone => ({
          zone_name: zone.name,
          total_items: zone.storage_locations.reduce((sum: number, location: any) => 
            sum + location.inventory.reduce((total: number, inv: any) => total + inv.quantity, 0)
          , 0)
        }));

        setStockMovements(movements);
        setInventoryByZone(zoneInventory || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  const lineChartData = {
    labels: stockMovements.map(m => m.date),
    datasets: [
      {
        label: 'Stock Movements',
        data: stockMovements.map(m => m.total_quantity),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Movements (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartData = {
    labels: inventoryByZone.map(z => z.zone_name),
    datasets: [
      {
        data: inventoryByZone.map(z => z.total_items),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Inventory Distribution by Zone',
      },
    },
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Line data={lineChartData} options={lineChartOptions} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Pie data={pieChartData} options={pieChartOptions} />
      </div>
    </div>
  );
}
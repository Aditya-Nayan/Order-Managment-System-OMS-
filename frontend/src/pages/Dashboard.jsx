import { useState, useEffect } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard" />;

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button onClick={fetchDashboard} className="btn-primary text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Products', value: data?.total_products || 0 },
    { label: 'Total Customers', value: data?.total_customers || 0 },
    { label: 'Total Orders', value: data?.total_orders || 0 },
    {
      label: 'Total Revenue',
      value: `$${(data?.total_revenue || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
  ];

  const lowStockProducts = data?.low_stock_products || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of Order Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alerts */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-red-400">Low Stock Alerts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Products with stock less than 10 units</p>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">All products are well-stocked.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                  <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">SKU</th>
                  <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                  <th className="pb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="py-3 pr-4 font-medium text-gray-900">{product.name}</td>
                    <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{product.sku}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700">
                      ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

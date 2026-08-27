import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantApi, orderApi } from '../../api';
import type { Restaurant, DashboardStats } from '../../types';
import Card from '../../components/ui/Card';

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const restaurants = await restaurantApi.getAll();
      if (restaurants.data.length > 0) {
        const rest = restaurants.data[0];
        setRestaurant(rest);
        localStorage.setItem('tableqr_restaurant_id', rest.id);
        const statsRes = await orderApi.getStats(rest.id);
        setStats(statsRes.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" /></div>;

  if (!restaurant) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-charcoal mb-4">No Restaurant Found</h2>
      <Link to="/owner/setup" className="bg-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-light transition-all">Create Restaurant</Link>
    </div>
  );

  const statCards = [
    { label: "Today's Sales", value: `₹${(stats?.todaySales || 0).toLocaleString()}`, icon: '💰', color: 'bg-green/10 text-green' },
    { label: "Today's Orders", value: stats?.todayOrders || 0, icon: '📦', color: 'bg-orange/10 text-orange' },
    { label: 'Active Tables', value: `${stats?.activeTables || 0} / ${stats?.totalTables || 0}`, icon: '🪑', color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: '⏳', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Preparing', value: stats?.preparingOrders || 0, icon: '👨‍🍳', color: 'bg-orange/10 text-orange' },
    { label: 'Completed', value: stats?.completedOrders || 0, icon: '✅', color: 'bg-green/10 text-green' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal">{restaurant.name}</h2><p className="text-charcoal-light">📍 {restaurant.city}, {restaurant.state}</p></div>
        <div className="flex gap-3">
          <Link to="/owner/orders" className="bg-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-light transition-all">📋 View Orders</Link>
          <Link to="/owner/menu" className="bg-green text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-light transition-all">🍽️ Manage Menu</Link>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-charcoal-light mb-1">{stat.label}</p><p className="text-2xl font-bold text-charcoal">{stat.value}</p></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/owner/menu/import"><Card hover className="p-6"><div className="text-3xl mb-3">📷</div><h3 className="font-bold text-charcoal mb-1">Import Menu</h3><p className="text-sm text-charcoal-light">Upload a photo to create your digital menu</p></Card></Link>
        <Link to="/owner/tables"><Card hover className="p-6"><div className="text-3xl mb-3">🪑</div><h3 className="font-bold text-charcoal mb-1">Manage Tables</h3><p className="text-sm text-charcoal-light">Add tables and generate QR codes</p></Card></Link>
        <Link to="/owner/orders"><Card hover className="p-6"><div className="text-3xl mb-3">📋</div><h3 className="font-bold text-charcoal mb-1">Live Orders</h3><p className="text-sm text-charcoal-light">View and manage incoming orders</p></Card></Link>
      </div>
    </div>
  );
}

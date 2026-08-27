import { useState, useEffect, useRef } from 'react';
import { orderApi, restaurantApi } from '../../api';
import type { Restaurant, Order } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const STATUS_LABELS: Record<string, string> = { PENDING: 'Pending', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY: 'Ready', SERVED: 'Served', CANCELLED: 'Cancelled' };
const STATUS_COLORS: Record<string, 'orange' | 'blue' | 'green' | 'red'> = { PENDING: 'orange', ACCEPTED: 'blue', PREPARING: 'orange', READY: 'green', SERVED: 'green', CANCELLED: 'red' };

export default function OrdersPage() {
  const [, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('active');
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => { loadData(); return () => { if (wsRef.current) wsRef.current.close(); }; }, []);

  const loadData = async () => {
    try {
      const restaurants = await restaurantApi.getAll();
      if (restaurants.data.length > 0) {
        const rest = restaurants.data[0]; setRestaurant(rest);
        setOrders((await orderApi.getRestaurantOrders(rest.id)).data);
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws/restaurant/${rest.id}`);
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NEW_ORDER') setOrders(prev => [msg.data, ...prev]);
          else if (msg.type === 'ORDER_STATUS_CHANGED') setOrders(prev => prev.map(o => o.id === msg.orderId ? { ...o, status: msg.status } : o));
        };
        wsRef.current = ws;
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try { const res = await orderApi.updateStatus(orderId, newStatus); setOrders(orders.map(o => o.id === orderId ? res.data : o)); } catch (e) { console.error(e); }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'PENDING': return { action: 'ACCEPTED', label: 'Accept', variant: 'primary' as const };
      case 'ACCEPTED': return { action: 'PREPARING', label: 'Mark Preparing', variant: 'secondary' as const };
      case 'PREPARING': return { action: 'READY', label: 'Mark Ready', variant: 'primary' as const };
      case 'READY': return { action: 'SERVED', label: 'Mark Served', variant: 'primary' as const };
      default: return null;
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
    if (filter === 'completed') return o.status === 'SERVED';
    if (filter === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal">Live Orders</h2><p className="text-charcoal-light">{filteredOrders.length} orders</p></div>
        <div className="flex gap-2">
          {['active', 'completed', 'cancelled', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-green text-white' : 'bg-white text-charcoal hover:bg-cream-dark'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center"><div className="text-5xl mb-4">📋</div><h3 className="text-xl font-bold text-charcoal mb-2">No Orders</h3><p className="text-charcoal-light">Orders will appear here when customers place them.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const nextAction = getNextAction(order.status);
            return (
              <Card key={order.id} className={`overflow-hidden ${order.status === 'PENDING' ? 'ring-2 ring-orange/30 animate-pulse-green' : ''}`}>
                <div className="px-5 py-3 border-b border-cream-dark/50 flex items-center justify-between">
                  <div><span className="font-bold text-charcoal">#{order.orderNumber}</span><span className="text-charcoal-light ml-2">Table {order.tableNumber}</span></div>
                  <Badge variant={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                </div>
                <div className="px-5 py-3">
                  <div className="space-y-1 mb-3">
                    {order.items?.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-charcoal">{item.itemName} × {item.quantity}</span><span className="text-charcoal-light">₹{item.subtotal}</span></div>))}
                  </div>
                  <div className="border-t border-cream-dark/50 pt-3 flex items-center justify-between">
                    <span className="font-bold text-charcoal">Total: ₹{order.total}</span>
                    <span className="text-xs text-charcoal-light">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                {nextAction && (
                  <div className="px-5 py-3 border-t border-cream-dark/50 bg-cream/30 flex gap-2">
                    <Button size="sm" variant={nextAction.variant} onClick={() => handleUpdateStatus(order.id, nextAction.action)} className="flex-1">{nextAction.label}</Button>
                    {order.status === 'PENDING' && <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>Reject</Button>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

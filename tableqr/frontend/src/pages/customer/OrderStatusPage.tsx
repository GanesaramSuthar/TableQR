import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { orderApi } from '../../api';
import type { Order } from '../../types';

const STATUSES = [
  { key: 'PENDING', label: 'Order Received', icon: '📝' },
  { key: 'ACCEPTED', label: 'Accepted', icon: '✅' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'READY', label: 'Ready', icon: '🔔' },
  { key: 'SERVED', label: 'Served', icon: '🎉' },
];

export default function OrderStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (orderId) { loadOrder(); const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; const ws = new WebSocket(`${protocol}//${window.location.host}/ws/order/${orderId}`); ws.onmessage = (e) => { const msg = JSON.parse(e.data); if (msg.type === 'STATUS_UPDATE') setOrder(prev => prev ? { ...prev, status: msg.status } : prev); }; wsRef.current = ws; }
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, [orderId]);

  const loadOrder = async () => { try { setOrder((await orderApi.getStatus(orderId!)).data); } catch (e) { setError('Order not found'); } finally { setLoading(false); } };

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-green border-t-transparent rounded-full" /></div>;
  if (error || !order) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="text-center"><div className="text-5xl mb-4">😕</div><h2 className="text-xl font-bold text-charcoal mb-2">Order Not Found</h2></div></div>;

  const currentIdx = STATUSES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-green to-green-dark text-white">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          {isCancelled ? <div className="text-4xl mb-2">❌</div> : currentIdx >= STATUSES.length - 1 ? <div className="text-4xl mb-2">🎉</div> : <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />}
          <h1 className="text-2xl font-bold">{isCancelled ? 'Order Cancelled' : currentIdx >= STATUSES.length - 1 ? 'Order Served!' : 'Order in Progress'}</h1>
          <p className="text-white/70 mt-1">#{order.orderNumber}</p>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="space-y-0">
            {STATUSES.map((status, i) => {
              const isCompleted = i <= currentIdx && !isCancelled;
              const isCurrent = i === currentIdx && !isCancelled;
              return (
                <div key={status.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isCompleted ? 'bg-green text-white' : 'bg-cream-dark text-charcoal-light'} ${isCurrent ? 'ring-4 ring-green/20' : ''}`}>{isCompleted ? '✓' : status.icon}</div>
                    {i < STATUSES.length - 1 && <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green' : 'bg-cream-dark'}`} />}
                  </div>
                  <div className="pt-2"><p className={`font-medium ${isCompleted ? 'text-charcoal' : 'text-charcoal-light'}`}>{status.label}</p>{isCurrent && <p className="text-xs text-green font-medium">Current status</p>}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-charcoal mb-3">Order Details</h3>
          <div className="space-y-2 mb-4">{order.items?.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-charcoal">{item.itemName} × {item.quantity}</span><span className="text-charcoal-light">₹{item.subtotal}</span></div>))}</div>
          <div className="border-t border-cream-dark pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-charcoal-light">Subtotal</span><span>₹{order.subtotal}</span></div>
            <div className="flex justify-between text-sm"><span className="text-charcoal-light">GST (5%)</span><span>₹{order.tax}</span></div>
            <div className="flex justify-between font-bold text-lg pt-1"><span>Total</span><span className="text-green">₹{order.total}</span></div>
          </div>
        </div>
        <div className="text-center text-charcoal-light"><p>Table {order.tableNumber}</p></div>
      </div>
    </div>
  );
}

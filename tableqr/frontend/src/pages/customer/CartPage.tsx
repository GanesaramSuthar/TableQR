import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api';
import Button from '../../components/ui/Button';
import { useState } from 'react';

export default function CartPage() {
  const { tableToken } = useParams<{ tableToken: string }>();
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_counter');

  const tax = Math.round(total * 0.05);
  const grandTotal = total + tax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return; setLoading(true); setError('');
    try {
      const res = await orderApi.place({ qrToken: tableToken!, items: items.map(i => ({ menuItemId: i.menuItem.id, quantity: i.quantity })), paymentMethod });
      clearCart(); navigate(`/order-status/${res.data.id}`);
    } catch (err: any) { setError(err.response?.data?.detail || "We couldn't place your order. Please try again."); }
    finally { setLoading(false); }
  };

  if (items.length === 0) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="text-center max-w-sm"><div className="text-5xl mb-4">🛒</div><h2 className="text-xl font-bold text-charcoal mb-2">Your Cart is Empty</h2><Link to={`/order/${tableToken}`} className="bg-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-light transition-all inline-block mt-4">Browse Menu</Link></div></div>;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-gradient-to-r from-green to-green-dark text-white"><div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3"><Link to={`/order/${tableToken}`} className="text-white/80 hover:text-white">← Back</Link><h1 className="text-xl font-bold">Your Order</h1></div></div>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {error && <div className="bg-red/10 text-red px-4 py-3 rounded-xl text-sm">{error}</div>}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {items.map(item => (
            <div key={item.menuItem.id} className="px-5 py-4 border-b border-cream-dark/30 last:border-0">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold text-charcoal">{item.menuItem.name}</h3><p className="text-sm text-charcoal-light">₹{item.menuItem.price} each</p></div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-cream rounded-xl">
                    <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream-dark rounded-l-xl">−</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream-dark rounded-r-xl">+</button>
                  </div>
                  <span className="font-bold text-green w-16 text-right">₹{item.menuItem.price * item.quantity}</span>
                </div>
              </div>
              <button onClick={() => removeItem(item.menuItem.id)} className="text-xs text-red/60 hover:text-red mt-1">Remove</button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="font-bold text-charcoal mb-3">Payment Method</h3>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 ${paymentMethod === 'pay_at_counter' ? 'border-green bg-green/5' : 'border-cream-dark'}`}><input type="radio" name="payment" value="pay_at_counter" checked={paymentMethod === 'pay_at_counter'} onChange={e => setPaymentMethod(e.target.value)} className="accent-green" /><div><p className="font-medium text-charcoal">Pay at Counter</p><p className="text-xs text-charcoal-light">Pay when your order is served</p></div></label>
            <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 ${paymentMethod === 'online_test' ? 'border-green bg-green/5' : 'border-cream-dark'}`}><input type="radio" name="payment" value="online_test" checked={paymentMethod === 'online_test'} onChange={e => setPaymentMethod(e.target.value)} className="accent-green" /><div><p className="font-medium text-charcoal">Online Payment <span className="text-xs text-orange font-normal">TEST</span></p><p className="text-xs text-charcoal-light">Test mode — no real payment</p></div></label>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm"><span className="text-charcoal-light">Subtotal</span><span>₹{total}</span></div>
            <div className="flex justify-between text-sm"><span className="text-charcoal-light">GST (5%)</span><span>₹{tax}</span></div>
            <div className="border-t border-cream-dark pt-2 flex justify-between"><span className="font-bold text-charcoal text-lg">Total</span><span className="font-bold text-green text-lg">₹{grandTotal}</span></div>
          </div>
          <Button onClick={handlePlaceOrder} isLoading={loading} className="w-full" size="lg">Place Order · ₹{grandTotal}</Button>
        </div>
      </div>
    </div>
  );
}

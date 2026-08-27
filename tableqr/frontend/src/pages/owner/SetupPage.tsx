import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { restaurantApi } from '../../api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', city: 'Jaipur', state: 'Rajasthan' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await restaurantApi.create(form);
      localStorage.setItem('tableqr_restaurant_id', res.data.id);
      navigate('/owner/menu/import');
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to create restaurant'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><span className="text-3xl">🍽️</span><span className="text-2xl font-bold text-green">TableQR</span></Link>
          <h1 className="text-2xl font-bold text-charcoal">Create Your Restaurant</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red/10 text-red px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Restaurant Name" placeholder="e.g. Rajasthan Zaika Dhaba" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <div><label className="block text-sm font-medium text-charcoal mb-1.5">Description</label><textarea className="w-full px-4 py-3 rounded-xl border-2 border-cream-dark bg-white focus:border-green outline-none resize-none" rows={3} placeholder="Tell customers about your restaurant..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <Input label="Phone" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <Input label="Address" placeholder="123 MI Road" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" placeholder="Jaipur" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              <Input label="State" placeholder="Rajasthan" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
            </div>
            <Button type="submit" isLoading={loading} className="w-full" size="lg">Create Restaurant</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

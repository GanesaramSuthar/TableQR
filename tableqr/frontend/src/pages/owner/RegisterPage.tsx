import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await register(form); navigate('/owner/setup'); }
    catch (err: any) { setError(err.response?.data?.detail || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><span className="text-3xl">🍽️</span><span className="text-2xl font-bold text-green">TableQR</span></Link>
          <h1 className="text-2xl font-bold text-charcoal">Create Your Account</h1>
          <p className="text-charcoal-light mt-1">Start managing your restaurant digitally</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red/10 text-red px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Phone" type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            <Button type="submit" isLoading={loading} className="w-full" size="lg">Create Account</Button>
          </form>
          <p className="text-center text-sm text-charcoal-light mt-6">Already have an account? <Link to="/owner/login" className="text-green font-semibold hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

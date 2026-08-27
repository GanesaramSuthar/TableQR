import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); navigate('/owner/dashboard'); }
    catch (err: any) { setError(err.response?.data?.detail || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6"><span className="text-3xl">🍽️</span><span className="text-2xl font-bold text-green">TableQR</span></Link>
          <h1 className="text-2xl font-bold text-charcoal">Welcome Back</h1>
          <p className="text-charcoal-light mt-1">Sign in to your restaurant dashboard</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red/10 text-red px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input label="Password" type="password" placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <Button type="submit" isLoading={loading} className="w-full" size="lg">Sign In</Button>
          </form>
          <div className="mt-6 p-4 bg-cream rounded-xl">
            <p className="text-xs text-charcoal-light font-medium mb-1">Demo Account:</p>
            <p className="text-xs text-charcoal">demo@tableqr.com / demo123</p>
          </div>
          <p className="text-center text-sm text-charcoal-light mt-6">Don't have an account? <Link to="/owner/register" className="text-green font-semibold hover:underline">Register</Link></p>
        </div>
      </div>
    </div>
  );
}

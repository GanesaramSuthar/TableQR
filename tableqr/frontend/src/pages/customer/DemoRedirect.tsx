import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableApi, restaurantApi } from '../../api';

export default function DemoRedirect() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const restaurants = await restaurantApi.getBySlug('rajasthan-zaika-dhaba');
        const tables = await tableApi.getAll(restaurants.data.id);
        if (tables.data.length > 0) navigate(`/order/${tables.data[0].qrToken}`);
        else setError('No tables found');
      } catch (err) { setError('Demo restaurant not found. Make sure backend is running.'); }
    })();
  }, []);

  if (error) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="text-center max-w-sm"><div className="text-5xl mb-4">⚠️</div><h2 className="text-xl font-bold text-charcoal mb-2">Demo Not Available</h2><p className="text-charcoal-light">{error}</p></div></div>;
  return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-green border-t-transparent rounded-full mx-auto mb-4" /></div>;
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tableApi, menuApi } from '../../api';
import type { Restaurant, Table, MenuSection, MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import Badge from '../../components/ui/Badge';

function getFoodEmoji(name: string): string {
  const l = name.toLowerCase();
  if (l.includes('chicken') || l.includes('tikka') || l.includes('wings')) return '🍗';
  if (l.includes('paneer') || l.includes('palak')) return '🧀';
  if (l.includes('biryani') || l.includes('rice')) return '🍚';
  if (l.includes('naan') || l.includes('roti') || l.includes('bread') || l.includes('bhature')) return '🫓';
  if (l.includes('dal') || l.includes('chole')) return '🥘';
  if (l.includes('samosa')) return '🥟';
  if (l.includes('chai') || l.includes('tea')) return '🍵';
  if (l.includes('lassi') || l.includes('chaas') || l.includes('lime')) return '🥤';
  if (l.includes('gulab') || l.includes('rasmalai') || l.includes('kulfi')) return '🍮';
  if (l.includes('mutton') || l.includes('rogan')) return '🍖';
  if (l.includes('butter')) return '🍛';
  if (l.includes('onion') || l.includes('bhaji')) return '🧅';
  return '🍽️';
}

export default function CustomerMenuPage() {
  const { tableToken } = useParams<{ tableToken: string }>();
  const { addItem, itemCount } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [menu, setMenu] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  useEffect(() => { if (tableToken) loadData(); }, [tableToken]);

  const loadData = async () => {
    try {
      const tableRes = await tableApi.getByQr(tableToken!);
      setTable(tableRes.data.table); setRestaurant(tableRes.data.restaurant);
      const menuRes = await menuApi.getPublicMenu(tableRes.data.restaurant.id);
      setMenu(menuRes.data.menu);
    } catch (err: any) { setError(err.response?.data?.detail || 'Invalid QR code'); }
    finally { setLoading(false); }
  };

  const handleAddItem = (item: MenuItem) => {
    addItem(item);
    setAddedItems(prev => new Set(prev).add(item.id));
    setTimeout(() => { setAddedItems(prev => { const n = new Set(prev); n.delete(item.id); return n; }); }, 1000);
  };

  const filteredMenu = menu.map(s => ({ ...s, items: s.items.filter(i => (activeCategory === 'all' || s.category.name === activeCategory) && (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()))) })).filter(s => s.items.length > 0);

  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-green border-t-transparent rounded-full mx-auto mb-4" /></div>;
  if (error || !restaurant || !table) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="text-center max-w-sm"><div className="text-5xl mb-4">😕</div><h2 className="text-xl font-bold text-charcoal mb-2">Invalid QR Code</h2><p className="text-charcoal-light">This table QR code is invalid or inactive.</p></div></div>;
  if (menu.length === 0) return <div className="min-h-screen bg-cream flex items-center justify-center p-4"><div className="text-center max-w-sm"><div className="text-5xl mb-4">🍽️</div><h2 className="text-xl font-bold text-charcoal mb-2">{restaurant.name}</h2><p className="text-charcoal-light">The restaurant hasn't published its menu yet.</p></div></div>;

  const allCategories = menu.map(s => s.category.name);

  return (
    <div className="min-h-screen bg-cream pb-24">
      <div className="bg-gradient-to-r from-green to-green-dark text-white sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4"><h1 className="text-xl font-bold">{restaurant.name}</h1><p className="text-white/70 text-sm">📍 {restaurant.city}, {restaurant.state} · Table {table.tableNumber}</p></div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="relative"><input type="text" placeholder="Search dishes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-cream-dark bg-white focus:border-green outline-none" /><span className="absolute left-3 top-3.5 text-charcoal-light">🔍</span></div>
      </div>
      <div className="max-w-lg mx-auto px-4 mb-4 overflow-x-auto"><div className="flex gap-2 pb-2">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === 'all' ? 'bg-green text-white' : 'bg-white text-charcoal border border-cream-dark'}`}>All</button>
        {allCategories.map(c => <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === c ? 'bg-green text-white' : 'bg-white text-charcoal border border-cream-dark'}`}>{c}</button>)}
      </div></div>
      <div className="max-w-lg mx-auto px-4 space-y-6">
        {filteredMenu.map(section => (
          <div key={section.category.name}>
            <h2 className="text-lg font-bold text-charcoal mb-3">{section.category.name}</h2>
            <div className="space-y-3">
              {section.items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-cream-dark/50 overflow-hidden">
                  <div className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-cream rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{getFoodEmoji(item.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-charcoal">{item.name}</h3>{item.isPopular && <Badge variant="orange" className="mt-1">Popular</Badge>}</div><span className="font-bold text-green whitespace-nowrap">₹{item.price}</span></div>
                      <p className="text-sm text-charcoal-light mt-1 line-clamp-2">{item.description}</p>
                      {!item.isAvailable ? <div className="mt-2"><Badge variant="red">SOLD OUT</Badge></div> : (
                        <button onClick={() => handleAddItem(item)} className={`mt-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${addedItems.has(item.id) ? 'bg-green text-white' : 'bg-green/10 text-green hover:bg-green hover:text-white'}`}>{addedItems.has(item.id) ? '✓ Added' : 'ADD +'}</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-dark shadow-lg z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div><p className="font-bold text-charcoal">{itemCount} item{itemCount > 1 ? 's' : ''}</p><p className="text-sm text-charcoal-light">View your order</p></div>
            <Link to={`/order/${tableToken}/cart`} className="bg-green text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-light transition-all shadow-md">View Cart →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

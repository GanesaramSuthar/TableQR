import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { menuApi, restaurantApi } from '../../api';
import type { Restaurant, Category, MenuItem } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', categoryId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const restaurants = await restaurantApi.getAll();
      if (restaurants.data.length > 0) {
        const rest = restaurants.data[0]; setRestaurant(rest);
        const [cats, itemsRes] = await Promise.all([menuApi.getCategories(rest.id), menuApi.getItems(rest.id)]);
        setCategories(cats.data); setItems(itemsRes.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddCategory = async () => {
    if (!restaurant || !newCategory.trim()) return;
    try { const res = await menuApi.createCategory(restaurant.id, { name: newCategory, displayOrder: categories.length }); setCategories([...categories, res.data]); setNewCategory(''); setShowAddCategory(false); } catch (e) { console.error(e); }
  };

  const handleAddItem = async () => {
    if (!restaurant || !newItem.name || !newItem.price || !newItem.categoryId) return;
    try { const res = await menuApi.createItem(restaurant.id, { name: newItem.name, description: newItem.description, price: parseFloat(newItem.price), categoryId: newItem.categoryId }); setItems([...items, res.data]); setNewItem({ name: '', description: '', price: '', categoryId: '' }); setShowAddItem(false); } catch (e) { console.error(e); }
  };

  const handleUpdateItem = async (itemId: string, data: Partial<MenuItem>) => {
    if (!restaurant) return;
    try { const res = await menuApi.updateItem(restaurant.id, itemId, data); setItems(items.map(i => i.id === itemId ? res.data : i)); } catch (e) { console.error(e); }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurant || !confirm('Delete this item?')) return;
    try { await menuApi.deleteItem(restaurant.id, itemId); setItems(items.filter(i => i.id !== itemId)); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal">Menu Management</h2><p className="text-charcoal-light">{items.length} items across {categories.length} categories</p></div>
        <div className="flex gap-3"><Link to="/owner/menu/import"><Button variant="outline" size="sm">📷 Import</Button></Link><Button variant="ghost" size="sm" onClick={() => setShowAddCategory(true)}>+ Category</Button><Button size="sm" onClick={() => setShowAddItem(true)}>+ Add Item</Button></div>
      </div>

      {showAddCategory && <Card className="p-6 border-2 border-green/20"><h3 className="font-bold text-charcoal mb-3">Add Category</h3><div className="flex gap-3"><Input placeholder="Category name" value={newCategory} onChange={e => setNewCategory(e.target.value)} /><Button onClick={handleAddCategory}>Add</Button><Button variant="ghost" onClick={() => setShowAddCategory(false)}>Cancel</Button></div></Card>}

      {showAddItem && (
        <Card className="p-6 border-2 border-green/20">
          <h3 className="font-bold text-charcoal mb-3">Add Menu Item</h3>
          <div className="grid grid-cols-2 gap-3 mb-3"><Input placeholder="Item name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /><Input placeholder="Price (₹)" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} /></div>
          <Input placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="mb-3" />
          <select className="w-full px-4 py-3 rounded-xl border-2 border-cream-dark bg-white focus:border-green outline-none mb-3" value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})}><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <div className="flex gap-3"><Button onClick={handleAddItem}>Add Item</Button><Button variant="ghost" onClick={() => setShowAddItem(false)}>Cancel</Button></div>
        </Card>
      )}

      {editingItem && (
        <Card className="p-6 border-2 border-orange/20">
          <h3 className="font-bold text-charcoal mb-3">Edit: {editingItem.name}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3"><Input label="Name" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} /><Input label="Price (₹)" type="number" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)||0})} /></div>
          <Input label="Description" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="mb-3" />
          <div className="flex gap-3"><Button onClick={() => { handleUpdateItem(editingItem.id, editingItem); setEditingItem(null); }}>Save</Button><Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button></div>
        </Card>
      )}

      {categories.map(cat => {
        const catItems = items.filter(i => i.categoryId === cat.id);
        return (
          <Card key={cat.id} className="overflow-hidden">
            <div className="bg-green/5 px-6 py-3 border-b border-cream-dark/50 flex items-center justify-between"><h3 className="font-bold text-green">{cat.name} ({catItems.length})</h3></div>
            {catItems.length === 0 ? <div className="px-6 py-8 text-center text-charcoal-light">No items</div> : (
              <div className="divide-y divide-cream-dark/30">
                {catItems.map(item => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-cream/50">
                    <div className="flex-1"><div className="flex items-center gap-2"><p className="font-semibold text-charcoal">{item.name}</p>{!item.isAvailable && <Badge variant="red">SOLD OUT</Badge>}{item.isPopular && <Badge variant="orange">Popular</Badge>}</div><p className="text-sm text-charcoal-light">{item.description}</p></div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-green">₹{item.price}</span>
                      <button onClick={() => handleUpdateItem(item.id, { isAvailable: !item.isAvailable })} className={`px-3 py-1 rounded-lg text-xs font-medium ${item.isAvailable ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>{item.isAvailable ? 'Available' : 'Sold Out'}</button>
                      <button onClick={() => setEditingItem(item)} className="text-charcoal-light hover:text-charcoal">✏️</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-charcoal-light hover:text-red">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {categories.length === 0 && <Card className="p-12 text-center"><div className="text-5xl mb-4">🍽️</div><h3 className="text-xl font-bold text-charcoal mb-2">No Menu Yet</h3><Link to="/owner/menu/import"><Button size="lg">📷 Import Menu Photo</Button></Link></Card>}
    </div>
  );
}

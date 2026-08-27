import { useState, useEffect } from 'react';
import { tableApi, restaurantApi } from '../../api';
import type { Restaurant, Table } from '../../types';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { QRCodeSVG } from 'qrcode.react';

export default function TablesPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState<Table | null>(null);
  const [bulkCount, setBulkCount] = useState(10);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const restaurants = await restaurantApi.getAll();
      if (restaurants.data.length > 0) { const rest = restaurants.data[0]; setRestaurant(rest); setTables((await tableApi.getAll(rest.id)).data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAddTable = async () => {
    if (!restaurant) return;
    try { const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1; const res = await tableApi.create(restaurant.id, nextNum); setTables([...tables, res.data]); } catch (e) { console.error(e); }
  };

  const handleBulkCreate = async () => {
    if (!restaurant) return;
    try { const res = await tableApi.createBulk(restaurant.id, bulkCount); setTables([...tables, ...res.data.tables]); } catch (e) { console.error(e); }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!restaurant || !confirm('Delete this table?')) return;
    try { await tableApi.delete(restaurant.id, tableId); setTables(tables.filter(t => t.id !== tableId)); } catch (e) { console.error(e); }
  };

  const handleToggleActive = async (table: Table) => {
    if (!restaurant) return;
    try { const res = await tableApi.update(restaurant.id, table.id, { isActive: !table.isActive }); setTables(tables.map(t => t.id === table.id ? res.data : t)); } catch (e) { console.error(e); }
  };

  const getQRUrl = (table: Table) => `${window.location.origin}/order/${table.qrToken}`;

  const handleDownloadQR = (table: Table) => {
    const svg = document.getElementById(`qr-${table.id}`)?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 400; canvas.height = 500;
      ctx.fillStyle = 'white'; ctx.fillRect(0, 0, 400, 500);
      ctx.drawImage(img, 50, 20, 300, 300);
      ctx.fillStyle = '#212121'; ctx.font = 'bold 24px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(restaurant?.name || '', 200, 360);
      ctx.font = '18px Inter, sans-serif'; ctx.fillText(`Table ${table.tableNumber}`, 200, 390);
      ctx.font = '14px Inter, sans-serif'; ctx.fillStyle = '#757575'; ctx.fillText('Scan to View Menu & Order', 200, 420);
      const link = document.createElement('a'); link.download = `table-${table.tableNumber}-qr.png`; link.href = canvas.toDataURL(); link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-green border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal">Table Management</h2><p className="text-charcoal-light">{tables.length} tables</p></div>
        <Button variant="outline" size="sm" onClick={handleAddTable}>+ Add Table</Button>
      </div>

      {tables.length === 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-charcoal mb-3">Quick Setup</h3>
          <div className="flex gap-3 items-end">
            <div><label className="block text-sm font-medium text-charcoal mb-1">Number of tables</label><input type="number" min={1} max={50} value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value)||10)} className="w-32 px-4 py-3 rounded-xl border-2 border-cream-dark bg-white focus:border-green outline-none" /></div>
            <Button onClick={handleBulkCreate}>Create {bulkCount} Tables</Button>
          </div>
        </Card>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div id={`qr-${showQR.id}`} className="mb-4"><QRCodeSVG value={getQRUrl(showQR)} size={250} level="H" includeMargin /></div>
            <h3 className="text-xl font-bold text-charcoal">{restaurant?.name}</h3>
            <p className="text-lg text-green font-semibold mb-1">Table {showQR.tableNumber}</p>
            <p className="text-sm text-charcoal-light mb-6">Scan to View Menu & Order</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleDownloadQR(showQR)}>Download QR</Button>
              <Button variant="outline" onClick={() => { navigator.clipboard.writeText(getQRUrl(showQR)); alert('Link copied!'); }}>Copy Link</Button>
            </div>
            <button onClick={() => setShowQR(null)} className="mt-4 text-sm text-charcoal-light hover:text-charcoal">Close</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <Card key={table.id} className="p-4 text-center" hover onClick={() => setShowQR(table)}>
            <div className="w-12 h-12 bg-green/10 rounded-xl flex items-center justify-center text-xl mx-auto mb-2">🪑</div>
            <h3 className="font-bold text-charcoal">Table {table.tableNumber}</h3>
            <Badge variant={table.isActive ? 'green' : 'red'} className="mt-2">{table.isActive ? 'Active' : 'Inactive'}</Badge>
            <div className="mt-3 flex gap-2 justify-center">
              <button onClick={e => { e.stopPropagation(); handleToggleActive(table); }} className="text-xs text-charcoal-light hover:text-charcoal">{table.isActive ? 'Deactivate' : 'Activate'}</button>
              <button onClick={e => { e.stopPropagation(); handleDeleteTable(table.id); }} className="text-xs text-red/60 hover:text-red">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

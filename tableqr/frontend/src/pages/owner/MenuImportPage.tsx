import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuImportApi, menuApi, restaurantApi } from '../../api';
import type { ExtractedMenuItem, Restaurant } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

type Step = 'upload' | 'processing' | 'review' | 'publishing';
const PROCESSING_STEPS = ['Uploading Menu...', 'Reading Menu...', 'Detecting Categories...', 'Extracting Food Items...', 'Extracting Prices...', 'Complete ✓'];

export default function MenuImportPage() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [step, setStep] = useState<Step>('upload');
  const [processingStep, setProcessingStep] = useState(0);
  const [extractedItems, setExtractedItems] = useState<ExtractedMenuItem[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { loadRestaurant(); }, []);

  const loadRestaurant = async () => {
    try { const r = await restaurantApi.getAll(); if (r.data.length > 0) setRestaurant(r.data[0]); } catch (e) { console.error(e); }
  };

  const runExtraction = async (extractFn: () => Promise<any>) => {
    setError(''); setStep('processing'); setProcessingStep(0);
    try {
      for (let i = 0; i < PROCESSING_STEPS.length - 1; i++) { await new Promise(r => setTimeout(r, 600)); setProcessingStep(i + 1); }
      const res = await extractFn();
      setExtractedItems(res.data.items); setStep('review');
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed'); setStep('upload'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !restaurant) return;
    await runExtraction(async () => { await menuImportApi.upload(restaurant.id, file); return menuImportApi.extract(restaurant.id); });
  };

  const handleUseDemo = async () => {
    if (!restaurant) return; setLoading(true);
    await runExtraction(() => menuImportApi.useDemo(restaurant.id));
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!restaurant) return; setLoading(true);
    try {
      await menuApi.bulkImport(restaurant.id, extractedItems);
      await restaurantApi.update(restaurant.id, { isPublished: true } as any);
      setStep('publishing'); setTimeout(() => navigate('/owner/menu'), 1500);
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to publish'); }
    finally { setLoading(false); }
  };

  const grouped = extractedItems.reduce((acc, item) => { if (!acc[item.category]) acc[item.category] = []; acc[item.category].push(item); return acc; }, {} as Record<string, ExtractedMenuItem[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {error && <div className="bg-red/10 text-red px-4 py-3 rounded-xl text-sm">{error}</div>}

      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-center"><h2 className="text-2xl font-bold text-charcoal mb-2">Create Your Digital Menu in Minutes</h2><p className="text-charcoal-light">Take a photo of your existing menu and we'll turn it into a digital menu.</p></div>
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Upload Menu Photo</h3>
            <p className="text-charcoal-light mb-6">JPG, PNG up to 10MB</p>
            <label className="inline-block cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} /><span className="bg-green text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-light transition-all inline-block">Upload Photo</span></label>
          </Card>
          <div className="text-center"><p className="text-charcoal-light mb-3">— or —</p><Button variant="outline" onClick={handleUseDemo} isLoading={loading}>Use Demo Menu</Button></div>
        </div>
      )}

      {step === 'processing' && (
        <Card className="p-12 text-center max-w-md mx-auto">
          <div className="space-y-4">
            {PROCESSING_STEPS.map((label, i) => (
              <div key={i} className={`flex items-center gap-3 text-left ${i <= processingStep ? 'text-charcoal' : 'text-charcoal-light/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < processingStep ? 'bg-green text-white' : i === processingStep ? 'bg-orange text-white animate-pulse' : 'bg-cream-dark text-charcoal-light'}`}>{i < processingStep ? '✓' : i + 1}</div>
                <span className={i === processingStep ? 'font-semibold' : ''}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <div className="bg-orange/10 border border-orange/20 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div><p className="font-semibold text-orange">AI-generated menu. Please review before publishing.</p><p className="text-sm text-charcoal-light mt-1">{extractedItems.length} items found. Click any item to edit.</p></div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setExtractedItems([...extractedItems, { category: 'Uncategorized', name: 'New Item', description: '', price: 0, isPopular: false }]); setEditingIdx(extractedItems.length); }}>+ Add Item</Button>
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={handlePublish} isLoading={loading} size="lg">Publish Menu</Button>
          </div>
          {Object.entries(grouped).map(([category, items]) => (
            <Card key={category} className="overflow-hidden">
              <div className="bg-green/5 px-6 py-3 border-b border-cream-dark/50"><h3 className="font-bold text-green">{category}</h3></div>
              <div className="divide-y divide-cream-dark/30">
                {items.map((item) => {
                  const globalIdx = extractedItems.indexOf(item);
                  const isEditing = editingIdx === globalIdx;
                  return (
                    <div key={globalIdx} className="px-6 py-4 hover:bg-cream/50 transition-colors">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3"><Input label="Name" value={item.name} onChange={e => { const u = [...extractedItems]; u[globalIdx] = {...u[globalIdx], name: e.target.value}; setExtractedItems(u); }} /><Input label="Price (₹)" type="number" value={item.price} onChange={e => { const u = [...extractedItems]; u[globalIdx] = {...u[globalIdx], price: parseFloat(e.target.value)||0}; setExtractedItems(u); }} /></div>
                          <Input label="Description" value={item.description} onChange={e => { const u = [...extractedItems]; u[globalIdx] = {...u[globalIdx], description: e.target.value}; setExtractedItems(u); }} />
                          <div className="flex gap-2"><Button size="sm" onClick={() => setEditingIdx(null)}>Done</Button><Button size="sm" variant="danger" onClick={() => { setExtractedItems(extractedItems.filter((_, i) => i !== globalIdx)); setEditingIdx(null); }}>Delete</Button></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setEditingIdx(globalIdx)}>
                          <div><p className="font-semibold text-charcoal">{item.name}</p><p className="text-sm text-charcoal-light">{item.description}</p></div>
                          <div className="flex items-center gap-3"><span className="font-bold text-green">₹{item.price}</span><span className="text-charcoal-light text-sm">✏️</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {step === 'publishing' && (
        <Card className="p-12 text-center max-w-md mx-auto"><div className="text-5xl mb-4">🎉</div><h2 className="text-2xl font-bold text-green mb-2">Menu Published!</h2><p className="text-charcoal-light">Redirecting to menu management...</p></Card>
      )}
    </div>
  );
}

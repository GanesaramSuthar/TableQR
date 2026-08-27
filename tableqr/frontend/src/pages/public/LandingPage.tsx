import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="text-2xl">🍽️</span><span className="text-xl font-bold text-green">TableQR</span></div>
          <div className="flex items-center gap-3">
            <Link to="/owner/login" className="text-sm font-medium text-charcoal hover:text-green transition-colors px-4 py-2">Owner Login</Link>
            <Link to="/owner/register" className="bg-green text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-light transition-all shadow-md">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange/10 text-orange px-4 py-2 rounded-full text-sm font-medium mb-8"><span>🚀</span> Revolutionizing Restaurant Ordering in India</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-charcoal leading-tight mb-6">Turn Every Table Into a <span className="text-green">Digital Ordering Counter</span></h1>
            <p className="text-lg sm:text-xl text-charcoal-light max-w-2xl mx-auto mb-10">Customers scan, browse, order and pay directly from their table — without waiting for a waiter.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo" className="bg-orange text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-light transition-all shadow-lg hover:shadow-xl">🍽️ Try Customer Demo</Link>
              <Link to="/owner/register" className="bg-white text-green border-2 border-green px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green hover:text-white transition-all shadow-md">For Restaurant Owners →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">How TableQR Works</h2><p className="text-charcoal-light text-lg">Simple for customers. Powerful for owners.</p></div>
          <div className="mb-16">
            <h3 className="text-xl font-bold text-green text-center mb-8">For Customers</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[{icon:'📱',title:'Scan QR',desc:'Scan the QR on your table'},{icon:'📖',title:'Browse Menu',desc:'See the full digital menu'},{icon:'🛒',title:'Add to Cart',desc:'Select your favorite dishes'},{icon:'✅',title:'Place Order',desc:'Confirm your order'},{icon:'🔔',title:'Track Order',desc:'Real-time status updates'}].map((s,i) => (
                <div key={i} className="text-center p-4"><div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{s.icon}</div><h4 className="font-semibold text-charcoal mb-1">{s.title}</h4><p className="text-sm text-charcoal-light">{s.desc}</p></div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange text-center mb-8">For Restaurant Owners</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{icon:'📝',title:'Register',desc:'Create your account'},{icon:'📷',title:'Upload Menu',desc:'Photo → Digital menu'},{icon:'✏️',title:'Review & Edit',desc:'Perfect your menu'},{icon:'📊',title:'Manage Orders',desc:'Real-time dashboard'}].map((s,i) => (
                <div key={i} className="text-center p-4"><div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">{s.icon}</div><h4 className="font-semibold text-charcoal mb-1">{s.title}</h4><p className="text-sm text-charcoal-light">{s.desc}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-green to-green-dark rounded-3xl p-8 md:p-16 text-white">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">⭐ Key Feature</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Photo of Menu → Digital Menu</h2>
              <p className="text-lg text-white/80 mb-8">Don't type out your entire menu. Just take a photo of your existing paper menu and our AI will extract all items, categories, and prices automatically.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{step:'1',text:'Upload photo'},{step:'2',text:'AI extracts items'},{step:'3',text:'Review & publish'}].map(s => (
                  <div key={s.step} className="flex items-center gap-3 bg-white/10 rounded-xl p-4"><div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center font-bold text-sm">{s.step}</div><span className="font-medium">{s.text}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">Everything You Need</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{icon:'📱',title:'QR Code Ordering',desc:'Each table gets a unique QR code.'},{icon:'⚡',title:'Real-Time Updates',desc:'Orders appear instantly on the dashboard.'},{icon:'📊',title:'Live Dashboard',desc:'Track sales, orders, and table activity.'},{icon:'📷',title:'AI Menu Import',desc:'Upload a photo of your menu.'},{icon:'🪑',title:'Table Management',desc:'Manage all your tables and QR codes.'},{icon:'🔒',title:'Secure & Fast',desc:'Server-side validation and secure tokens.'}].map((f,i) => (
            <div key={i} className="bg-cream rounded-2xl p-6 hover:shadow-lg transition-all"><div className="text-3xl mb-4">{f.icon}</div><h3 className="text-lg font-bold text-charcoal mb-2">{f.title}</h3><p className="text-charcoal-light">{f.desc}</p></div>
          ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green to-green-dark">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Modernize Your Restaurant?</h2>
          <p className="text-lg text-white/80 mb-10">Join hundreds of restaurants across Rajasthan already using TableQR.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/owner/register" className="bg-orange text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-orange-light transition-all shadow-lg">Get Started Free →</Link>
            <Link to="/demo" className="bg-white/20 text-white border-2 border-white/40 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition-all">Try Demo</Link>
          </div>
        </div>
      </section>

      <footer className="bg-charcoal text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><span className="text-xl">🍽️</span><span className="text-lg font-bold text-white">TableQR</span></div>
          <p className="text-sm">© 2026 TableQR. Made with ❤️ in Rajasthan, India</p>
        </div>
      </footer>
    </div>
  );
}

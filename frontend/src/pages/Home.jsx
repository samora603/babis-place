import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiTruck, FiSmartphone } from 'react-icons/fi';
import { GiBee } from 'react-icons/gi';
import { productService } from '@/services/productService';
import ProductGrid from '@/components/products/ProductGrid';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ featured: true, limit: 8 }),
      productService.getCategories(),
    ]).then(([productsRes, catRes]) => {
      setFeatured(productsRes.data.data);
      setCategories(catRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#0B0B0B] min-h-screen text-slate-200">
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-brand-500/10">
        {/* Honeycomb pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0l20 10v20L20 40 0 30V10z\' fill=\'none\' stroke=\'%23D4AF37\' stroke-width=\'1\'/%3E%3C/svg%3E")' }}></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[25rem] h-[25rem] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="section-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#111] text-brand-500 text-xs tracking-widest uppercase font-semibold px-5 py-2 rounded-full mb-8 border border-brand-500/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <GiBee size={14} /> Luxury Campus Edition
          </div>
          <h1 className="font-display font-extrabold text-6xl md:text-8xl text-white mb-6 leading-tight tracking-tight">
            Curated Elegance,<br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-500 to-brand-400 bg-clip-text text-transparent italic pr-4">Exclusively Yours.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide leading-relaxed">
            The definitive collegiate luxury experience. Browse our premium collection and complete your acquisition seamlessly via M-Pesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/shop" className="btn-primary flex items-center gap-3 text-lg px-10 py-4 uppercase tracking-widest text-sm">
              Discover <FiArrowRight size={18} />
            </Link>
            <Link to="/shop?sort=-createdAt" className="btn-secondary flex items-center gap-3 text-lg px-10 py-4 uppercase tracking-widest text-sm text-brand-500 hover:text-brand-400 border-brand-500/50">
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-card/30 border-b border-brand-500/10 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-brand-500/5 to-transparent pointer-events-none"></div>
        <div className="section-container py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FiSmartphone, title: 'Seamless Acquisition', desc: 'Instant STK push authorization directly to your secured device.' },
              { icon: FiShoppingBag, title: 'Concierge Pickup',   desc: 'Discreet collection from our designated campus boutiques.' },
              { icon: FiTruck,      title: 'Priority Delivery',    desc: 'White-glove delivery service direct to your residence.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-5 p-6 rounded-2xl bg-[#111]/50 border border-brand-500/10 hover:border-brand-500/30 transition-colors duration-300 group">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-brand-500/20 text-brand-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white tracking-wide mb-2 text-lg">{title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-container py-20 pb-10">
          <div className="flex flex-col items-center mb-10">
             <GiBee className="text-brand-500 text-3xl mb-4 opacity-50" />
             <h2 className="font-display font-bold text-3xl text-white tracking-wide uppercase">The Collections</h2>
             <div className="w-12 h-px bg-brand-500 mt-4"></div>
          </div>
          
          <div className="flex gap-4 flex-wrap justify-center max-w-4xl mx-auto">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/shop?category=${cat._id}`}
                className="px-6 py-3 rounded-full border border-brand-500/20 bg-[#111] text-sm text-slate-300 uppercase tracking-widest hover:text-black hover:bg-brand-500 hover:border-brand-500 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section-container py-16 pb-24 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex items-end justify-between mb-10 relative z-10 border-b border-brand-500/20 pb-4">
          <div>
            <h2 className="font-display font-bold text-3xl text-white tracking-wide uppercase">Featured Exclusives</h2>
            <p className="text-slate-400 mt-2 font-light">Hand-selected pieces for the discerning student.</p>
          </div>
          <Link to="/shop" className="text-brand-500 hover:text-brand-400 text-sm font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors group">
            View All <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="relative z-10">
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style={{ 
          backgroundImage: 'url("/assets/images/hero-bg.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"></div>
        {/* Subtle Gradient Overlay for added depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      </div>

      {/* Content Container */}
      <div className="section-container relative z-10 text-center px-4 py-32 md:py-48 animate-fade-in-up">
        {/* Headline */}
        <h1 className="font-display font-extrabold text-5xl md:text-8xl text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
          Collective <span className="text-brand-500">Luxury</span> Outfits
        </h1>

        {/* Subheading */}
        <p className="text-slate-100 text-lg md:text-2xl max-w-3xl mx-auto mb-4 font-medium tracking-wide leading-relaxed drop-shadow-lg">
          Shop at your own comfort, from your own comfort. <span className="text-brand-500 italic">Bee you.</span> Curated elegance. <span className="text-brand-500 italic">Exclusively yours.</span>
        </p>

        {/* Supporting Text */}
        <p className="text-slate-300 text-md md:text-lg max-w-2xl mx-auto mb-8 font-light italic opacity-90">
          Swipe to thrift and complete acquisition seamlessly through M-Pesa.
        </p>

        {/* Delivery Notice */}
        <div className="inline-block bg-brand-500/10 border border-brand-500/30 px-6 py-3 rounded-xl mb-12 backdrop-blur-md animate-pulse-slow">
          <p className="text-brand-500 text-sm md:text-base font-semibold tracking-wide">
            Free same-day delivery from Roysambu to Juja (within 24 hours of purchase).
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-brand-400/80 uppercase tracking-widest">
            <span>• Kahawa Sukari</span>
            <span>• JKUAT Juja</span>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Link 
            to="/shop" 
            className="group relative bg-brand-500 text-black font-bold py-4 px-10 rounded-full transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2 uppercase tracking-widest text-sm">
              Start Shopping <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </Link>
          
          <a 
            href="https://wa.me/254785098972" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group border-2 border-brand-500 text-brand-500 font-bold py-4 px-10 rounded-full transition-all duration-300 hover:bg-brand-500/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95 flex items-center gap-2 uppercase tracking-widest text-sm"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-8 animate-fade-in delay-500">
          {[
            { icon: FaInstagram, link: 'https://instagram.com/Babis-Place', label: 'Instagram' },
            { icon: FaTiktok, link: 'https://tiktok.com/@babiigatyou', label: 'TikTok' },
            { icon: FaWhatsapp, link: 'https://wa.me/254785098972', label: 'WhatsApp' }
          ].map((social, index) => (
            <a 
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500/70 hover:text-brand-500 transition-all duration-300 transform hover:scale-125 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
              aria-label={social.label}
            >
              <social.icon size={24} />
            </a>
          ))}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-surface to-transparent"></div>
    </section>
  );
}

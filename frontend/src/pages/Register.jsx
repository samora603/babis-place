import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

export default function Register() {
  return (
    <div className="min-h-screen flex text-slate-100 bg-surface">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-card items-center justify-center p-12 overflow-hidden border-r border-surface-border">
        {/* Animated Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative z-10 max-w-lg">
          <Link to="/" className="text-4xl font-display font-bold bg-gradient-to-r from-brand-400 to-orange-300 bg-clip-text text-transparent mb-8 inline-block">
            Babis Place
          </Link>
          <h1 className="text-5xl font-display font-medium leading-tight mb-6">
            Join the finest,<br />
            <span className="text-slate-400">shop the best.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Create an account in seconds using just your phone number. No passwords to remember, just simple, secure access to premium products.
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          {/* Mobile Glow */}
          <div className="absolute top-0 w-full h-64 bg-brand-500/10 blur-[80px] lg:hidden -z-10"></div>
          
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center">
            
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold text-white mb-4">Create Account</h2>
              <p className="text-slate-400 leading-relaxed">
                We use secure, passwordless authentication. Simply enter your phone number to get started. 
              </p>
            </div>

            <div className="bg-surface/50 border border-brand-500/20 rounded-2xl p-6 text-sm text-slate-300 mb-8 shadow-inner">
              <span className="text-2xl block mb-2">💡</span>
              <p>Just head over to the sign-in page and enter your phone number. If you're new here, we'll create your account automatically upon OTP verification!</p>
            </div>

            <Link 
              to="/login" 
              className="w-full flex items-center justify-center gap-2 group py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-brand-500/20 active:scale-95"
            >
              <span>Continue with Phone</span>
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

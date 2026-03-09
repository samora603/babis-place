import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { normalizePhone } from '@/utils/helpers';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/auth/OtpInput';
import { HiArrowRight } from 'react-icons/hi';

const STEPS = { PHONE: 'phone', OTP: 'otp' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.PHONE);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(30);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === STEPS.OTP && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    const normalized = normalizePhone(phone);
    if (!normalized) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      await authService.requestOTP(normalized);
      setPhone(normalized);
      setStep(STEPS.OTP);
      setTimer(30);
      setCanResend(false);
      toast.success('OTP sent to your phone');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
        toast.error('Please enter the full 6-digit OTP');
        return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP(phone, otp, 'login');
      login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      toast.success(`Welcome back!`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

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
            Everything you need,<br />
            <span className="text-slate-400">delivered fast.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Sign in to track your orders, manage your wishlist, and enjoy a seamless shopping experience curated just for you.
          </p>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          {/* Mobile Glow */}
          <div className="absolute top-0 w-full h-64 bg-brand-500/10 blur-[80px] lg:hidden -z-10"></div>
          
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
            </div>

            {step === STEPS.PHONE ? (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="login-phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      +254
                    </span>
                    <input
                      id="login-phone"
                      type="tel"
                      value={phone.replace(/^\+254/, '')}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="7XXXXXXXX"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2 group py-3.5 mt-2">
                  <span>Send OTP</span>
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                      <label className="text-sm font-medium text-slate-300">Enter Verification Code</label>
                      <button 
                        type="button" 
                        onClick={() => setStep(STEPS.PHONE)} 
                        className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Change number
                      </button>
                  </div>
                  
                  <OtpInput 
                    length={6} 
                    value={otp} 
                    onChange={setOtp} 
                    className="my-6"
                  />
                  
                  <p className="text-sm text-center text-slate-400">
                    Sent to <span className="text-white font-medium">{phone}</span>
                  </p>
                </div>

                <Button type="submit" loading={loading} className="w-full py-3.5 !mt-6 shadow-lg shadow-brand-500/20">
                  Verify & Sign In
                </Button>

                <div className="text-center mt-6">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleRequestOTP()}
                      className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Resend code in <span className="text-slate-300">{timer}s</span>
                    </p>
                  )}
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-slate-400">
                New to Babis Place?{' '}
                <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

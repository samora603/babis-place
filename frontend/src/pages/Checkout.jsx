import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { productService } from '@/services/productService';
import { formatCurrency, normalizePhone } from '@/utils/helpers';
import { DELIVERY_TYPES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { FiMapPin, FiTruck, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { GiBee } from 'react-icons/gi';

const DELIVERY_FEE = 100;

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState('pickup');
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState({ street: '', building: '', landmark: '' });
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');
  const [step, setStep] = useState('details'); // details | payment | processing
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productService.getCategories(); // warm up
    import('@/services/api').then(({ default: api }) =>
      api.get('/pickup-locations').then(({ data }) => setPickupLocations(data.data))
    );
  }, []);

  const total = subtotal + (deliveryType === 'delivery' ? DELIVERY_FEE : 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (deliveryType === 'pickup' && !selectedPickup) { toast.error('Please select a pickup location'); return; }
    setLoading(true);
    try {
      const { data } = await orderService.createOrder({
        deliveryType,
        pickupLocation: deliveryType === 'pickup' ? selectedPickup : undefined,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
        customerPhone: normalizePhone(mpesaPhone),
        customerName: user?.name,
      });
      setOrderId(data.data._id);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      await paymentService.initiateStkPush(orderId, normalizePhone(mpesaPhone));
      setStep('processing');
      toast.success('Check your phone for the M-Pesa prompt!');
      // Poll payment status
      const poll = setInterval(async () => {
        const { data } = await paymentService.checkStatus(orderId);
        if (data.paymentStatus === 'paid') {
          clearInterval(poll);
          clearCart();
          navigate(`/orders/${orderId}/confirmation`);
        } else if (data.paymentStatus === 'failed') {
          clearInterval(poll);
          setStep('payment');
          toast.error('Payment failed. Please try again.');
        }
      }, 3000);
      setTimeout(() => clearInterval(poll), 120000); // stop polling after 2 min
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0B0B] min-h-screen text-slate-200 py-12 relative">
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="section-container max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <GiBee className="text-brand-500 text-4xl mx-auto mb-4 opacity-80" />
          <h1 className="font-display font-bold text-4xl text-white tracking-wide uppercase">Secure Checkout</h1>
          <div className="w-20 h-px bg-brand-500/50 mx-auto mt-6"></div>
        </div>

        {step === 'details' && (
          <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-6">
              {/* Delivery type */}
              <div className="bg-[#111] p-8 rounded-2xl border border-brand-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                <h2 className="font-display font-semibold text-lg text-white tracking-widest uppercase mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Fulfillment Method
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {Object.entries(DELIVERY_TYPES).map(([key, { label, icon }]) => (
                    <button key={key} type="button" onClick={() => setDeliveryType(key)}
                      className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${deliveryType === key ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-brand-500/30' : 'border-surface-border bg-surface-card hover:border-brand-500/40 hover:bg-surface-card/80'}`}>
                      <span className={`text-3xl mb-3 ${deliveryType === key ? 'text-brand-500' : 'text-slate-400'}`}>{icon}</span>
                      <span className={`font-medium tracking-wide ${deliveryType === key ? 'text-white' : 'text-slate-300'}`}>{label}</span>
                      {key === 'delivery' && <span className="block text-xs font-light text-brand-500/80 mt-1">+{formatCurrency(DELIVERY_FEE)}</span>}
                    </button>
                  ))}
                </div>

                {deliveryType === 'pickup' ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block" htmlFor="checkout-pickup">Designated Pickup Boutique</label>
                    <select id="checkout-pickup" required value={selectedPickup} onChange={(e) => setSelectedPickup(e.target.value)} className="input bg-[#0A0A0A] border-brand-500/20 focus:border-brand-500 py-3.5 text-slate-300">
                      <option value="">Select a location…</option>
                      {pickupLocations.map((loc) => <option key={loc._id} value={loc._id}>{loc.name} — {loc.building}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block">Delivery Destination</label>
                    <input required placeholder="Street / Road" value={deliveryAddress.street} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })} className="input bg-[#0A0A0A] border-brand-500/20 focus:border-brand-500 py-3.5" id="checkout-street" />
                    <input placeholder="Building / Room (Optional)" value={deliveryAddress.building} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, building: e.target.value })} className="input bg-[#0A0A0A] border-brand-500/20 focus:border-brand-500 py-3.5" id="checkout-building" />
                    <input placeholder="Landmark (Optional)" value={deliveryAddress.landmark} onChange={(e) => setDeliveryAddress({ ...deliveryAddress, landmark: e.target.value })} className="input bg-[#0A0A0A] border-brand-500/20 focus:border-brand-500 py-3.5" id="checkout-landmark" />
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="bg-[#111] p-8 rounded-2xl border border-brand-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                 <h2 className="font-display font-semibold text-lg text-white tracking-widest uppercase mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Billing Details
                </h2>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 block mb-3" htmlFor="checkout-phone">M-Pesa Authorization Number <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <input id="checkout-phone" required type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} placeholder="07XXXXXXXX" className="input bg-[#0A0A0A] border-brand-500/20 focus:border-brand-500 pl-12 py-3.5 text-lg font-mono tracking-wider" />
                </div>
                <p className="text-xs text-slate-500 mt-3 font-light">The STK Push prompt will be sent to this number for authorization.</p>
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-2">
              <div className="bg-[#111] p-8 rounded-2xl border border-brand-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] h-fit sticky top-28">
                <h3 className="font-display font-semibold text-xl text-white tracking-widest uppercase pb-4 mb-6 border-b border-brand-500/20">Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm tracking-wide">
                    <span className="text-slate-400">Merchandise</span>
                    <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm tracking-wide">
                    <span className="text-slate-400">Logistics</span>
                    <span className={deliveryType === 'delivery' ? 'text-white font-medium' : 'text-brand-500 italic'}>
                      {deliveryType === 'delivery' ? formatCurrency(DELIVERY_FEE) : 'Complimentary'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-display font-bold text-2xl border-t border-brand-500/20 pt-6 mb-8">
                  <span className="text-slate-300">Total</span>
                  <span className="text-brand-400">{formatCurrency(total)}</span>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full text-center uppercase tracking-widest text-sm py-4 shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.4)] flex justify-center items-center gap-2">
                  {loading ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === 'payment' && (
          <div className="bg-[#111] p-12 text-center rounded-3xl border border-brand-500/20 shadow-2xl max-w-xl mx-auto space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="w-24 h-24 mx-auto rounded-full bg-[#1A1A1A] border-2 border-brand-500/30 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              📱
            </div>
            
            <div>
              <h2 className="font-display font-bold text-3xl text-white mb-2 tracking-wide">Authorization Required</h2>
              <p className="text-slate-400 font-light">You are about to securely transfer <strong className="text-brand-400 font-medium">{formatCurrency(total)}</strong> via M-Pesa.</p>
            </div>
            
            <div className="bg-[#0A0A0A] border border-surface-border p-4 rounded-xl inline-block mx-auto">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-semibold">Registered Device Number</p>
              <p className="text-xl text-white font-mono tracking-widest">{mpesaPhone}</p>
            </div>

            <Button onClick={handlePay} loading={loading} className="w-full btn-primary text-base py-4 shadow-[0_4px_25px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.5)]">
               Send Push Authorization
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-[#111] p-16 text-center rounded-3xl border border-brand-500/20 shadow-[0_10px_50px_rgba(212,175,55,0.1)] max-w-xl mx-auto space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-surface-card"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin flex items-center justify-center"></div>
              <GiBee size={24} className="text-brand-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-3xl text-white tracking-wide mt-8">Awaiting Confirmation</h2>
            <p className="text-slate-400 font-light text-lg">
              Please enter your M-Pesa PIN on your registered device to complete the transaction.
            </p>
            <p className="text-xs text-brand-500/70 tracking-widest uppercase font-semibold mt-4">Do not close this window</p>
          </div>
        )}
      </div>
    </div>
  );
}

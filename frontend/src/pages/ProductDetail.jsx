import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getPrimaryImage } from '@/utils/helpers';
import StarRating from '@/components/ui/StarRating';
import QuantitySelector from '@/components/ui/QuantitySelector';
import Spinner from '@/components/ui/Spinner';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

import Skeleton from '@/components/ui/Skeleton';

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);

  useEffect(() => {
    productService.getProduct(idOrSlug)
      .then(({ data }) => setProduct(data.data))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) return (
    <div className="section-container py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" variant="rectangular" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="w-16 h-16 rounded-xl" variant="rectangular" />)}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="w-24 h-4" variant="text" />
          <Skeleton className="w-3/4 h-10" variant="text" />
          <Skeleton className="w-32 h-6" variant="text" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-4" variant="text" />)}
          </div>
          <div className="flex gap-4 mt-8">
            <Skeleton className="w-1/2 h-12 rounded-xl" variant="rectangular" />
            <Skeleton className="w-12 h-12 rounded-xl" variant="rectangular" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!product) return <div className="section-container py-20 text-center text-slate-400">Product not found.</div>;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    await addToCart(product._id, quantity, selectedVariation);
  };

  return (
    <div className="section-container py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-card border border-surface-border">
            <img src={product.images[activeImage]?.url} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === activeImage ? 'border-brand-500' : 'border-surface-border'}`}>
                  <img src={img.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-500 mb-1">{product.category?.name}</p>
            <h1 className="font-display font-bold text-3xl text-white leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-slate-400">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="font-display font-bold text-3xl text-brand-400">{formatCurrency(product.discountPrice)}</span>
                <span className="text-lg text-slate-500 line-through">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="font-display font-bold text-3xl">{formatCurrency(product.price)}</span>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed">{product.description}</p>

          {/* Variations */}
          {product.variations?.map((variation) => (
            <div key={variation.name}>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">{variation.name}</label>
              <div className="flex gap-2 flex-wrap">
                {variation.options.map((opt) => (
                  <button key={opt.label}
                    onClick={() => setSelectedVariation({ name: variation.name, option: opt.label, priceModifier: opt.priceModifier })}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                      selectedVariation?.option === opt.label
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                        : 'border-surface-border text-slate-300 hover:border-slate-500'
                    }`}>
                    {opt.label} {opt.priceModifier > 0 ? `+${formatCurrency(opt.priceModifier)}` : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-4">
            <QuantitySelector value={quantity} max={product.stock} onChange={setQuantity} />
            <span className="text-sm text-slate-500">{product.stock} in stock</span>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={() => isAuthenticated && toggleWishlist(product._id)}
              className={`btn-secondary px-4 ${isWishlisted(product._id) ? 'text-red-400 border-red-400/40' : ''}`}>
              <FiHeart className={isWishlisted(product._id) ? 'fill-current' : ''} />
            </button>
          </div>

          {/* FAQs */}
          {product.faqs?.length > 0 && (
            <div className="border-t border-surface-border pt-5 space-y-3">
              <h3 className="font-semibold text-slate-200">FAQs</h3>
              {product.faqs.map((faq, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium text-slate-200">{faq.question}</p>
                  <p className="text-slate-400 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

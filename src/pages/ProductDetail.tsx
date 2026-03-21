import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Minus, Plus, ArrowLeft, Truck, RotateCcw, Shield } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ProductDetail() {
  const { id } = useParams();
  const ref = useScrollReveal();
  const product = products.find((p) => p.id === id) || products[0];
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <Link to="/shop" className="scroll-reveal inline-flex items-center gap-1 text-sm text-brand-taupe hover:text-brand-gold transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div
              className="scroll-reveal-left relative cursor-zoom-in overflow-hidden rounded-sm bg-brand-cream"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full aspect-[3/4] object-cover transition-transform duration-700 ${zoomed ? "scale-150" : "scale-100"}`}
              />
              {product.badge && (
                <span className="absolute top-4 left-4 brand-label bg-brand-ivory/90 backdrop-blur-sm px-3 py-1 text-[10px]">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="scroll-reveal-right">
              <p className="brand-label mb-2">{product.collection}</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-brand-brown mb-3">{product.name}</h2>

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-sand"} />
                ))}
                <span className="text-sm text-brand-taupe ml-2">{product.rating} rating</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-serif text-3xl text-brand-brown">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lg text-brand-taupe line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>

              <p className="text-sm text-brand-warm leading-relaxed mb-8">{product.description}</p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs uppercase tracking-[0.12em] font-medium text-brand-warm">Quantity</span>
                <div className="flex items-center border border-brand-sand rounded-sm">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2.5 text-brand-warm hover:text-brand-gold transition-colors active:scale-95">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-brand-brown">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-2.5 text-brand-warm hover:text-brand-gold transition-colors active:scale-95">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mb-8">
                <button className="brand-btn-primary flex-1">
                  <ShoppingBag size={16} className="mr-2" /> Add to Cart
                </button>
                <button className="brand-btn-outline px-4" aria-label="Add to wishlist">
                  <Heart size={18} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-sand/40">
                {[
                  { icon: Truck, label: "Free Shipping 500+" },
                  { icon: RotateCcw, label: "Easy Returns" },
                  { icon: Shield, label: "Secure Checkout" },
                ].map((b, i) => (
                  <div key={i} className="text-center">
                    <b.icon size={18} className="mx-auto text-brand-gold mb-1" />
                    <p className="text-[10px] text-brand-taupe uppercase tracking-wide">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-20">
              <div className="scroll-reveal mb-10">
                <p className="brand-label mb-2">You May Also Like</p>
                <h3 className="font-serif text-2xl text-brand-brown">Related Products</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

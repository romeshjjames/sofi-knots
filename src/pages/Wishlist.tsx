import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const wishlistItems = [products[4], products[1], products[6]];

export default function Wishlist() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Your Favorites</p>
            <h2 className="brand-heading">Wishlist</h2>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="scroll-reveal text-center py-16">
              <Heart size={40} className="mx-auto text-brand-sand mb-4" />
              <p className="text-brand-warm mb-4">Your wishlist is empty</p>
              <Link to="/shop" className="brand-btn-primary">Explore Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {wishlistItems.map((p, i) => (
                <div key={p.id} className="scroll-reveal brand-card group" style={{ transitionDelay: `${i * 80}ms` }}>
                  <Link to={`/product/${p.id}`}>
                    <div className="img-zoom aspect-[3/4] bg-brand-cream relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-serif text-base text-brand-brown group-hover:text-brand-gold transition-colors">{p.name}</h3>
                    </Link>
                    <p className="text-sm text-brand-warm mt-1 mb-3">₹{p.price.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button className="brand-btn-primary text-[10px] py-2 px-4 flex-1">
                        <ShoppingBag size={12} className="mr-1" /> Add to Cart
                      </button>
                      <button className="p-2 border border-brand-sand rounded-sm text-brand-taupe hover:text-brand-rose transition-colors active:scale-95">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

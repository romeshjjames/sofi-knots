import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products, collections } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Collections() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Explore</p>
            <h2 className="brand-heading">Our Collections</h2>
            <div className="brand-divider mt-4" />
          </div>

          <div className="space-y-16">
            {collections.map((col, i) => {
              const items = products.filter((p) => p.collection === col);
              if (items.length === 0) return null;
              return (
                <div key={col} className="scroll-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="brand-label mb-1">{items.length} pieces</p>
                      <h3 className="font-serif text-2xl lg:text-3xl text-brand-brown">{col}</h3>
                    </div>
                    <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-brand-gold hover:text-brand-warm transition-colors">
                      View All <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                    {items.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} className="group">
                        <div className="brand-card">
                          <div className="img-zoom aspect-[3/4] bg-brand-cream">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div className="p-3">
                            <h4 className="font-serif text-base text-brand-brown group-hover:text-brand-gold transition-colors">{p.name}</h4>
                            <p className="text-sm text-brand-warm mt-0.5">₹{p.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

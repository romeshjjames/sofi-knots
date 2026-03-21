import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Shop() {
  const ref = useScrollReveal();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let items = category === "All" ? [...products] : products.filter((p) => p.category === category);
    if (sort === "low") items.sort((a, b) => a.price - b.price);
    else if (sort === "high") items.sort((a, b) => b.price - a.price);
    else if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
    return items;
  }, [category, sort]);

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Browse Our Collection</p>
            <h2 className="brand-heading">Shop All</h2>
          </div>

          {/* Filters */}
          <div className="scroll-reveal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-sand/40">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 text-xs uppercase tracking-[0.12em] font-medium border rounded-sm transition-all duration-200 active:scale-95 ${
                    category === c
                      ? "bg-brand-gold text-brand-ivory border-transparent"
                      : "border-brand-sand text-brand-warm hover:border-brand-gold"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-brand-taupe" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs uppercase tracking-wide text-brand-warm bg-transparent border-none outline-none cursor-pointer font-medium"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-brand-taupe py-16">No products found in this category.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

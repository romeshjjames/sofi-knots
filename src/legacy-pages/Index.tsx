import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, Scissors, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroBg from "@/assets/hero-bg.jpg";

const testimonials = [
  { name: "Ananya Sharma", text: "The wall hanging is absolutely gorgeous. You can feel the love and effort in every knot. My living room feels like an art gallery now!", rating: 5 },
  { name: "Priya Mehta", text: "Ordered the bohemian tote for my sister's birthday and she was speechless. Premium quality and the colors are even more vibrant in person.", rating: 5 },
  { name: "Ritu Agarwal", text: "I keep coming back to Sofi Knots. The baby dress was the most unique gift I've ever given. Truly one-of-a-kind craftsmanship.", rating: 5 },
];

export default function Home() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Sofi Knots macrame collection" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(40,33%,97%,0.88) 0%, hsla(40,33%,97%,0.55) 60%, transparent 100%)" }} />
        </div>
        <div className="relative brand-container py-24 lg:py-32 max-w-2xl">
          <p className="brand-label mb-4 animate-fade-in" style={{ animationDelay: "200ms" }}>Handcrafted Macrame Art</p>
          <h2 className="brand-heading text-5xl sm:text-6xl lg:text-7xl mb-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
            Woven with<br />Love & Soul
          </h2>
          <p className="brand-subheading max-w-lg mb-8 animate-fade-in" style={{ animationDelay: "600ms" }}>
            Discover handcrafted macrame pieces that bring warmth, texture, and artisan charm to your world.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "800ms" }}>
            <Link to="/shop" className="brand-btn-primary">
              Shop Collection <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link to="/about" className="brand-btn-outline">Our Story</Link>
          </div>
        </div>
      </section>

      {/* Brand Intro */}
      <section className="brand-section">
        <div className="brand-container text-center max-w-2xl mx-auto">
          <div className="scroll-reveal">
            <p className="brand-label mb-3">Welcome to Sofi Knots</p>
            <h2 className="brand-heading mb-4">The Art of Handmade Macrame</h2>
            <div className="brand-divider mb-6" />
            <p className="text-brand-warm leading-relaxed">
              Every piece in our collection is lovingly handcrafted using premium natural cotton cord and age-old knotting techniques. From statement wall hangings to delicate accessories, each creation is a celebration of patience, artistry, and the beauty of the handmade.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Curated For You</p>
            <h2 className="brand-heading">Our Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Bohemian Living", desc: "Statement pieces for your home", img: products[0].image },
              { title: "Earth & Texture", desc: "Warm tones, natural materials", img: products[1].image },
              { title: "Little Knots", desc: "Tiny treasures & baby essentials", img: products[6].image },
            ].map((col, i) => (
              <Link
                key={col.title}
                to="/collections"
                className="scroll-reveal group relative aspect-[3/4] overflow-hidden rounded-sm"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="brand-label text-brand-ivory/80 mb-1" style={{ color: "hsla(40,33%,97%,0.8)" }}>{col.desc}</p>
                  <h3 className="font-serif text-2xl font-medium" style={{ color: "hsl(40,33%,97%)" }}>{col.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal flex items-end justify-between mb-10">
            <div>
              <p className="brand-label mb-2">Most Loved</p>
              <h2 className="brand-heading">Bestsellers</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-gold hover:text-brand-warm transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.filter(p => p.badge === "Bestseller" || p.rating >= 4.8).slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="scroll-reveal flex items-end justify-between mb-10">
            <div>
              <p className="brand-label mb-2">Just Dropped</p>
              <h2 className="brand-heading">New Arrivals</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-gold hover:text-brand-warm transition-colors">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.filter(p => p.badge === "New").concat(products.slice(2, 4)).slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Why Sofi Knots</p>
            <h2 className="brand-heading">Crafted with Intention</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Scissors, title: "Handmade with Love", desc: "Every knot is tied by hand with care and patience. No two pieces are exactly alike." },
              { icon: Shield, title: "Premium Materials", desc: "We use only 100% natural cotton cord and sustainably sourced wooden elements." },
              { icon: Truck, title: "Thoughtful Packaging", desc: "Each order is wrapped in eco-friendly packaging, ready to gift or cherish." },
            ].map((item, i) => (
              <div key={i} className="scroll-reveal text-center" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-cream flex items-center justify-center mb-5">
                  <item.icon size={22} className="text-brand-gold" />
                </div>
                <h3 className="font-serif text-xl text-brand-brown mb-2">{item.title}</h3>
                <p className="text-sm text-brand-warm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="brand-section bg-brand-cream">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Kind Words</p>
            <h2 className="brand-heading">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="scroll-reveal bg-brand-ivory p-8 rounded-sm" style={{ transitionDelay: `${i * 100}ms` }}>
                <Quote size={24} className="text-brand-gold/40 mb-4" />
                <p className="text-sm text-brand-warm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={12} className="fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="font-serif text-base text-brand-brown">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="brand-section">
        <div className="brand-container text-center max-w-xl mx-auto">
          <div className="scroll-reveal">
            <p className="brand-label mb-3">Stay Connected</p>
            <h2 className="brand-heading mb-4">Join the Sofi Knots Family</h2>
            <p className="text-sm text-brand-warm mb-8">
              Subscribe for early access to new collections, handmade inspirations, and exclusive offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className="brand-input flex-1" />
              <button type="submit" className="brand-btn-primary whitespace-nowrap">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

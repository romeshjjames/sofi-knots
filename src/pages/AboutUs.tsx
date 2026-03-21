import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Heart, Leaf, Award } from "lucide-react";
import productWallart from "@/assets/product-wallart.jpg";
import productBag from "@/assets/product-bag.jpeg";

export default function AboutUs() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />

      {/* Hero */}
      <section className="brand-section bg-brand-cream">
        <div className="brand-container text-center max-w-2xl mx-auto">
          <div className="scroll-reveal">
            <p className="brand-label mb-3">Our Story</p>
            <h2 className="brand-heading text-4xl lg:text-5xl mb-4">Behind Every Knot, a Story</h2>
            <div className="brand-divider mb-6" />
            <p className="text-brand-warm leading-relaxed">
              Sofi Knots was born from a deep love for handmade art and the meditative beauty of macrame. What started as a personal passion for knotting cotton cord into beautiful forms has grown into a brand that celebrates slow craftsmanship, natural materials, and the warmth of handmade pieces.
            </p>
          </div>
        </div>
      </section>

      {/* Story with image */}
      <section className="brand-section">
        <div className="brand-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal-left">
              <img src={productWallart} alt="Macrame craftsmanship" className="w-full aspect-[4/5] object-cover rounded-sm" />
            </div>
            <div className="scroll-reveal-right">
              <p className="brand-label mb-3">Craftsmanship</p>
              <h3 className="font-serif text-3xl text-brand-brown mb-5">Made by Hand, Made with Heart</h3>
              <p className="text-brand-warm leading-relaxed mb-4">
                Each piece in our collection takes hours — sometimes days — to create. We use traditional macrame techniques passed down through generations, combined with contemporary designs that fit modern aesthetics.
              </p>
              <p className="text-brand-warm leading-relaxed mb-4">
                Our artisans work with 100% natural cotton cord, sustainably sourced wooden elements, and eco-friendly materials. We believe in slow fashion and intentional creation.
              </p>
              <p className="text-brand-warm leading-relaxed">
                When you choose Sofi Knots, you're not just buying a product — you're supporting handmade art, fair craftsmanship, and sustainable practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="brand-section bg-brand-cream">
        <div className="brand-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Made with Love", desc: "Every piece carries the warmth and intention of our artisans. No mass production, ever." },
              { icon: Leaf, title: "Sustainably Sourced", desc: "We use natural cotton, wooden beads, and eco-friendly packaging to minimize our footprint." },
              { icon: Award, title: "Premium Quality", desc: "We never compromise on materials or technique. Each piece is inspected for perfection before shipping." },
            ].map((v, i) => (
              <div key={i} className="scroll-reveal text-center p-8" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-ivory flex items-center justify-center mb-5">
                  <v.icon size={22} className="text-brand-gold" />
                </div>
                <h3 className="font-serif text-xl text-brand-brown mb-3">{v.title}</h3>
                <p className="text-sm text-brand-warm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="brand-section">
        <div className="brand-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="scroll-reveal-left order-2 lg:order-1">
            <p className="brand-label mb-3">Join Our Journey</p>
            <h3 className="font-serif text-3xl text-brand-brown mb-5">From Our Hands to Your Home</h3>
            <p className="text-brand-warm leading-relaxed mb-6">
              We'd love for you to be part of the Sofi Knots family. Browse our collection and find a piece that speaks to your soul.
            </p>
            <a href="/shop" className="brand-btn-primary">Explore the Shop</a>
          </div>
          <div className="scroll-reveal-right order-1 lg:order-2">
            <img src={productBag} alt="Sofi Knots products" className="w-full aspect-square object-cover rounded-sm" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

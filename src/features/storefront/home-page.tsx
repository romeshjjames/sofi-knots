import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Scissors, Shield, Star, Truck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ProductCard } from "@/components/site/product-card";
import { getCatalogCollections, getFeaturedProducts, getNewArrivalProducts } from "@/lib/catalog";
import { getCollectionImageSource } from "@/lib/media";

const testimonials = [
  {
    name: "Ananya Sharma",
    text: "The wall hanging is absolutely gorgeous. You can feel the love and effort in every knot.",
    rating: 5,
  },
  {
    name: "Priya Mehta",
    text: "Ordered the bohemian tote as a gift and the craftsmanship felt premium from the first glance.",
    rating: 5,
  },
  {
    name: "Ritu Agarwal",
    text: "The baby dress was one of the most unique handmade gifts I have ever given.",
    rating: 5,
  },
];

export async function HomePage() {
  const [featuredResult, newArrivalResult, collectionResult] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivalProducts(),
    getCatalogCollections(),
  ]);
  const featuredProducts = featuredResult.data;
  const newArrivals = newArrivalResult.data;
  const storefrontCollections = collectionResult.data;

  return (
    <div>
      <Navbar />
      <DataSourceNote source={featuredResult.source} error={featuredResult.error} />

      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroBg} alt="Sofi Knots macrame collection" className="h-full w-full object-cover" priority />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsla(40,33%,97%,0.88) 0%, hsla(40,33%,97%,0.55) 60%, transparent 100%)",
            }}
          />
        </div>
        <div className="brand-container relative max-w-2xl py-24 lg:py-32">
          <p className="brand-label mb-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Handcrafted Macrame Art
          </p>
          <h1 className="brand-heading mb-6 text-5xl sm:text-6xl lg:text-7xl animate-fade-in" style={{ animationDelay: "400ms" }}>
            Woven with
            <br />
            Love and Soul
          </h1>
          <p className="brand-subheading mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "600ms" }}>
            Discover handcrafted macrame pieces that bring warmth, texture, and artisan charm to your world.
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "800ms" }}>
            <Link href="/shop" className="brand-btn-primary">
              Shop Collection <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link href="/about" className="brand-btn-outline">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container mx-auto max-w-2xl text-center">
          <p className="brand-label mb-3">Welcome to Sofi Knots</p>
          <h2 className="brand-heading mb-4">The Art of Handmade Macrame</h2>
          <div className="brand-divider mb-6" />
          <p className="leading-relaxed text-brand-warm">
            Every piece in our collection is lovingly handcrafted using premium natural cotton cord and age-old knotting techniques.
          </p>
        </div>
      </section>

      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <p className="brand-label mb-3">Curated For You</p>
            <h2 className="brand-heading">Our Collections</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {storefrontCollections.map((collection, index) => (
              <Link
                key={collection.slug}
                href="/collections"
                className="group relative aspect-[3/4] overflow-hidden rounded-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={getCollectionImageSource(collection)}
                  alt={collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  placeholder={collection.imageUrl ? "empty" : "blur"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="mb-1 text-xs uppercase tracking-[0.2em]" style={{ color: "hsla(40,33%,97%,0.8)" }}>
                    {collection.description}
                  </p>
                  <h3 className="font-serif text-2xl font-medium text-brand-ivory">{collection.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="brand-label mb-2">Most Loved</p>
              <h2 className="brand-heading">Bestsellers</h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium text-brand-gold transition-colors hover:text-brand-warm sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="brand-label mb-2">Just Dropped</p>
              <h2 className="brand-heading">New Arrivals</h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium text-brand-gold transition-colors hover:text-brand-warm sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-14 text-center">
            <p className="brand-label mb-3">Why Sofi Knots</p>
            <h2 className="brand-heading">Crafted with Intention</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12">
            {[
              { icon: Scissors, title: "Handmade with Love", desc: "Every knot is tied by hand with care and patience." },
              { icon: Shield, title: "Premium Materials", desc: "We use natural cotton cord and carefully selected accessories." },
              { icon: Truck, title: "Thoughtful Packaging", desc: "Every order is packed beautifully for gifting and safe delivery." },
            ].map((item, index) => (
              <div key={item.title} className="text-center animate-fade-in" style={{ animationDelay: `${index * 120}ms` }}>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream">
                  <item.icon size={22} className="text-brand-gold" />
                </div>
                <h3 className="mb-2 font-serif text-xl text-brand-brown">{item.title}</h3>
                <p className="text-sm leading-relaxed text-brand-warm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section bg-brand-cream">
        <div className="brand-container">
          <div className="mb-14 text-center">
            <p className="brand-label mb-3">Kind Words</p>
            <h2 className="brand-heading">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="rounded-sm bg-brand-ivory p-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <Quote size={24} className="mb-4 text-brand-gold/40" />
                <p className="mb-5 text-sm leading-relaxed text-brand-warm">{testimonial.text}</p>
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={12} className="fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="font-serif text-base text-brand-brown">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section">
        <div className="brand-container mx-auto max-w-xl text-center">
          <p className="brand-label mb-3">Stay Connected</p>
          <h2 className="brand-heading mb-4">Join the Sofi Knots Family</h2>
          <p className="mb-8 text-sm text-brand-warm">
            Subscribe for early access to new collections, styling inspiration, and exclusive offers.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="Your email address" className="brand-input flex-1" />
            <button type="submit" className="brand-btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

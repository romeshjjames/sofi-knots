import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import productWallart from "@/assets/product-wallart.jpg";
import productWallhanging from "@/assets/product-wallhanging.jpeg";
import productBag from "@/assets/product-bag.jpeg";

const blogPosts = [
  {
    id: "1",
    title: "The Art of Macrame: A Beginner's Guide to Understanding Knots",
    excerpt: "Discover the ancient art of macrame and learn about the fundamental knots that create beautiful patterns. From square knots to spiral hitches, every technique has a story.",
    image: productWallart,
    date: "March 15, 2026",
    readTime: "5 min read",
    category: "Craft Guide",
  },
  {
    id: "2",
    title: "How to Style Macrame Wall Hangings in Your Home",
    excerpt: "Transform your living space with these expert tips on hanging and styling macrame art. Learn about placement, lighting, and creating the perfect bohemian corner.",
    image: productWallhanging,
    date: "March 8, 2026",
    readTime: "4 min read",
    category: "Home Styling",
  },
  {
    id: "3",
    title: "Sustainable Fashion: Why Handmade Accessories Matter",
    excerpt: "In a world of fast fashion, choosing handmade accessories is a conscious decision. Learn why investing in artisan-crafted pieces benefits both you and the planet.",
    image: productBag,
    date: "February 28, 2026",
    readTime: "6 min read",
    category: "Sustainability",
  },
];

export default function Blog() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Stories & Inspiration</p>
            <h2 className="brand-heading">The Sofi Knots Journal</h2>
            <div className="brand-divider mt-4" />
          </div>

          {/* Featured post */}
          <Link to="/blog" className="scroll-reveal block mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 group">
              <div className="img-zoom aspect-[4/3] lg:aspect-auto rounded-sm overflow-hidden">
                <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="brand-label mb-3">{blogPosts[0].category}</span>
                <h3 className="font-serif text-2xl lg:text-3xl text-brand-brown group-hover:text-brand-gold transition-colors mb-4">
                  {blogPosts[0].title}
                </h3>
                <p className="text-brand-warm text-sm leading-relaxed mb-5">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-brand-taupe">
                  <span>{blogPosts[0].date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {blogPosts[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Other posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.slice(1).map((post, i) => (
              <Link key={post.id} to="/blog" className="scroll-reveal group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="brand-card">
                  <div className="img-zoom aspect-[16/10]">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <span className="brand-label mb-2 block">{post.category}</span>
                    <h3 className="font-serif text-xl text-brand-brown group-hover:text-brand-gold transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-brand-warm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-taupe">{post.date}</span>
                      <span className="flex items-center gap-1 text-xs font-medium text-brand-gold">
                        Read More <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

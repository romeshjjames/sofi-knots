import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/data/products";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  return (
    <div
      className="scroll-reveal brand-card group"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative img-zoom aspect-[3/4] bg-brand-cream">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 brand-label bg-brand-ivory/90 backdrop-blur-sm px-3 py-1 text-[10px]">
              {product.badge}
            </span>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="w-10 h-10 rounded-full bg-brand-ivory/90 backdrop-blur-sm flex items-center justify-center text-brand-warm hover:text-brand-rose transition-colors shadow-sm active:scale-95"
                aria-label="Add to wishlist"
              >
                <Heart size={16} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); }}
                className="w-10 h-10 rounded-full bg-brand-ivory/90 backdrop-blur-sm flex items-center justify-center text-brand-warm hover:text-brand-gold transition-colors shadow-sm active:scale-95"
                aria-label="Add to cart"
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[10px] brand-label mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg text-brand-brown group-hover:text-brand-gold transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.floor(product.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-sand"}
            />
          ))}
          <span className="text-xs text-brand-taupe ml-1">{product.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm font-medium text-brand-brown">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-brand-taupe line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const cartItems = [products[0], products[4], products[7]];

export default function Cart() {
  const ref = useScrollReveal();
  const subtotal = cartItems.reduce((s, p) => s + p.price, 0);

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container max-w-4xl">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Your Selection</p>
            <h2 className="brand-heading">Shopping Cart</h2>
          </div>

          {cartItems.length === 0 ? (
            <div className="scroll-reveal text-center py-16">
              <ShoppingBag size={40} className="mx-auto text-brand-sand mb-4" />
              <p className="text-brand-warm mb-4">Your cart is empty</p>
              <Link to="/shop" className="brand-btn-primary">Continue Shopping</Link>
            </div>
          ) : (
            <div className="scroll-reveal">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 p-4 bg-brand-cream rounded-sm">
                    <Link to={`/product/${item.id}`} className="shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`} className="font-serif text-lg text-brand-brown hover:text-brand-gold transition-colors">{item.name}</Link>
                      <p className="text-xs text-brand-taupe mt-0.5">{item.category}</p>
                      <p className="font-sans text-sm font-medium text-brand-brown mt-2">₹{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-brand-sand rounded-sm">
                          <button className="p-1.5 text-brand-warm hover:text-brand-gold transition-colors"><Minus size={12} /></button>
                          <span className="w-7 text-center text-xs font-medium">1</span>
                          <button className="p-1.5 text-brand-warm hover:text-brand-gold transition-colors"><Plus size={12} /></button>
                        </div>
                        <button className="text-brand-taupe hover:text-brand-rose transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-brand-cream rounded-sm">
                <div className="flex justify-between text-sm text-brand-warm mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-warm mb-4">
                  <span>Shipping</span>
                  <span>{subtotal >= 500 ? "Free" : "₹80"}</span>
                </div>
                <div className="border-t border-brand-sand/40 pt-3 flex justify-between">
                  <span className="font-serif text-lg text-brand-brown">Total</span>
                  <span className="font-serif text-lg text-brand-brown">₹{(subtotal + (subtotal >= 500 ? 0 : 80)).toLocaleString()}</span>
                </div>
                <button className="brand-btn-primary w-full mt-6">Proceed to Checkout</button>
                <Link to="/shop" className="block text-center text-sm text-brand-gold mt-3 hover:text-brand-warm transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}

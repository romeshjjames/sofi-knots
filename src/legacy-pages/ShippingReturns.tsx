import { Truck, Package, RotateCcw, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ShippingReturns() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container max-w-3xl">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Policies</p>
            <h2 className="brand-heading">Shipping & Returns</h2>
            <div className="brand-divider mt-4" />
          </div>

          {/* Shipping highlights */}
          <div className="scroll-reveal grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
            {[
              { icon: Truck, label: "Free shipping on orders above ₹500" },
              { icon: Clock, label: "Processing time: 2–3 business days" },
              { icon: Package, label: "Eco-friendly premium packaging" },
              { icon: RotateCcw, label: "7-day return window" },
            ].map((item, i) => (
              <div key={i} className="text-center p-5 bg-brand-cream rounded-sm">
                <item.icon size={22} className="mx-auto text-brand-gold mb-2" />
                <p className="text-xs text-brand-warm leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="scroll-reveal space-y-10">
            <div>
              <h3 className="font-serif text-2xl text-brand-brown mb-4">Shipping Information</h3>
              <div className="space-y-3 text-sm text-brand-warm leading-relaxed">
                <p>We currently ship across India through trusted courier partners. Orders are processed within 2–3 business days after confirmation.</p>
                <p><strong className="text-brand-brown font-medium">Standard delivery:</strong> 5–7 business days from dispatch.</p>
                <p><strong className="text-brand-brown font-medium">Express delivery:</strong> 2–3 business days (available for select pin codes at an additional charge).</p>
                <p>Free shipping on all orders above ₹500. For orders below ₹500, a flat shipping fee of ₹80 applies.</p>
                <p>You'll receive a tracking number via email and WhatsApp once your order is shipped.</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl text-brand-brown mb-4">Returns & Exchanges</h3>
              <div className="space-y-3 text-sm text-brand-warm leading-relaxed">
                <p>We want you to love your Sofi Knots piece. If you're not completely satisfied, we accept returns within 7 days of delivery.</p>
                <p><strong className="text-brand-brown font-medium">Conditions:</strong> Items must be unused, in original packaging, and in the same condition as received.</p>
                <p><strong className="text-brand-brown font-medium">Custom orders:</strong> Custom and personalized items are non-refundable.</p>
                <p><strong className="text-brand-brown font-medium">Process:</strong> Contact us via email or WhatsApp to initiate a return. We'll provide a return shipping label and process your refund within 5–7 business days of receiving the item.</p>
                <p>Exchanges are subject to availability. If the requested item is out of stock, a full refund will be issued.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

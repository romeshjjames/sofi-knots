import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function TermsConditions() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container max-w-3xl">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Legal</p>
            <h2 className="brand-heading">Terms & Conditions</h2>
            <div className="brand-divider mt-4" />
          </div>

          <div className="scroll-reveal prose-sm space-y-8">
            {[
              { title: "General Terms", body: "By accessing and placing an order with Sofi Knots, you confirm that you are in agreement with and bound by these terms and conditions. These terms apply to the entire website and any communication between you and Sofi Knots." },
              { title: "Products & Pricing", body: "All products are handmade and may have slight variations in color, texture, and size — this is a hallmark of artisan craftsmanship. Prices are listed in Indian Rupees (INR) and are subject to change without notice." },
              { title: "Orders & Payment", body: "Once an order is placed, you will receive an email confirmation. We accept payments through UPI, bank transfer, and major debit/credit cards. Orders are processed within 2-3 business days." },
              { title: "Intellectual Property", body: "All content on this website, including designs, photographs, text, and logos, is the intellectual property of Sofi Knots. Reproduction without written permission is prohibited." },
              { title: "Limitation of Liability", body: "Sofi Knots shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our liability is limited to the purchase price of the product." },
              { title: "Governing Law", body: "These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in Jaipur, Rajasthan." },
            ].map((section, i) => (
              <div key={i}>
                <h3 className="font-serif text-xl text-brand-brown mb-2">{section.title}</h3>
                <p className="text-sm text-brand-warm leading-relaxed">{section.body}</p>
              </div>
            ))}
            <p className="text-xs text-brand-taupe pt-4 border-t border-brand-sand/40">Last updated: March 2026</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

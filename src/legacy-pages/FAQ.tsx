import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const faqs = [
  { q: "How long does it take to make a macrame piece?", a: "Depending on the complexity, each piece takes anywhere from 4 hours to several days. Our larger wall hangings and bags require the most time and attention." },
  { q: "What materials do you use?", a: "We use 100% natural cotton cord, sustainably sourced wooden beads and dowels, and eco-friendly dyes. All materials are carefully chosen for durability and beauty." },
  { q: "Can I place a custom order?", a: "Absolutely! We love creating custom pieces. Reach out to us via the Contact page or WhatsApp with your ideas, preferred colors, and dimensions." },
  { q: "Do you offer gift wrapping?", a: "Yes! Every order comes in our signature eco-friendly packaging. For special occasions, we offer premium gift wrapping with a handwritten note." },
  { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for unused items in original packaging. Custom orders are non-refundable. Please visit our Shipping & Returns page for details." },
  { q: "Do you ship internationally?", a: "Currently, we ship across India. International shipping is coming soon! Follow us on Instagram to stay updated." },
  { q: "How do I care for my macrame piece?", a: "Gently spot-clean with mild soap and water. For wall hangings, a soft brush helps remove dust. Avoid prolonged exposure to direct sunlight to preserve colors." },
  { q: "Are your products suitable as gifts?", a: "Our pieces make wonderful gifts for housewarmings, weddings, baby showers, and birthdays. Many customers choose our keychains and car charms as thoughtful everyday gifts." },
];

export default function FAQ() {
  const ref = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container max-w-3xl">
          <div className="scroll-reveal text-center mb-14">
            <p className="brand-label mb-3">Common Questions</p>
            <h2 className="brand-heading">Frequently Asked Questions</h2>
            <div className="brand-divider mt-4" />
          </div>

          <div className="scroll-reveal space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-brand-sand/50 rounded-sm overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-cream/50 transition-colors"
                >
                  <span className="font-serif text-base text-brand-brown pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brand-gold transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === i ? "200px" : "0" }}
                >
                  <p className="px-5 pb-5 text-sm text-brand-warm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

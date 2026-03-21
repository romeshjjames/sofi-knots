import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ContactUs() {
  const ref = useScrollReveal();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container">
          <div className="scroll-reveal text-center max-w-xl mx-auto mb-14">
            <p className="brand-label mb-3">We'd Love to Hear from You</p>
            <h2 className="brand-heading">Get in Touch</h2>
            <div className="brand-divider mt-4 mb-4" />
            <p className="text-brand-warm text-sm">
              Have a question, custom order request, or just want to say hello? Drop us a message and we'll get back to you soon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3 scroll-reveal-left">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-cream flex items-center justify-center mb-4">
                    <Send size={24} className="text-brand-gold" />
                  </div>
                  <h3 className="font-serif text-2xl text-brand-brown mb-2">Message Sent!</h3>
                  <p className="text-brand-warm text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input type="text" placeholder="Your Name" className="brand-input" required />
                    <input type="email" placeholder="Email Address" className="brand-input" required />
                  </div>
                  <input type="text" placeholder="Subject" className="brand-input" />
                  <textarea placeholder="Your Message" rows={6} className="brand-input resize-none" required />
                  <button type="submit" className="brand-btn-primary">
                    Send Message <Send size={14} className="ml-2" />
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-2 scroll-reveal-right">
              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Email", value: "hello@sofiknots.com" },
                  { icon: Phone, label: "Phone / WhatsApp", value: "+91 98765 43210" },
                  { icon: MapPin, label: "Based in", value: "Jaipur, Rajasthan, India" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-brand-cream flex items-center justify-center">
                      <item.icon size={18} className="text-brand-gold" />
                    </div>
                    <div>
                      <p className="brand-label mb-1">{item.label}</p>
                      <p className="text-sm text-brand-brown">{item.value}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 border-t border-brand-sand/40">
                  <p className="brand-label mb-3">Follow Us</p>
                  <div className="flex gap-3">
                    {["Instagram", "Facebook", "Pinterest"].map((s) => (
                      <a key={s} href="#" className="text-sm text-brand-warm hover:text-brand-gold transition-colors">{s}</a>
                    ))}
                  </div>
                </div>

                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-btn-primary block text-center w-full"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

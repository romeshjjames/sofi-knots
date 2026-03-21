import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function PrivacyPolicy() {
  const ref = useScrollReveal();

  return (
    <div ref={ref}>
      <Navbar />
      <section className="brand-section">
        <div className="brand-container max-w-3xl">
          <div className="scroll-reveal text-center mb-12">
            <p className="brand-label mb-3">Legal</p>
            <h2 className="brand-heading">Privacy Policy</h2>
            <div className="brand-divider mt-4" />
          </div>

          <div className="scroll-reveal prose-sm space-y-8">
            {[
              { title: "Information We Collect", body: "We collect personal information you provide when placing an order, including your name, email address, shipping address, and phone number. We also collect browsing data through cookies to improve your shopping experience." },
              { title: "How We Use Your Information", body: "Your information is used to process orders, communicate about your purchases, send promotional emails (with your consent), and improve our website and services. We never sell your personal data to third parties." },
              { title: "Data Security", body: "We implement industry-standard security measures to protect your personal information. All payment transactions are processed through secure encrypted channels." },
              { title: "Cookies", body: "Our website uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage cookie preferences through your browser settings." },
              { title: "Your Rights", body: "You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time by clicking the unsubscribe link in our emails." },
              { title: "Contact Us", body: "If you have questions about this privacy policy, please contact us at hello@sofiknots.com or through our Contact page." },
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

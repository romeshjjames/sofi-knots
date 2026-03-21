type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-brand-sand/30 bg-brand-cream">
      <div className="brand-container py-16 text-center sm:py-20 lg:py-24">
        <p className="brand-label mb-4">{eyebrow}</p>
        <h1 className="brand-heading mb-4">{title}</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-warm sm:text-lg">{description}</p>
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  label: string;
  title: string;
  centered?: boolean;
};

export function SectionHeading({ label, title, centered = false }: SectionHeadingProps) {
  return (
    <div className={centered ? "mb-10 text-center" : "mb-10"}>
      <p className="brand-label mb-3">{label}</p>
      <h2 className="brand-heading">{title}</h2>
    </div>
  );
}

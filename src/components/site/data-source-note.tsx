type DataSourceNoteProps = {
  source: "supabase" | "fallback";
  error?: string;
};

export function DataSourceNote({ source, error }: DataSourceNoteProps) {
  if (source === "supabase") {
    return null;
  }

  return (
    <div className="brand-container pt-6">
      <div className="rounded-sm border border-brand-sand/40 bg-brand-cream px-4 py-3 text-sm text-brand-warm">
        Showing starter catalog content because Supabase tables are not populated yet.
        {error ? ` (${error})` : ""}
      </div>
    </div>
  );
}

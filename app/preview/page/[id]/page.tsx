import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyPreviewToken } from "@/lib/preview";

export default async function PreviewPageRoute({ params, searchParams }: { params: { id: string }; searchParams: { token?: string } }) {
  if (!searchParams.token || !verifyPreviewToken("page", params.id, searchParams.token)) {
    notFound();
  }

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("pages")
    .select("title, excerpt, body")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Draft Preview" title={data.title} description={data.excerpt || "Previewing unpublished page content."} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <CmsPageRenderer bodyText={JSON.stringify(data.body ?? [], null, 2)} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { verifyPreviewToken } from "@/lib/preview";

export default async function PreviewPostRoute({ params, searchParams }: { params: { id: string }; searchParams: { token?: string } }) {
  if (!searchParams.token || !verifyPreviewToken("post", params.id, searchParams.token)) {
    notFound();
  }

  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body, cover_image_url, author_name")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Draft Preview" title={data.title} description={data.excerpt || "Previewing unpublished post content."} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          {data.cover_image_url ? <img src={data.cover_image_url} alt={data.title} className="mb-8 w-full rounded-[28px] object-cover" /> : null}
          {data.author_name ? <p className="mb-6 text-sm uppercase tracking-[0.16em] text-brand-gold">By {data.author_name}</p> : null}
          <CmsPageRenderer bodyText={JSON.stringify(data.body ?? [], null, 2)} />
        </div>
      </section>
      <Footer />
    </div>
  );
}

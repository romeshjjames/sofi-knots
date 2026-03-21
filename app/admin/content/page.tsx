import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { HomepageSectionsManager } from "@/components/admin/homepage-sections-manager";
import { defaultHomepageSections, getBlogPosts, getHomepageMerchandising, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminContentPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts, homepageMerchandising] = await Promise.all([getPages(), getBlogPosts(), getHomepageMerchandising()]);

  return (
    <AdminShell
      active="content"
      eyebrow="Content studio"
      title="Pages, Blog, and Homepage Sections"
      description="Manage landing pages, FAQs, policy content, editorial stories, and homepage storytelling blocks from one publishing workspace."
      stats={[
        { label: "Pages", value: `${pages.length}`, hint: "Standalone pages currently stored in Supabase." },
        { label: "Blog posts", value: `${posts.length}`, hint: "Editorial posts available in the content library." },
      ]}
    >
      <AdminPanel
        title="Publishing map"
        description="Use these slugs to drive live storefront routes directly from the content studio."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["home", "Homepage content override"],
            ["collections", "Collections landing intro"],
            ["collection-your-collection-slug", "Individual collection landing page"],
            ["about / contact / faq / shipping / terms / privacy", "Managed static pages with CMS override"],
          ].map(([slug, description]) => (
            <div key={slug} className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Slug pattern</div>
              <div className="mt-2 font-medium text-brand-brown">{slug}</div>
              <div className="mt-2 text-sm text-brand-warm">{description}</div>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Homepage layout" description="Reorder homepage storytelling sections so campaign priorities can shift without another code change.">
        <HomepageSectionsManager
          sections={defaultHomepageSections}
          initialSectionOrder={homepageMerchandising.sectionOrder}
          updatedAt={homepageMerchandising.updatedAt}
        />
      </AdminPanel>

      <AdminPanel title="Content studio" description="Create and edit pages or blog posts with structured JSON blocks, SEO fields, publishing status, and canonical targets.">
        <ContentStudio pages={pages} posts={posts} />
      </AdminPanel>
    </AdminShell>
  );
}

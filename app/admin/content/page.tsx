import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ContentStudio } from "@/components/admin/content-studio";
import { getBlogPosts, getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminContentPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const [pages, posts] = await Promise.all([getPages(), getBlogPosts()]);

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
      <AdminPanel title="Content studio" description="Create and edit pages or blog posts with structured JSON blocks, SEO fields, publishing status, and canonical targets.">
        <ContentStudio pages={pages} posts={posts} />
      </AdminPanel>
    </AdminShell>
  );
}

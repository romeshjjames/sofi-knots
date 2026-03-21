import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getCatalogBlogPosts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

async function getPostBySlug(slug: string) {
  const result = await getCatalogBlogPosts();
  return result.data.find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return buildMetadata({
      title: "Blog Post Not Found",
      description: "The requested article could not be found.",
      path: `/blog/${params.slug}`,
    });
  }

  return buildMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    keywords: post.seoKeywords,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <article className="brand-section">
        <div className="brand-container max-w-3xl">
          <p className="brand-label mb-4">{post.category}</p>
          <h1 className="brand-heading mb-4">{post.title}</h1>
          <p className="mb-8 text-sm text-brand-taupe">
            {post.publishedAt} · {post.readTime}
          </p>
          <div className="space-y-6 text-base leading-relaxed text-brand-warm">
            <p>{post.excerpt}</p>
            <p>
              This article route is ready for CMS-backed blog content. The next step is replacing this placeholder body with rich text from Supabase while preserving unique metadata and internal linking.
            </p>
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}

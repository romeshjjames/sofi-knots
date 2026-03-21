import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getCatalogBlogPostBySlug } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

async function getPostBySlug(slug: string) {
  const result = await getCatalogBlogPostBySlug(slug);
  return result.data;
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
          <p className="mb-4 text-sm text-brand-taupe">
            {post.publishedAt} | {post.readTime}
          </p>
          {post.authorName ? <p className="mb-6 text-sm uppercase tracking-[0.16em] text-brand-gold">By {post.authorName}</p> : null}
          {post.coverImageUrl ? <img src={post.coverImageUrl} alt={post.title} className="mb-8 w-full rounded-[28px] object-cover" /> : null}
          <div className="space-y-6 text-base leading-relaxed text-brand-warm">
            <p>{post.excerpt}</p>
            <CmsPageRenderer bodyText={JSON.stringify(post.body ?? [], null, 2)} />
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
}

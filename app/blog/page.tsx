import type { Metadata } from "next";
import Link from "next/link";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogBlogPosts, getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const pageResult = await getCatalogPageBySlug("blog");
  const page = pageResult.data;

  return buildStorefrontMetadata({
    title: page?.seoTitle || "Sofi Knots Blog",
    description: page?.seoDescription || "Read Sofi Knots blog content focused on styling tips, gifting guides, and handmade product care for SEO growth.",
    path: "/blog",
    keywords: page?.seoKeywords || ["macrame blog", "boho decor tips", "handmade gift guide"],
  });
}

export default async function BlogPage() {
  const [result, pageResult] = await Promise.all([getCatalogBlogPosts(), getCatalogPageBySlug("blog")]);
  const page = pageResult.data;

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Content Marketing"
        title={page?.title || "Blog Content for SEO Growth"}
        description={page?.excerpt || "Editorial pages help Sofi Knots target informational search queries, build internal links, and support on-page keyword coverage beyond product pages."}
      />
      {page ? (
        <section className="brand-section pb-0">
          <div className="brand-container max-w-5xl">
            <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
          </div>
        </section>
      ) : null}
      <section className="brand-section">
        <div className="brand-container grid gap-6 lg:grid-cols-3">
          {result.data.map((post) => (
            <article key={post.slug} className="overflow-hidden rounded-[28px] bg-brand-cream">
              {post.coverImageUrl ? <img src={post.coverImageUrl} alt={post.title} className="aspect-[16/10] w-full object-cover" /> : null}
              <div className="p-8">
                <p className="brand-label mb-3">{post.category}</p>
                <h2 className="mb-3 font-serif text-3xl text-brand-brown">{post.title}</h2>
                <p className="mb-4 text-sm text-brand-taupe">
                  {post.publishedAt} | {post.readTime}
                </p>
                <p className="mb-6 text-sm leading-relaxed text-brand-warm">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-brand-gold">
                  Read article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}

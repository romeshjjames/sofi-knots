import type { Metadata } from "next";
import Link from "next/link";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogBlogPosts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sofi Knots Blog",
  description: "Read Sofi Knots blog content focused on styling tips, gifting guides, and handmade product care for SEO growth.",
  path: "/blog",
  keywords: ["macrame blog", "boho decor tips", "handmade gift guide"],
});

export default async function BlogPage() {
  const result = await getCatalogBlogPosts();

  return (
    <div>
      <Navbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Content Marketing"
        title="Blog Content for SEO Growth"
        description="Editorial pages help Sofi Knots target informational search queries, build internal links, and support on-page keyword coverage beyond product pages."
      />
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
      <Footer />
    </div>
  );
}

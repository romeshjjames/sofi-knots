"use client";

import Link from "next/link";
import { ExternalLink, FileText, Package, Search, Sparkles } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { PageRecord } from "@/lib/admin-data";
import { coreStorefrontRoutes } from "@/lib/storefront-page-templates";

const routeOwners: Record<string, { primary: string; secondary?: string }> = {
  "/": { primary: "Pages", secondary: "Settings" },
  "/shop": { primary: "Pages", secondary: "Products" },
  "/collections": { primary: "Pages", secondary: "Collections" },
  "/blog": { primary: "Pages", secondary: "Blog" },
  "/about": { primary: "Pages" },
  "/contact": { primary: "Pages", secondary: "Settings" },
  "/faq": { primary: "Pages" },
  "/privacy": { primary: "Pages", secondary: "Settings" },
  "/shipping": { primary: "Pages", secondary: "Settings" },
  "/terms": { primary: "Pages", secondary: "Settings" },
  "/product/[slug]": { primary: "Products", secondary: "Reviews" },
  "/collections/[slug]": { primary: "Collections", secondary: "Pages" },
  "/blog/[slug]": { primary: "Blog" },
  "/cart": { primary: "Products", secondary: "Settings" },
  "/wishlist": { primary: "Products" },
};

type Props = {
  pages: PageRecord[];
};

export function StorefrontMap({ pages }: Props) {
  const corePages = coreStorefrontRoutes.map((route) => ({
    ...route,
    record: pages.find((page) => page.slug === route.slug) ?? null,
  }));

  const managedRoutes = [
    ...corePages.map((item) => ({
      route: item.route,
      label: item.label,
      status: item.record?.status ?? "missing",
      primary: routeOwners[item.route]?.primary || "Pages",
      secondary: routeOwners[item.route]?.secondary,
      href: item.record ? `/admin/pages/${item.record.id}` : "/admin/pages",
      liveHref: item.route,
    })),
    {
      route: "/product/[slug]",
      label: "Product detail pages",
      status: "managed",
      primary: routeOwners["/product/[slug]"].primary,
      secondary: routeOwners["/product/[slug]"].secondary,
      href: "/admin/products",
      liveHref: "/shop",
    },
    {
      route: "/collections/[slug]",
      label: "Collection landing pages",
      status: "managed",
      primary: routeOwners["/collections/[slug]"].primary,
      secondary: routeOwners["/collections/[slug]"].secondary,
      href: "/admin/collections",
      liveHref: "/collections",
    },
    {
      route: "/blog/[slug]",
      label: "Blog article pages",
      status: "managed",
      primary: routeOwners["/blog/[slug]"].primary,
      secondary: routeOwners["/blog/[slug]"].secondary,
      href: "/admin/blog",
      liveHref: "/blog",
    },
    {
      route: "/cart",
      label: "Cart and checkout",
      status: "managed",
      primary: routeOwners["/cart"].primary,
      secondary: routeOwners["/cart"].secondary,
      href: "/admin/settings",
      liveHref: "/cart",
    },
    {
      route: "/wishlist",
      label: "Wishlist",
      status: "managed",
      primary: routeOwners["/wishlist"].primary,
      secondary: routeOwners["/wishlist"].secondary,
      href: "/admin/products",
      liveHref: "/wishlist",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
            <FileText size={18} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900">Core pages provisioned</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Homepage, shop, collections, blog, and policy pages are now provisioned in the Pages CMS so they can be edited directly from admin.
          </p>
        </div>
        <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
            <Package size={18} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900">Commerce routes linked</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Product, collection, cart, review, and policy-linked routes now resolve from admin modules instead of relying on static storefront copy.
          </p>
        </div>
        <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700">
            <Sparkles size={18} />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900">Route ownership map</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use this map to see exactly which admin workspace controls each public route and open the right editor without guesswork.
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e7eaee] bg-white">
        <div className="border-b border-[#eef1f4] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fbfcfd] text-slate-500">
              <Search size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Storefront route coverage</p>
              <p className="text-sm text-slate-500">Page-by-page verification of what is managed from admin and where to edit it.</p>
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Managed from</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managedRoutes.map((item) => (
                <tr key={item.route} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{item.route}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{item.primary}</div>
                    {item.secondary ? <div className="mt-1 text-xs text-slate-500">Also uses {item.secondary}</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={item.status === "published" || item.status === "managed" ? "success" : item.status === "draft" ? "warning" : "danger"}>
                      {item.status}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={item.href} className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Open admin">
                        <FileText size={15} />
                      </Link>
                      <Link href={item.liveHref} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Open live route">
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

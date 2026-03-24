import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { FaqManager } from "@/components/admin/faq-manager";
import { getFaqs } from "@/lib/faqs";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminFaqPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const faqs = await getFaqs();

  return (
    <AdminShell
      active="faq"
      eyebrow="Support content"
      title="FAQ"
      description="Create, edit, order, and publish frequently asked questions from one cleaner support-content workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "FAQ" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Total FAQ", value: `${faqs.length}`, hint: "Questions currently stored in the FAQ library." },
        { label: "Active", value: `${faqs.filter((item) => item.status === "active").length}`, hint: "Questions visible on the storefront FAQ page." },
        { label: "Inactive", value: `${faqs.filter((item) => item.status === "inactive").length}`, hint: "Questions kept internally but hidden from customers." },
        {
          label: "Categories",
          value: `${new Set(faqs.map((item) => item.category)).size}`,
          hint: "Grouped FAQ topics for support and browsing.",
        },
      ]}
    >
      <AdminPanel title="FAQ library" description="Add new questions, update answers, manage ordering, and control which items are visible on the website.">
        <FaqManager faqs={faqs} />
      </AdminPanel>
    </AdminShell>
  );
}

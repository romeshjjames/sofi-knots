import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ColorSwatchesManager } from "@/components/admin/color-swatches-manager";
import { getColorSwatches } from "@/lib/color-swatches";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminColorSwatchesPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const swatches = await getColorSwatches();

  return (
    <AdminShell
      active="colorSwatches"
      eyebrow="Customization options"
      title="Color Swatches"
      description="Manage the swatches used across premium custom-order requests."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Color Swatches" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Total", value: String(swatches.length), hint: "All available swatches in the library." },
        { label: "Enabled", value: String(swatches.filter((swatch) => swatch.isEnabled).length), hint: "Visible in the custom order form." },
        { label: "Image swatches", value: String(swatches.filter((swatch) => swatch.imageUrl).length), hint: "Swatches using uploaded image previews." },
      ]}
    >
      <AdminPanel title="Color Swatches Management" description="Add, edit, enable, disable, or delete color swatches for storefront custom orders.">
        <ColorSwatchesManager initialSwatches={swatches} />
      </AdminPanel>
    </AdminShell>
  );
}

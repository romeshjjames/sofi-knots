import { AdminShell } from "@/components/admin/admin-shell";
import { MediaLibraryManager } from "@/components/admin/media-library-manager";
import { getMediaAssets } from "@/lib/media-library";

export default async function AdminMediaPage() {
  const assets = await getMediaAssets();

  return (
    <AdminShell
      active="media"
      eyebrow="Content assets"
      title="Media Library"
      description="Upload reusable images, banners, icons, and videos once, then paste their URLs into page, blog, collection, and product content."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Media Library" },
      ]}
      statsVariant="compact"
      stats={[
        {
          label: "Assets",
          value: String(assets.length),
          hint: "Reusable files currently available.",
        },
        {
          label: "Images",
          value: String(assets.filter((asset) => asset.mediaType === "image" || asset.mediaType === "banner").length),
          hint: "Page, blog, and banner visuals.",
        },
        {
          label: "Videos",
          value: String(assets.filter((asset) => asset.mediaType === "video").length),
          hint: "Video files stored in the library.",
        },
      ]}
    >
      <MediaLibraryManager initialAssets={assets} />
    </AdminShell>
  );
}

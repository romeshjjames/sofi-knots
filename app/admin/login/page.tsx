import { LoginForm } from "@/components/admin/login-form";
import { getSiteSettings } from "@/lib/admin-data";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  const settingsPromise = getSiteSettings();

  return <AdminLoginPageContent searchParams={searchParams} settingsPromise={settingsPromise} />;
}

async function AdminLoginPageContent({
  searchParams,
  settingsPromise,
}: {
  searchParams?: { next?: string; error?: string };
  settingsPromise: ReturnType<typeof getSiteSettings>;
}) {
  const settings = await settingsPromise;
  const siteName = settings.siteName || "Sofi Knots";
  const logoUrl = settings.branding.logoUrl;

  return (
    <div className="min-h-screen bg-[#f8f4ec]">
      <section className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[32px] border border-[#e5dccf] bg-white p-8 shadow-[0_24px_80px_rgba(54,41,27,0.08)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e5dccf] bg-[#fcfaf5] font-serif text-3xl text-brand-brown">
                SK
              </div>
            )}
            <p className="mt-5 font-serif text-3xl text-brand-brown">{siteName}</p>
          </div>
          <div className="mt-8">
            <LoginForm next={searchParams?.next} error={searchParams?.error} />
          </div>
        </div>
      </section>
    </div>
  );
}

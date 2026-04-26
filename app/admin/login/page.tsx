import { LoginForm } from "@/components/admin/login-form";
import { getSiteSettings } from "@/lib/admin-data";

type LoginSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

type LoginPageSettings = {
  siteName: string;
  branding: {
    logoUrl: string | null;
  };
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: LoginSearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const settingsPromise = getSiteSettings().catch(() => ({
    siteName: "Sofi Knots",
    branding: {
      logoUrl: null,
    },
  }));

  return (
    <AdminLoginPageContent
      searchParams={{
        next: getSingleParam(resolvedSearchParams?.next),
        error: getSingleParam(resolvedSearchParams?.error),
      }}
      settingsPromise={settingsPromise}
    />
  );
}

async function AdminLoginPageContent({
  searchParams,
  settingsPromise,
}: {
  searchParams?: { next?: string; error?: string };
  settingsPromise: Promise<LoginPageSettings>;
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

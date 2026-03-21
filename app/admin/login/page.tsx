import { LoginForm } from "@/components/admin/login-form";
import { PageHero } from "@/components/site/page-hero";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <PageHero
        eyebrow="Secure Access"
        title="Admin Sign In"
        description="Use a Supabase user account with an assigned admin role to access the ecommerce management dashboard."
      />
      <section className="brand-section">
        <div className="brand-container max-w-lg">
          <LoginForm next={searchParams?.next} error={searchParams?.error} />
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type BrandingState = {
  siteName: string;
  logoUrl: string | null;
};

function initialsFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SK"
  );
}

export function AdminSidebarBrand() {
  const [branding, setBranding] = useState<BrandingState>({
    siteName: "Sofi Knots",
    logoUrl: null,
  });

  useEffect(() => {
    let active = true;

    async function loadBranding() {
      const response = await fetch("/api/admin/settings/site");
      const body = await response.json();
      if (!response.ok || !active) return;
      setBranding({
        siteName: body.settings?.siteName || "Sofi Knots",
        logoUrl: body.settings?.logoUrl || null,
      });
    }

    void loadBranding();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#e8ddcf] bg-[#fffaf2] text-white shadow-[0_10px_24px_rgba(49,36,23,0.06)]">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.siteName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-[#1f2933]">{initialsFromName(branding.siteName)}</span>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{branding.siteName}</p>
        <p className="font-serif text-2xl text-slate-900">Admin</p>
      </div>
    </>
  );
}

export function AdminHeaderProfile() {
  const [branding, setBranding] = useState<BrandingState>({
    siteName: "Sofi Knots",
    logoUrl: null,
  });

  useEffect(() => {
    let active = true;

    async function loadBranding() {
      const response = await fetch("/api/admin/settings/site");
      const body = await response.json();
      if (!response.ok || !active) return;
      setBranding({
        siteName: body.settings?.siteName || "Sofi Knots",
        logoUrl: body.settings?.logoUrl || null,
      });
    }

    void loadBranding();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-full border border-[#e6ddcf] bg-white px-3 py-2.5 shadow-[0_10px_24px_rgba(49,36,23,0.06)]">
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#eadfce] bg-[#fffaf2] text-sm font-medium text-[#1f2933]">
        {branding.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.siteName} className="h-full w-full object-cover" />
        ) : (
          initialsFromName(branding.siteName)
        )}
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-slate-900">{branding.siteName} Admin</p>
        <p className="text-xs text-slate-500">Store manager</p>
      </div>
    </div>
  );
}

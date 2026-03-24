"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";

type AccountOrder = {
  id: string;
  orderNumber: string;
  totalInr: number;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};

type AccountPayload = {
  customer: {
    id?: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    createdAt?: string;
    isActive?: boolean;
  };
  orders: AccountOrder[];
};

export function CustomerAccountPanel() {
  const { customer, loading, logout, refreshSession } = useCustomerAuth();
  const [data, setData] = useState<AccountPayload | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "" });

  useEffect(() => {
    if (!customer) return;
    void (async () => {
      const response = await fetch("/api/customer/account", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Unable to load account.");
        return;
      }
      setData(body);
      setProfileForm({
        fullName: body.customer.fullName || customer.fullName,
        phone: body.customer.phone || customer.phone || "",
      });
    })();
  }, [customer]);

  function saveProfile() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/customer/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Unable to update profile.");
        return;
      }
      await refreshSession();
      setData((current) =>
        current
          ? {
              ...current,
              customer: {
                ...current.customer,
                fullName: profileForm.fullName,
                phone: profileForm.phone || null,
              },
            }
          : current,
      );
      setIsEditing(false);
      setMessage("Profile updated successfully.");
    });
  }

  if (loading) {
    return <div className="rounded-sm border border-brand-sand/40 p-8 text-sm text-brand-warm">Loading account...</div>;
  }

  if (!customer) {
    return (
      <div className="rounded-sm border border-brand-sand/40 p-8 text-sm text-brand-warm">
        Please <Link href="/account/login" className="font-medium text-brand-brown hover:underline">log in</Link> to view your account.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-[28px] border border-brand-sand/35 bg-white p-8">
        <p className="brand-label mb-3">Customer profile</p>
        <h1 className="brand-heading mb-4 text-[clamp(2rem,4vw,3.2rem)]">Hello, {data?.customer.fullName || customer.fullName}</h1>
        <div className="space-y-4 text-sm text-brand-warm">
          <p>Email: <span className="text-brand-brown">{data?.customer.email || customer.email}</span></p>
          {isEditing ? (
            <div className="space-y-3">
              <input
                className="brand-input"
                placeholder="Full name"
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
              />
              <input
                className="brand-input"
                placeholder="Phone number"
                value={profileForm.phone}
                onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </div>
          ) : (
            <p>Phone: <span className="text-brand-brown">{data?.customer.phone || customer.phone || "Not added yet"}</span></p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {isEditing ? (
            <>
              <button type="button" className="brand-btn-primary" disabled={isPending} onClick={saveProfile}>
                {isPending ? "Saving..." : "Save profile"}
              </button>
              <button type="button" className="brand-btn-outline" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="brand-btn-outline" onClick={() => setIsEditing(true)}>
              Edit profile
            </button>
          )}
          <button
            type="button"
            className="brand-btn-outline"
            onClick={() =>
              startTransition(async () => {
                await logout();
                window.location.href = "/";
              })
            }
          >
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-brand-sand/35 bg-white p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="brand-label mb-2">Orders</p>
            <h2 className="font-serif text-3xl text-brand-brown">Your order history</h2>
          </div>
          <Link href="/shop" className="brand-btn-outline">
            Continue shopping
          </Link>
        </div>
        {message ? <p className="mb-4 text-sm text-brand-warm">{message}</p> : null}
        {data?.orders?.length ? (
          <div className="space-y-4">
            {data.orders.map((order) => (
              <div key={order.id} className="rounded-sm border border-brand-sand/30 bg-brand-cream px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-brand-brown">{order.orderNumber}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <p className="text-sm font-medium text-brand-brown">Rs. {order.totalInr.toLocaleString("en-IN")}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-brand-taupe">
                  <span>{order.status}</span>
                  <span>{order.paymentStatus}</span>
                  <span>{order.fulfillmentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-sm bg-brand-cream px-6 py-10 text-center text-sm text-brand-warm">
            No orders yet. Your future orders will appear here automatically.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CustomerIdentity = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive?: boolean;
} | null;

type CustomerAuthContextValue = {
  customer: CustomerIdentity;
  customerId: string | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerIdentity>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    setLoading(true);
    try {
      const response = await fetch("/api/customer/session", { cache: "no-store" });
      const body = await response.json();
      if (response.ok) {
        setCustomer(body.customer ?? null);
        setCustomerId(body.customerId ?? null);
      } else {
        setCustomer(null);
        setCustomerId(null);
      }
    } catch {
      setCustomer(null);
      setCustomerId(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/customer/logout", { method: "POST" });
    setCustomer(null);
    setCustomerId(null);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      customerId,
      loading,
      refreshSession,
      logout,
    }),
    [customer, customerId, loading],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const value = useContext(CustomerAuthContext);
  if (!value) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return value;
}

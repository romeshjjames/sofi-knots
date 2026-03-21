"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getAnalyticsSessionId, getStoredAttribution, trackAnalyticsEvent } from "@/lib/analytics";
import type { Product } from "@/types/commerce";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type CartCheckoutProps = {
  products: Product[];
  razorpayKeyId?: string;
};

type CartItem = {
  productId: string;
  quantity: number;
};

const SHIPPING_CHARGE = 120;

async function loadRazorpayScript() {
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CartCheckout({ products, razorpayKeyId }: CartCheckoutProps) {
  const [cart, setCart] = useState<CartItem[]>(
    products.slice(0, 2).map((product, index) => ({
      productId: product.id,
      quantity: index === 0 ? 1 : 0,
    })),
  );
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedItems = useMemo(
    () =>
      cart
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          ...item,
          product: products.find((product) => product.id === item.productId),
        }))
        .filter((item) => item.product),
    [cart, products],
  );

  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 1999 || subtotal === 0 ? 0 : SHIPPING_CHARGE;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!selectedItems.length) return;
    void trackAnalyticsEvent({
      eventName: "cart_view",
      path: "/cart",
      metadata: {
        items: selectedItems.map((item) => ({
          productId: item.product?.id,
          productName: item.product?.name,
          quantity: item.quantity,
        })),
        subtotal,
        total,
      },
    });
  }, [selectedItems, subtotal, total]);

  async function handleCheckout() {
    setMessage(null);

    if (!selectedItems.length) {
      setMessage("Select at least one product before checkout.");
      return;
    }

    if (!customer.fullName || !customer.email || !customer.line1 || !customer.city || !customer.state || !customer.postal_code) {
      setMessage("Complete the customer and shipping details before checkout.");
      return;
    }

    startTransition(async () => {
      await trackAnalyticsEvent({
        eventName: "checkout_submitted",
        path: "/cart",
        metadata: {
          itemCount: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          total,
        },
      });

      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analytics: {
            sessionId: getAnalyticsSessionId(),
            attribution: getStoredAttribution(),
          },
          customer: {
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
          },
          shippingAddress: {
            ...customer,
            name: customer.fullName,
          },
          billingAddress: {
            ...customer,
            name: customer.fullName,
          },
          items: selectedItems.map((item) => ({
            productId: item.product!.id,
            quantity: item.quantity,
          })),
          notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Failed to create order.");
        return;
      }

      if (!razorpayKeyId) {
        setMessage(`Order ${payload.localOrder.orderNumber} created. Add RAZORPAY_KEY_ID to enable the Razorpay popup.`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setMessage("Unable to load Razorpay Checkout.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: payload.razorpayOrder.amount,
        currency: payload.razorpayOrder.currency,
        order_id: payload.razorpayOrder.id,
        name: "Sofi Knots",
        description: `Order ${payload.localOrder.orderNumber}`,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone,
        },
        notes: payload.razorpayOrder.notes,
        handler: async (responsePayload: Record<string, string>) => {
          const verifyResponse = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(responsePayload),
          });
          const verifyBody = await verifyResponse.json();

          if (!verifyResponse.ok) {
            await trackAnalyticsEvent({
              eventName: "payment_verification_failed",
              path: "/cart",
              metadata: {
                localOrderId: payload.localOrder.id,
                razorpayOrderId: payload.razorpayOrder.id,
              },
            });
            setMessage(verifyBody.error || "Payment verification failed.");
            return;
          }

          await trackAnalyticsEvent({
            eventName: "payment_verified",
            path: "/cart",
            metadata: {
              localOrderId: payload.localOrder.id,
              localOrderNumber: payload.localOrder.orderNumber,
              razorpayOrderId: payload.razorpayOrder.id,
            },
          });
          setMessage(`Payment successful. Order ${verifyBody.order.order_number} is now marked as paid.`);
        },
        theme: {
          color: "#c39d63",
        },
      });

      await trackAnalyticsEvent({
        eventName: "payment_popup_opened",
        path: "/cart",
        metadata: {
          localOrderId: payload.localOrder.id,
          localOrderNumber: payload.localOrder.orderNumber,
          razorpayOrderId: payload.razorpayOrder.id,
          totalInr: payload.localOrder.totalInr,
        },
      });
      razorpay.open();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-sm border border-brand-sand/40 p-6">
          <h2 className="mb-4 font-serif text-2xl text-brand-brown">Cart Items</h2>
          <div className="space-y-4">
            {products.slice(0, 4).map((product) => {
              const item = cart.find((entry) => entry.productId === product.id) || { productId: product.id, quantity: 0 };
              return (
                <div key={product.id} className="flex items-center justify-between gap-4 border-b border-brand-sand/20 pb-4">
                  <div>
                    <div className="font-medium text-brand-brown">{product.name}</div>
                    <div className="text-sm text-brand-warm">Rs. {product.price.toLocaleString("en-IN")}</div>
                  </div>
                  <select
                    className="brand-input max-w-24"
                    value={item.quantity}
                    onChange={(event) =>
                      setCart((current) => {
                        const nextQuantity = Number(event.target.value);
                        void trackAnalyticsEvent({
                          eventName: nextQuantity > 0 ? "add_to_cart_intent" : "remove_from_cart_intent",
                          path: "/cart",
                          metadata: {
                            productId: product.id,
                            productName: product.name,
                            quantity: nextQuantity,
                            source: "cart_quantity_selector",
                          },
                        });
                        const existing = current.find((entry) => entry.productId === product.id);
                        if (existing) {
                          return current.map((entry) => (entry.productId === product.id ? { ...entry, quantity: nextQuantity } : entry));
                        }
                        return [...current, { productId: product.id, quantity: nextQuantity }];
                      })
                    }
                  >
                    {[0, 1, 2, 3].map((value) => (
                      <option key={value} value={value}>
                        Qty {value}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-sm border border-brand-sand/40 p-6">
          <h2 className="mb-4 font-serif text-2xl text-brand-brown">Customer Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="Full name" value={customer.fullName} onChange={(event) => setCustomer((current) => ({ ...current, fullName: event.target.value }))} />
            <input className="brand-input" type="email" placeholder="Email" value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} />
            <input className="brand-input" placeholder="Phone" value={customer.phone} onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))} />
            <input className="brand-input" placeholder="Address line 1" value={customer.line1} onChange={(event) => setCustomer((current) => ({ ...current, line1: event.target.value }))} />
            <input className="brand-input" placeholder="City" value={customer.city} onChange={(event) => setCustomer((current) => ({ ...current, city: event.target.value }))} />
            <input className="brand-input" placeholder="State" value={customer.state} onChange={(event) => setCustomer((current) => ({ ...current, state: event.target.value }))} />
            <input className="brand-input" placeholder="Postal code" value={customer.postal_code} onChange={(event) => setCustomer((current) => ({ ...current, postal_code: event.target.value }))} />
            <input className="brand-input" placeholder="Country" value={customer.country} onChange={(event) => setCustomer((current) => ({ ...current, country: event.target.value }))} />
          </div>
          <textarea className="brand-input mt-4 min-h-24" placeholder="Order notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </div>

      <div className="rounded-sm border border-brand-sand/40 p-6">
        <h2 className="mb-4 font-serif text-2xl text-brand-brown">Order Summary</h2>
        <div className="space-y-3 text-sm text-brand-warm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Rs. {shipping.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t border-brand-sand/30 pt-3 font-medium text-brand-brown">
            <span>Total</span>
            <span>Rs. {total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <button type="button" className="brand-btn-primary mt-6 w-full" disabled={isPending} onClick={() => void handleCheckout()}>
          {isPending ? "Processing..." : "Proceed to Razorpay"}
        </button>
        <p className="mt-3 text-xs text-brand-taupe">Orders are created in Supabase before the Razorpay popup opens, so payment updates can sync back to admin.</p>
        {message ? <p className="mt-4 text-sm text-brand-warm">{message}</p> : null}
      </div>
    </div>
  );
}

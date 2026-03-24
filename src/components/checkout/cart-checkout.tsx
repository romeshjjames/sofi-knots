"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { getAnalyticsSessionId, getStoredAttribution, hasAnalyticsConsent, trackAnalyticsEvent } from "@/lib/analytics";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cart, setItemQuantity, removeItem, clearCart } = useCart();
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
  const [autoCheckoutRequested, setAutoCheckoutRequested] = useState(false);

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

  useEffect(() => {
    if (searchParams.get("checkout") !== "1" || autoCheckoutRequested || !selectedItems.length) return;
    setAutoCheckoutRequested(true);
    const summary = document.getElementById("checkout-summary");
    summary?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [autoCheckoutRequested, searchParams, selectedItems.length]);

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
          analytics: hasAnalyticsConsent()
            ? {
                sessionId: getAnalyticsSessionId(),
                attribution: getStoredAttribution(),
              }
            : null,
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
          clearCart();
          router.replace("/cart");
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
          {selectedItems.length ? (
            <div className="space-y-4">
              {selectedItems.map((item) => (
                <div key={item.product!.id} className="flex flex-col gap-4 border-b border-brand-sand/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-sm bg-brand-cream">
                      {item.product?.featuredImageUrl ? (
                        <img src={item.product.featuredImageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-center text-[10px] uppercase tracking-[0.2em] text-brand-taupe">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <Link href={`/product/${item.product!.slug}`} className="font-medium text-brand-brown transition-colors hover:text-brand-gold">
                        {item.product!.name}
                      </Link>
                      <div className="mt-1 text-sm text-brand-taupe">{item.product!.category}</div>
                      <div className="mt-1 text-sm text-brand-warm">Rs. {item.product!.price.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <select
                      className="brand-input max-w-24"
                      value={item.quantity}
                      onChange={(event) => {
                        const nextQuantity = Number(event.target.value);
                        void trackAnalyticsEvent({
                          eventName: nextQuantity > 0 ? "add_to_cart_intent" : "remove_from_cart_intent",
                          path: "/cart",
                          metadata: {
                            productId: item.product!.id,
                            productName: item.product!.name,
                            quantity: nextQuantity,
                            source: "cart_quantity_selector",
                          },
                        });
                        setItemQuantity(item.product!.id, nextQuantity);
                      }}
                    >
                      {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
                        <option key={value} value={value}>
                          Qty {value}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                      aria-label={`Remove ${item.product!.name} from cart`}
                      onClick={() => {
                        void trackAnalyticsEvent({
                          eventName: "remove_from_cart_intent",
                          path: "/cart",
                          metadata: {
                            productId: item.product!.id,
                            productName: item.product!.name,
                            quantity: 0,
                            source: "cart_remove_button",
                          },
                        });
                        removeItem(item.product!.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-sm bg-brand-cream px-6 py-10 text-center">
              <p className="brand-label mb-3">Your cart is empty</p>
              <p className="mx-auto max-w-md text-sm leading-7 text-brand-warm">
                Add products from the shop or any product page to begin checkout.
              </p>
              <Link href="/shop" className="brand-btn-primary mt-6 inline-flex">
                Continue shopping
              </Link>
            </div>
          )}
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

      <div id="checkout-summary" className="rounded-sm border border-brand-sand/40 p-6">
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
        <button type="button" className="brand-btn-primary mt-6 w-full" disabled={isPending || !selectedItems.length} onClick={() => void handleCheckout()}>
          {isPending ? "Processing..." : "Proceed to Checkout"}
        </button>
        <p className="mt-3 text-xs text-brand-taupe">
          Orders are created in Supabase first, then secure Razorpay checkout opens so payment and admin status stay in sync.
        </p>
        {message ? <p className="mt-4 text-sm text-brand-warm">{message}</p> : null}
      </div>
    </div>
  );
}

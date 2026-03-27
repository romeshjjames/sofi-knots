"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";

type ColorSwatch = {
  id: string;
  name: string;
  hex: string | null;
  imageUrl: string | null;
};

type CustomOrderModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
};

type DraftState = {
  customerName: string;
  email: string;
  phone: string;
  colorId: string;
  message: string;
};

const FILE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getDraftKey(productId: string) {
  return `sofi-knots-custom-order:${productId}`;
}

export function CustomOrderModal({ open, onClose, productId, productName, productImageUrl }: CustomOrderModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { customer } = useCustomerAuth();
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [loadingColors, setLoadingColors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState>({
    customerName: "",
    email: "",
    phone: "",
    colorId: "",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setLoadingColors(true);
    void fetch("/api/color-swatches", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => setColors(Array.isArray(body.colors) ? body.colors : []))
      .catch(() => setColors([]))
      .finally(() => setLoadingColors(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const stored = window.localStorage.getItem(getDraftKey(productId));
    const parsed = stored ? (JSON.parse(stored) as Partial<DraftState>) : null;

    setDraft({
      customerName: parsed?.customerName || customer?.fullName || "",
      email: parsed?.email || customer?.email || "",
      phone: parsed?.phone || customer?.phone || "",
      colorId: parsed?.colorId || "",
      message: parsed?.message || "",
    });
    setFiles([]);
    setPreviews([]);
    setErrors({});
    setNotice(null);
  }, [customer, open, productId]);

  useEffect(() => {
    if (!open) return;
    window.localStorage.setItem(getDraftKey(productId), JSON.stringify(draft));
  }, [draft, open, productId]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const selectedColor = useMemo(
    () => colors.find((color) => color.id === draft.colorId) ?? null,
    [colors, draft.colorId],
  );

  function updateField(field: keyof DraftState, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles?.length) return;
    const validFiles = Array.from(nextFiles).filter((file) => FILE_TYPES.has(file.type));
    if (!validFiles.length) {
      setErrors((current) => ({ ...current, files: "Only JPG, PNG, and WEBP files are allowed." }));
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      delete next.files;
      return next;
    });

    setFiles((current) => [...current, ...validFiles]);
    setPreviews((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviews((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
  }

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.customerName.trim()) nextErrors.customerName = "Name is required.";
    if (!draft.email.trim()) nextErrors.email = "Email is required.";
    if (!draft.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!draft.colorId.trim()) nextErrors.colorId = "Please select a color.";
    if (!draft.message.trim()) nextErrors.message = "Please describe your customization requirements.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (files.length) {
        setUploading(true);
        const uploadFormData = new FormData();
        files.forEach((file) => uploadFormData.append("files", file));
        const uploadResponse = await fetch("/api/custom-orders/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadBody = await uploadResponse.json();
        setUploading(false);

        if (!uploadResponse.ok) {
          setErrors((current) => ({ ...current, files: uploadBody.error || "Image upload failed." }));
          setSubmitting(false);
          return;
        }

        imageUrls = Array.isArray(uploadBody.imageUrls) ? uploadBody.imageUrls : [];
      }

      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          product_name: productName,
          customer_name: draft.customerName,
          email: draft.email,
          phone: draft.phone,
          color_id: draft.colorId,
          message: draft.message,
          image_urls: imageUrls,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        setNotice(body.error || "Failed to submit custom order request.");
        setSubmitting(false);
        return;
      }

      window.localStorage.removeItem(getDraftKey(productId));
      setDraft({
        customerName: customer?.fullName || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        colorId: "",
        message: "",
      });
      previews.forEach((preview) => URL.revokeObjectURL(preview));
      setFiles([]);
      setPreviews([]);
      setNotice(body.message || "Your custom order request has been submitted successfully");
      setTimeout(() => onClose(), 1200);
    } catch {
      setNotice("Failed to submit custom order request.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(41,30,18,0.4)] px-4 py-8 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-[#eadcc6] bg-[#fffaf2] shadow-[0_35px_100px_rgba(49,36,23,0.28)] animate-[fade-in_180ms_ease-out]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadcc6] bg-white/85 text-brand-warm transition hover:scale-105 hover:text-brand-brown"
          aria-label="Close custom order modal"
        >
          <X size={18} />
        </button>

        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-[#eadcc6] bg-[linear-gradient(180deg,#f5ead8_0%,#f9f2e7_100%)] p-8 lg:border-b-0 lg:border-r">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.24em] text-[#b68953]">Custom Order</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-tight text-brand-brown">Request a bespoke Sofi Knots piece</h2>
            <p className="mt-4 text-sm leading-7 text-brand-warm">
              Share the finish, color, and story you want to create. Our studio will review your request and follow up with a tailored quote.
            </p>

            <div className="mt-8 rounded-[26px] border border-[#eadcc6] bg-white/90 p-5 shadow-[0_18px_35px_rgba(199,160,90,0.08)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#b68953]">Product reference</p>
              <div className="mt-4 flex items-start gap-4">
                <div className="h-24 w-24 overflow-hidden rounded-[20px] bg-brand-cream">
                  {productImageUrl ? (
                    <img src={productImageUrl} alt={productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-[9px] uppercase tracking-[0.2em] text-brand-taupe">
                      Product
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-2xl text-brand-brown">{productName}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-taupe">Product ID: {productId}</p>
                </div>
              </div>
            </div>
          </div>

          <form className="p-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="md:col-span-1">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Name</span>
                <input
                  className="h-12 w-full rounded-2xl border border-[#e7d8c1] bg-white px-4 text-sm text-brand-warm outline-none transition focus:border-[#c7a05a] focus:ring-2 focus:ring-[#f0ddba]"
                  value={draft.customerName}
                  onChange={(event) => updateField("customerName", event.target.value)}
                />
                {errors.customerName ? <p className="mt-2 text-xs text-rose-600">{errors.customerName}</p> : null}
              </label>

              <label className="md:col-span-1">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Phone</span>
                <input
                  className="h-12 w-full rounded-2xl border border-[#e7d8c1] bg-white px-4 text-sm text-brand-warm outline-none transition focus:border-[#c7a05a] focus:ring-2 focus:ring-[#f0ddba]"
                  value={draft.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
                {errors.phone ? <p className="mt-2 text-xs text-rose-600">{errors.phone}</p> : null}
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Email</span>
                <input
                  type="email"
                  className="h-12 w-full rounded-2xl border border-[#e7d8c1] bg-white px-4 text-sm text-brand-warm outline-none transition focus:border-[#c7a05a] focus:ring-2 focus:ring-[#f0ddba]"
                  value={draft.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
                {errors.email ? <p className="mt-2 text-xs text-rose-600">{errors.email}</p> : null}
              </label>

              <div className="relative md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Preferred color</span>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((value) => !value)}
                  className="flex h-12 w-full items-center justify-between rounded-2xl border border-[#e7d8c1] bg-white px-4 text-sm text-brand-warm outline-none transition hover:border-[#d8ba84] focus:border-[#c7a05a] focus:ring-2 focus:ring-[#f0ddba]"
                >
                  {selectedColor ? (
                    <span className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: selectedColor.hex }} />
                      {selectedColor.name}
                    </span>
                  ) : (
                    <span>{loadingColors ? "Loading colors..." : "Select a color"}</span>
                  )}
                  <span className="text-xs uppercase tracking-[0.18em] text-brand-taupe">{dropdownOpen ? "Close" : "Open"}</span>
                </button>
                {dropdownOpen && colors.length ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-[#e7d8c1] bg-white p-2 shadow-[0_18px_40px_rgba(49,36,23,0.12)]">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          updateField("colorId", color.id);
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-brand-warm transition hover:bg-[#f8f0e2]"
                      >
                        {color.imageUrl ? (
                          <img src={color.imageUrl} alt={color.name} className="h-5 w-5 rounded-full border border-black/10 object-cover" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex || "#f3f1ec" }} />
                        )}
                        {color.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                {errors.colorId ? <p className="mt-2 text-xs text-rose-600">{errors.colorId}</p> : null}
              </div>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Custom message</span>
                <textarea
                  rows={5}
                  placeholder="Describe your customization requirements"
                  className="min-h-[150px] w-full rounded-2xl border border-[#e7d8c1] bg-white px-4 py-3 text-sm leading-7 text-brand-warm outline-none transition focus:border-[#c7a05a] focus:ring-2 focus:ring-[#f0ddba]"
                  value={draft.message}
                  onChange={(event) => updateField("message", event.target.value)}
                />
                {errors.message ? <p className="mt-2 text-xs text-rose-600">{errors.message}</p> : null}
              </label>

              <div className="md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-brand-brown">Reference images</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#d8ba84] bg-[#fffdf8] px-4 text-sm font-medium text-brand-warm transition hover:scale-[1.01] hover:border-[#c7a05a] hover:shadow-[0_12px_30px_rgba(199,160,90,0.12)]"
                >
                  <Upload size={16} />
                  Upload inspiration images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                {errors.files ? <p className="mt-2 text-xs text-rose-600">{errors.files}</p> : null}
                {previews.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {previews.map((preview, index) => (
                      <div key={`${preview}-${index}`} className="relative overflow-hidden rounded-2xl border border-[#eadcc6] bg-white">
                        <img src={preview} alt={`Upload preview ${index + 1}`} className="aspect-square h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand-warm shadow-sm transition hover:text-rose-600"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {notice ? (
              <div className="mt-5 rounded-2xl border border-[#eadcc6] bg-[#fff7eb] px-4 py-3 text-sm text-brand-warm">
                {notice}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-w-[260px] items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#c7a05a_0%,#e6c585_100%)] px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-brand-brown shadow-[0_18px_35px_rgba(199,160,90,0.22)] transition hover:scale-[1.015] hover:shadow-[0_22px_42px_rgba(199,160,90,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {uploading ? "Uploading images..." : "Submit Custom Order Request"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-brand-taupe transition hover:text-brand-brown"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

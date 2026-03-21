import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filename) {
  const envPath = path.join(projectRoot, filename);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: products, error: productError } = await supabase.from("products").select("id, name, slug, price_inr").eq("status", "active").limit(3);
  if (productError) throw productError;
  if (!products?.length) throw new Error("Seed catalog products before seeding orders.");

  const customerPayload = [
    { email: "customer1@example.com", full_name: "Ananya Sharma", phone: "+91 9876500001" },
    { email: "customer2@example.com", full_name: "Priya Mehta", phone: "+91 9876500002" },
  ];
  const customerMap = new Map();

  for (const customer of customerPayload) {
    const { data: existingCustomer, error: existingCustomerError } = await supabase
      .from("customers")
      .select("id, email")
      .eq("email", customer.email)
      .maybeSingle();

    if (existingCustomerError) throw existingCustomerError;

    if (existingCustomer) {
      customerMap.set(customer.email, existingCustomer.id);
      continue;
    }

    const { data: createdCustomer, error: createdCustomerError } = await supabase
      .from("customers")
      .insert(customer)
      .select("id, email")
      .single();

    if (createdCustomerError) throw createdCustomerError;
    customerMap.set(customer.email, createdCustomer.id);
  }

  const ordersPayload = [
    {
      customer_id: customerMap.get("customer1@example.com"),
      order_number: "SK-1001",
      status: "paid",
      payment_status: "paid",
      fulfillment_status: "processing",
      subtotal_inr: 2450,
      shipping_inr: 120,
      discount_inr: 0,
      total_inr: 2570,
      razorpay_order_id: "order_demo_1001",
      razorpay_payment_id: "pay_demo_1001",
      shipping_address: {
        name: "Ananya Sharma",
        line1: "12 Artisan Lane",
        city: "Jaipur",
        state: "Rajasthan",
        postal_code: "302001",
        country: "India",
        phone: "+91 9876500001",
      },
      billing_address: {
        name: "Ananya Sharma",
        line1: "12 Artisan Lane",
        city: "Jaipur",
        state: "Rajasthan",
        postal_code: "302001",
        country: "India",
        phone: "+91 9876500001",
      },
      notes: "Gift wrap requested.",
    },
    {
      customer_id: customerMap.get("customer2@example.com"),
      order_number: "SK-1002",
      status: "processing",
      payment_status: "authorized",
      fulfillment_status: "unfulfilled",
      subtotal_inr: 1650,
      shipping_inr: 150,
      discount_inr: 100,
      total_inr: 1700,
      razorpay_order_id: "order_demo_1002",
      razorpay_payment_id: "pay_demo_1002",
      shipping_address: {
        name: "Priya Mehta",
        line1: "44 Textile Park",
        city: "Mumbai",
        state: "Maharashtra",
        postal_code: "400001",
        country: "India",
        phone: "+91 9876500002",
      },
      billing_address: {
        name: "Priya Mehta",
        line1: "44 Textile Park",
        city: "Mumbai",
        state: "Maharashtra",
        postal_code: "400001",
        country: "India",
        phone: "+91 9876500002",
      },
      notes: "Customer asked for dispatch update.",
    },
  ];

  const { data: orders, error: orderError } = await supabase
    .from("orders")
    .upsert(ordersPayload, { onConflict: "order_number" })
    .select("id, order_number");

  if (orderError) throw orderError;

  const orderMap = new Map((orders ?? []).map((item) => [item.order_number, item.id]));

  const orderItemsPayload = [
    {
      order_id: orderMap.get("SK-1001"),
      product_id: products[0].id,
      variant_id: null,
      product_name: products[0].name,
      sku: products[0].slug,
      quantity: 1,
      unit_price_inr: products[0].price_inr,
      line_total_inr: products[0].price_inr,
    },
    {
      order_id: orderMap.get("SK-1002"),
      product_id: products[1].id,
      variant_id: null,
      product_name: products[1].name,
      sku: products[1].slug,
      quantity: 1,
      unit_price_inr: products[1].price_inr,
      line_total_inr: products[1].price_inr,
    },
  ];

  for (const item of orderItemsPayload) {
    const { data: existing } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", item.order_id)
      .eq("sku", item.sku)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase.from("order_items").insert(item);
      if (error) throw error;
    }
  }

  console.log("Order seed completed successfully.");
}

main().catch((error) => {
  console.error("Order seed failed:", error.message);
  process.exitCode = 1;
});

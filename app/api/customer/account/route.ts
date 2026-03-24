import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCustomerSession } from "@/lib/supabase/customer-auth";

export async function GET() {
  const session = await getCustomerSession();

  if (!session.user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const normalizedEmail = session.user.email.trim().toLowerCase();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, email, full_name, phone, created_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json({
      customer: {
        email: normalizedEmail,
        fullName: session.user.fullName,
        phone: session.user.phone,
      },
      orders: [],
    });
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, order_number, total_inr, status, payment_status, fulfillment_status, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      fullName: customer.full_name,
      phone: customer.phone,
      createdAt: customer.created_at,
    },
    orders: (orders ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      totalInr: order.total_inr,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      createdAt: order.created_at,
    })),
  });
}

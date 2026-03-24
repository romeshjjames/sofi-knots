import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/supabase/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  return NextResponse.json({
    customer: session.user,
    customerId: session.customerId,
  });
}

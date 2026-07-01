import type { NextRequest } from "next/server";
import { handleAdmin } from "@/server/portal/http";

export const dynamic = "force-dynamic";

type AdminRouteContext = {
  params: Promise<{ admin?: string[] }>;
};

export async function GET(request: NextRequest, context: AdminRouteContext) {
  const { admin = [] } = await context.params;
  return handleAdmin(request, admin);
}

export async function POST(request: NextRequest, context: AdminRouteContext) {
  const { admin = [] } = await context.params;
  return handleAdmin(request, admin);
}

export async function PATCH(request: NextRequest, context: AdminRouteContext) {
  const { admin = [] } = await context.params;
  return handleAdmin(request, admin);
}

export async function DELETE(request: NextRequest, context: AdminRouteContext) {
  const { admin = [] } = await context.params;
  return handleAdmin(request, admin);
}

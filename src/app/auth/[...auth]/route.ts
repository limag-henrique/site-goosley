import type { NextRequest } from "next/server";
import { handleAuth } from "@/server/portal/http";

export const dynamic = "force-dynamic";

type AuthRouteContext = {
  params: Promise<{ auth?: string[] }>;
};

export async function GET(request: NextRequest, context: AuthRouteContext) {
  const { auth = [] } = await context.params;
  return handleAuth(request, auth);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const { auth = [] } = await context.params;
  return handleAuth(request, auth);
}

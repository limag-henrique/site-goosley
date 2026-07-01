import type { NextRequest } from "next/server";
import { handleClient } from "@/server/portal/http";

export const dynamic = "force-dynamic";

type ClientRouteContext = {
  params: Promise<{ client?: string[] }>;
};

export async function GET(request: NextRequest, context: ClientRouteContext) {
  const { client = [] } = await context.params;
  return handleClient(request, client);
}

export async function POST(request: NextRequest, context: ClientRouteContext) {
  const { client = [] } = await context.params;
  return handleClient(request, client);
}

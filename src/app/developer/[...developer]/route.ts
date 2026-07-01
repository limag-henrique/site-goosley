import type { NextRequest } from "next/server";
import { handleProgrammer } from "@/server/portal/http";

export const dynamic = "force-dynamic";

type DeveloperRouteContext = {
  params: Promise<{ developer?: string[] }>;
};

export async function GET(request: NextRequest, context: DeveloperRouteContext) {
  const { developer = [] } = await context.params;
  return handleProgrammer(request, developer);
}

export async function POST(request: NextRequest, context: DeveloperRouteContext) {
  const { developer = [] } = await context.params;
  return handleProgrammer(request, developer);
}

export async function PATCH(request: NextRequest, context: DeveloperRouteContext) {
  const { developer = [] } = await context.params;
  return handleProgrammer(request, developer);
}

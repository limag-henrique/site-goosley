import type { NextRequest } from "next/server";
import { handleProgrammer } from "@/server/portal/http";

export const dynamic = "force-dynamic";

type ProgrammerRouteContext = {
  params: Promise<{ programmer?: string[] }>;
};

export async function GET(request: NextRequest, context: ProgrammerRouteContext) {
  const { programmer = [] } = await context.params;
  return handleProgrammer(request, programmer);
}

export async function POST(request: NextRequest, context: ProgrammerRouteContext) {
  const { programmer = [] } = await context.params;
  return handleProgrammer(request, programmer);
}

export async function PATCH(request: NextRequest, context: ProgrammerRouteContext) {
  const { programmer = [] } = await context.params;
  return handleProgrammer(request, programmer);
}

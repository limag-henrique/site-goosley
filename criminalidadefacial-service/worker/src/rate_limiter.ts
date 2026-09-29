import { DurableObject } from "cloudflare:workers";

type WindowState = { startedAt: number; count: number };

/** A single Durable Object is keyed by client IP, so its counter survives Worker isolates. */
export class RateLimitCounter extends DurableObject {
  async fetch(): Promise<Response> {
    const now = Date.now();
    const current = await this.ctx.storage.get<WindowState>("window");
    const active = !current || now - current.startedAt >= 60_000
      ? { startedAt: now, count: 0 }
      : current;
    const next = { ...active, count: active.count + 1 };
    await this.ctx.storage.put("window", next);
    return Response.json({ success: next.count <= 8 });
  }
}

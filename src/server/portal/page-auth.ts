import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "./security";
import { findUserBySession, getRoleHome, requireActor } from "./services";
import { loadPortalDatabaseFromD1 } from "./store";
import type { RequestActor, UserRole } from "./types";

export async function requirePortalPageActor(roles?: UserRole[]): Promise<RequestActor> {
  await loadPortalDatabaseFromD1();
  const cookieStore = await cookies();
  const user = findUserBySession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!user) {
    redirect("/meu-portal");
  }

  const actor = requireActor(user);
  if (roles && !roles.includes(actor.user.role) && !(actor.user.role === "developer" && roles.includes("programmer"))) {
    redirect(getRoleHome(actor.user.role));
  }

  return actor;
}

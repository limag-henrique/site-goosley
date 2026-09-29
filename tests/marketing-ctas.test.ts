import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const workspaceRoot = resolve(import.meta.dirname, "..");

test("CTAs comerciais não usam indicadores pulsantes", () => {
  const componentSources = ["Hero.tsx", "Navbar.tsx"].map((fileName) =>
    readFileSync(resolve(workspaceRoot, "src", "components", fileName), "utf8")
  );

  assert.equal(componentSources.some((source) => source.includes("animate-ping")), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { findDeclaration } from "../src/server/electronic-signature";
import { isImmersiveRoute } from "../src/lib/public-chrome";

test("a chave de consulta recupera a declaração e seu emitente", () => {
  const declaration = findDeclaration("a8f9c2d1-e4b7-4a3d-9c1f-8e2b5d6a7c9f");
  assert.equal(declaration?.patient.name, "Miguel Eduardo Silveira Ofeman Verri");
  assert.equal(declaration?.physician.name, "Dr. Guilherme Marques");
  assert.equal(declaration?.physician.registration, "CRM-MG 56888");
});

test("chaves vazias, desconhecidas ou com trechos extras não revelam a declaração", () => {
  for (const key of ["", "chave-invalida", "toString", "__proto__", "00000000-0000-4000-8000-000000000000", "a8f9c2d1-e4b7-4a3d-9c1f-8e2b5d6a7c9f/extra"]) {
    assert.equal(findDeclaration(key), undefined);
  }
});

test("consulta e declaração são apresentadas sem o menu comercial", () => {
  assert.equal(isImmersiveRoute("/assinatura-eletronica"), true);
  assert.equal(isImmersiveRoute("/assinatura-eletronica/a8f9c2d1-e4b7-4a3d-9c1f-8e2b5d6a7c9f"), true);
  assert.equal(isImmersiveRoute("/assinatura-eletronica-outro"), false);
  assert.equal(isImmersiveRoute("/contato"), false);
});

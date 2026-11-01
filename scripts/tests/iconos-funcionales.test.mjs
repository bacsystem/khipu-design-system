import assert from "node:assert/strict";
import { test } from "node:test";
import * as phosphor from "@phosphor-icons/react";
import { FUNCIONALES, aplicarPesoFuncional } from "../iconos-funcionales.mjs";

test("cada icono funcional existe en @phosphor-icons/react", () => {
  for (const nombre of FUNCIONALES) assert.ok(nombre in phosphor, nombre);
});

test("agrega weight=bold a los funcionales sin peso", () => {
  assert.equal(aplicarPesoFuncional('<CaretDownIcon className="size-4" />'), '<CaretDownIcon weight="bold" className="size-4" />');
  assert.equal(aplicarPesoFuncional("<XIcon/>"), '<XIcon weight="bold"/>');
});

test("respeta un weight explícito, no toca semánticos ni nombres más largos", () => {
  assert.equal(aplicarPesoFuncional('<CheckIcon weight="fill" />'), '<CheckIcon weight="fill" />');
  assert.equal(aplicarPesoFuncional('<FileTextIcon className="size-4" />'), '<FileTextIcon className="size-4" />');
  assert.equal(aplicarPesoFuncional("<CheckIconGrande />"), "<CheckIconGrande />");
});

test("idempotente y multilínea", () => {
  const antes = '<DotsThreeIcon\n  className="size-4"\n/>';
  const una = aplicarPesoFuncional(antes);
  assert.equal(una, '<DotsThreeIcon weight="bold"\n  className="size-4"\n/>');
  assert.equal(aplicarPesoFuncional(una), una);
});

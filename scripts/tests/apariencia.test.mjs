import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLAVE_PALETA,
  CLAVE_TONO_OSCURO,
  PALETAS,
  PALETA_POR_DEFECTO,
  TONOS_OSCURO,
  TONO_OSCURO_POR_DEFECTO,
  codigoScriptApariencia,
  valorValido,
} from "../../src/components/apariencia-opciones.ts";

const HEX = /^#[0-9a-f]{6}$/i;

test("paletas: valores únicos, la por defecto existe y cada muestra tiene 3 colores", () => {
  const valores = PALETAS.map((p) => p.valor);
  assert.deepEqual(valores, ["lima", "indigo", "oceano", "coral", "violeta"]);
  assert.ok(valores.includes(PALETA_POR_DEFECTO));
  for (const p of PALETAS) {
    assert.equal(p.muestra.length, 3);
    assert.ok(p.muestra.every((c) => HEX.test(c)), p.valor);
  }
});

test("tonos oscuros: medianoche por defecto, muestras #rrggbb", () => {
  assert.deepEqual(TONOS_OSCURO.map((t) => t.valor), ["medianoche", "grafito", "tintado"]);
  assert.equal(TONO_OSCURO_POR_DEFECTO, "medianoche");
  assert.ok(TONOS_OSCURO.every((t) => HEX.test(t.muestra)));
});

test("valorValido devuelve el pedido solo si existe", () => {
  assert.equal(valorValido("coral", PALETAS, "lima"), "coral");
  assert.equal(valorValido("rojo", PALETAS, "lima"), "lima");
  assert.equal(valorValido(null, PALETAS, "lima"), "lima");
});

function ejecutar(codigo, guardado) {
  const documento = { documentElement: { dataset: {} } };
  const almacenamiento = { getItem: (k) => guardado[k] ?? null };
  new Function("document", "localStorage", codigo)(documento, almacenamiento);
  return documento.documentElement.dataset;
}

test("el script aplica lo guardado, ignora valores inválidos e `inicial` gana", () => {
  assert.deepEqual(ejecutar(codigoScriptApariencia(), {}), { paleta: "lima", oscuro: "medianoche" });
  assert.deepEqual(ejecutar(codigoScriptApariencia(), { [CLAVE_PALETA]: "coral", [CLAVE_TONO_OSCURO]: "grafito" }), { paleta: "coral", oscuro: "grafito" });
  assert.deepEqual(ejecutar(codigoScriptApariencia(), { [CLAVE_PALETA]: "x", [CLAVE_TONO_OSCURO]: "y" }), { paleta: "lima", oscuro: "medianoche" });
  const conInicial = codigoScriptApariencia({ inicial: { paleta: "violeta", tonoOscuro: "tintado" } });
  assert.deepEqual(ejecutar(conInicial, { [CLAVE_PALETA]: "coral" }), { paleta: "violeta", oscuro: "tintado" });
});

test("el script sobrevive a un localStorage bloqueado", () => {
  const documento = { documentElement: { dataset: {} } };
  const bloqueado = { getItem: () => { throw new Error("SecurityError"); } };
  new Function("document", "localStorage", codigoScriptApariencia())(documento, bloqueado);
  assert.deepEqual(documento.documentElement.dataset, { paleta: "lima", oscuro: "medianoche" });
});

test("un `inicial` desconocido se descarta y cae a lo guardado", () => {
  const codigo = codigoScriptApariencia({ inicial: { paleta: "x", tonoOscuro: "y" } });
  assert.deepEqual(ejecutar(codigo, { [CLAVE_PALETA]: "coral", [CLAVE_TONO_OSCURO]: "grafito" }), { paleta: "coral", oscuro: "grafito" });
  assert.deepEqual(ejecutar(codigo, {}), { paleta: "lima", oscuro: "medianoche" });
});

test("un `inicial` con </script> no llega al código generado", () => {
  const malicioso = "</script><script>alert(1)</script>";
  const codigo = codigoScriptApariencia({ inicial: { paleta: malicioso, tonoOscuro: malicioso } });
  assert.ok(!codigo.includes("<"), codigo);
  assert.ok(!codigo.includes("alert"), codigo);
  assert.deepEqual(ejecutar(codigo, {}), { paleta: "lima", oscuro: "medianoche" });
});

test("las opciones propias con < se escapan dentro del script", () => {
  const paletas = [{ valor: "</script>", etiqueta: "X", muestra: ["#000000", "#000000", "#000000"] }];
  const codigo = codigoScriptApariencia({ paletas, inicial: { paleta: "</script>" } });
  assert.ok(!codigo.includes("<"), codigo);
  assert.equal(ejecutar(codigo, {}).paleta, "</script>");
});

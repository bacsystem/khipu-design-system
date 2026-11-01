import assert from "node:assert/strict";
import { test } from "node:test";
import * as phosphor from "@phosphor-icons/react";
import { MAPA_ICONOS, migrarAlturas, migrarIconos } from "../codemod-05.mjs";

test("cada icono del mapa existe en @phosphor-icons/react", () => {
  for (const [lucide, nuevo] of Object.entries(MAPA_ICONOS)) assert.ok(nuevo in phosphor, `${lucide} → ${nuevo}`);
});

test("reescribe imports, usos, el tipo LucideIcon y strokeWidth", () => {
  const antes = [
    'import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react";',
    'import { cn } from "@/lib/utils";',
    "type P = { icon: LucideIcon };",
    'const a = <ChevronDownIcon className="size-4" />;',
    'const b = <CheckIcon className="size-3" strokeWidth={3} />;',
  ].join("\n");
  const despues = migrarIconos(antes);
  assert.ok(despues.startsWith('import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";\nimport type { IconoComponente } from "@/lib/iconos";'));
  assert.ok(!despues.includes("lucide-react"));
  assert.ok(despues.includes("type P = { icon: IconoComponente };"));
  assert.ok(despues.includes('<CaretDownIcon className="size-4" />'));
  assert.ok(despues.includes('<CheckIcon className="size-3" weight="bold" />'));
});

test("renombra Menu de lucide sin tocar otros identificadores", () => {
  const antes = 'import { Menu } from "lucide-react";\nconst x = <Menu className="size-5" />; const MenuTrigger = 1;';
  const despues = migrarIconos(antes);
  assert.ok(despues.includes("<ListIcon"));
  assert.ok(despues.includes("const MenuTrigger = 1;"));
});

test("un archivo sin lucide no cambia", () => {
  assert.equal(migrarIconos('import { cn } from "@/lib/utils";\n'), 'import { cn } from "@/lib/utils";\n');
});

test("alturas: h-9, size-9 y min-h-9 pasan a control; h-90 y h-9/50 no", () => {
  assert.equal(migrarAlturas('"h-9 sm:h-9 size-9 min-h-9"'), '"h-control sm:h-control size-control min-h-control"');
  assert.equal(migrarAlturas('"h-90 w-9 h-9.5"'), '"h-90 w-9 h-9.5"');
});

test("idempotente", () => {
  const una = migrarAlturas(migrarIconos('import { XIcon } from "lucide-react";\n<XIcon className="h-9" />'));
  assert.equal(migrarAlturas(migrarIconos(una)), una);
});

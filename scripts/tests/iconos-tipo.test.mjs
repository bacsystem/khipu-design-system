import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("IconoComponente acepta iconos de Phosphor y de Lucide", () => {
  const dir = mkdtempSync(join(ROOT, ".tmp-iconos-"));
  try {
    writeFileSync(
      join(dir, "prueba.ts"),
      [
        'import { CheckIcon } from "@phosphor-icons/react";',
        'import { Check } from "lucide-react";',
        'import type { IconoComponente } from "../src/lib/iconos";',
        "const a: IconoComponente = CheckIcon;",
        "const b: IconoComponente = Check;",
        "export { a, b };",
      ].join("\n"),
    );
    const tsc = join(ROOT, "node_modules", "typescript", "bin", "tsc");
    execFileSync(process.execPath, [tsc, "--noEmit", "--strict", "--skipLibCheck", "--jsx", "react-jsx", "--moduleResolution", "bundler", "--module", "esnext", "--target", "es2022", join(dir, "prueba.ts")], { cwd: ROOT, stdio: "pipe" });
    assert.ok(true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ensamblar, insertarSeccion, necesitaFragmento, parsearFragmento, validarChangelog } from "../changelog.mjs";

const raiz = new URL("../../", import.meta.url).pathname;

test("parsearFragmento: secciones por tipo, viñetas intactas (también con varias líneas)", () => {
  const r = parsearFragmento("### Added\n- uno\n  continúa\n- dos\n\n### Fixed\n- tres\n", "x.md");
  assert.deepEqual(r, { Added: "- uno\n  continúa\n- dos", Fixed: "- tres" });
});

test("parsearFragmento: rechaza tipo desconocido, texto suelto, sección vacía o repetida y fragmento sin secciones", () => {
  assert.throws(() => parsearFragmento("### Cambios\n- a\n", "x.md"), /x\.md.*no válido/);
  assert.throws(() => parsearFragmento("hola\n### Added\n- a\n", "x.md"), /antes del primer/);
  assert.throws(() => parsearFragmento("### Added\n\n### Fixed\n- a\n", "x.md"), /"### Added" está vacía/);
  assert.throws(() => parsearFragmento("### Added\n- a\n### Added\n- b\n", "x.md"), /repetida/);
  assert.throws(() => parsearFragmento("", "x.md"), /ninguna sección/);
  assert.throws(() => parsearFragmento("## Added\n- a\n", "x.md"), /no válido/);
});

test("parsearFragmento: un `### ` dentro de un bloque de código no es encabezado", () => {
  const r = parsearFragmento("### Added\n- ejemplo\n```md\n### Cualquier cosa\n```\n", "x.md");
  assert.match(r.Added, /### Cualquier cosa/);
});

test("ensamblar: orden canónico de tipos y orden alfabético de fragmentos, sin importar el orden de entrada", () => {
  const frags = [
    { nombre: "b.md", texto: "### Fixed\n- b-fix\n### Added\n- b-add\n" },
    { nombre: "a.md", texto: "### Added\n- a-add\n### Security\n- a-sec\n" },
  ];
  const esperado = "### Added\n- a-add\n- b-add\n\n### Fixed\n- b-fix\n\n### Security\n- a-sec";
  assert.equal(ensamblar(frags), esperado);
  assert.equal(ensamblar([...frags].reverse()), esperado);
});

test("insertarSeccion: va antes de la primera versión, con fecha, y respeta el resto", () => {
  const cl = "# Changelog\n\nIntro.\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- viejo\n";
  const r = insertarSeccion(cl, "0.10.0", "2026-12-01", "### Added\n- nuevo");
  assert.equal(r, "# Changelog\n\nIntro.\n\n## [0.10.0] - 2026-12-01\n\n### Added\n- nuevo\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- viejo\n");
});

test("insertarSeccion: rechaza versión repetida, versión y fecha mal formadas", () => {
  const cl = "# C\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- a\n";
  assert.throws(() => insertarSeccion(cl, "0.9.0", "2026-12-01", "x"), /ya tiene/);
  assert.throws(() => insertarSeccion(cl, "0.10", "2026-12-01", "x"), /X\.Y\.Z/);
  assert.throws(() => insertarSeccion(cl, "0.10.0", "1/12/2026", "x"), /YYYY-MM-DD/);
});

test("validarChangelog: no admite [Unreleased]", () => {
  assert.throws(() => validarChangelog("# C\n\n## [Unreleased]\n\n### Added\n- a\n"), /Unreleased/);
  validarChangelog("# C\n\n## [0.9.0] - 2026-11-17\n");
});

test("necesitaFragmento: src/ sin fragmento falla; con fragmento nuevo, con opt-out o sin src/ pasa", () => {
  assert.equal(necesitaFragmento(["M\tsrc/components/ui/button.tsx"]).ok, false);
  assert.equal(necesitaFragmento(["M\tsrc/lib/estilos.ts", "A\tchangelog.d/mi-cambio.md"]).ok, true);
  assert.equal(necesitaFragmento(["M\tsrc/lib/estilos.ts"], { sinChangelog: true }).ok, true);
  assert.equal(necesitaFragmento(["M\tREADME.md", "M\tscripts/x.mjs"]).ok, true);
  assert.equal(necesitaFragmento(["M\tsrc/a.ts", "M\tchangelog.d/existente.md"]).ok, false, "editar un fragmento ajeno no cuenta como añadir");
  assert.equal(necesitaFragmento(["M\tsrc/a.ts", "A\tchangelog.d/README.md"]).ok, false, "el README no es un fragmento");
  assert.equal(necesitaFragmento(["D\tsrc/a.ts"]).ok, true, "solo borrar de src/ no pide nota");
  assert.equal(necesitaFragmento(["R100\tsrc/a.ts\tsrc/b.ts"]).ok, false);
});

test("release de extremo a extremo en un repo temporal: arma la sección, borra los fragmentos y deja README", () => {
  const dir = mkdtempSync(join(tmpdir(), "khipu-cl-"));
  try {
    mkdirSync(join(dir, "scripts"));
    mkdirSync(join(dir, "changelog.d"));
    cpSync(join(raiz, "scripts/changelog.mjs"), join(dir, "scripts/changelog.mjs"));
    writeFileSync(join(dir, "package.json"), '{"version":"0.10.0"}');
    writeFileSync(join(dir, "CHANGELOG.md"), "# Changelog\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- viejo\n");
    writeFileSync(join(dir, "changelog.d/README.md"), "# no es un fragmento\n");
    writeFileSync(join(dir, "changelog.d/b.md"), "### Fixed\n- arreglo\n");
    writeFileSync(join(dir, "changelog.d/a.md"), "### Added\n- novedad\n");
    const correr = (...args) => execFileSync("node", [join(dir, "scripts/changelog.mjs"), ...args], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    assert.throws(() => correr("release", "0.11.0"), /no coincide con package\.json/);
    correr("release", "--date", "2026-12-01");
    assert.equal(
      readFileSync(join(dir, "CHANGELOG.md"), "utf8"),
      "# Changelog\n\n## [0.10.0] - 2026-12-01\n\n### Added\n- novedad\n\n### Fixed\n- arreglo\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- viejo\n",
    );
    assert.ok(!existsSync(join(dir, "changelog.d/a.md")) && !existsSync(join(dir, "changelog.d/b.md")));
    assert.ok(existsSync(join(dir, "changelog.d/README.md")));
    assert.throws(() => correr("release"), /nada que publicar/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("el release plan y changelog-section.sh aceptan lo que produce release (la sección sale como notas)", () => {
  const dir = mkdtempSync(join(tmpdir(), "khipu-cl-"));
  try {
    const cl = insertarSeccion("# C\n\n## [0.9.0] - 2026-11-17\n\n### Added\n- viejo\n", "0.10.0", "2026-12-01", ensamblar([{ nombre: "a.md", texto: "### Added\n- novedad\n" }]));
    writeFileSync(join(dir, "CHANGELOG.md"), cl);
    const notas = execFileSync(join(raiz, ".github/scripts/changelog-section.sh"), ["0.10.0", join(dir, "CHANGELOG.md")], { encoding: "utf8" });
    assert.equal(notas, "### Added\n- novedad\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("el repo no tiene [Unreleased] y sus fragmentos son válidos", () => {
  validarChangelog(readFileSync(join(raiz, "CHANGELOG.md"), "utf8"));
});

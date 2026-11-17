# Contribuir

Los PR van a `main` y se revisan antes de mezclar. Antes de abrirlo: `npm ci && npm run lint && npm run typecheck && npm test && npm run verify:paquete && npm run build` (es lo que corre la CI; `npm run verify:next15` también, ver README §Mantenerlo).

## Qué toca un PR y qué no

Para que dos PR abiertos a la vez no choquen al mezclar, **un PR normal no edita archivos compartidos**:

| No lo edites en un PR | Por qué / dónde va |
|---|---|
| `CHANGELOG.md` | Tu nota va en un fragmento `changelog.d/<slug>.md` (abajo). No hay sección `[Unreleased]`. |
| `registry/registry.json` | No está en git: se genera de `src/` (`prepare`, `npm run registry:build`). Un componente nuevo entra solo; `scripts/build-registry.mjs` recorre `src/components/**` y `src/lib/*.ts`. |
| Las listas de componentes de `README.md` y `docs/design-system.md` §19 (entre `<!-- generado:componentes -->` y `<!-- /generado:componentes -->`) | Las regenera el PR de release (`npm run docs:build`). |
| `version` de `package.json` | Solo el PR de release. |

Sí editas: el código, sus pruebas, la **prosa** de tu componente en `docs/design-system.md` (en su propia sección, no en tablas compartidas), la galería de `src/app/ejemplo` y el subpath en `package.json` `exports` si creas una carpeta nueva en `src/components/`.

## Changelog: un fragmento por PR

Si tu PR cambia algo de `src/`, añade `changelog.d/<slug>.md` (el slug, único, p. ej. el nombre de la rama). Es Markdown con una sección `### <Tipo>` por tipo y las viñetas tal como irán en el CHANGELOG:

```md
### Added
- **`EntradaDecimal`** (`formularios/entrada-decimal`): ...

### Fixed
- `EntradaMonto` aceptaba solo punto decimal ...
```

Tipos válidos: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security` (se ordenan así en el release). Una sección vacía, un tipo desconocido o texto antes del primer `###` hacen fallar `npm run changelog:check`. Los cambios incompatibles o que obligan a re-copiar archivos con la CLI van en `Changed` y empiezan con **negrita** (como en las versiones anteriores).

- La CI (`.github/workflows/changelog.yml`) falla un PR que cambia `src/` sin añadir un fragmento. **Opt-out:** ponle la etiqueta `sin-changelog` al PR cuando no cambia nada visible para quien consume el kit (refactor interno, pruebas, la app de ejemplo).
- Un PR que solo toca docs, scripts o CI no necesita fragmento.

## Publicar una versión (PR de release)

Lo hace quien mezcla, en un PR aparte y corto (los PR de funcionalidad no suben versión):

```bash
git switch -c release/X.Y.Z origin/main
# 1. sube "version" en package.json y en package-lock.json (dos sitios arriba del todo)
npm version X.Y.Z --no-git-tag-version
# 2. junta los fragmentos en "## [X.Y.Z] - fecha" y los borra (la fecha es hoy; --date YYYY-MM-DD para otra)
node scripts/changelog.mjs release
# 3. regenera las listas de componentes de README.md y docs/design-system.md
npm run docs:build
# 4. comprueba
npm ci && npm run lint && npm run typecheck && npm test && npm run verify:paquete
git add -A && git commit -m "chore(release): vX.Y.Z"
```

Revisa la sección generada de `CHANGELOG.md` (puedes retocar el texto a mano antes de mezclar). Al mezclar a `main`, `release.yml` crea el tag `vX.Y.Z` y la release con las notas de esa sección (ver README §Publicar una versión). Si quedan fragmentos en `changelog.d/` en el commit de release, o el inventario está desactualizado, la CI/`release-plan` falla antes de crear nada: vuelve a correr los pasos 2 y 3 sobre `origin/main` actualizado (un PR mezclado entre medias trae su fragmento).

## Scripts y pruebas

Los scripts de `scripts/` no llevan dependencias externas y sus pruebas están en `scripts/tests/*.test.mjs` (`npm test`). Una prueba nueva debe fallar si rompes lo que prueba: mutar a mano la lógica y comprobar que se pone en rojo.

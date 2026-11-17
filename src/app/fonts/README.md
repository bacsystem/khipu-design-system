# Fuentes locales

Fuentes de la app de ejemplo, servidas con `next/font/local` para que el build no dependa de la red (`next/font/google` las descargaba en cada build). Solo `latin` y en `woff2`. Son las mismas fuentes de Google Fonts, empaquetadas por [Fontsource](https://fontsource.org) (5.3.0).

| Archivo | Familia | Pesos | Licencia |
| --- | --- | --- | --- |
| `inter-latin-wght-normal.woff2` | Inter | variable 100–900 | `OFL-inter.txt` |
| `plus-jakarta-sans-latin-wght-normal.woff2` | Plus Jakarta Sans | variable 200–800 | `OFL-plus-jakarta-sans.txt` |
| `manrope-latin-wght-normal.woff2` | Manrope | variable 200–800 | `OFL-manrope.txt` |
| `dm-sans-latin-wght-normal.woff2` | DM Sans | variable 100–1000 | `OFL-dm-sans.txt` |
| `figtree-latin-wght-normal.woff2` | Figtree | variable 300–900 | `OFL-figtree.txt` |
| `jetbrains-mono-latin-wght-normal.woff2` | JetBrains Mono | variable 100–800 (declarada 100–600) | `OFL-jetbrains-mono.txt` |

Todas con licencia SIL Open Font License 1.1 (se pueden redistribuir con la app; el texto de cada licencia va junto a los archivos). Para añadir o actualizar una fuente: `npm pack @fontsource-variable/<familia>` (o `@fontsource/<familia>` para pesos estáticos), copia el `woff2` del subconjunto `latin` y su `LICENSE`.

Notas:
- JetBrains Mono se declara con peso `100 600` para que `font-bold` (700) se pinte con el 600, como con las caras estáticas 400/500/600 de `next/font/google`.
- Solo `latin`: los caracteres de `latin-ext` (p. ej. Ł ř Ş ₡ ₲) caen en la fuente de respaldo. Añadirlos costaría ~165 KB (con `unicode-range`, solo se bajarían al usarse); si hace falta, copia los `*-latin-ext-wght-normal.woff2` del mismo paquete de Fontsource.

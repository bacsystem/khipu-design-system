import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next 16 ya exporta flat config: no hace falta FlatCompat ni @eslint/eslintrc.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16 trae las reglas nuevas de react-hooks (las del React Compiler) como error. Los componentes
    // que las incumplen (ref sincronizada en el render, setState en un efecto de montaje para evitar desajustes de
    // hidratación…) funcionan y están probados; reescribirlos cambiaría su comportamiento y esta migración no puede
    // hacerlo. Quedan como aviso, visibles, hasta migrarlos uno a uno.
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Estado y worktrees del ejecutor de planes (cys): copias del repo con su propio .next.
    ".worktrees/**",
    ".cys/**",
  ]),
]);

export default eslintConfig;

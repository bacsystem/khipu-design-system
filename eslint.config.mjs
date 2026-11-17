import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// eslint-config-next 16 ya exporta flat config: no hace falta FlatCompat ni @eslint/eslintrc.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next 16 trae las reglas nuevas de react-hooks (las del React Compiler) como error. Estos 7 archivos
    // las incumplen (ref sincronizada en el render, setState en un efecto de montaje para que la hidratación coincida…).
    // El comportamiento de esos efectos NO tiene pruebas, así que reescribirlos aquí cambiaría el componente sin red de
    // seguridad: quedan como aviso, solo ellos, y en el resto del repo siguen en error. Migración (empezando por escribir
    // sus pruebas): https://github.com/bacsystem/khipu-design-system/issues/58. Al migrar un archivo, quítalo de la lista.
    files: [
      "src/app/ejemplo/demo-avisos.tsx",
      "src/components/apariencia.tsx",
      "src/components/diseno.tsx",
      "src/components/formularios/calendario.tsx",
      "src/components/nav/mobile-nav.tsx",
      "src/components/nav/theme-toggle.tsx",
      "src/components/navegacion/paleta.tsx",
    ],
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

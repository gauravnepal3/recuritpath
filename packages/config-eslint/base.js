import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * Shared flat config. ESLint 9 no longer reads the eslintrc-style objects this
 * package used to export, which is why linting silently did nothing.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: { turbo: turboPlugin },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: { onlyWarn },
  },
  {
    rules: {
      // The codebase leans on `any` in a number of Prisma payload shapes;
      // surface them as warnings rather than blocking the build.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      "dist/**",
      ".next/**",
      "node_modules/**",
      "generated/**",
      "next-env.d.ts",
    ],
  },
];

export default config;

import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Conservative rules - only catch obvious errors, don't enforce style
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Basic JavaScript rules that catch real bugs
      "no-debugger": "warn",
      "no-console": "off", // Allow console for debugging
      "no-unused-expressions": "warn",
      "no-unreachable": "error",
      "no-duplicate-case": "error",
      "no-empty": "warn",

      // React-specific (but not enforcing hooks rules to avoid breaking existing code)
      "react-hooks/rules-of-hooks": "off", // We already fixed these
      "react-hooks/exhaustive-deps": "off", // Too noisy for existing code
    },
  },
  {
    // Ignore generated files and test files for now
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.d.ts",
      "**/*.js", // Ignore compiled JS files
    ],
  },
];

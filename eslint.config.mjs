import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["dist-extension/*", "build", "chrome"]
  },
  js.configs.recommended,
  {
    "rules": {
      "dot-notation": 2,
      "max-statements-per-line": 2,
      "no-unused-vars": [2, { "args": "after-used", "argsIgnorePattern": "^_", "caughtErrors": "none" }],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // ...globals.webextensions,
      }
    },
  },
];

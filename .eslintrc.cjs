module.exports = {
parser: "@typescript-eslint/parser",
parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
        jsx: true,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
},
extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
],
plugins: ["@typescript-eslint", "react", "react-hooks"],
rules: {
    // Allow unused variables with underscore prefix
    "@typescript-eslint/no-unused-vars": ["warn", { 
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    }],
    // Relax the unsafe return rule to warning
    "@typescript-eslint/no-unsafe-return": "warn",
    // Enforce hook dependencies
    "react-hooks/exhaustive-deps": "warn",
    // React 17+ doesn't need React in scope
    "react/react-in-jsx-scope": "off",
},
settings: {
    react: {
    version: "detect",
    },
},
};


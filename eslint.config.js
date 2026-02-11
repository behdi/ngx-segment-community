// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");
const jsdoc = require("eslint-plugin-jsdoc");
const sonar = require("eslint-plugin-sonarjs");
const fp = require("eslint-plugin-fp");
const preferClassProperties = require("eslint-plugin-prefer-class-properties");
const preferEarlyReturn = require("@regru/eslint-plugin-prefer-early-return");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
      jsdoc.configs["flat/recommended-typescript"],
      sonar.configs["recommended"],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      jsdoc,
      sonar,
      fp,
      preferClassProperties,
      preferEarlyReturn,
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/prefer-on-push-component-change-detection": ["error"],

      // ESLint rules
      "no-console": ["error", { allow: ["warn", "error", "debug"] }],
      "no-nested-ternary": "warn",
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: { array: false, object: true },
          AssignmentExpression: { array: false, object: false },
        },
        { enforceForRenamedProperties: false },
      ],
      "no-param-reassign": ["warn", { props: false }],
      "no-underscore-dangle": "off",
      "no-restricted-globals": [
        "error",
        {
          name: "isFinite",
          message:
            "Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite",
        },
        {
          name: "isNaN",
          message:
            "Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan",
        },
        {
          name: "fdescribe",
          message: "Do not commit fdescribe. Use describe instead.",
        },
      ],

      // JSDoc overrides
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
        },
      ],
      "jsdoc/tag-lines": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/check-tag-names": [
        "warn",
        {
          definedTags: ["internal"],
        },
      ],

      // ----- Typescript-eslint overrides -----
      "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
        },
      ],
      // We might need to access private properties in some cases (in spec files for example)
      "@typescript-eslint/dot-notation": [
        "error",
        {
          allowIndexSignaturePropertyAccess: true,
          allowPrivateClassPropertyAccess: true,
          allowProtectedClassPropertyAccess: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "default",
          format: ["camelCase"],
        },
        // ---- variableLike: functions, parameters, and variables
        {
          selector: "variableLike",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: ["parameter", "function"],
          format: ["camelCase"],
        },
        {
          selector: ["parameter", "function"],
          format: ["camelCase"],
          modifiers: ["unused"],
          leadingUnderscore: "allow",
        },
        // ---- memberLike: accessor, enumMember, method, parameterProperty, property, classProperty, objectLiteralProperty, typeProperty
        {
          selector: "memberLike",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
        },
        {
          selector: "objectLiteralProperty",
          format: ["camelCase", "UPPER_CASE", "snake_case"],
        },
        {
          selector: "memberLike",
          format: ["camelCase"],
          modifiers: ["private"],
          leadingUnderscore: "require",
        },
        {
          selector: "memberLike",
          format: ["camelCase"],
          modifiers: ["protected"],
          leadingUnderscore: "allow",
        },
        {
          selector: "memberLike",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          modifiers: ["readonly"],
        },
        {
          selector: "memberLike",
          format: ["camelCase"],
          modifiers: ["private", "readonly"],
          leadingUnderscore: "require",
        },
        {
          selector: "memberLike",
          format: ["UPPER_CASE", "PascalCase"],
          modifiers: ["private", "readonly"],
          leadingUnderscore: "allow",
        },
        {
          selector: "memberLike",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          modifiers: ["protected", "readonly"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeProperty",
          format: ["snake_case", "camelCase", "UPPER_CASE"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE", "PascalCase"],
          leadingUnderscore: "forbid",
        },
        // ---- typeLike: type aliases and interfaces
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // ---- ignore numbers and quoted properties
        {
          selector: [
            "classProperty",
            "objectLiteralProperty",
            "typeProperty",
            "classMethod",
            "objectLiteralMethod",
            "typeMethod",
            "accessor",
            "enumMember",
          ],
          format: null,
          modifiers: ["requiresQuotes"],
        },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/require-array-sort-compare": "error",

      // SonjarJS overrides
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/function-return-type": "off",

      // Functional programming - avoiding mutations
      "fp/no-arguments": "error",
      "fp/no-delete": "error",
      "fp/no-events": "error",
      "fp/no-mutating-assign": "error",
      "fp/no-mutation": "warn",
      "fp/no-proxy": "error",
      "fp/no-valueof-field": "error",

      "preferClassProperties/prefer-class-properties": "warn",
      "preferEarlyReturn/prefer-early-return": [
        "error",
        { maximumStatements: 1 },
      ],
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "sonarjs/cognitive-complexity": ["off"],
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // functional programming
      "fp/no-arguments": "off",
      "fp/no-delete": "off",
      "fp/no-events": "off",
      "fp/no-mutating-assign": "off",
      "fp/no-mutating-methods": "off",
      "fp/no-mutation": "off",
      "fp/no-proxy": "off",
      "fp/no-valueof-field": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "max-len": [
        "error",
        {
          code: 140,
          ignoreUrls: true,
        },
      ],
      "@angular-eslint/template/prefer-self-closing-tags": "error",
    },
  },
);

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: ["vendor/**", "public/**", ".next/**"],
  },
  {
    // 08a-автоматические-проверки.md, 2.2: цены не пишем в коде экрана - они
    // приходят из базы через formatPrice.
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\d\\s*₽/]",
          message: "Цена в коде экрана: берите сумму из базы через formatPrice.",
        },
        {
          selector: "JSXText[value=/\\d\\s*₽/]",
          message: "Цена в коде экрана: берите сумму из базы через formatPrice.",
        },
        {
          selector: "TemplateElement[value.raw=/\\d\\s*₽/]",
          message: "Цена в коде экрана: берите сумму из базы через formatPrice.",
        },
      ],
    },
  },
];

export default eslintConfig;

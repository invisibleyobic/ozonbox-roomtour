import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Регресс бага фазы 1: клиентский компонент сцены импортировал lib/storage,
// тот тянул config/env, и в браузере страница падала на обязательной
// DATABASE_URL. Клиентский файл не должен импортировать серверные модули.

const ROOT = path.resolve(__dirname, "..");
const FORBIDDEN = [
  /from\s+["']@\/config\/env["']/,
  /from\s+["']@\/lib\/storage["']/,
  /from\s+["']@\/lib\/db\/[^"']*["']/,
  /from\s+["']@prisma\/client["']/,
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const clientFiles = ["components", "app"]
  .flatMap((dir) => walk(path.join(ROOT, dir)))
  .filter((file) => /\.(ts|tsx)$/.test(file) && !file.endsWith(".test.ts"))
  .filter((file) => /^\s*["']use client["']/.test(readFileSync(file, "utf8")));

describe("клиентские компоненты", () => {
  it("нашлись (иначе проверка ничего не проверяет)", () => {
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it.each(clientFiles.map((file) => [path.relative(ROOT, file), file]))(
    "%s не импортирует серверные модули",
    (_name, file) => {
      const source = readFileSync(file, "utf8");
      // import type стирается при сборке и в браузер не попадает
      const runtimeImports = source
        .split("\n")
        .filter((line) => /^\s*import\s/.test(line) && !/^\s*import\s+type\s/.test(line));
      for (const pattern of FORBIDDEN) {
        expect(runtimeImports.filter((line) => pattern.test(line))).toEqual([]);
      }
    }
  );
});

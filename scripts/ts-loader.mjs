// Minimal resolver hook so .ts files can import each other without a .ts
// extension. Used by scripts/smoke-test.mjs together with Node's built-in
// type-stripping (--experimental-strip-types), available in Node >= 22.6.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") && !/\.[a-z0-9]+$/i.test(specifier)) {
    const parent = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd();
    const tried = resolvePath(dirname(parent), specifier + ".ts");
    if (existsSync(tried)) {
      return nextResolve(pathToFileURL(tried).href, context);
    }
  }
  return nextResolve(specifier, context);
}

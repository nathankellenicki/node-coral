import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";

const root = resolve(__dirname, "..", "dist", "web");

function listJsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function resolveSpecifier(fromDir: string, spec: string): string {
  if (spec.endsWith(".js") || spec.endsWith(".mjs") || spec.endsWith(".cjs") || spec.endsWith(".json")) {
    return spec;
  }
  const targetPath = resolve(fromDir, spec);
  const fileCandidate = `${targetPath}.js`;
  if (existsSync(fileCandidate)) {
    return `${spec}.js`;
  }
  if (existsSync(targetPath) && statSync(targetPath).isDirectory()) {
    return `${spec.replace(/\/$/, "")}/index.js`;
  }
  return spec;
}

function rewriteFile(filePath: string): void {
  const original = readFileSync(filePath, "utf8");
  const dir = dirname(filePath);
  let updated = original;

  const patterns = [
    /from\s+["'](\.{1,2}\/[^"']+)["']/g,
    /import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    updated = updated.replace(pattern, (match: string, spec: string) => {
      const resolved = resolveSpecifier(dir, spec);
      if (resolved === spec) {
        return match;
      }
      return match.replace(spec, resolved);
    });
  }

  if (updated !== original) {
    writeFileSync(filePath, updated, "utf8");
  }
}

for (const file of listJsFiles(root)) {
  rewriteFile(file);
}

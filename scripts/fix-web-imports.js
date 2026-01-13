const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "dist", "web");

function listJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

function resolveSpecifier(fromDir, spec) {
  if (spec.endsWith(".js") || spec.endsWith(".mjs") || spec.endsWith(".cjs") || spec.endsWith(".json")) {
    return spec;
  }
  const targetPath = path.resolve(fromDir, spec);
  const fileCandidate = `${targetPath}.js`;
  if (fs.existsSync(fileCandidate)) {
    return `${spec}.js`;
  }
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    return `${spec.replace(/\/$/, "")}/index.js`;
  }
  return spec;
}

function rewriteFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const dir = path.dirname(filePath);
  let updated = original;

  const patterns = [
    /from\s+["'](\.{1,2}\/[^"']+)["']/g,
    /import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    updated = updated.replace(pattern, (match, spec) => {
      const resolved = resolveSpecifier(dir, spec);
      if (resolved === spec) {
        return match;
      }
      return match.replace(spec, resolved);
    });
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
  }
}

for (const file of listJsFiles(root)) {
  rewriteFile(file);
}

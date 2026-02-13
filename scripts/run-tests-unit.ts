import { spawn, type ChildProcess } from "child_process";
import { readdirSync, statSync, type Stats, type Dirent } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(__dirname, "..");
const TEST_ROOT = resolve(ROOT, "tests/unit");
const TEST_PATTERN = /\.test\.ts$/;

function safeReadDir(dir: string): string[] | null {
  try {
    return readdirSync(dir);
  } catch {
    return null;
  }
}

function safeStat(filePath: string): Stats | null {
  try {
    return statSync(filePath);
  } catch {
    return null;
  }
}

function collectTests(dir: string): string[] {
  const entries = safeReadDir(dir);
  if (!entries) {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = safeStat(fullPath);
    if (!stats) {
      continue;
    }
    if (stats.isDirectory()) {
      files.push(...collectTests(fullPath));
    } else if (stats.isFile() && TEST_PATTERN.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const tests = collectTests(TEST_ROOT).sort();

if (tests.length === 0) {
  console.log("No unit test files found under", TEST_ROOT);
  process.exit(0);
}

console.log("[run-tests:unit] Test files:", tests.join(", "));

let index = 0;

function runNext(previousCode: number): void {
  if (previousCode !== 0) {
    process.exit(previousCode);
    return;
  }
  if (index >= tests.length) {
    process.exit(0);
    return;
  }
  const file = tests[index]!;
  index += 1;
  console.log(`\n[run-tests:unit] Starting ${file}`);
  const args = ["--test", "--require", "ts-node/register", file];
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  let handled = false;
  const handle = (code: number | null, signal: NodeJS.Signals | null): void => {
    if (handled) {
      return;
    }
    handled = true;
    console.log(`[run-tests:unit] Finished ${file} with code ${code ?? 0}${signal ? ` signal ${signal}` : ""}`);
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    runNext(code ?? 0);
  };
  child.on("exit", handle);
  child.on("close", handle);
}

runNext(0);

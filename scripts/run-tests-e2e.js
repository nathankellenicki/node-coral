#!/usr/bin/env node
const { spawn } = require("child_process");
const { readdirSync, statSync } = require("fs");
const { join, resolve } = require("path");

const ROOT = resolve(__dirname, "..");
const TEST_ROOT = resolve(ROOT, "tests/e2e/devices");
const TEST_PATTERN = /\.test\.ts$/;

function collectTests(dir) {
  const entries = safeReadDir(dir);
  if (!entries) {
    return [];
  }
  const files = [];
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

function safeReadDir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return null;
  }
}

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

const tests = collectTests(TEST_ROOT).sort();

if (tests.length === 0) {
  console.log("No test files found under", TEST_ROOT);
  process.exit(0);
}

console.log("[run-tests] Test files:", tests.join(", "));

let index = 0;

runNext(0);

function runNext(previousCode) {
  if (previousCode && previousCode !== 0) {
    process.exit(previousCode);
    return;
  }
  if (index >= tests.length) {
    process.exit(0);
    return;
  }
  const file = tests[index];
  index += 1;
  console.log(`\n[run-tests] Starting ${file}`);
  const args = ["--test", "--require", "ts-node/register", file];
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  let handled = false;
  const handle = (code, signal) => {
    if (handled) {
      return;
    }
    handled = true;
    console.log(`[run-tests] Finished ${file} with code ${code ?? 0}${signal ? ` signal ${signal}` : ""}`);
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    runNext(code ?? 0);
  };
  child.on("exit", handle);
  child.on("close", handle);
}

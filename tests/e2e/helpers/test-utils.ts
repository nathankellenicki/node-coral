export function scheduleProcessExit(delayMs = 100): void {
  const timer = setTimeout(() => {
    process.exit(0);
  }, delayMs);
  timer.unref?.();
}

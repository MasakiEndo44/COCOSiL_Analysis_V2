const KEY = "onboarding_max_step";

export function getMaxReached(): number {
  if (typeof window === "undefined") return 0;
  const val = Number.parseInt(sessionStorage.getItem(KEY) ?? "0", 10);
  return Number.isNaN(val) ? 0 : val;
}

export function markStepReached(step: number): void {
  if (typeof window === "undefined") return;
  const current = getMaxReached();
  if (step > current) {
    sessionStorage.setItem(KEY, String(step));
  }
}

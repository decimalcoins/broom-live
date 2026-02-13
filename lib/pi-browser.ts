// lib/pi-browser.ts

export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;

  // Pi Browser inject object window.Pi
  if ((window as any).Pi) return true;

  // optional: userAgent check
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("pibrowser")) return true;

  return false;
}

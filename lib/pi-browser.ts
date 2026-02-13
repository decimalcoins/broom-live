export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window as any).Pi !== "undefined";
}
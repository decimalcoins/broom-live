// lib/pi-browser.ts

export async function waitForPiSDK(
  timeoutMs: number = 4000
): Promise<boolean> {
  if (typeof window === "undefined") return false

  const start = Date.now()

  return new Promise((resolve) => {
    const check = () => {
      if ((window as any).Pi) {
        console.log("✅ Pi SDK detected")
        return resolve(true)
      }

      if (Date.now() - start > timeoutMs) {
        console.log("❌ Pi SDK not found after timeout")
        return resolve(false)
      }

      setTimeout(check, 200)
    }

    check()
  })
}

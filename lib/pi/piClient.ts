export const PI_API_BASE =
  process.env.PI_API_URL || "https://api.minepi.com/v2"

export function piHeaders() {
  return {
    "Content-Type": "application/json",

    // ✅ Official Production Server Key
    Authorization: `Key ${process.env.PI_SERVER_API_KEY}`,
  }
}

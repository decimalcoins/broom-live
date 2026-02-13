export const PI_API_BASE = "https://api.minepi.com/v2"

export function piHeaders() {
  return {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    "Content-Type": "application/json",
  }
}

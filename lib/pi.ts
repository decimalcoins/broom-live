export async function verifyPiToken(accessToken: string) {
  const apiKey = process.env.PI_API_KEY
  const apiUrl = process.env.PI_API_URL || "https://api.minepi.com"

  if (!apiKey) throw new Error("Missing PI_API_KEY")

  const res = await fetch(`${apiUrl}/v2/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": apiKey,
    },
  })

  if (!res.ok) {
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

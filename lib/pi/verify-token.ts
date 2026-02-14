// lib/pi/verify-token.ts

export async function verifyPiToken(accessToken: string) {
  const apiKey = process.env.PI_SERVER_API_KEY

  if (!apiKey) {
    throw new Error("Missing PI_SERVER_API_KEY in environment")
  }

  // ============================
  // ✅ PI API ENDPOINT
  // ============================
  const res = await fetch(
    `https://api.minepi.com/v2/me?accessToken=${accessToken}`,
    {
      method: "GET",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    console.error("❌ Pi Token Verify Failed:", errText)
    throw new Error("Invalid Pi Access Token")
  }

  // Example response:
  // {
  //   uid: "abc123",
  //   username: "pioneer"
  // }

  return await res.json()
}

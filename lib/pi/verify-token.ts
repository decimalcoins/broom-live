// lib/pi/verify-token.ts

export async function verifyPiToken(accessToken: string) {
  const apiKey = process.env.PI_SERVER_API_KEY

  if (!apiKey) {
    throw new Error("Missing PI_SERVER_API_KEY in environment")
  }

  // ============================
  // ✅ OFFICIAL PI AUTH VERIFY ENDPOINT
  // ============================
  const res = await fetch("https://api.minepi.com/v2/authentication", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",

      // ✅ REQUIRED: Server API Key
      "X-API-Key": apiKey,

      // ✅ REQUIRED: Access Token
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("❌ Pi Token Verify Failed:", errText)
    throw new Error("Invalid Pi Access Token")
  }

  const data = await res.json()

  // Expected:
  // {
  //   uid: "...",
  //   username: "...",
  //   roles: [...]
  // }

  if (!data?.uid) {
    throw new Error("Pi verification response missing uid")
  }

  return {
    uid: data.uid,
    username: data.username,
  }
}

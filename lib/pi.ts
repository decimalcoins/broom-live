export async function verifyPiToken(accessToken: string) {
  const res = await fetch("https://api.minepi.com/v2/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",

      // ✅ WAJIB Production Key
      "X-Pi-Api-Key": process.env.PI_API_KEY!,
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("❌ Pi Verify Error:", errText)
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

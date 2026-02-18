export async function verifyPiToken(accessToken: string) {
  const res = await fetch("https://api.minepi.com/v2/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,

      // ✅ WAJIB: Server Key Production
      "X-Pi-Api-Key": process.env.PI_SERVER_API_KEY!,
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("❌ Pi Verify Error:", errText)
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

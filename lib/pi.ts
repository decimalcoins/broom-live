export async function verifyPiToken(accessToken: string) {
  const apiUrl = "https://api.minepi.com/v2/me"

  const res = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    console.error("❌ Pi Token Verify Failed:", await res.text())
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

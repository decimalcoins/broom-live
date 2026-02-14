export async function verifyPiToken(accessToken: string) {
  const apiUrl = "https://api.minepi.com"

  const res = await fetch(`${apiUrl}/v2/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("Pi Verify Error:", errText)
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

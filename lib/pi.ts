export async function verifyPiToken(accessToken: string) {
  const apiKey = process.env.PI_SERVER_API_KEY
  const apiUrl = "https://api.minepi.com"

  if (!apiKey) throw new Error("Missing PI_SERVER_API_KEY")

  const res = await fetch(
    `${apiUrl}/v2/me?accessToken=${accessToken}`,
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
    console.error("Pi Verify Error:", errText)
    throw new Error("Invalid Pi Token")
  }

  return await res.json()
}

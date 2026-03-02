export interface PiVerifiedUser {
  uid: string
  username: string
  kyc_verified: boolean
}

export async function verifyPiToken(
  accessToken: string
): Promise<PiVerifiedUser> {
  if (!process.env.PI_SERVER_API_KEY) {
    throw new Error("Missing PI_SERVER_API_KEY")
  }

  const res = await fetch("https://api.minepi.com/v2/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Pi-Api-Key": process.env.PI_SERVER_API_KEY,
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("❌ Pi Verify Error:", errText)
    throw new Error("Invalid Pi Token")
  }

  const data = await res.json()

  return {
    uid: data.uid,
    username: data.username || "Pioneer",
    kyc_verified: data.kyc_verified === true,
  }
}
export function sendGiftMessage(room: any, gift: any) {
  if (!room) return

  const payload = {
    type: "gift",
    gift: {
      id: gift.id,
      name: gift.name,
      image_url: gift.image_url,
      coin_cost: gift.coin_cost,
    },
    sender: room.localParticipant.identity,
    timestamp: Date.now(),
  }

  room.localParticipant.publishData(
    new TextEncoder().encode(JSON.stringify(payload)),
    { reliable: true }
  )

  console.log("🎁 Gift sent realtime:", payload)
}
import { Room } from "livekit-client"

export interface LiveKitConfig {
  url: string
  token: string
}

export class LiveKitService {
  private room: Room | null = null

  async connect(config: LiveKitConfig): Promise<Room> {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    })

    await this.room.connect(config.url, config.token)

    // auto enable publish untuk host
    await this.room.localParticipant.setCameraEnabled(true)
    await this.room.localParticipant.setMicrophoneEnabled(true)

    console.log("[LiveKit] connected")
    return this.room
  }

  disconnect() {
    this.room?.disconnect()
    this.room = null
    console.log("[LiveKit] disconnected")
  }

  getRoom(): Room | null {
    return this.room
  }

  async enableCamera() { await this.room?.localParticipant.setCameraEnabled(true) }
  async disableCamera() { await this.room?.localParticipant.setCameraEnabled(false) }
  async enableMicrophone() { await this.room?.localParticipant.setMicrophoneEnabled(true) }
  async disableMicrophone() { await this.room?.localParticipant.setMicrophoneEnabled(false) }
}

import { Room } from "livekit-client"

export interface LiveKitConfig {
  url: string
  token: string
}

export class LiveKitService {
  private room: Room | null = null

  // ============================
  // ✅ CONNECT TO LIVEKIT CLOUD
  // ============================
  async connect(config: LiveKitConfig): Promise<Room> {
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    })

    await this.room.connect(config.url, config.token)

    console.log("✅ LiveKit Room Connected:", this.room.name)

    return this.room
  }

  // ============================
  // ✅ DISCONNECT ROOM
  // ============================
  disconnect() {
    if (this.room) {
      console.log("🔌 Disconnecting LiveKit Room...")
      this.room.disconnect()
      this.room = null
    }
  }

  // ============================
  // GET ROOM INSTANCE
  // ============================
  getRoom(): Room | null {
    return this.room
  }

  // ============================
  // 🎥 CAMERA CONTROL (HOST ONLY)
  // ============================
  async enableCamera(): Promise<void> {
    if (!this.room) return

    console.log("🎥 Enabling camera...")

    await this.room.localParticipant.setCameraEnabled(true)
  }

  async disableCamera(): Promise<void> {
    if (!this.room) return

    console.log("🎥 Disabling camera...")

    await this.room.localParticipant.setCameraEnabled(false)
  }

  // ============================
  // 🎤 MICROPHONE CONTROL (HOST ONLY)
  // ============================
  async enableMicrophone(): Promise<void> {
    if (!this.room) return

    console.log("🎤 Enabling microphone...")

    await this.room.localParticipant.setMicrophoneEnabled(true)
  }

  async disableMicrophone(): Promise<void> {
    if (!this.room) return

    console.log("🎤 Disabling microphone...")

    await this.room.localParticipant.setMicrophoneEnabled(false)
  }
}
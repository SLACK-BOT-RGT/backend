import MoodCheckin from "../model/moodCheckins"

interface MoodTrackingData {
  user_id: string
  team_id: string
  mood_score: number
  note: string | null
  date: Date
  is_anonymous: boolean
}

export const saveMoodTracking = async (data: MoodTrackingData) => {
  try {
    await MoodCheckin.create(data)
  } catch (error) {
    console.error("Error saving mood tracking:", error)
    throw error
  }
}


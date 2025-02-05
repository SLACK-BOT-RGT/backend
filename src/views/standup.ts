import type { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt"
import type { Logger, WebClient } from "@slack/web-api"
import { StandupConfigsModel, StandupResponseModel } from "../model"
import { create_standup_responses, update_standup_response } from "../services/standup_response"
import { saveMoodTracking } from "../services/mood_tracking"
import { Op } from "sequelize"

interface ModalSubmissionProps {
  ack: AckFn<void> | AckFn<ViewResponseAction>
  body: SlackViewAction
  view: ViewOutput
  client: WebClient
  logger: Logger
  respond: RespondFn
}

export const StandupResponseModalSubmission = async ({ ack, body, view, client }: ModalSubmissionProps) => {
  await ack()

  try {
    const { team_id } = JSON.parse(view.private_metadata)
    const teamConfig = await StandupConfigsModel.findOne({
      where: {
        team_id: team_id,
        is_active: true,
      },
    })

    if (!teamConfig) {
      throw new Error("No active standup configuration found")
    }

    // Extract responses from view state
    const responses: any = {}
    teamConfig.questions?.forEach((_, index) => {
      responses[`response_${index}`] = view.state.values[`question_${index}`][`response_${index}`].value
    })

    // Extract mood tracking data
    const moodTrackingValues = view.state.values.mood_tracking.mood_selection
    const moodScore = moodTrackingValues.selected_option
      ? Number.parseInt(moodTrackingValues.selected_option.value)
      : null
    const moodNote = view.state.values.mood_reason.mood_reason_input.value || null
    const isAnonymous =
      (view.state.values["anonymous_option"]?.["anonymous_selection"]?.selected_options?.length ?? 0) > 0

    // Check if standup already started today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const existingStandup = await StandupResponseModel.findOne({
      where: {
        config_id: teamConfig.id,
        user_id: body.user.id,
        submitted_at: {
          [Op.gte]: today,
        },
      },
    })

    if (!existingStandup) {
      await create_standup_responses({
        config_id: teamConfig.id,
        responses,
        user_id: body.user.id,
        status: "responded",
      })

      if (moodScore === null) {
        throw new Error("Mood score is required")
      }

      await saveMoodTracking({
        user_id: body.user.id,
        team_id: team_id,
        mood_score: moodScore,
        note: moodNote,
        date: new Date(),
        is_anonymous: isAnonymous,
      })
    } else if (existingStandup.status === "not responded") {
      if (moodScore === null) {
        throw new Error("Mood score is required")
      }

      await update_standup_response({
        config_id: teamConfig.id,
        responses,
        user_id: body.user.id,
        id: existingStandup.id,
        submitted_at: today,
        status: "responded",
      })

      await saveMoodTracking({
        user_id: body.user.id,
        team_id: team_id,
        mood_score: moodScore,
        note: moodNote,
        date: new Date(),
        is_anonymous: isAnonymous,
      })
    } else {
      throw new Error("Standup response already submitted for today")
    }

    // Notify user
    await client.chat.postMessage({
      channel: body.user.id,
      text: `Your standup response and mood tracking have been submitted successfully.`,
    })
  } catch (error) {
    console.error("Error submitting standup response:", error)
    await client.chat.postMessage({
      channel: body.user.id,
      text: "Failed to submit standup response and mood tracking. Please try again.",
    })
  }
}


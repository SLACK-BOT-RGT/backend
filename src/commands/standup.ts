import type { AckFn, RespondArguments, RespondFn, SlashCommand, ViewResponseAction, SlackViewAction, ViewOutput, } from "@slack/bolt"
import type { Logger, WebClient } from "@slack/web-api"
import { StandupConfigsModel, StandupResponseModel } from "../model"
import { create_standup_responses, update_standup_response } from "../services/standup_response"
import { saveMoodTracking } from "../services/mood_tracking"
import { Op } from "sequelize"
import TeamModel from "../model/team"

interface ModalSubmissionProps {
  ack: AckFn<void> | AckFn<ViewResponseAction>
  body: SlackViewAction
  view: ViewOutput
  client: WebClient
  logger: Logger
  respond: RespondFn
}

interface commandProps {
  command: SlashCommand
  ack: AckFn<string | RespondArguments>
  respond: RespondFn
  client: WebClient
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
      text: `Your standup response has been submitted successfully.`,
    })
  } catch (error) {
    console.error("Error submitting standup response:", error)
    await client.chat.postMessage({
      channel: body.user.id,
      text: "Failed to submit standup response. Please try again.",
    })
  }
}

export const StartStandup = async ({ command, ack, respond, client }: commandProps) => {
  await ack()
  try {
    const [teamName] = command.text.split(" ")
    // Get team config
    const team = await TeamModel.findOne({ where: { name: teamName } })

    const teamConfig = await StandupConfigsModel.findOne({
      where: {
        team_id: team?.id,
        is_active: true,
      },
      include: [
        {
          model: TeamModel,
        },
      ],
    })

    if (!teamConfig) {
      await respond("No active standup configuration found for this team.")
      return
    }

    // Check if standup already started today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingStandup = await StandupResponseModel.findOne({
      where: {
        config_id: teamConfig.id,
        user_id: command.user_id,
        status: {
          [Op.or]: ["responded", "missed"],
        },
        submitted_at: {
          [Op.gte]: today,
        },
      },
    })

    if (existingStandup) {
      await respond("Today's standup has already been submitted or missed!")
      return
    }

    // Create blocks for standup questions
    const blocks: any[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "🌅 Time for daily standup!",
        },
      },
      {
        type: "divider",
      },
      {
        text: {
          type: "plain_text",
          text: "1 - Very Unhappy",
        },
        value: "1",
      },
    ]

    // Add configured questions
    teamConfig.questions?.forEach((question: string, index: number) => {
      blocks.push({
        type: "input",
        block_id: `question_${index}`,
        label: {
          type: "plain_text",
          text: question,
        },
        element: {
          type: "plain_text_input",
          action_id: `response_${index}`,
          multiline: true,
        },
      })
    })


    console.log("Blocks being sent to Slack:", JSON.stringify(blocks, null, 2))

    try {
      const result = await client.views.open({
        trigger_id: command.trigger_id,
        view: {
          type: "modal",
          callback_id: "standup_response_modal",
          title: {
            type: "plain_text",
            text: "Daily Standup",
          },
          submit: {
            type: "plain_text",
            text: "Submit",
          },
          blocks: blocks,
          private_metadata: JSON.stringify({ team_id: team?.id }),
        },
      })
      console.log("Modal opened successfully:", JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("Error opening modal:", error)
      await respond("Failed to open standup modal. Please try again.")
    }
  } catch (error) {
    console.error("Error starting standup:", error)
    await respond("Failed to start standup. Please try again.")
  }
}

export const SkipStandup = async ({ command, ack, respond, client }: commandProps) => {
  await ack();
  try {
    // Logic for skipping standup
    await respond("Standup has been skipped for today.");
  } catch (error) {
    console.error("Error skipping standup:", error);
    await respond("Failed to skip standup. Please try again.");
  }
};

export const ViewTodayStandups = async ({ command, ack, respond, client }: commandProps) => {
  await ack();
  try {
    // Logic for viewing today's standups
    await respond("Here are today's standup responses.");
  } catch (error) {
    console.error("Error viewing today's standups:", error);
    await respond("Failed to view today's standups. Please try again.");
  }
};

// Removed duplicate export


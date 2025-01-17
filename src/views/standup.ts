// src/views/standup.ts
import { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt";
import { Logger, WebClient } from "@slack/web-api";
import { StandupConfigsModel, StandupResponseModel } from "../model";

interface ModalSubmissionProps {
    ack: AckFn<void> | AckFn<ViewResponseAction>;
    body: SlackViewAction;
    view: ViewOutput;
    client: WebClient;
    logger: Logger;
    respond: RespondFn;
}

export const StandupResponseModalSubmission = async ({ ack, body, view, client }: ModalSubmissionProps) => {
    await ack();

    try {
        const { team_id } = JSON.parse(view.private_metadata);
        const teamConfig = await StandupConfigsModel.findOne({
            where: {
                team_id: team_id,
                is_active: true
            }
        });

        if (!teamConfig) {
            throw new Error('No active standup configuration found');
        }

        // Extract responses from view state
        const responses: any = {};
        teamConfig.questions?.forEach((_, index) => {
            responses[`response_${index}`] = view.state.values[`question_${index}`][`response_${index}`].value;
        });

        // // Save response
        await StandupResponseModel.create({
            user_id: body.user.id,
            config_id: teamConfig.id,
            responses,
            submitted_at: new Date()
        });

        // // Notify channel
        await client.chat.postMessage({
            channel: body.user.id, // You might want to store and use the actual channel ID
            text: `<@${body.user.id}> has submitted his/her standup response.`
        });

    } catch (error) {
        console.error('Error submitting standup response:', error);
        await client.chat.postMessage({
            channel: body.user.id,
            text: "Failed to submit standup response. Please try again."
        });
    }
};
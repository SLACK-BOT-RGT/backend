// src/views/standup.ts
import { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt";
import { Logger, WebClient } from "@slack/web-api";
import { StandupConfigsModel, StandupResponseModel } from "../model";
import { create_standup_responses, update_standup_response } from "../services/standup_response";
import { Op } from 'sequelize';

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
        const responses: any = [];
        teamConfig.questions?.forEach((_, index) => {
            responses.push(view.state.values[`question_${index}`][`response_${index}`].value);
        });

        // // Save response
        // Check if standup already started today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingStandup = await StandupResponseModel.findOne({
            where: {
                config_id: teamConfig.id,
                user_id: body.user.id,
                // status: {
                //     [Op.or]: ['not responded', 'missed'],
                // },
                submitted_at: {
                    [Op.gte]: today
                }
            }
        });

        if (!existingStandup) {

            await create_standup_responses({ config_id: teamConfig.id, responses, user_id: body.user.id, status: 'responded' });
            // TODO: Mood Tracking Question ( Grab answer and save it in the database)

        } else {
            if (existingStandup.status == 'not responded') {
                // TODO: Mood Tracking Question ( Grab answer and save it in the database)

                await update_standup_response({ config_id: teamConfig.id, responses, user_id: body.user.id, id: existingStandup.id, submitted_at: today, status: 'responded' });
            }

        }
        // await StandupResponseModel.create({
        //     user_id: body.user.id,
        //     config_id: teamConfig.id,
        //     responses,
        //     submitted_at: new Date()
        // });

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
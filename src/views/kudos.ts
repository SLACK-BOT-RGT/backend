import Kudos from "../model/kudos";
import { Op } from "sequelize";
import { AckFn, RespondFn, SlackViewAction, ViewOutput, ViewResponseAction } from "@slack/bolt";
import { Logger, WebClient } from "@slack/web-api";

interface ModalSubmissionProps {
    ack: AckFn<void> | AckFn<ViewResponseAction>;
    body: SlackViewAction;
    view: ViewOutput;
    client: WebClient;
    logger: Logger;
    respond: RespondFn;
}

type kudosType = 'rocket' | 'heart' | 'thumbs';


export const HandleKudosSubmission = async ({ ack, body, view, client, logger }: ModalSubmissionProps) => {

    await ack();
    const { team_id, from_user_id } = JSON.parse(view.private_metadata);

    const recipient = view.state.values['selected_member']['static_selected_member']['selected_option']?.value;
    const message = view.state.values['message_block']['message'].value || '';
    const kudosType = (view.state.values['kudos_type_block']['kudos_type']['selected_option']?.value as kudosType) || 'thumbs';


    if (!recipient || !message || !kudosType) {
        await client.chat.postMessage({
            channel: from_user_id,
            text: "⚠️ Invalid input!"
        });
        return;
    }

    const kudosValues = { rocket: 3, heart: 2, thumbs: 1 };
    const kudosPoints = kudosValues[kudosType];


    // // Check user's daily kudos count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const kudosGiven = await Kudos.findAll({
        where: {
            from_user_id,
            created_at: { [Op.gte]: today }
        }
    });

    const usedKudos = kudosGiven.reduce((sum, k) => sum + kudosValues[k.category as kudosType], 0);
    if (usedKudos + kudosPoints > 3) {
        await client.chat.postMessage({
            channel: from_user_id,
            text: "⚠️ You have exceeded your daily kudos limit."
        });
        return;
    }

    // Store kudos in DB
    await Kudos.create({
        from_user_id,
        to_user_id: recipient,
        team_id,
        category: kudosType,
        message,
        created_at: new Date()
    });

    // // Notify the recipient
    await client.chat.postMessage({
        channel: recipient,
        text: `🎉 <@${from_user_id}> just gave you a *${kudosType.toUpperCase()}* kudos!\n📝 Reason: "${message}"`
    });

    // // Confirm to sender
    await client.chat.postMessage({
        channel: from_user_id,
        text: "✅ Your kudos has been sent!"
    });

};

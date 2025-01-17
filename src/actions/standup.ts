import { AckFn, BlockAction, DialogValidation, SayArguments, SlackAction } from "@slack/bolt";
import type { WebClient } from '@slack/web-api';
import { submitStandupModal } from "../user_interfaces/modals/standup";

export const SubmitStandupAction = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
    await ack();
    const triggerId = (body as BlockAction).trigger_id;
    await submitStandupModal(body.user.id, client, triggerId);
}
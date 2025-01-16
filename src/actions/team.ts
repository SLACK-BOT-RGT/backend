import { AckFn, BlockAction, DialogValidation, SayArguments, SlackAction } from "@slack/bolt";
import type { WebClient } from '@slack/web-api';
import { createTeamModal, removeTeamModal } from "../user_interfaces/modals/team";

export const CreateTeamAction = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
    await ack();
    const triggerId = (body as BlockAction).trigger_id;
    await createTeamModal(body.user.id, client, triggerId)
    // await openUpdateForm(body.user.id, client, triggerId);
}

export const RemoveTeamAction = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
    await ack();
    const triggerId = (body as BlockAction).trigger_id;
    await removeTeamModal(body.user.id, client, triggerId)
}
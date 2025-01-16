import { AckFn, BlockAction, DialogValidation, SayArguments, SlackAction } from "@slack/bolt";
import type { WebClient } from '@slack/web-api';
import { addTeamMemberModal, removeTeamMemberModal } from "../user_interfaces/modals/members";

export const AddTeamMemberAction = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
    await ack();
    const triggerId = (body as BlockAction).trigger_id;
    await addTeamMemberModal(body.user.id, client, triggerId)
}

export const RemoveTeamMemberAction = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
    await ack();
    const triggerId = (body as BlockAction).trigger_id;
    await removeTeamMemberModal(body.user.id, client, triggerId)
}
// export const RemoveTeamMemberAction2 = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
//     await ack();
//     const triggerId = (body as BlockAction).trigger_id;
//     await removeTeamMemberModal(body.user.id, client, triggerId)
// }

// export const SelectChannelForRemoval = async ({ body, ack, client }: { body: SlackAction; ack: AckFn<void> | AckFn<string | SayArguments> | AckFn<DialogValidation>; client: WebClient }) => {
//     await ack();
//     // const triggerId = (body as BlockAction).trigger_id;
//     // await handleChannelSelection(view, client, body.user.id)
// }
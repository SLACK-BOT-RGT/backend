import { PollModel, TeamModel, UserModel } from "../model";
import { IPoll, IPollOption } from "../types/interfaces";
import { CustomError } from "../utils/CustomError";
import { get_user_by_id } from "./users";


export const create_poll = async (pollData: IPoll) => {

    const { team_id, end_time, creator_id, is_anonymous, options, question, start_time } = pollData;

    try {
        const poll = await PollModel.create({
            team_id,
            end_time,
            creator_id,
            is_anonymous,
            options: options.map((item, index) => ({
                id: (index + 1).toString(),
                text: item.text,
                votes: 0,
                voters: []
            })),
            question,
            start_time,
            total_votes: 0
        });

        return poll.dataValues;
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
    }

};


export const get_team_polls = async ({ team_id }: { team_id: string }) => {

    const polls = await PollModel.findAll({
        where: {
            team_id
        },
        include: [TeamModel, UserModel]
    });

    return polls;
}


export const get_poll_by_id = async ({ id }: { id: string }) => {

    const poll = await PollModel.findByPk(id);

    return poll?.dataValues;
}



interface IVote {
    poll_id: number;
    user_id: string;
    option_id: string;
}

export const vote_on_poll = async ({ poll_id, user_id, option_id }: IVote) => {
    try {
        const user = await get_user_by_id({ id: user_id });
        // Get the poll
        const poll = await PollModel.findByPk(poll_id);
        if (!poll) {
            throw new CustomError('Poll not found', 404);
        }


        // Check if poll is active
        // if (poll.status !== 'active') {
        //     throw new CustomError('Poll is not active', 409);
        // }

        // Check if poll has ended
        if (new Date() > new Date(poll.end_time)) {
            throw new CustomError('Poll has ended', 409);
        }

        // Get current options
        const currentOptions = poll.options;
        // Ensure updatedOptions is initialized
        const updatedOptions: IPollOption[] = currentOptions.map(option => ({ ...option }));

        // Find if user has voted before
        const previousVoteIndex = currentOptions.findIndex(option =>
            option.voters?.some(voter => voter.id === user_id)
        );

        // If user has voted before, remove their previous vote
        if (previousVoteIndex !== -1) {
            updatedOptions[previousVoteIndex] = {
                ...updatedOptions[previousVoteIndex],
                votes: Math.max((updatedOptions[previousVoteIndex].votes || 0) - 1, 0), // Prevent negative votes
                voters: updatedOptions[previousVoteIndex].voters?.filter(voter => voter.id !== user_id) || []
            };
        }

        // Add new vote
        const newOptionIndex = updatedOptions.findIndex(option => option.id === option_id);
        if (newOptionIndex !== -1) {
            updatedOptions[newOptionIndex] = {
                ...updatedOptions[newOptionIndex],
                votes: (updatedOptions[newOptionIndex].votes || 0) + 1,
                voters: [...(updatedOptions[newOptionIndex].voters || []), { id: user_id, name: user.name }] // Add voter object
            };
        }

        // Update the poll
        const updatedPoll = await poll.update({
            options: updatedOptions,
            total_votes: previousVoteIndex === -1 ? poll.total_votes + 1 : poll.total_votes
        });

        return updatedPoll.dataValues;
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        throw error;
    }
};
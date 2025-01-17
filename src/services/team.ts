import { TeamModel } from "../model";

interface createTeamProps {
    id: string;
    name: string;
    description: string;
}
export const createTeam = async ({ id, name, description }: createTeamProps) => {
    const team = await TeamModel.create({ id, name, description });
}
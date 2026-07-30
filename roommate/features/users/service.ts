import { User } from "./types";

export async function getUsers(): Promise<User[]> {
    return [
        {
            id: 1,
            name: "Joshua",
            major: "Applied Math",
        },
    ];
}

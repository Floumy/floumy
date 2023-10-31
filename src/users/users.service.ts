import {Injectable} from "@nestjs/common";

export type User = {
    userId: number;
    username: string;
    password: string;
}

@Injectable()
export class UsersService {
    private readonly users: User[] = [
        {
            userId: 1,
            username: "john",
            password: "changeme"
        },
        {
            userId: 2,
            username: "maria",
            password: "guess"
        }
    ];

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async create(username: string, password: string) {
        await this.validateUser(password, username);
        const user = {
            userId: this.users.length + 1,
            username,
            password
        };
        this.users.push(user);
        return user;
    }

    private async validateUser(password: string, username: string) {
        if (password === "") throw new Error("Invalid password");
        if (username === "") throw new Error("Invalid username");
        if (await this.findOne(username)) throw new Error("Username already exists");
    }
}

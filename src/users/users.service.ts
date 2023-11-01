import {Injectable} from "@nestjs/common";
import {User} from './user.entity';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) {
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOneBy({username});
    }

    async create(username: string, password: string) {
        await this.validateUser(password, username);
        const user = new User(username, password);
        return this.usersRepository.save(user);
    }

    private async validateUser(password: string, username: string) {
        if (password === "") throw new Error("Invalid password");
        if (username === "") throw new Error("Invalid username");
        if (await this.findOne(username)) throw new Error("Username already exists");
    }

    async clear() {
        await this.usersRepository.clear();
    }
}

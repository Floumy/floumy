import {Injectable} from "@nestjs/common";
import {User} from './user.entity';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        private configService: ConfigService
    ) {
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.usersRepository.findOneBy({username});
    }

    async create(username: string, password: string) {
        await this.validateUser(password, username);
        const hashedPassword = await this.encryptPassword(password);
        const user = new User(username, hashedPassword);
        return this.usersRepository.save(user);
    }

    async encryptPassword(password: string) {
        return bcrypt.hash(password, +this.configService.get<number>("encryption.rounds"));
    }

    async isPasswordCorrect(password: string, hash: string) {
        try {
            await bcrypt.compare(password, hash);
            return true;
        } catch (e) {
            return false;
        }
    }

    private async validateUser(password: string, username: string) {
        if (!this.isPasswordValid(password)) throw new Error("Invalid password");
        if (!this.isUsernameValid(username)) throw new Error("Invalid username");
        if (await this.findOne(username)) throw new Error("Username already exists");
    }

    private isPasswordValid(password: string) {
        return password !== "" && password.length >= 8;
    }

    private isUsernameValid(username: string) {
        const emailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$");
        return username !== "" && emailRegex.test(username);
    }

    async clear() {
        await this.usersRepository.clear();
    }
}

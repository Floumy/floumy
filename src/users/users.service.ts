import { Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { OrgsService } from "../orgs/orgs.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private orgsService: OrgsService,
    private configService: ConfigService
  ) {
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ email });
  }

  async create(name: string, email: string, password: string) {
    await this.validateUser(name, email, password);
    const hashedPassword = await this.encryptPassword(password);
    const user = new User(name, email, hashedPassword);
    const org = await this.orgsService.createForUser(user);
    user.org = Promise.resolve(org);
    return await this.usersRepository.save(user);
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

  private async validateUser(name: string, email: string, password: string) {
    if (!this.isNameValid(name)) throw new Error("Invalid name");
    if (!this.isEmailValid(email)) throw new Error("Invalid email");
    if (!this.isPasswordValid(password)) throw new Error("Invalid password");
    if (await this.findOneByEmail(email)) throw new Error("Email already exists");
  }

  private isPasswordValid(password: string) {
    return password !== "" && password.length >= 8;
  }

  private isEmailValid(email: string) {
    const emailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$");
    return email !== "" && emailRegex.test(email);
  }

  private isNameValid(name: string) {
    return name !== "" && name.length >= 2;
  }

  async clear() {
    await this.usersRepository.clear();
  }

  async update(user: User) {
    await this.usersRepository.save(user);
  }
}

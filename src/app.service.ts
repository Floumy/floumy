import { Injectable } from '@nestjs/common';
import { Public } from "./auth/public.guard";

@Injectable()
export class AppService {
  @Public()
  getHello(): string {
    return "Hello World!";
  }
}

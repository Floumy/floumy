import { Module } from "@nestjs/common";
import { OkrsService } from "./okrs.service";
import { OkrsController } from "./okrs.controller";

@Module({
  providers: [OkrsService],
  controllers: [OkrsController]
})
export class OkrsModule {
}

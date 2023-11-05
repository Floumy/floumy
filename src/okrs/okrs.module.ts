import { Module } from "@nestjs/common";
import { OkrsService } from "./okrs.service";

@Module({
  providers: [OkrsService]
})
export class OkrsModule {
}

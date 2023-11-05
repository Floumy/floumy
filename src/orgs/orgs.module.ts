import { Module } from "@nestjs/common";
import { OrgsService } from "./orgs.service";

@Module({
  providers: [OrgsService]
})
export class OrgsModule {
}

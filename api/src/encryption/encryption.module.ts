import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  exports: [EncryptionService],
})
export class EncryptionModule {}
